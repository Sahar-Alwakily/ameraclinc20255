import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FaUser, FaPhone, FaClock, FaCalendarAlt, FaCheck, FaWhatsapp, FaInfoCircle } from 'react-icons/fa';
import { database } from '../dataApi/firebaseApi';
import { ref, push, set, get, onValue, query, orderByChild, equalTo, limitToLast } from 'firebase/database';

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

        // جلب الحجوزات

        // الاشتراك في تحديثات الحجوزات
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
  ? 'https://us-central1-ameraclinic-326b2.cloudfunctions.net/api' 
  : 'http://localhost:5000';


const generateAvailableTimes = useCallback((settings, date) => {
  if (!date || !settings) return [];
  
  const day = date.getDay();
  const startHour = settings[`day_${day}_start`] || 9;
  const endHour = settings[`day_${day}_end`] || 17;
  
  const times = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    const period = hour < 12 ? 'صباحًا' : 'مساءً';
    const displayHour = hour > 12 ? hour - 12 : hour;
    
    // إضافة الوقت على شكل 00 و 30 دقيقة
    times.push(`${displayHour}:00 ${period}`);
    if (hour !== endHour) {
      times.push(`${displayHour}:30 ${period}`);
    }
  }
  setAvailableTimes(times);
}, []);

// 3. تحديث الأوقات عند تغيير التاريخ أو الإعدادات
useEffect(() => {
  if (selectedDate && scheduleSettings) {
    generateAvailableTimes(scheduleSettings, selectedDate);
  }
}, [selectedDate, scheduleSettings, generateAvailableTimes]);

// 4. تعديل دالة handleDateChange
const handleDateChange = (date) => {
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

  const isTimeBooked = useCallback((time) => {
    if (!selectedDate) return false;
    
    // تحويل التاريخ المحدد إلى توقيت إسرائيل
    const userDate = new Date(selectedDate);
    userDate.setHours(0, 0, 0, 0);
    
    const timeStr = convertTo24HourFormat(time);
  
    return Object.values(bookedAppointments).some(appointment => {
      if (!appointment || appointment.status === 'cancelled') return false;
      
      // تحويل تاريخ الحجز من UTC إلى توقيت إسرائيل
      const apptDate = new Date(appointment.date);
      apptDate.setMinutes(apptDate.getMinutes() + apptDate.getTimezoneOffset());
      
      return (
        apptDate.toDateString() === userDate.toDateString() &&
        convertTo24HourFormat(appointment.time) === timeStr
      );
    });
  }, [selectedDate, bookedAppointments]);
  
  // دالة مساعدة لتحويل الوقت من 12 ساعة إلى 24 ساعة
  const convertTo24HourFormat = (time12h) => {
    if (!time12h) return '';
    
    // إذا كان التنسيق يحتوي على AM/PM بالفعل (مثل البيانات القديمة)
    if (time12h.includes('AM') || time12h.includes('PM')) {
      const [time, period] = time12h.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      let hours24 = hours;
      if (period === 'PM' && hours < 12) hours24 += 12;
      if (period === 'AM' && hours === 12) hours24 = 0;
      return `${hours24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
  
    // معالجة التنسيق العربي (صباحًا/مساءً)
    const [time, period] = time12h.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    let hours24 = hours;
    if (period === 'مساءً') {
      hours24 = hours === 12 ? 12 : hours + 12;
    } else { // صباحًا
      hours24 = hours === 12 ? 0 : hours;
    }
    
    return `${hours24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

const isTimeAvailable = useCallback((time) => {
  if (!selectedDate || !scheduleSettings) return true;

  // 1. التحقق من الأجازات
  const dateStr = selectedDate.toISOString().split('T')[0];
  if (scheduleSettings.holidays?.includes(dateStr)) {
    return false;
  }

  // 2. التحقق من ساعات العمل اليومية
  const dayOfWeek = selectedDate.getDay();
  const startHour = scheduleSettings[`day_${dayOfWeek}_start`] || 9;
  const endHour = scheduleSettings[`day_${dayOfWeek}_end`] || 17;

  // تحويل الوقت المحدد إلى ساعة رقمية
  const [timePart, period] = time.split(' ');
  const [hours, minutes] = timePart.split(':').map(Number);
  
  let numericHour = hours;
  if (period === 'مساءً') {
    numericHour = hours === 12 ? 12 : hours + 12;
  } else {
    numericHour = hours === 12 ? 0 : hours;
  }

  // 3. التحقق من التوافق مع ساعات العمل
  if (numericHour < startHour || numericHour > endHour) {
    return false;
  }

  // 4. التحقق من الوقت الحالي إذا كان التاريخ هو اليوم
  const today = new Date();
  if (
    selectedDate.getDate() === today.getDate() &&
    selectedDate.getMonth() === today.getMonth() &&
    selectedDate.getFullYear() === today.getFullYear()
  ) {
    if (numericHour < today.getHours()) return false;
    if (numericHour === today.getHours() && minutes <= today.getMinutes()) return false;
  }

  return true;
}, [selectedDate, scheduleSettings, currentTime]);

  const isDateDisabled = ({ date }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const adjustedDate = new Date(date);
    adjustedDate.setHours(0, 0, 0, 0);

    // التحقق من الأجازات
    if (scheduleSettings?.holidays) {
      const dateStr = date.toISOString().split('T')[0];
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
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = convertTo24HourFormat(time);
  
    const appointmentsRef = ref(database, 'appointments');
    const snapshot = await get(appointmentsRef);
    
    if (snapshot.exists()) {
      const appointments = snapshot.val();
      const isBooked = Object.values(appointments).some(appt => {
        if (!appt || appt.status === 'cancelled') return false;
        const apptDate = new Date(appt.date).toISOString().split('T')[0];
        const apptTime = convertTo24HourFormat(appt.time);
        return apptDate === dateStr && apptTime === timeStr;
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
    // تحويل الوقت إلى تنسيق 24 ساعة
    const [time, period] = selectedTime.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    // ضبط الساعات حسب الفترة
    let adjustedHours = hours;
    if (period === 'مساءً' && hours < 12) adjustedHours += 12;
    if (period === 'صباحًا' && hours === 12) adjustedHours = 0;

    // إنشاء كائن التاريخ هنا قبل أي استخدام
    const appointmentDateTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      adjustedHours,
      minutes
    );
    appointmentDateTime.setMinutes(appointmentDateTime.getMinutes() + appointmentDateTime.getTimezoneOffset());

    // التحقق من عدم الحجز في وقت ماضي
    const now = new Date();
    now.setMinutes(now.getMinutes() + now.getTimezoneOffset());
    if (appointmentDateTime < now) {
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
      date: appointmentDateTime.toISOString(),
      time: selectedTime,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    await set(newAppointmentRef, appointmentData);

    // إرسال رسالة التأكيد
    await sendWhatsAppMessage(phoneNumber, 'HX277d8bcb856090aa17ce4c441dc8f103', {
      customerName,
      selectedDate: formatArabicDate(selectedDate),
      selectedTime
    });

    // إعداد التذكير قبل 24 ساعة
    const reminderTime = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000);
    const timeUntilReminder = reminderTime.getTime() - Date.now();

    if (timeUntilReminder > 0) {
      setTimeout(async () => {
        try {
          await sendWhatsAppMessage(phoneNumber, 'HX1b073311cb981b06b540940d2462efcb', {
            customerName,
            selectedDate: formatArabicDate(selectedDate),
            selectedTime
          });
          console.log('تم إرسال تذكير الموعد قبل 24 ساعة');
        } catch (error) {
          console.error('Failed to send reminder:', error);
        }
      }, timeUntilReminder);
    }

    toast.success('تم الحجز بنجاح! سيصلك تأكيد على واتساب');
    
    // إعادة تعيين الحقول
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
                placeholder="أدخل رقم هاتفك (مثال: 0512345678)"
              />
            </div>

            <div className="time-picker mb-4">
  <div className="flex items-center gap-2 mb-1 text-purple-900">
    <FaClock className="text-lg" />
    <label htmlFor="time" className="text-base font-semibold">اختار الوقت</label>
  </div>
  <div className="grid grid-cols-2 gap-3">
    {availableTimes.map((time, index) => {
      const isBooked = isTimeBooked(time);
      const isAvailable = isTimeAvailable(time);
      const isDisabled = isBooked || !isAvailable;
      
      // البحث عن الحجز المطابق
      const appointment = Object.values(bookedAppointments).find(appt => {
        if (!appt || appt.status === 'cancelled') return false;
        const apptDate = new Date(appt.date).toISOString().split('T')[0];
        const currentDate = selectedDate?.toISOString().split('T')[0];
        return (
          apptDate === currentDate && 
          convertTo24HourFormat(appt.time) === convertTo24HourFormat(time)
        );
      });

      return (
<button
  key={index}
  onClick={() => !isDisabled && setSelectedTime(time)}
  disabled={isDisabled}
  className={`py-2 px-3 rounded-lg transition-all ${
    selectedTime === time
      ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white'
      : isDisabled
        ? 'bg-red-100 text-red-600 cursor-not-allowed border border-red-300'
        : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
  }`}
  title={isDisabled ? (isBooked ? 'محجوز' : 'غير متاح') : 'متاح'}
>
  {time}
  {isDisabled && (
    <span className="text-xs block mt-1">
      {isBooked ? '(محجوز)' : '(غير متاح)'}
    </span>
  )}
</button>
      );
    })}
  </div>
</div>

            <div className="service-select mb-4">
              <div className="flex items-center gap-2 mb-1 text-purple-900">
                <FaCheck className="text-lg" />
                <label htmlFor="service" className="text-base font-semibold">اختار الخدمة</label>
              </div>
              <select
                id="service"
                value={selectedService}
                onChange={handleServiceChange}
                className="w-full py-2 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={loadingServices}
              >
                <option value="">اختر الخدمة</option>
                {services.map((service) => (
                  <option key={service.id} value={service.title}>
                    {service.title}
                  </option>
                ))}
              </select>
            </div>


            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full py-2 bg-gradient-to-br from-purple-500 to-blue-500 text-white text-base font-semibold rounded-lg mt-4 transition-all hover:from-purple-600 hover:to-blue-600 flex items-center justify-center gap-2 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                'جاري الحفظ...'
              ) : (
                <>
                  <FaWhatsapp className="text-lg" />
                  حجز الموعد وإرسال التأكيد
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointment;