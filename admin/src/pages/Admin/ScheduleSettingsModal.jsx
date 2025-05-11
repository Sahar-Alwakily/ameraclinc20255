import React, { useState, useEffect } from "react";
import { FaClock, FaCalendarDay, FaSave, FaTimes } from "react-icons/fa";
import { toast } from 'react-toastify';
import { database } from '../../APIFirebase/Apidata';
import { ref, set } from 'firebase/database';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { registerLocale } from "react-datepicker";
import ar from 'date-fns/locale/ar';

registerLocale('ar', ar);

const daysOfWeek = [
  { id: 0, name: 'الأحد', short: 'أحد' },
  { id: 1, name: 'الاثنين', short: 'إثنين' },
  { id: 2, name: 'الثلاثاء', short: 'ثلاثاء' },
  { id: 3, name: 'الأربعاء', short: 'أربعاء' },
  { id: 4, name: 'الخميس', short: 'خميس' },
  { id: 5, name: 'الجمعة', short: 'جمعة' },
  { id: 6, name: 'السبت', short: 'سبت' }
];

const TimePicker = ({ value, onChange }) => (
  <select 
    value={value} 
    onChange={e => onChange(Number(e.target.value))}
    className="p-2 border rounded w-full"
  >
    {Array.from({ length: 24 }, (_, i) => (
      <option key={i} value={i}>
        {i < 12 ? `${i} صباحًا` : `${i === 12 ? 12 : i-12} مساءً`}
      </option>
    ))}
  </select>
);

const ScheduleSettingsModal = ({ 
  show, 
  onClose, 
  initialSettings,
  onSave 
}) => {
  const [settings, setSettings] = useState({
    days: daysOfWeek.map(day => ({
      ...day,
      active: true,
      start: 9,
      end: 17
    })),
    holidays: []
  });

  const [newHoliday, setNewHoliday] = useState(null);

  useEffect(() => {
    if (initialSettings) {
      setSettings({
        days: daysOfWeek.map(day => ({
          ...day,
          active: initialSettings.workingDays.includes(day.id),
          start: initialSettings[`day_${day.id}_start`] || 9,
          end: initialSettings[`day_${day.id}_end`] || 17
        })),
        holidays: initialSettings.holidays || []
      });
    }
  }, [initialSettings]);

  const handleDayToggle = (dayId) => {
    setSettings(prev => ({
      ...prev,
      days: prev.days.map(day => 
        day.id === dayId ? { ...day, active: !day.active } : day
      )
    }));
  };

  const handleTimeChange = (dayId, field, value) => {
    setSettings(prev => ({
      ...prev,
      days: prev.days.map(day =>
        day.id === dayId ? { ...day, [field]: value } : day
      )
    }));
  };

  const handleAddHoliday = () => {
    if (!newHoliday) return;
    const dateStr = newHoliday.toISOString().split('T')[0];
    setSettings(prev => ({
      ...prev,
      holidays: [...new Set([...prev.holidays, dateStr])]
    }));
    setNewHoliday(null);
  };

const handleSave = async () => {
  try {
    const dbData = {
      holidays: settings.holidays,
      workingDays: settings.days.filter(d => d.active).map(d => d.id),
      updatedAt: new Date().toISOString()
    };

    settings.days.forEach(day => {
      dbData[`day_${day.id}_start`] = day.start;
      dbData[`day_${day.id}_end`] = day.end;
    });

    await set(ref(database, 'scheduleSettings'), dbData);
    toast.success('تم تحديث الساعات بنجاح');
    onClose();
  } catch (error) {
    toast.error('حدث خطأ أثناء الحفظ: ' + error.message);
  }
};

  return (
    <div className={`fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 ${show ? 'block' : 'hidden'}`}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="title-wrapper mb-8 mt-12">
            <h1 className="page-title text-3xl font-bold text-center text-gray-800">
              <FaClock className="text-blue-500" />
              إعدادات ساعات العمل والأجازات
            </h1>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FaTimes className="text-xl" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* أيام العمل */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">ساعات العمل اليومية</h3>
              <div className="space-y-4">
                {settings.days.map(day => (
                  <div key={day.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={day.active}
                          onChange={() => handleDayToggle(day.id)}
                          className="w-5 h-5 accent-blue-500"
                        />
                        <span className="font-medium">{day.name}</span>
                      </label>
                    </div>

                    {day.active && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm mb-1">ساعة البدء</label>
                          <TimePicker
                            value={day.start}
                            onChange={v => handleTimeChange(day.id, 'start', v)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">ساعة الانتهاء</label>
                          <TimePicker
                            value={day.end}
                            onChange={v => handleTimeChange(day.id, 'end', v)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* الأجازات */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">أيام الإجازة</h3>
              <div className="flex gap-2">
                <DatePicker
                  selected={newHoliday}
                  onChange={setNewHoliday}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="اختر تاريخ الإجازة"
                  className="p-2 border rounded w-full"
                  locale={ar}
                />
                <button
                  onClick={handleAddHoliday}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  إضافة
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                {settings.holidays.length === 0 ? (
                  <p className="text-gray-500 text-center">لا توجد أيام إجازة مضافة</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {settings.holidays.map((date, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-2 rounded">
                        <span>{new Date(date).toLocaleDateString('ar-EG')}</span>
                        <button
                          onClick={() => setSettings(prev => ({
                            ...prev,
                            holidays: prev.holidays.filter(d => d !== date)
                          }))}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={handleSave}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
            >
              <FaSave /> حفظ التغييرات
            </button>
            <button
              onClick={onClose}
              className="bg-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSettingsModal;