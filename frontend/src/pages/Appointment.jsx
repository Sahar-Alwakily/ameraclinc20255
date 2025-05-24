import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FaUser, FaPhone, FaClock, FaCalendarAlt, FaCheck, FaWhatsapp, FaInfoCircle } from 'react-icons/fa';
import { database } from '../dataApi/firebaseApi';
import { ref, push, set, get, onValue, query, orderByChild, equalTo, limitToLast } from 'firebase/database';
import moment from 'moment-timezone';

const Appointment = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [services, setServices] = useState([]);
  const [bookedAppointments, setBookedAppointments] = useState({});
  const [loadingServices, setLoadingServices] = useState(true);
  const [appointmentStatus, setAppointmentStatus] = useState('pending');
  const [scheduleSettings, setScheduleSettings] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // تحديث الوقت الحالي كل دقيقة
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // كل دقيقة

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchData = async () => {
      try {

      // الاشتراك في تحديثات إعدادات الجدول
      const settingsRef = ref(database, 'scheduleSettings');
      onValue(settingsRef, (snapshot) => {
        if (snapshot.exists()) {
          const newSettings = snapshot.val();
          setScheduleSettings(newSettings);
          generateAvailableTimes(newSettings, selectedDate);
        }
      });

      // جلب البيانات الأولية
      const [servicesSnapshot, appointmentsSnapshot] = await Promise.all([
        get(ref(database, 'services')),
        get(ref(database, 'appointments'))
      ]);
        // جلب إعدادات الجدول
        const settingsSnapshot = await get(ref(database, 'scheduleSettings'));
        if (settingsSnapshot.exists()) {
          const settings = settingsSnapshot.val();
          setScheduleSettings(settings);
          // توليد الأوقات المتاحة بناء على الإعدادات
          generateAvailableTimes(settings);
        }

        // جلب الخدمات
        if (servicesSnapshot.exists()) {
          const servicesData = servicesSnapshot.val();
          const servicesList = Object.entries(servicesData).map(([id, service]) => ({
            id,
            title: service.title
          }));
          setServices(servicesList);
          
          const urlParams = new URLSearchParams(window.location.search);
          const serviceParam = urlParams.get('service');
          if (serviceParam) {
            const foundService = servicesList.find(s => s.id === serviceParam);
            if (foundService) setSelectedService(foundService.title);
          }
        }

        const appointmentsRef = ref(database, 'appointments');
        onValue(appointmentsRef, (snapshot) => {
          if (snapshot.exists()) {
            setBookedAppointments(snapshot.val());
          }
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('حدث خطأ أثناء جلب البيانات');
      } finally {
        setLoadingServices(false);
      }
    };

    fetchData();
  }, []);
  const apiUrl = import.meta.env.PROD 
  ? 'https://www.api.ameraclinic.com' 
  : 'http://localhost:5000';


const generateAvailableTimes = useCallback((settings, date) => {
  if (!date || !settings) return [];
  
  const day = date.getDay();
  const startHour = settings[`day_${day}_start`] || 9;
  const endHour = settings[`day_${day}_end`] || 17;
  
  const times = [];
  // توليد كل ساعة كاملة من البداية للنهاية
  for (let hour = startHour; hour < endHour; hour++) {
    const period = hour < 12 ? 'صباحًا' : 'مساءً';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    
    // إضافة الوقت الأساسي (مثال: 1:00 مساءً)
    times.push(`${displayHour}:00 ${period}`);
    
    // إضافة 30 دقيقة فقط إذا لم تكن الساعة الأخيرة
    if (hour < endHour) {
      times.push(`${displayHour}:30 ${period}`);
    }
  }
  setAvailableTimes(times);
}, []);

const isTimeAvailable = useCallback((time) => {
  if (!selectedDate || !scheduleSettings) return true;
  
  const dateStr = moment(selectedDate).tz('Asia/Jerusalem').format('YYYY-MM-DD');
  if (scheduleSettings.holidays?.includes(dateStr)) return false;
  
  const dayOfWeek = selectedDate.getDay();
  if (!scheduleSettings.workingDays?.includes(dayOfWeek)) return false;
  
  // تحسين تحويل الوقت إلى تنسيق 24 ساعة
  const timeStr = time.trim();
  const isPM = timeStr.includes('مساءً');
  const timeComponents = timeStr.replace('صباحًا', '').replace('مساءً', '').trim().split(':');
  let hours = parseInt(timeComponents[0], 10);
  const minutes = parseInt(timeComponents[1] || '0', 10);
  
  // تحويل الوقت بشكل صحيح
  if (isPM && hours !== 12) {
    hours += 12;
  } else if (!isPM && hours === 12) {
    hours = 0;
  }
  
  const startHour = scheduleSettings[`day_${dayOfWeek}_start`] || 9;
  const endHour = scheduleSettings[`day_${dayOfWeek}_end`] || 17;
  
  // التحقق من أن الوقت ضمن ساعات العمل
  if (hours < startHour || hours > endHour) return false;
  
  // التحقق من الوقت الحالي
  const now = moment().tz('Asia/Jerusalem');
  if (moment(selectedDate).isSame(now, 'day')) {
    const currentHour = now.hours();
    const currentMinute = now.minutes();
    
    // مقارنة الوقت المحدد مع الوقت الحالي
    if (hours < currentHour || (hours === currentHour && minutes <= currentMinute)) {
      return false;
    }
  }
  
  return true;
}, [selectedDate, scheduleSettings, currentTime]);

// تحسين دالة تحويل الوقت - إصلاح مشكلة AM/PM
const convertTo24HourFormat = (timeStr) => {
  if (!timeStr) return '';
  
  // تحليل الوقت يدوياً للتأكد من معالجة AM/PM بشكل صحيح
  const isPM = timeStr.includes('مساءً');
  const timeComponents = timeStr.replace('صباحًا', '').replace('مساءً', '').trim().split(':');
  let hours = parseInt(timeComponents[0], 10);
  const minutes = parseInt(timeComponents[1] || '0', 10);
  
  // تحويل الوقت بشكل صحيح إلى تنسيق 24 ساعة
  if (isPM && hours !== 12) {
    hours += 12;
  } else if (!isPM && hours === 12) {
    hours = 0;
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
};

// 2. دالة التحقق من الحجز (مُحدَّثة)
const isTimeBooked = useCallback((time) => {
  if (!selectedDate) return false;
  
  return Object.values(bookedAppointments).some(appointment => {
    if (!appointment || !['pending', 'confirmed'].includes(appointment.status)) return false;
    
    const apptMoment = moment(appointment.date).tz('Asia/Jerusalem');
    const selectedMoment = moment(selectedDate).tz('Asia/Jerusalem').startOf('day');
    
    // استخدام نفس طريقة تحويل الوقت المستخدمة في convertTo24HourFormat
    const isPM = time.includes('مساءً');
    const timeComponents = time.replace('صباحًا', '').replace('مساءً', '').trim().split(':');
    let hours = parseInt(timeComponents[0], 10);
    const minutes = parseInt(timeComponents[1] || '0', 10);
    
    if (isPM && hours !== 12) {
      hours += 12;
    } else if (!isPM && hours === 12) {
      hours = 0;
    }
    
    // التحقق من التطابق الدقيق للوقت
    return (
      apptMoment.isSame(selectedMoment, 'day') &&
      apptMoment.hours() === hours &&
      apptMoment.minutes() === minutes
    );
  });
}, [selectedDate, bookedAppointments]);




// 3. تحديث الأوقات عند تغيير التاريخ أو الإعدادات
useEffect(() => {
  if (selectedDate && scheduleSettings) {
    generateAvailableTimes(scheduleSettings, selectedDate);
  }
}, [selectedDate, scheduleSettings, generateAvailableTimes]);

// 4. تعديل دالة handleDateChange
const handleDateChange = (date) => {
  if (!date || isNaN(date.getTime())) return;
  setSelectedDate(date);
  setSelectedTime('');
  if (scheduleSettings) {
    generateAvailableTimes(scheduleSettings, date);
  }
};

  const sendWhatsAppMessage = async (phone, templateId, variables) => {
    try {
      const response = await fetch(`${apiUrl}/api/send-whatsapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: `${phone.replace(/\D/g, '').replace(/^0/, '')}`,
          templateId,
          variables
        })
      });
  
      if (!response.ok) throw new Error('فشل إرسال الرسالة');
      return await response.json();
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      throw error;
    }
  };


  const handleServiceChange = (event) => {
    setSelectedService(event.target.value);
  };


  


const isDateDisabled = ({ date }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const adjustedDate = new Date(date);
  adjustedDate.setHours(0, 0, 0, 0);

  // التحقق من الأجازات مع تعديل المنطقة الزمنية
  if (scheduleSettings?.holidays) {
    const dateStr = moment(date)
      .tz('Asia/Jerusalem')
      .format('YYYY-MM-DD');
    
    if (scheduleSettings.holidays.includes(dateStr)) {
      return true;
    }
  }
    // التحقق من أيام العمل
    if (scheduleSettings?.workingDays) {
      const dayOfWeek = date.getDay();
      if (!scheduleSettings.workingDays.includes(dayOfWeek)) {
        return true;
      }
    }


    


    
  return adjustedDate < today;
  };

  const formatArabicDate = (date) => {
    const options = { 
      timeZone: 'Asia/Jerusalem', // تحديد منطقة بئر السبع
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(date).toLocaleDateString('ar-IL', options);
  };


const checkTimeAvailability = async (date, time) => {
  const timeStr = convertTo24HourFormat(time);
  const dateMoment = moment(date).startOf('day');

  const appointmentsRef = ref(database, 'appointments');
  const snapshot = await get(appointmentsRef);
  
  if (snapshot.exists()) {
    const appointments = snapshot.val();
    const isBooked = Object.values(appointments).some(appt => {
      if (!appt) return false;
      
      // التعديل هنا: نتحقق من الحالات المطلوبة فقط
      const validStatus = ['pending', 'confirmed'].includes(appt.status);
      if (!validStatus) return false;
      
      const apptMoment = moment(appt.date);
      return (
        apptMoment.isSame(dateMoment, 'day') &&
        convertTo24HourFormat(appt.time) === timeStr
      );
    });

    if (isBooked) {
      return { available: false, message: 'هذا الوقت محجوز الآن، يرجى اختيار وقت آخر' };
    }
  }

  return { available: true };
};

  
  const handleSubmit = async () => {
  // التحقق من تعبئة جميع الحقول
  if (!selectedDate || !selectedTime || !selectedService || !customerName || !phoneNumber) {
    toast.warning('الرجاء تعبئة جميع الحقول!');
    return;
  }

  try {
    // تحليل الوقت المحدد للتأكد من معالجة AM/PM بشكل صحيح
    const isPM = selectedTime.includes('مساءً');
    const timeComponents = selectedTime.replace('صباحًا', '').replace('مساءً', '').trim().split(':');
    let hours = parseInt(timeComponents[0], 10);
    const minutes = parseInt(timeComponents[1] || '0', 10);
    
    // تحويل الوقت بشكل صحيح إلى تنسيق 24 ساعة
    if (isPM && hours !== 12) {
      hours += 12;
    } else if (!isPM && hours === 12) {
      hours = 0;
    }

    // إنشاء الموعد باستخدام moment مع التحقق من الصحة
    const appointmentMoment = moment(selectedDate)
      .set({ hour: hours, minute: minutes })
      .tz('Asia/Jerusalem', true);

    // التحقق من صحة التاريخ بعد الإنشاء
    if (!appointmentMoment.isValid() || isNaN(appointmentMoment.toDate().getTime())) {
      toast.error('الوقت المحدد غير صحيح');
      return;
    }

    // الوقت الحالي بتوقيت إسرائيل
    const now = moment().tz('Asia/Jerusalem');

    // حساب الفرق الزمني بالمللي ثانية
    const timeUntilAppointment = appointmentMoment.valueOf() - now.valueOf();

    // التحقق من عدم الحجز في وقت ماضي
    if (timeUntilAppointment < 0) {
      toast.error('لا يمكن الحجز في أوقات ماضية');
      return;
    }

    // التحقق من وجود حجز مسبق
    if (isTimeBooked(selectedTime)) {
      toast.error('هذا الوقت محجوز بالفعل، يرجى اختيار وقت آخر');
      return;
    }

    // التحقق النهائي من توفر الوقت
    const finalCheck = await checkTimeAvailability(selectedDate, selectedTime);
    if (!finalCheck.available) {
      toast.error(finalCheck.message);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);

    // حفظ البيانات في Firebase
    const appointmentsRef = ref(database, 'appointments');
    const newAppointmentRef = push(appointmentsRef);
    
    const appointmentData = {
      customerName,
      phoneNumber: phoneNumber.replace(/\D/g, '').replace(/^0/, ''),
      service: selectedService,
      date: appointmentMoment.toISOString(),
      time: selectedTime,
      createdAt: new Date().toISOString(),
      status: 'pending',
      timezone: 'Asia/Jerusalem' // إضافة المنطقة الزمنية
    };

    await set(newAppointmentRef, appointmentData);

    // إرسال رسالة التأكيد الفورية
    await sendWhatsAppMessage(phoneNumber, 'HX277d8bcb856090aa17ce4c441dc8f103', {
      customerName,
      selectedDate: formatArabicDate(selectedDate),
      selectedTime
    });

if (timeUntilAppointment > 0) {
  const threeHours = 3 * 60 * 60 * 1000; // 3 ساعات بالمللي ثانية
  let reminderDelay = timeUntilAppointment - threeHours;

  // منع الجدولة إذا كان الوقت المتبقي أقل من 3 ساعات
  if (reminderDelay < 0) {
    console.log('الموعد قريب جدًا، لا يتم إرسال تذكير');
    return;
  }

  const sendAt = new Date(appointmentMoment.valueOf() - threeHours).toISOString();

  try {
    const response = await fetch(`${apiUrl}/api/schedule-reminder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: phoneNumber.replace(/\D/g, '').replace(/^0/, ''),
        templateId: 'HX1b073311cb981b06b540940d2462efcb',
        variables: {
          customerName,
          selectedDate: formatArabicDate(selectedDate),
          selectedTime,
          remainingTime: '3 ساعات'
        },
        sendAt
      }),
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'فشل جدولة التذكير');
    }

  } catch (error) {
    console.error('فشل في الجدولة:', error);
    toast.error('فشل في جدولة التذكير');
  }
}


    toast.success('تم الحجز بنجاح! سيصلك تأكيد على واتساب');
    setSelectedDate(null);
    setSelectedTime('');
    setSelectedService('');
    setCustomerName('');
    setPhoneNumber('');

  } catch (error) {
    console.error('Error:', error);
    toast.error(error.message || 'حدث خطأ أثناء الحجز');
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="appointment-container bg-gradient-to-br from-pink-50 to-white-50 min-h-screen flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-3xl w-full">
        <div className="header text-center mb-6">
          <h1 className="text-2xl font-bold text-purple-900">حجز موعد</h1>
          <p className="text-sm text-gray-600 mt-1">اختر التاريخ والوقت والخدمة لحجز موعدك</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="calendar-container bg-gradient-to-br from-purple-100 to-blue-100 p-4 rounded-2xl shadow-lg">
            <div className="flex items-center gap-2 mb-3 text-purple-900">
              <FaCalendarAlt className="text-xl" />
              <h2 className="text-lg font-semibold">اختر التاريخ</h2>
            </div>
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              locale="ar"
              tileDisabled={isDateDisabled}
              className="rounded-lg border-none"
            />
          </div>

          <div className="selection-container">
            <div className="customer-name mb-4">
              <div className="flex items-center gap-2 mb-1 text-purple-900">
                <FaUser className="text-lg" />
                <label htmlFor="customerName" className="text-base font-semibold">اسم العميل</label>
              </div>
              <input
                type="text"
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full py-2 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="أدخل اسمك"
              />
            </div>

            <div className="phone-number mb-4">
              <div className="flex items-center gap-2 mb-1 text-purple-900">
                <FaPhone className="text-lg" />
                <label htmlFor="phoneNumber" className="text-base font-semibold">رقم الهاتف</label>
              </div>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full py-2 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="أدخل رقم هاتفك"
                dir="ltr"
              />
            </div>

            <div className="service-selection mb-4">
              <div className="flex items-center gap-2 mb-1 text-purple-900">
                <FaInfoCircle className="text-lg" />
                <label htmlFor="service" className="text-base font-semibold">اختر الخدمة</label>
              </div>
              <select
                id="service"
                value={selectedService}
                onChange={handleServiceChange}
                className="w-full py-2 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">اختر الخدمة</option>
                {services.map((service) => (
                  <option key={service.id} value={service.title}>
                    {service.title}
                  </option>
                ))}
              </select>
            </div>

            {selectedDate && (
              <div className="time-selection mb-4">
                <div className="flex items-center gap-2 mb-1 text-purple-900">
                  <FaClock className="text-lg" />
                  <label className="text-base font-semibold">اختر الوقت</label>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {availableTimes.map((time, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      disabled={!isTimeAvailable(time) || isTimeBooked(time)}
                      className={`py-2 px-1 rounded-lg text-sm transition-all ${
                        selectedTime === time
                          ? 'bg-purple-600 text-white'
                          : !isTimeAvailable(time) || isTimeBooked(time)
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                      }`}
                    >
                      {time}
                      {selectedTime === time && <FaCheck className="inline mr-1" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!selectedDate || !selectedTime || !selectedService || !customerName || !phoneNumber || isSubmitting}
              className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
                !selectedDate || !selectedTime || !selectedService || !customerName || !phoneNumber || isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'
              }`}
            >
              <FaWhatsapp className="text-xl" />
              {isSubmitting ? 'جاري الحجز...' : 'تأكيد الحجز'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointment;
