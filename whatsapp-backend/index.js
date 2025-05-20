const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const twilio = require('twilio');
const cors = require('cors');
const { initializeApp } = require('firebase/app');
const { 
  getDatabase, 
  ref, 
  get,
  set, 
  update,
  orderByChild, 
  equalTo, 
  limitToLast,
  query,
  onValue 
} = require('firebase/database');
const schedule = require('node-schedule');

// 1. تكوين Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAwISrrsswQWNSU0D-V0m8co61jmX0jYEw",
  authDomain: "ameraclinic-326b2.firebaseapp.com",
  databaseURL: "https://ameraclinic-326b2-default-rtdb.firebaseio.com",
  projectId: "ameraclinic-326b2",
  storageBucket: "ameraclinic-326b2.firebasestorage.app",
  messagingSenderId: "1000806780465",
  appId: "1:1000806780465:web:3c1accd69277a9a5494f10",
  measurementId: "G-3SFZLYKMNF"
};

const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);

// 2. تكوين CORS
const allowedOrigins = [
  'https://www.ameraclinic.com',
  'https://api.ameraclinic.com',
  'http://localhost:3000',
  'https://www.admin.ameraclinic.com'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

const app = express();
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. تكوين Twilio
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// 4. جدولة التذكيرات مع حفظ الحالة
const jobsDB = {};

app.post('/api/schedule-reminder', async (req, res) => {
  try {
    
    const { phone, templateId, variables, sendAt } = req.body;
    const jobId = `reminder_${Date.now()}`;
    console.log('🚀 تفاصيل الجدولة:', {
      الطلب_وصل: new Date().toISOString(),
      موعد_الإرسال: req.body.sendAt,
      الوقت_المتبقي: new Date(req.body.sendAt) - new Date()
    });
    // حفظ المهمة في Firebase
    const jobsRef = ref(database, `scheduledJobs/${jobId}`);
    await set(jobsRef, {
      phone,
      templateId,
      variables,
      sendAt,
      status: 'scheduled'
    });

    // جدولة المهمة
    const job = schedule.scheduleJob(new Date(sendAt), async () => {
      try {
        await client.messages.create({
          contentSid: templateId,
          from: 'whatsapp:+972545380785',
          to: `whatsapp:+972${phone.replace(/\D/g, '').replace(/^0/, '')}`,
          contentVariables: JSON.stringify(variables)
        });
        
        await update(jobsRef, { 
          status: 'delivered',
          deliveredAt: new Date().toISOString()
        });
      } catch (error) {
        await update(jobsRef, {
          status: 'failed',
          error: error.message
        });
      }
    });

    jobsDB[jobId] = job;

    res.json({ 
      success: true, 
      jobId,
      message: 'تم جدولة التذكير بنجاح'
    });

  } catch (error) {
    console.error('❌ خطأ في الجدولة:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// 5. استعادة المهام المجدولة عند التشغيل
async function restoreScheduledJobs() {
  const jobsRef = ref(database, 'scheduledJobs');
  const snapshot = await get(jobsRef);

  if (snapshot.exists()) {
    Object.entries(snapshot.val()).forEach(([jobId, jobData]) => {
      console.log('⏰ تشغيل التذكير:', jobId, new Date().toISOString());
      if (jobData.status === 'scheduled' && new Date(jobData.sendAt) > new Date()) {
        const job = schedule.scheduleJob(new Date(jobData.sendAt), async () => {
          try {
                await client.messages.create({
                  contentSid: jobData.templateId,
                  from: 'whatsapp:+972545380785',
                  to: `whatsapp:+972${jobData.phone.replace(/\D/g, '').replace(/^0/, '')}`,
                  contentVariables: JSON.stringify(jobData.variables)
                });            
                await update(ref(database, `scheduledJobs/${jobId}`), { status: 'delivered' });
                console.log('✅ تم إرسال التذكير بنجاح');

          } catch (error) {
            await update(ref(database, `scheduledJobs/${jobId}`), { status: 'failed' });
            console.error('❌ فشل إرسال التذكير:', error);

          }
        });
        jobsDB[jobId] = job;
      }
    });
  }
}

// 6. نقطة إرسال رسائل الواتساب
app.post('/api/send-whatsapp', async (req, res) => {
  try {
    const { templateId, phone, variables } = req.body;
    
    if (!templateId || !phone || !variables) {
      return res.status(400).json({ 
        success: false,
        message: 'المعطيات المطلوبة: templateId, phone, variables'
      });
    }

    const cleanedPhone = `whatsapp:+972${phone.replace(/\D/g, '').replace(/^0/, '')}`;

    const message = await client.messages.create({
      contentSid: templateId,
      from: 'whatsapp:+972545380785',
      to: cleanedPhone,
      contentVariables: JSON.stringify(variables)
    });

    res.json({
      success: true,
      message: 'تم الإرسال بنجاح',
      sid: message.sid
    });

  } catch (error) {
    console.error('❌ خطأ في الإرسال:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 7. ويب هوك استقبال الردود
app.post('/api/whatsapp-webhook', async (req, res) => {
  try {
    const userPhone = req.body.From.replace(/\D/g, '').replace(/^972/, '');
    if (!req.body.ButtonPayload) {
      // إرسال الرد التلقائي باستخدام القالب المحدد
      await client.messages.create({
        contentSid: 'HXb71c8abd97ff494ff7cf8ba5bf9320e5',
        from: 'whatsapp:+972545380785',
        to: req.body.From,
        contentVariables: JSON.stringify({
          customerName: 'عزيزتي '
        })
      });
      
      return res.type('xml').send('<Response></Response>');
    }
    const appointmentsRef = ref(database, 'appointments');
    const q = query(
      appointmentsRef,
      orderByChild('phoneNumber'),
      equalTo(userPhone),
      limitToLast(1)
    );

    const snapshot = await get(q);

    if (!snapshot.exists()) {
      return res.type('xml').send('<Response></Response>');
    }

    const appointmentsData = snapshot.val();
    const appointmentId = Object.keys(appointmentsData)[0];
    const appointmentData = appointmentsData[appointmentId];

    if (req.body.ButtonPayload === 'confirmed') {
      // تحديث حالة الموعد في العقدة الصحيحة
      const specificAppointmentRef = ref(database, `appointments/${appointmentId}`);
      await update(specificAppointmentRef, {
        status: 'confirmed',
        confirmedAt: new Date().toISOString()
      });

      // إرسال الرد
      await client.messages.create({
        contentSid: 'HX1497f9f86940632a3cc4571dc764016d',
        from: 'whatsapp:+972545380785',
        to: req.body.From,
        contentVariables: JSON.stringify({
          selectedDate: new Date(appointmentData.date).toISOString().split('T')[0],
          selectedTime: appointmentData.time
        })
      });
    } 
    else if (req.body.ButtonPayload === 'rescheduled') {
      const specificAppointmentRef = ref(database, `appointments/${appointmentId}`);
      await update(specificAppointmentRef, {
        status: 'rescheduled',
        rescheduledAt: new Date().toISOString()
      });
      
      await client.messages.create({
        contentSid: 'HXef7215391ae4a15e77ac83d855c37980',
        from: 'whatsapp:+972545380785',
        to: req.body.From,
        contentVariables: JSON.stringify({
          selectedDate: new Date(appointmentData.date).toISOString().split('T')[0],
          selectedTime: appointmentData.time
        })
      });
    }

    res.type('xml').send('<Response></Response>');

  } catch (error) {
    console.error('❌ خطأ في المعالجة:', error);
    res.status(500).type('xml').send('<Response></Response>');
  }
});

// 8. اختبار الاتصالات
async function testFirebaseConnection() {
  try {
    const testRef = ref(database, 'connection_test');
    await set(testRef, { status: 'connected', timestamp: Date.now() });
    
    const snapshot = await new Promise((resolve) => {
      onValue(testRef, (snapshot) => resolve(snapshot), { onlyOnce: true });
    });
    
    return !!snapshot.val();
  } catch (error) {
    console.error('🔥 فشل اتصال Firebase:', error.message);
    return false;
  }
}

async function testTwilioConnection() {
  try {
    await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    return true;
  } catch (error) {
    console.error('❌ فشل اتصال Twilio:', error.message);
    return false;
  }
}

// 9. تشغيل الخادم
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`
  ██████╗  ██████╗ ██████╗ ██╗   ██╗
  ██╔══██╗██╔═══██╗██╔══██╗╚██╗ ██╔╝
  ██████╔╝██║   ██║██████╔╝ ╚████╔╝ 
  ██╔══██╗██║   ██║██╔══██╗  ╚██╔╝  
  ██║  ██║╚██████╔╝██║  ██║   ██║   
  ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   
  http://localhost:${PORT}
  `);

  // استعادة المهام المجدولة
  await restoreScheduledJobs();

  // اختبار الاتصالات
  try {
    const [twilioStatus, firebaseStatus] = await Promise.all([
      testTwilioConnection(),
      testFirebaseConnection()
    ]);

    console.log(`
    ============ حالة الاتصالات ============
    Twilio: ${twilioStatus ? '✅ ناجح' : '❌ فشل'}
    Firebase: ${firebaseStatus ? '✅ ناجح' : '❌ فشل'}
    ========================================
    `);

  } catch (error) {
    console.error('⚠️  خطأ في اختبار الاتصالات:', error);
  }
});