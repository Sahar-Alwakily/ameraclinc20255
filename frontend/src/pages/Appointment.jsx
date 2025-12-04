import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FaUser, FaPhone, FaClock, FaCalendarAlt, FaCheck, FaWhatsapp, FaInfoCircle, FaMapMarkerAlt } from 'react-icons/fa';
import { database } from '../dataApi/firebaseApi';
import { ref, push, set, get, onValue } from 'firebase/database';
import moment from 'moment-timezone';

const Appointment = () => {
  const [selectedArea, setSelectedArea] = useState(''); // 'shqeib' أو 'rahat'
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [services, setServices] = useState([]);
  const [bookedAppointments, setBookedAppointments] = useState({});
  const [loadingServices, setLoadingServices] = useState(true);
  const [scheduleSettings, setScheduleSettings] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // تحديث الوقت الحالي كل دقيقة
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

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
          }
        });

        // جلب الخدمات
        const servicesSnapshot = await get(ref(database, 'services'));
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

        // الاشتراك في تحديثات المواعيد
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

  // توليد الأوقات المتاحة بناءً على المنطقة والتاريخ
  const generateAvailableTimes = useCallback((date) => {
    if (!date || !scheduleSettings || !selectedArea) return [];
    
    const day = date.getDay();
    
    // تحديد ساعات العمل بناءً على المنطقة
    let startHour, endHour;
    
    if (selectedArea === 'shqeib') {
      // شقيب السلام - الثلاثاء فقط من 9-17
      if (day !== 2) return []; // 2 = الثلاثاء
      startHour = scheduleSettings.shqeib_start || 9;
      endHour = scheduleSettings.shqeib_end || 17;
    } else if (selectedArea === 'rahat') {
      // رهط - حسب الإعدادات المحددة
      startHour = scheduleSettings.rahat_start || 9;
      endHour = scheduleSettings.rahat_end || 17;
    } else {
      return [];
    }
    
    const times = [];
    for (let hour = startHour; hour <= endHour; hour++) {
      const period = hour < 12 ? 'صباحًا' : 'مساءً';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      
      times.push(`${displayHour}:00 ${period}`);
      
      if (hour < endHour) {
        times.push(`${displayHour}:30 ${period}`);
      }
    }
    setAvailableTimes(times);
  }, [selectedArea, scheduleSettings]);

  // التحقق من توفر الوقت
  const isTimeAvailable = useCallback((time) => {
    if (!selectedDate || !scheduleSettings || !selectedArea) return false;
    
    // التحقق من الأجازات
    const dateStr = moment(selectedDate).tz('Asia/Jerusalem').format('YYYY-MM-DD');
    if (scheduleSettings.holidays?.includes(dateStr)) return false;
    
    // التحقق من أيام العمل بناءً على المنطقة
    const dayOfWeek = selectedDate.getDay();
    
    if (selectedArea === 'shqeib' && dayOfWeek !== 2) return false; // الثلاثاء فقط لشقيب السلام
    if (selectedArea === 'rahat' && !scheduleSettings.workingDays?.includes(dayOfWeek)) return false;
    
    // تحويل الوقت
    const timeStr = time.trim();
    const isPM = timeStr.includes('مساءً');
    const timeComponents = timeStr.replace('صباحًا', '').replace('مساءً', '').trim().split(':');
    let hours = parseInt(timeComponents[0], 10);
    const minutes = parseInt(timeComponents[1] || '0', 10);
    
    if (isPM && hours !== 12) {
      hours += 12;
    } else if (!isPM && hours === 12) {
      hours = 0;
    }
    
    // تحديد ساعات العمل بناءً على المنطقة
    let startHour, endHour;
    if (selectedArea === 'shqeib') {
      startHour = scheduleSettings.shqeib_start || 9;
      endHour = scheduleSettings.shqeib_end || 17;
    } else {
      startHour = scheduleSettings.rahat_start || 9;
      endHour = scheduleSettings.rahat_end || 17;
    }
    
    // التحقق من أن الوقت ضمن ساعات العمل
    if (hours < startHour || hours > endHour) return false;
    
    // التحقق من الوقت الحالي
    const now = moment().tz('Asia/Jerusalem');
    if (moment(selectedDate).isSame(now, 'day')) {
      const currentHour = now.hours();
      const currentMinute = now.minutes();
      
      if (hours < currentHour || (hours === currentHour && minutes <= currentMinute)) {
        return false;
      }
    }
    
    return true;
  }, [selectedDate, scheduleSettings, selectedArea, currentTime]);

  // التحقق من الحجز المسبق
  const isTimeBooked = useCallback((time) => {
    if (!selectedDate || !selectedArea) return false;
    
    return Object.values(bookedAppointments).some(appointment => {
      if (!appointment || !['pending', 'confirmed'].includes(appointment.status)) return false;
      
      // التحقق من المنطقة أولاً
      if (appointment.area !== selectedArea) return false;
      
      const apptMoment = moment(appointment.date).tz('Asia/Jerusalem');
      const selectedMoment = moment(selectedDate).tz('Asia/Jerusalem').startOf('day');
      
      const isPM = time.includes('مساءً');
      const timeComponents = time.replace('صباحًا', '').replace('مساءً', '').trim().split(':');
      let hours = parseInt(timeComponents[0], 10);
      const minutes = parseInt(timeComponents[1] || '0', 10);
      
      if (isPM && hours !== 12) {
        hours += 12;
      } else if (!isPM && hours === 12) {
        hours = 0;
      }
      
      return (
        apptMoment.isSame(selectedMoment, 'day') &&
        apptMoment.hours() === hours &&
        apptMoment.minutes() === minutes
      );
    });
  }, [selectedDate, bookedAppointments, selectedArea]);

  // تحديث الأوقات عند تغيير المنطقة أو التاريخ
  useEffect(() => {
    if (selectedDate && selectedArea) {
      generateAvailableTimes(selectedDate);
    }
  }, [selectedDate, selectedArea, generateAvailableTimes]);

  const handleDateChange = (date) => {
    if (!date || isNaN(date.getTime())) return;
    setSelectedDate(date);
    setSelectedTime('');
    generateAvailableTimes(date);
  };

  const handleAreaChange = (area) => {
    setSelectedArea(area);
    setSelectedDate(null);
    setSelectedTime('');
    setSelectedService('');
  };

  // تحديد إذا كان التاريخ معطل بناءً على المنطقة
  const isDateDisabled = ({ date }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const adjustedDate = new Date(date);
    adjustedDate.setHours(0, 0, 0, 0);

    if (adjustedDate < today) return true;

    // التحقق من الأجازات
    if (scheduleSettings?.holidays) {
      const dateStr = moment(date)
        .tz('Asia/Jerusalem')
        .format('YYYY-MM-DD');
      
      if (scheduleSettings.holidays.includes(dateStr)) {
        return true;
      }
    }

    // التحقق من أيام العمل بناءً على المنطقة
    const dayOfWeek = date.getDay();
    
    if (selectedArea === 'shqeib' && dayOfWeek !== 2) {
      return true; // شقيب السلام - الثلاثاء فقط
    }
    
    if (selectedArea === 'rahat' && scheduleSettings?.workingDays && 
        !scheduleSettings.workingDays.includes(dayOfWeek)) {
      return true; // رهط - حسب أيام العمل المحددة
    }

    return false;
  };

  const formatArabicDate = (date) => {
    const options = { 
      timeZone: 'Asia/Jerusalem',
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(date).toLocaleDateString('ar-IL', options);
  };

  const convertTo24HourFormat = (timeStr) => {
    if (!timeStr) return '';
    
    const isPM = timeStr.includes('مساءً');
    const timeComponents = timeStr.replace('صباحًا', '').replace('مساءً', '').trim().split(':');
    let hours = parseInt(timeComponents[0], 10);
    const minutes = parseInt(timeComponents[1] || '0', 10);
    
    if (isPM && hours !== 12) {
      hours += 12;
    } else if (!isPM && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
  };

const sendWhatsAppMessage = async (phone, templateId, variables) => {
  try {
    // التحقق المكثف من رقم الهاتف
    if (!phone || phone.length < 9) {
      throw new Error('رقم الهاتف غير صالح');
    }

    // التحقق من تنسيق الرقم السعودي/الإسرائيلي
    if (!phone.match(/^5[0-9]{8,}$/)) {
      throw new Error('الرجاء إدخال رقم هاتف صحيح يبدأ بـ 5');
    }

    const response = await fetch(`${apiUrl}/api/send-whatsapp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: phone,
        templateId,
        variables
      }),
      timeout: 15000 // زيادة المهلة إلى 15 ثانية
    });

    const responseData = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      // تحليل رسالة الخطأ
      let errorMessage = 'فشل إرسال الرسالة';
      
      if (response.status === 400) {
        errorMessage = 'رقم الهاتف غير صحيح أو غير مسجل في واتساب';
      } else if (response.status === 429) {
        errorMessage = 'تم إرسال الكثير من الرسائل، يرجى المحاولة لاحقاً';
      } else if (responseData.error) {
        errorMessage = responseData.error.message || responseData.error;
      }
      
      throw new Error(errorMessage);
    }
    
    // التحقق من أن الرسالة أرسلت بالفعل
    if (!responseData.success && !responseData.messageId) {
      throw new Error('لم يتم إرسال الرسالة، يرجى التحقق من الرقم');
    }
    
    return responseData;
  } catch (error) {
    console.error('Error sending WhatsApp:', error);
    
    // رسالة خطأ موحدة
    throw new Error(`فشل إرسال واتساب: ${error.message}. تأكد من أن الرقم ${phone} مسجل في واتساب`);
  }
};

  const handleServiceChange = (event) => {
    setSelectedService(event.target.value);
  };

const handleSubmit = async () => {
  if (!selectedArea || !selectedDate || !selectedTime || !selectedService || !customerName || !phoneNumber) {
    toast.warning('الرجاء تعبئة جميع الحقول!');
    return;
  }

  try {
    const isPM = selectedTime.includes('مساءً');
    const timeComponents = selectedTime.replace('صباحًا', '').replace('مساءً', '').trim().split(':');
    let hours = parseInt(timeComponents[0], 10);
    const minutes = parseInt(timeComponents[1] || '0', 10);
    
    if (isPM && hours !== 12) {
      hours += 12;
    } else if (!isPM && hours === 12) {
      hours = 0;
    }

    const appointmentMoment = moment(selectedDate)
      .set({ hour: hours, minute: minutes })
      .tz('Asia/Jerusalem', true);

    if (!appointmentMoment.isValid() || isNaN(appointmentMoment.toDate().getTime())) {
      toast.error('الوقت المحدد غير صحيح');
      return;
    }

    const now = moment().tz('Asia/Jerusalem');
    const timeUntilAppointment = appointmentMoment.valueOf() - now.valueOf();

    if (timeUntilAppointment < 0) {
      toast.error('لا يمكن الحجز في أوقات ماضية');
      return;
    }

    if (isTimeBooked(selectedTime)) {
      toast.error('هذا الوقت محجوز بالفعل، يرجى اختيار وقت آخر');
      return;
    }

    setIsSubmitting(true);

    // التحقق من صحة رقم الهاتف
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '').replace(/^0/, '');
    if (cleanPhoneNumber.length < 9 || !cleanPhoneNumber.startsWith('5')) {
      toast.error('الرجاء إدخال رقم هاتف صحيح يبدأ بـ 05xxxxxxxx');
      setIsSubmitting(false);
      return;
    }

    // محاولة إرسال رسالة الواتساب أولاً
    try {
      // إرسال رسالة اختبارية أولاً للتأكد من صحة الرقم
      const whatsappResult = await sendWhatsAppMessage(cleanPhoneNumber, 'HX277d8bcb856090aa17ce4c441dc8f103', {
        customerName,
        selectedDate: formatArabicDate(selectedDate),
        selectedTime,
        area: selectedArea === 'shqeib' ? 'شقيب السلام' : 'رهط'
      });

      // إذا نجح إرسال الواتساب، نحفظ الموعد في Firebase
      const appointmentsRef = ref(database, 'appointments');
      const newAppointmentRef = push(appointmentsRef);
      
      const appointmentData = {
        customerName,
        phoneNumber: cleanPhoneNumber,
        service: selectedService,
        date: appointmentMoment.toISOString(),
        time: selectedTime,
        area: selectedArea,
        createdAt: new Date().toISOString(),
        status: 'pending',
        timezone: 'Asia/Jerusalem',
        whatsappSent: true, // إضافة علامة أن الرسالة أرسلت
        whatsappMessageId: whatsappResult.messageId // حفظ معرف الرسالة إن وجد
      };

      // حفظ الموعد في Firebase بعد نجاح إرسال الواتساب
      await set(newAppointmentRef, appointmentData);
      
      toast.success('✅ تم الحجز بنجاح! تم إرسال تأكيد إلى واتساب');

      // إعادة تعيين الحقول
      setSelectedArea('');
      setSelectedDate(null);
      setSelectedTime('');
      setSelectedService('');
      setCustomerName('');
      setPhoneNumber('');

    } catch (whatsappError) {
      console.warn('فشل إرسال واتساب:', whatsappError);
      
      // إذا فشل إرسال الواتساب، لا نحفظ الموعد
      throw new Error('فشل إرسال رسالة التأكيد. الرجاء التأكد من أن رقم الهاتف مسجل في واتساب');
    }

  } catch (error) {
    console.error('Error:', error);
    
    // عرض رسالة خطأ واضحة
    if (error.message.includes('واتساب') || error.message.includes('رقم الهاتف')) {
      toast.error(
        <div>
          <div className="font-bold mb-2">⚠️ لم يتم الحجز!</div>
          <div className="text-sm text-right">
            <div>الرجاء التأكد من:</div>
            <div>1️⃣ أن رقم الهاتف مسجل في واتساب</div>
            <div>2️⃣ الرقم يبدأ بـ 05xxxxxxxx</div>
            <div>3️⃣ اتصال الإنترنت قوي</div>
            <div className="mt-2 text-red-600">❌ بدون إرسال واتساب لا يمكن إتمام الحجز</div>
          </div>
        </div>,
        {
          autoClose: 10000,
          closeOnClick: false,
          pauseOnHover: true
        }
      );
    } else {
      toast.error(error.message || 'حدث خطأ أثناء الحجز');
    }
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="appointment-container bg-gradient-to-br from-pink-50 to-white-50 min-h-screen flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-3xl w-full">
        <div className="header text-center mb-6">
          <h1 className="text-2xl font-bold text-purple-900">حجز موعد</h1>
          <p className="text-sm text-gray-600 mt-1">اختر المنطقة ثم التاريخ والوقت والخدمة لحجز موعدك</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="calendar-container bg-gradient-to-br from-purple-100 to-blue-100 p-4 rounded-2xl shadow-lg">
            {/* اختيار المنطقة */}
            {!selectedArea && (
              <div className="area-selection mb-4">
                <div className="flex items-center gap-2 mb-3 text-purple-900">
                  <FaMapMarkerAlt className="text-xl" />
                  <h2 className="text-lg font-semibold">اختر المنطقة</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleAreaChange('shqeib')}
                    className="py-3 px-4 bg-white rounded-lg border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50 transition-all text-purple-800 font-semibold"
                  >
                    شقيب السلام
                    <div className="text-xs text-gray-600 mt-1 font-normal">الثلاثاء فقط</div>
                  </button>
                  <button
                    onClick={() => handleAreaChange('rahat')}
                    className="py-3 px-4 bg-white rounded-lg border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50 transition-all text-purple-800 font-semibold"
                  >
                    رهط
                    <div className="text-xs text-gray-600 mt-1 font-normal">أيام متعددة</div>
                  </button>
                </div>
              </div>
            )}

            {/* التقويم */}
            {selectedArea && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-purple-900">
                    <FaCalendarAlt className="text-xl" />
                    <h2 className="text-lg font-semibold">اختر التاريخ</h2>
                  </div>
                  <button 
                    onClick={() => handleAreaChange('')}
                    className="text-sm text-purple-600 hover:text-purple-800"
                  >
                    تغيير المنطقة
                  </button>
                </div>
                <Calendar
                  onChange={handleDateChange}
                  value={selectedDate}
                  locale="ar"
                  tileDisabled={isDateDisabled}
                  className="rounded-lg border-none"
                />
                {selectedArea === 'shqeib' && (
                  <div className="mt-2 text-xs text-center text-purple-600 bg-purple-50 py-1 rounded">
                    ⓘ متاح الثلاثاء فقط في شقيب السلام
                  </div>
                )}
              </>
            )}
          </div>

          <div className="selection-container">
            {/* معلومات العميل والخدمة */}
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

            {/* اختيار الوقت */}
            {selectedDate && selectedArea && (
              <div className="time-selection mb-4">
                <div className="flex items-center gap-2 mb-1 text-purple-900">
                  <FaClock className="text-lg" />
                  <label className="text-base font-semibold">اختر الوقت</label>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {availableTimes.length > 0 ? (
                    availableTimes.map((time, index) => (
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
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-4 text-gray-500">
                      لا توجد أوقات متاحة في هذا التاريخ
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* زر التأكيد */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!selectedArea || !selectedDate || !selectedTime || !selectedService || !customerName || !phoneNumber || isSubmitting}
              className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
                !selectedArea || !selectedDate || !selectedTime || !selectedService || !customerName || !phoneNumber || isSubmitting
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