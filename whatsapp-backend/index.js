// index.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const twilio = require('twilio');
const cors = require('cors');
const { initializeApp } = require('firebase/app'); // التعديل هنا
const { 
  getDatabase, 
  ref, 
  set, 
  orderByChild, 
  equalTo, 
  limitToLast,
  query,
  onValue // أضف هذا
} = require('firebase/database');

// تعديل دالة اختبار الاتصال
async function testFirebaseConnection() {
  try {
    const testRef = ref(database, 'connection_test'); // التعديل هنا
    await set(testRef, { 
      status: 'connected', 
      timestamp: Date.now() 
    });
    
    const snapshot = await new Promise((resolve) => {
      onValue(testRef, (snapshot) => resolve(snapshot), { onlyOnce: true });
    });
    
    return !!snapshot.val();
  } catch (error) {
    console.error('🔥 فشل اتصال Firebase:', error.message);
    return false;
  }
}
const app = express();

// تكوين Firebase
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

// التهيئة الصحيحة
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp); // التعديل هنا
// تكوين CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5174',
  'https://ameraaclinic.com',
  'https://www.api.ameraclinic.com',
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// تكوين Twilio
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID, // التعديل هنا
  process.env.TWILIO_AUTH_TOKEN   // التعديل هنا
);



// إرسال رسالة واتساب
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
      message: error.message
    });
  }
});

// ويب هوك استقبال الردود
app.post('/api/whatsapp-webhook', async (req, res) => {
  try {
    const userPhone = req.body.From.replace(/\D/g, '').replace(/^972/, '');
    const appointmentsRef = database.ref('appointments');

    const snapshot = await appointmentsRef
      .orderByChild('phoneNumber')
      .equalTo(userPhone)
      .limitToLast(1)
      .once('value');

    if (!snapshot.exists()) {
      return res.type('xml').send('<Response></Response>');
    }

    const [appointmentId, appointmentData] = Object.entries(snapshot.val())[0];

    if (req.body.ButtonPayload === 'confirmed') {
      await appointmentsRef.child(appointmentId).update({
        status: 'confirmed',
        confirmedAt: new Date().toISOString()
      });

      await client.messages.create({
        body: `تم تأكيد موعدك بتاريخ ${appointmentData.date}`,
        from: 'whatsapp:+972545380785',
        to: req.body.From
      });
    }

    res.type('xml').send('<Response></Response>');
  } catch (error) {
    console.error('❌ خطأ في المعالجة:', error);
    res.status(500).type('xml').send('<Response></Response>');
  }
});

async function testTwilioConnection() {
  try {
    await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    return true;
  } catch (error) {
    console.error('❌ فشل اتصال Twilio:', error.message);
    return false;
  }
}
// تشغيل الخادم
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