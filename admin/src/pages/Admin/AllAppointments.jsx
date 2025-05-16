import React, { useState, useEffect } from "react";
import { FaFilter, FaCheckCircle, FaClock, FaCalendarAlt, FaUser, FaPhone, FaWhatsapp, FaTimes, FaBusinessTime, FaCalendarDay, FaSave } from "react-icons/fa";
import { toast } from 'react-toastify';
import { database } from '../../APIFirebase/Apidata';
import { ref, get,update, set } from 'firebase/database';
import { registerLocale } from "react-datepicker";
import ar from 'date-fns/locale/ar';
import ScheduleSettingsModal from './ScheduleSettingsModal';
registerLocale('ar', ar);
import moment from 'moment-timezone';
import 'moment/locale/ar';
moment.locale('ar');
const statusOptions = [
  { value: "all", label: "جميع الحالات" },
  { value: "pending", label: "بانتظار التأكيد" },
  { value: "confirmed", label: "مؤكدة" },
  { value: "rescheduled", label: "إعادة جدولة" },
  { value: "cancelled", label: "ملغية" }
];

const AllAppointments = () => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [scheduleSettings, setScheduleSettings] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [weekDays, setWeekDays] = useState([]);
  const [showScheduleSettings, setShowScheduleSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState({
    startHour: 9,
    endHour: 15,
    holidays: [],
    workingDays: [0, 1, 2, 3, 4, 5, 6]
  });
  const [newHoliday, setNewHoliday] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // جلب إعدادات الجدول
        const settingsSnapshot = await get(ref(database, 'scheduleSettings'));
        if (settingsSnapshot.exists()) {
          const settings = settingsSnapshot.val();
          setScheduleSettings(settings);
          setTempSettings({
            startHour: settings.startHour || 9,
            endHour: settings.endHour || 15,
            holidays: settings.holidays || [],
            workingDays: settings.workingDays || [0, 1, 2, 3, 4, 5, 6]
          });
          
          // توليد الوقت بناء على الإعدادات
          const slots = generateTimeSlots(settings.startHour || 9, settings.endHour || 15);
          setTimeSlots(slots);
        }

        // جلب الحجوزات
        const appointmentsSnapshot = await get(ref(database, 'appointments'));
        if (appointmentsSnapshot.exists()) {
        const bookingsData = Object.entries(appointmentsSnapshot.val()).map(([id, booking]) => {
  // التحقق من صحة التاريخ قبل التحويل
              const isValidDate = moment(booking.date).isValid();
  
             return {
                id,
                name: booking.customerName,
                phone: `+972${booking.phoneNumber}`,
                date: isValidDate ? 
                  moment(booking.date).format('YYYY-MM-DD') : 
                  'تاريخ غير صالح',
                time: convertTo12HourFormat(booking.time),
                service: booking.service,
                status: booking.status || "pending",
                confirmedAt: booking.confirmedAt || null,
                cancelledAt: booking.cancelledAt || null,
                createdAt: booking.createdAt
              };
            });
          
          setBookings(bookingsData);
          setFilteredBookings(bookingsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("حدث خطأ أثناء جلب البيانات");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(booking => booking.status === statusFilter));
    }
  }, [statusFilter, bookings]);

  useEffect(() => {
    if (bookings.length > 0) {
      generateWeekDays();
    }
  }, [bookings]);

  const sendWhatsAppMessage = async (phone, templateId, variables) => {
    try {

  const apiUrl = import.meta.env.PROD 
  ? 'https://www.api.ameraclinic.com' 
  : 'http://localhost:5000';
      // Use environment variable for API base URL
      
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
    
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل إرسال الرسالة');
      }
      return await response.json();
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      throw new Error(error.message || 'فشل الاتصال بالخادم');
    }
  };
  

  const generateTimeSlots = (startHour, endHour) => {
    const slots = [];
    for (let hour = startHour; hour <= endHour; hour++) {
      slots.push(`${hour}:00 ${hour < 12 ? 'AM' : 'PM'}`);
      if (hour !== endHour) {
        slots.push(`${hour}:30 ${hour < 12 ? 'AM' : 'PM'}`);
      }
    }
    return slots;
  };

const generateWeekDays = () => {
  const today = moment(); // استخدام moment
  const days = [];
  
  for (let i = 0; i < 7; i++) {
    const date = today.clone().add(i, 'days'); // استخدام clone() و add()
    
    days.push({
      date: date.format('YYYY-MM-DD'), // استخدام format() بدلًا من toISOString()
      day: date.format('dddd'), // الحصول على اسم اليوم بالعربية
      shortDay: date.format('ddd'), // اسم اليوم المختصر
      isToday: i === 0,
      dayNumber: date.date() // الحصول على رقم اليوم
    });
  }
  
  setWeekDays(days);
};

const convertTo12HourFormat = (time) => {
  if (!time) return "وقت غير معروف";
  
  // معالجة التنسيقات العربية
  const normalizedTime = time
    .replace('صباحًا', 'AM')
    .replace('مساءً', 'PM')
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));

  const momentTime = moment(normalizedTime, 'HH:mm:ss');
  
  if (!momentTime.isValid()) return "تنسيق وقت خاطئ";
  
  return momentTime.format('h:mm A');
};

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
          <FaCheckCircle /> مؤكدة
        </span>;
      case "pending":
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
          <FaClock /> بانتظار التأكيد
        </span>;
      case "rescheduled":
      case "cancelled":
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
          <FaTimes /> {status === "rescheduled" ? "إعادة جدولة" : "ملغية"}
        </span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">غير معروف</span>;
    }
  };

  const handleWorkingDayToggle = (dayIndex) => {
    setTempSettings(prev => {
      const newWorkingDays = [...prev.workingDays];
      const dayIndexInArray = newWorkingDays.indexOf(dayIndex);
      
      if (dayIndexInArray === -1) {
        newWorkingDays.push(dayIndex);
      } else {
        newWorkingDays.splice(dayIndexInArray, 1);
      }
      
      return {
        ...prev,
        workingDays: newWorkingDays.sort()
      };
    });
  };

  const addHoliday = () => {
    if (!newHoliday) return;
    
    const holidayStr = newHoliday.toISOString().split('T')[0];
    setTempSettings(prev => ({
      ...prev,
      holidays: [...prev.holidays, holidayStr].filter((v, i, a) => a.indexOf(v) === i)
    }));
    setNewHoliday(null);
  };

  const removeHoliday = (holidayToRemove) => {
    setTempSettings(prev => ({
      ...prev,
      holidays: prev.holidays.filter(h => h !== holidayToRemove)
    }));
  };

  const saveScheduleSettings = async (newSettings) => {
    try {
      await set(ref(database, "scheduleSettings"), newSettings);
      setScheduleSettings(newSettings);
      toast.success("تم حفظ إعدادات الجدول بنجاح");
      setShowScheduleSettings(false);
    } catch (error) {
      toast.error("حدث خطأ أثناء حفظ الإعدادات: " + error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      // 1. Update appointment status in Firebase first
      await update(ref(database, `appointments/${appointmentId}`), {
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      });
  
      // 2. Get appointment data directly from Firebase
      const appointmentRef = ref(database, `appointments/${appointmentId}`);
      const appointmentSnapshot = await get(appointmentRef);
      const appointmentData = appointmentSnapshot.val();
      
      if (!appointmentData) {
        throw new Error('لم يتم العثور على بيانات الحجز');
      }
  
      // 3. Validate customer phone
      const customerPhone = appointmentData.phoneNumber;
      if (!customerPhone || customerPhone === '545380785') {
        throw new Error('رقم الهاتف غير صحيح');
      }
  
      // 4. Send cancellation message
      try {
        await sendWhatsAppMessage(customerPhone, 'HX37fbfdda164c92d277bf0199e988367c', {
          selectedDate:new Date(appointmentData.date).toLocaleDateString('ar-EG'),
        });
      } catch (whatsappError) {
        console.error('Failed to send WhatsApp message:', whatsappError);
        // Continue with cancellation even if WhatsApp fails
        toast.warning('تم إلغاء الحجز ولكن لم يتم إرسال رسالة التأكيد');
      }
  
      // 5. Update UI
      const updatedBookings = bookings.map(b => 
        b.id === appointmentId ? {...b, status: 'cancelled'} : b
      );
      setBookings(updatedBookings);
      setFilteredBookings(updatedBookings.filter(b => 
        statusFilter === 'all' || b.status === statusFilter
      ));
  
      setShowModal(false);
      toast.success('تم إلغاء الحجز بنجاح');
    } catch (error) {
      console.error('Detailed cancellation error:', {
        error: error.message,
        stack: error.stack,
        appointmentId: appointmentId
      });
      toast.error(error.message || 'حدث خطأ أثناء إلغاء الحجز');
    }
  };

  

  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const sendWhatsAppMessageDirect = (phone) => {
    const whatsappUrl = `https://wa.me/${phone.replace('+', '')}`;
    window.open(whatsappUrl, '_blank');
  };


  return (
    <div className="container mx-auto p-4 bg-white min-h-screen" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-4">إدارة المواعيد</h1>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <FaFilter className="text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded p-2 text-sm w-full"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className="text-sm text-gray-500 w-full text-center md:text-right">
              إجمالي المواعيد: {filteredBookings.length}
            </div>
            <button
              onClick={() => setShowScheduleSettings(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 whitespace-nowrap"
            >
              <FaBusinessTime /> إعدادات الجدول
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">جاري تحميل البيانات...</div>
      ) : (
        <>
          {/* جدول المواعيد للجوال */}
          <div className="md:hidden mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">قائمة المواعيد</h2>
            <div className="space-y-3">
              {filteredBookings.map(booking => (
                <div 
                  key={booking.id}
                  onClick={() => handleBookingClick(booking)}
                  className={`p-4 rounded-lg border ${
                    booking.status === "confirmed" ? "bg-green-50 border-green-200" :
                    booking.status === "pending" ? "bg-yellow-50 border-yellow-200" :
                    "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold">{booking.name}</p>
                      <p className="text-sm text-gray-600">{booking.service}</p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <FaCalendarAlt className="text-gray-500" />
                      <span>{booking.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaClock className="text-gray-500" />
                      <span>{booking.time}</span>
                    </div>
                    <div className="flex items-center gap-1 col-span-2">
                      <FaPhone className="text-gray-500" />
                      <span>{booking.phone}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* جدول المواعيد للشاشات الكبيرة */}
          <div className="hidden md:block mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">قائمة المواعيد</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 border text-right">الاسم</th>
                    <th className="py-3 px-4 border text-right">الخدمة</th>
                    <th className="py-3 px-4 border text-right">التاريخ</th>
                    <th className="py-3 px-4 border text-right">الوقت</th>
                    <th className="py-3 px-4 border text-right">الحالة</th>
                    <th className="py-3 px-4 border text-right">الهاتف</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map(booking => (
                    <tr 
                      key={booking.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleBookingClick(booking)}
                    >
                      <td className="py-3 px-4 border">{booking.name}</td>
                      <td className="py-3 px-4 border">{booking.service}</td>
                      <td className="py-3 px-4 border">{booking.date}</td>
                      <td className="py-3 px-4 border">{booking.time}</td>
                      <td className="py-3 px-4 border">{getStatusBadge(booking.status)}</td>
                      <td className="py-3 px-4 border">{booking.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* جدول الأسبوع */}
        </>
      )}

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">تفاصيل الموعد</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FaUser className="text-gray-500" />
                  <span className="font-medium">الاسم:</span>
                  <span>{selectedBooking.name}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <FaPhone className="text-gray-500" />
                  <span className="font-medium">الهاتف:</span>
                  <span>{selectedBooking.phone}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-gray-500" />
                  <span className="font-medium">الخدمة:</span>
                  <span>{selectedBooking.service}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-gray-500" />
                  <span className="font-medium">التاريخ:</span>
                  <span>{selectedBooking.date}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <FaClock className="text-gray-500" />
                  <span className="font-medium">الوقت:</span>
                  <span>{selectedBooking.time}</span>
                </div>
                
                <div className="pt-2">
                  <span className="font-medium">حالة الموعد:</span>
                  <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
                </div>
                
                {selectedBooking.confirmedAt && (
                  <div className="text-sm text-gray-600">
                    تم التأكيد في: {new Date(selectedBooking.confirmedAt).toLocaleString('ar-SA')}
                  </div>
                )}
                
                {selectedBooking.cancelledAt && (
                  <div className="text-sm text-gray-600">
                    تم الإلغاء في: {new Date(selectedBooking.cancelledAt).toLocaleString('ar-SA')}
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => sendWhatsAppMessageDirect(selectedBooking.phone)}
                  className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                  <FaWhatsapp /> مراسلة عبر واتساب
                </button>
                {selectedBooking.status !== 'cancelled' && (
                  <button
                    onClick={() => cancelAppointment(selectedBooking.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded flex items-center gap-2"
                  >
                    <FaTimes /> إلغاء الحجز
                  </button>
                )}
                <button
                  onClick={handleCloseModal}
                  className="bg-gray-200 px-4 py-2 rounded"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ScheduleSettingsModal
        show={showScheduleSettings}
        onClose={() => setShowScheduleSettings(false)}
        initialSettings={scheduleSettings}
        onSave={saveScheduleSettings}
      />

    </div>
  );
};

export default AllAppointments;