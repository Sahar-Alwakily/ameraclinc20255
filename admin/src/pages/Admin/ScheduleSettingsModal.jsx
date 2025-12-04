/****************************************************************************************
 *  ScheduleSettingsModal  –  إعدادات ساعات العمل والإجازات
 *  لا يستخدم أي قيم افتراضية، يقرأ ويكتب فقط من Firebase
 ****************************************************************************************/
import React, { useState, useEffect } from "react";
import { FaClock, FaCalendarDay, FaSave, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { database } from "../../APIFirebase/Apidata";          // <— غيّر المسار حسب مشروعك
import { ref, set, onValue, off } from "firebase/database";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import ar from "date-fns/locale/ar";
registerLocale("ar", ar);

/* --------------------------------------------------
   مكون TimePicker يقبل null ويعرض «-- اختر الساعة --»
-------------------------------------------------- */
const TimePicker = ({ value, onChange }) => (
  <select
    value={value ?? ""}
    onChange={e => onChange(e.target.value === "" ? null : Number(e.target.value))}
    className="p-2 border rounded w-full"
  >
    <option value="">-- اختر الساعة --</option>
    {Array.from({ length: 24 }, (_, i) => {
      const label =
        i === 0 ? "12 صباحًا"
        : i < 12 ? `${i} صباحًا`
        : i === 12 ? "12 مساءً"
        : `${i - 12} مساءً`;
      return <option key={i} value={i}>{label}</option>;
    })}
  </select>
);

/* --------------------------------------------------
   أيام الأسبوع (اسم كامل + مختصر)
-------------------------------------------------- */
const daysOfWeek = [
  { id: 0, name: "الأحد", short: "أحد" },
  { id: 1, name: "الاثنين", short: "إثنين" },
  { id: 2, name: "الثلاثاء", short: "ثلاثاء" },
  { id: 3, name: "الأربعاء", short: "أربعاء" },
  { id: 4, name: "الخميس", short: "خميس" },
  { id: 5, name: "الجمعة", short: "جمعة" },
  { id: 6, name: "السبت", short: "سبت" }
];

/* --------------------------------------------------
   المكون الرئيسي
-------------------------------------------------- */
const ScheduleSettingsModal = ({ show, onClose, onSave }) => {
  /* ---------- الحالات ---------- */
  const [settings, setSettings] = useState({ days: [], holidays: [] });
  const [newHoliday, setNewHoliday] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /* ---------- عند فتح/غلق النافذة ---------- */
  useEffect(() => {
    if (!show) { off(ref(database, "scheduleSettings")); return; }

    setIsLoading(true);
    const dbRef = ref(database, "scheduleSettings");
    onValue(dbRef, snap => {
      const data = snap.val() || {};          // إذا لم توجد بيانات يُعطي {}
      const loadedDays = daysOfWeek.map(day => ({
        ...day,
        active: data.workingDays ? data.workingDays.includes(day.id) : false,
        start: data[`day_${day.id}_start`] ?? null,
        end: data[`day_${day.id}_end`] ?? null
      }));
      setSettings({
        days: loadedDays,
        holidays: data.holidays || []
      });
      setIsLoading(false);
    }, { onlyOnce: true });
  }, [show]);

  /* ---------- م handlers ---------- */
  const toggleDay = dayId =>
    setSettings(prev => ({
      ...prev,
      days: prev.days.map(d =>
        d.id === dayId ? { ...d, active: !d.active } : d
      )
    }));

  const changeTime = (dayId, field, value) =>
    setSettings(prev => ({
      ...prev,
      days: prev.days.map(d =>
        d.id === dayId ? { ...d, [field]: value } : d
      )
    }));

  const addHoliday = () => {
    if (!newHoliday) return;
    const iso = new Date(newHoliday.getTime() - newHoliday.getTimezoneOffset() * 60000).toISOString().split("T")[0];
    setSettings(prev => ({
      ...prev,
      holidays: [...new Set([...prev.holidays, iso])]
    }));
    setNewHoliday(null);
  };

  const removeHoliday = date =>
    setSettings(prev => ({ ...prev, holidays: prev.holidays.filter(h => h !== date) }));

  /* ---------- الحفظ ---------- */
  const handleSave = async () => {
    try {
      /* validation */
      for (const d of settings.days) {
        if (d.active && (d.start == null || d.end == null || d.start >= d.end)) {
          toast.error(`خطأ في يوم ${d.name}: اختر وقتًا صحيحًا`);
          return;
        }
      }

      const activeDays = settings.days.filter(d => d.active);
      const dbData = {
        holidays: settings.holidays,
        workingDays: activeDays.map(d => d.id),
        updatedAt: new Date().toISOString()
      };

      /* أوقات كل يوم (null إذا لم يُحدد) */
      settings.days.forEach(d => {
        dbData[`day_${d.id}_start`] = d.start ?? null;
        dbData[`day_${d.id}_end`] = d.end ?? null;
      });

      /* أول وأخر ساعة من الأيام النشطة فقط */
      const starts = activeDays.map(d => d.start).filter(v => v != null);
      const ends = activeDays.map(d => d.end).filter(v => v != null);
      if (starts.length) dbData.startHour = Math.min(...starts);
      if (ends.length) dbData.endHour = Math.max(...ends);

      await set(ref(database, "scheduleSettings"), dbData);
      if (onSave) onSave(dbData);
      toast.success("تم الحفظ");
      onClose();
    } catch (e) {
      toast.error("فشل الحفظ: " + e.message);
    }
  };

  /* ---------- حسابات عرضية ---------- */
  const activeDays = settings.days.filter(d => d.active);
  const totalStart = activeDays.length
    ? Math.min(...activeDays.map(d => d.start).filter(v => v != null))
    : null;
  const totalEnd = activeDays.length
    ? Math.max(...activeDays.map(d => d.end).filter(v => v != null))
    : null;

  /* ---------- UI ---------- */
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4" />
                <p className="text-gray-600">جاري تحميل الإعدادات...</p>
              </div>
            </div>
          ) : (
            <>
              {/* عنوان النافذة */}
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FaClock className="text-blue-500" />
                  إعدادات ساعات العمل والإجازات
                </h1>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2">
                  <FaTimes className="text-xl" />
                </button>
              </div>

              {/* ملخص ساعات العمل الإجمالية */}
              <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-blue-800">ساعات العمل الإجمالية:</h3>
                    {totalStart != null && totalEnd != null ? (
                      <p className="text-gray-700">
                        من {totalStart < 12 ? `${totalStart} صباحًا` : `${totalStart === 12 ? 12 : totalStart - 12} مساءً`}
                        {" إلى "}
                        {totalEnd < 12 ? `${totalEnd} صباحًا` : `${totalEnd === 12 ? 12 : totalEnd - 12} مساءً`}
                      </p>
                    ) : (
                      <p className="text-gray-700">لا توجد أيام عمل نشطة بعد</p>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    أيام العمل النشطة: {activeDays.length} من 7 أيام
                  </div>
                </div>
              </div>

              {/* إذا لم توجد بيانات */}
              {settings.days.length === 0 && (
                <div className="text-center py-8 text-gray-600">
                  لا توجد بيانات لساعات العمل بعد. يمكنك إضافتها يدويًا ثم حفظها.
                </div>
              )}

              {/* الشبكة: أيام العمل | الإجازات */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* أيام العمل اليومية */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">ساعات العمل اليومية</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    <strong>ملاحظة:</strong> سيتم استخدام الأوقات فقط من الأيام المفعّلة (✓)
                  </p>

                  {settings.days.map(day => (
                    <div key={day.id} className={`p-4 rounded-lg border ${day.active ? "bg-green-50 border-green-200" : "bg-gray-100 border-gray-200"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={day.active}
                            onChange={() => toggleDay(day.id)}
                            className="w-5 h-5 accent-blue-500"
                          />
                          <span className={`font-medium ${day.active ? "text-gray-800" : "text-gray-500"}`}>{day.name}</span>
                        </label>
                        {day.active && day.start != null && day.end != null && (
                          <span className="text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
                            {day.start < 12 ? `${day.start} صباحًا` : `${day.start === 12 ? 12 : day.start - 12} مساءً`}
                            {" - "}
                            {day.end < 12 ? `${day.end} صباحًا` : `${day.end === 12 ? 12 : day.end - 12} مساءً`}
                          </span>
                        )}
                      </div>

                      {day.active ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm mb-1">ساعة البدء</label>
                            <TimePicker value={day.start} onChange={v => changeTime(day.id, "start", v)} />
                          </div>
                          <div>
                            <label className="block text-sm mb-1">ساعة الانتهاء</label>
                            <TimePicker value={day.end} onChange={v => changeTime(day.id, "end", v)} />
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-2">غير مفعّل - لن يكون متاحًا للحجوزات</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* أيام الإجازة */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">أيام الإجازة</h3>
                  <div className="flex gap-2">
                    <DatePicker
                      selected={newHoliday}
                      onChange={setNewHoliday}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="اختر تاريخ الإجازة"
                      className="p-2 border rounded w-full"
                      locale="ar"
                    />
                    <button
                      onClick={addHoliday}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap"
                    >
                      إضافة
                    </button>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    {settings.holidays.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">لا توجد أيام إجازة مضافة</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {settings.holidays.map((date, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white p-2 rounded border">
                            <span className="text-sm">
                              {new Date(date + "T00:00:00+03:00").toLocaleDateString("ar-IL", {
                                timeZone: "Asia/Jerusalem",
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit"
                              })}
                            </span>
                            <button
                              onClick={() => removeHoliday(date)}
                              className="text-red-500 hover:text-red-700 p-1"
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

              {/* أزرار الإجراء */}
              <div className="mt-8 flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="bg-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSave}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
                >
                  <FaSave /> حفظ التغييرات
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleSettingsModal;