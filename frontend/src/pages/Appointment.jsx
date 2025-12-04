
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FaUser, FaPhone, FaClock, FaCalendarAlt, FaCheck, FaWhatsapp, FaInfoCircle, FaMapMarkerAlt } from 'react-icons/fa';
import { database } from '../dataApi/firebaseApi';
import { ref, push, set, get, onValue } from 'firebase/database';
import moment from 'moment-timezone';

const Appointment = () => {
  const [selectedArea, setSelectedArea] = useState('');          // 'shqeib' | 'rahat'
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
    const t = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  // جلب البيانات الأولية
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        // إعدادات الجدول
        onValue(ref(database, 'scheduleSettings'), s =>
          setScheduleSettings(s.exists() ? s.val() : {})
        );

        // الخدمات
        const svc = await get(ref(database, 'services'));
        if (svc.exists()) {
          const list = Object.entries(svc.val()).map(([id, s]) => ({ id, title: s.title }));
          setServices(list);
          const url = new URLSearchParams(window.location.search);
          const sel = list.find(i => i.id === url.get('service'));
          if (sel) setSelectedService(sel.title);
        }

        // المواعيد المحجوزة
        onValue(ref(database, 'appointments'), s =>
          setBookedAppointments(s.exists() ? s.val() : {})
        );
      } catch (e) {
        console.error(e);
        toast.error('حدث خطأ أثناء جلب البيانات');
      } finally {
        setLoadingServices(false);
      }
    };
    fetchData();
  }, []);

  /* ----------------------------------------------------------
     فلترة الخدمات حسب المنطقة واليوم
  ---------------------------------------------------------- */
  const getFilteredServices = useCallback(() => {
    if (!selectedDate) return [];
    const day = selectedDate.getDay(); // 0=أحد ... 3=أربعاء

    if (selectedArea === 'shqeib') return day === 2 ? services : [];
    if (selectedArea === 'rahat') {
      if (day === 3) return services.filter(s => s.title.includes('وريدي'));          // أربعاء فقط وريدي
      if (day !== 2) return services.filter(s => !s.title.includes('وريدي'));        // باقي الأيام بدون وريدي
    }
    return [];
  }, [selectedDate, selectedArea, services]);

  /* ----------------------------------------------------------
     توليد الأوقات:
     - الأربعاء + رهط → كل 10 دقائق
     - باقي الحالات → كل 30 دقيقة
  ---------------------------------------------------------- */
  const generateAvailableTimes = useCallback(date => {
    if (!date || !scheduleSettings || !selectedArea) {
      setAvailableTimes([]);
      return;
    }

    const day = date.getDay();

    // شقيب السلام → الثلاثاء فقط
    if (selectedArea === 'shqeib' && day !== 2) {
      setAvailableTimes([]);
      return;
    }

    // رهط → ضمن workingDays فقط + استبعاد الثلاثاء
    if (selectedArea === 'rahat') {
      const isWorkingDay = Array.isArray(scheduleSettings.workingDays) &&
                           scheduleSettings.workingDays.includes(day);
      const isExcludedDay = day === 2; // الثلاثاء

      if (!isWorkingDay || isExcludedDay) {
        setAvailableTimes([]);
        return;
      }
    }

    // قراءة أوقات البداية والنهاية
    const start = scheduleSettings[`day_${day}_start`];
    const end   = scheduleSettings[`day_${day}_end`];

    if (typeof start !== 'number' || typeof end !== 'number' || start >= end) {
      setAvailableTimes([]);
      return;
    }

    const times = [];

    // الأربعاء + رهط → كل 10 دقائق
    if (selectedArea === 'rahat' && day === 3) {
      for (let h = start; h < end; h++) {
        const period = h < 12 ? 'صباحًا' : 'مساءً';
        const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
        for (let m = 0; m < 60; m += 10) {
          times.push(`${displayHour}:${m.toString().padStart(2, '0')} ${period}`);
        }
      }
      const periodEnd = end < 12 ? 'صباحًا' : 'مساءً';
      const displayHourEnd = end === 0 ? 12 : end > 12 ? end - 12 : end;
      times.push(`${displayHourEnd}:00 ${periodEnd}`);
    } else {
      // باقي الأيام → كل 30 دقيقة
      for (let h = start; h < end; h++) {
        const periodStart = h < 12 ? 'صباحًا' : 'مساءً';
        const displayHourStart = h === 0 ? 12 : h > 12 ? h - 12 : h;

        times.push(`${displayHourStart}:00 ${periodStart}`);
        times.push(`${displayHourStart}:30 ${periodStart}`);
      }
      const periodEnd = end < 12 ? 'صباحًا' : 'مساءً';
      const displayHourEnd = end === 0 ? 12 : end > 12 ? end - 12 : end;
      times.push(`${displayHourEnd}:00 ${periodEnd}`);
    }

    setAvailableTimes(times);
  }, [scheduleSettings, selectedArea]);

  /* ----------------------------------------------------------
     باقي المنطق (بدون تعديل جوهري)
  ---------------------------------------------------------- */
  const isTimeAvailable = useCallback(
    time => {
      if (!selectedDate || !scheduleSettings || !selectedArea) return false;
      const dateStr = moment(selectedDate).tz('Asia/Jerusalem').format('YYYY-MM-DD');
      if (Array.isArray(scheduleSettings.holidays) && scheduleSettings.holidays.includes(dateStr)) return false;

      const day = selectedDate.getDay();
      if (selectedArea === 'shqeib' && day !== 2) return false;
      if (selectedArea === 'rahat' && (!Array.isArray(scheduleSettings.workingDays) ||
          !scheduleSettings.workingDays.includes(day))) return false;

      // الوقت ضمن الفترة المحفوظة فقط
      const start = scheduleSettings[`day_${day}_start`];
      const end   = scheduleSettings[`day_${day}_end`];
      if (typeof start !== 'number' || typeof end !== 'number') return false;

      const isPM = time.includes('مساءً');
      const [t, m] = time.replace(/صباحًا|مساءً/g, '').trim().split(':').map(Number);
      let h = t; if (isPM && h !== 12) h += 12; if (!isPM && h === 12) h = 0;
      if (h < start || h > end) return false;

      // لا أوقات ماضية
      const now = moment().tz('Asia/Jerusalem');
      if (moment(selectedDate).isSame(now, 'day')) {
        const currH = now.hours(), currM = now.minutes();
        if (h < currH || (h === currH && (m||0) <= currM)) return false;
      }
      return true;
    },
    [selectedDate, scheduleSettings, selectedArea, currentTime]
  );

  const isTimeBooked = useCallback(
    time => {
      if (!selectedDate || !selectedArea) return false;
      return Object.values(bookedAppointments).some(ap => {
        if (!ap || !['pending','confirmed'].includes(ap.status) || ap.area !== selectedArea) return false;
        const apMoment = moment(ap.date).tz('Asia/Jerusalem');
        const selMoment = moment(selectedDate).startOf('day');
        const isPM = time.includes('مساءً');
        const [t, m] = time.replace(/صباحًا|مساءً/g, '').trim().split(':').map(Number);
        let h = t; if (isPM && h !== 12) h += 12; if (!isPM && h === 12) h = 0;
        return apMoment.isSame(selMoment, 'day') && apMoment.hours() === h && apMoment.minutes() === (m||0);
      });
    },
    [selectedDate, bookedAppointments, selectedArea]
  );

  useEffect(() => { if (selectedDate && selectedArea) generateAvailableTimes(selectedDate); },
           [selectedDate, selectedArea, generateAvailableTimes]);

  /* ---------- Handlers ---------- */
  const handleDateChange = date => { if (!date || isNaN(date.getTime())) return; setSelectedDate(date); setSelectedTime(''); generateAvailableTimes(date); };
  const handleAreaChange = area => { setSelectedArea(area); setSelectedDate(null); setSelectedTime(''); setSelectedService(''); };

  const isDateDisabled = ({ date }) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const adjDate = new Date(date); adjDate.setHours(0,0,0,0);
    if (adjDate < today) return true;
    const dateStr = moment(date).tz('Asia/Jerusalem').format('YYYY-MM-DD');
    if (Array.isArray(scheduleSettings?.holidays) && scheduleSettings.holidays.includes(dateStr)) return true;
    const day = date.getDay();
    if (selectedArea === 'shqeib' && day !== 2) return true;
    if (selectedArea === 'rahat' && day === 2) return true;
    if (selectedArea === 'rahat' && (!Array.isArray(scheduleSettings?.workingDays) ||
        !scheduleSettings.workingDays.includes(day))) return true;
    return false;
  };

  const formatArabicDate = date => new Date(date).toLocaleDateString('ar-IL', {
    timeZone:'Asia/Jerusalem', weekday:'long', year:'numeric', month:'long', day:'numeric'
  });

  const convertTo24 = time => {
    if (!time) return '';
    const isPM = time.includes('مساءً');
    const [t, m] = time.replace(/صباحًا|مساءً/g, '').trim().split(':').map(Number);
    let h = t; if (isPM && h !== 12) h += 12; if (!isPM && h === 12) h = 0;
    return `${String(h).padStart(2,'0')}:${String(m||0).padStart(2,'0')}:00`;
  };

  /* ---------- إرسال الحجز مع واتساب إجباري ---------- */
  const sendWhatsAppMessage = async (phone, templateId, variables) => {
    try {
      if (!phone || phone.length < 9) throw new Error('رقم الهاتف غير صالح');
      if (!phone.match(/^5[0-9]{8,}$/)) throw new Error('الرجاء إدخال رقم هاتف صحيح يبدأ بـ 5');

      const apiUrl = import.meta.env.PROD
        ? 'https://www.api.ameraclinic.com'
        : 'http://localhost:5000';

      const response = await fetch(`${apiUrl}/api/send-whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, templateId, variables }),
        timeout: 15000
      });

      const responseData = await response.json().catch(() => ({}));
      if (!response.ok) {
        let errorMessage = 'فشل إرسال الرسالة';
        if (response.status === 400) errorMessage = 'رقم الهاتف غير صحيح أو غير مسجل في واتساب';
        else if (response.status === 429) errorMessage = 'تم إرسال الكثير من الرسائل، يرجى المحاولة لاحقاً';
        else if (responseData.error) errorMessage = responseData.error.message || responseData.error;
        throw new Error(errorMessage);
      }
      if (!responseData.success && !responseData.messageId) {
        throw new Error('لم يتم إرسال الرسالة، يرجى التحقق من الرقم');
      }
      return responseData;
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      throw new Error(`فشل إرسال واتساب: ${error.message}. تأكد من أن الرقم ${phone} مسجل في واتساب`);
    }
  };

  const handleSubmit = async () => {
    if (!selectedArea || !selectedDate || !selectedTime || !selectedService || !customerName || !phoneNumber) {
      toast.warning('الرجاء تعبئة جميع الحقول!');
      return;
    }
    try {
      const isPM = selectedTime.includes('مساءً');
      const [t, m] = selectedTime.replace(/صباحًا|مساءً/g, '').trim().split(':').map(Number);
      let h = t; if (isPM && h !== 12) h += 12; if (!isPM && h === 12) h = 0;
      const appMoment = moment(selectedDate).set({h, m}).tz('Asia/Jerusalem', true);
      if (!appMoment.isValid()) { toast.error('الوقت المحدد غير صحيح'); return; }
      if (isTimeBooked(selectedTime)) { toast.error('الوقت محجوز بالفعل'); return; }

      setIsSubmitting(true);
      const cleanPhone = phoneNumber.replace(/\D/g, '').replace(/^0/, '');
      if (cleanPhone.length < 9 || !cleanPhone.startsWith('5')) {
        toast.error('أدخل رقمًا صحيحًا يبدأ بـ 05xxxxxxxx');
        setIsSubmitting(false); return;
      }

      // إرسال واتساب أولاً
      const whatsappResult = await sendWhatsAppMessage(cleanPhone, 'HX277d8bcb856090aa17ce4c441dc8f103', {
        customerName,
        selectedDate: formatArabicDate(selectedDate),
        selectedTime,
        area: selectedArea === 'shqeib' ? 'شقيب السلام' : 'رهط'
      });

      // حفظ الحجز بعد نجاح الواتساب
      const appointmentsRef = ref(database, 'appointments');
      const newRef = push(appointmentsRef);
      await set(newRef, {
        customerName,
        phoneNumber: cleanPhone,
        service: selectedService,
        date: appMoment.toISOString(),
        time: selectedTime,
        area: selectedArea,
        createdAt: new Date().toISOString(),
        status: 'pending',
        timezone: 'Asia/Jerusalem',
        whatsappSent: true,
        whatsappMessageId: whatsappResult.messageId
      });

      toast.success('✅ تم الحجز بنجاح وتم إرسال تأكيد إلى واتساب!');
      setSelectedArea(''); setSelectedDate(null); setSelectedTime(''); setSelectedService('');
      setCustomerName(''); setPhoneNumber('');
    } catch (e) {
      console.error(e);
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
        { autoClose: 10000, closeOnClick: false, pauseOnHover: true }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- Render ---------- */
  if (loadingServices) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-4" />
        <p className="text-gray-600">جاري التحميل...</p>
      </div>
    </div>
  );

  return (
    <div className="appointment-container bg-gradient-to-br from-pink-50 to-white-50 min-h-screen flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-3xl w-full">
        <div className="header text-center mb-6">
          <h1 className="text-2xl font-bold text-purple-900">حجز موعد</h1>
          <p className="text-sm text-gray-600 mt-1">اختر المنطقة ثم التاريخ والوقت والخدمة لحجز موعدك</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* التقويم */}
          <div className="calendar-container bg-gradient-to-br from-purple-100 to-blue-100 p-4 rounded-2xl shadow-lg">
            {!selectedArea && (
              <div className="area-selection mb-4">
                <div className="flex items-center gap-2 mb-3 text-purple-900">
                  <FaMapMarkerAlt className="text-xl" />
                  <h2 className="text-lg font-semibold">اختر المنطقة</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handleAreaChange('shqeib')} className="py-3 px-4 bg-white rounded-lg border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50 transition-all text-purple-800 font-semibold">شقيب السلام<div className="text-xs text-gray-600 mt-1 font-normal">الثلاثاء فقط</div></button>
                  <button onClick={() => handleAreaChange('rahat')} className="py-3 px-4 bg-white rounded-lg border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50 transition-all text-purple-800 font-semibold">رهط<div className="text-xs text-gray-600 mt-1 font-normal">أيام متعددة</div></button>
                </div>
              </div>
            )}

            {selectedArea && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-purple-900"><FaCalendarAlt className="text-xl" /><h2 className="text-lg font-semibold">اختر التاريخ</h2></div>
                  <button onClick={() => handleAreaChange('')} className="text-sm text-purple-600 hover:text-purple-800">تغيير المنطقة</button>
                </div>
                <Calendar onChange={handleDateChange} value={selectedDate} locale="ar" tileDisabled={isDateDisabled} className="rounded-lg border-none" />
                {selectedArea === 'shqeib' && <div className="mt-2 text-xs text-center text-purple-600 bg-purple-50 py-1 rounded">ⓘ متاح الثلاثاء فقط في شقيب السلام</div>}
              </>
            )}
          </div>

          {/* النموذج */}
          <div className="selection-container">
            <div className="customer-name mb-4"><div className="flex items-center gap-2 mb-1 text-purple-900"><FaUser className="text-lg" /><label className="text-base font-semibold">اسم العميل</label></div><input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full py-2 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="أدخل اسمك" /></div>
            <div className="phone-number mb-4"><div className="flex items-center gap-2 mb-1 text-purple-900"><FaPhone className="text-lg" /><label className="text-base font-semibold">رقم الهاتف</label></div><input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="w-full py-2 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="أدخل رقم هاتفك" dir="ltr" /></div>
            <div className="service-selection mb-4"><div className="flex items-center gap-2 mb-1 text-purple-900"><FaInfoCircle className="text-lg" /><label className="text-base font-semibold">اختر الخدمة</label></div><select value={selectedService} onChange={e => setSelectedService(e.target.value)} className="w-full py-2 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"><option value="">اختر الخدمة</option>{getFilteredServices().map(s => <option key={s.id} value={s.title}>{s.title}</option>)}</select></div>

            {selectedDate && selectedArea && (
              <div className="time-selection mb-4">
                <div className="flex items-center gap-2 mb-1 text-purple-900"><FaClock className="text-lg" /><label className="text-base font-semibold">اختر الوقت</label></div>
                <div className="grid grid-cols-3 gap-2">
                  {availableTimes.length ? availableTimes.map(t => (
                    <button key={t} type="button" onClick={() => setSelectedTime(t)} disabled={!isTimeAvailable(t) || isTimeBooked(t)} className={`py-2 px-1 rounded-lg text-sm transition-all ${selectedTime === t ? 'bg-purple-600 text-white' : !isTimeAvailable(t) || isTimeBooked(t) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-purple-100 text-purple-800 hover:bg-purple-200'}`}>{t}{selectedTime === t && <FaCheck className="inline mr-1" />}</button>
                  )) : <div className="col-span-3 text-center py-4 text-gray-500">لا توجد أوقات متاحة في هذا التاريخ</div>}
                </div>
              </div>
            )}

            <button type="button" onClick={handleSubmit} disabled={!selectedArea || !selectedDate || !selectedTime || !selectedService || !customerName || !phoneNumber || isSubmitting} className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${!selectedArea || !selectedDate || !selectedTime || !selectedService || !customerName || !phoneNumber || isSubmitting ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'}`}><FaWhatsapp className="text-xl" />{isSubmitting ? 'جاري الحجز...' : 'تأكيد الحجز'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointment;
