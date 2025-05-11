import React, { useState, useEffect } from 'react';
import { ref, onValue, remove, update } from 'firebase/database';
import { database } from '../../APIFirebase/Apidata';
import { toast } from 'react-toastify';
import EditServiceModal from './EditServiceModal';

const ServiceList = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingService, setEditingService] = useState(null);

    useEffect(() => {
        const servicesRef = ref(database, 'services');
        const unsubscribe = onValue(servicesRef, (snapshot) => {
            const servicesData = snapshot.val();
            if (servicesData) {
                const servicesArray = Object.entries(servicesData).map(([key, value]) => ({
                    key: key,
                    ...value
                }));
                setServices(servicesArray);
            } else {
                setServices([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async (serviceId) => {
        if (window.confirm('هل أنت متأكد من رغبتك في حذف هذه الخدمة؟')) {
            try {
                await remove(ref(database, `services/${serviceId}`));
                toast.success('تم حذف الخدمة بنجاح');
            } catch (error) {
                console.error('Error deleting service:', error);
                toast.error('فشل في حذف الخدمة');
            }
        }
    };

    const handleEdit = (service) => {
        setEditingService(service);
    };

    const handleUpdate = async (updatedService) => {
        try {
            if (!updatedService.key) {
                throw new Error('لا يوجد مفتاح للخدمة');
            }

            const { key, ...updateData } = updatedService;
            
            await update(ref(database, `services/${key}`), updateData);
            
            setServices(prevServices => 
                prevServices.map(service => 
                    service.key === key ? { ...service, ...updateData } : service
                )
            );
            
            toast.success('تم تحديث الخدمة بنجاح');
            setEditingService(null);
        } catch (error) {
            console.error('Error updating service:', error);
            toast.error(error.message || 'فشل في تحديث الخدمة');
        }
    };

    const truncateText = (text, maxLength = 6) => {
        if (!text) return '';
        const words = text.split(' ');
        if (words.length <= maxLength) return text;
        return words.slice(0, maxLength).join(' ') + '...';
    };

    if (loading) {
        return <div className="text-center py-8">جاري تحميل الخدمات...</div>;
    }

    return (
<div className="container mx-auto p-4" dir="rtl">
  <h2 className="text-2xl font-bold mb-6 text-center">قائمة الخدمات</h2>

  {services.length === 0 ? (
    <p className="text-center py-8">لا توجد خدمات متاحة</p>
  ) : (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md text-sm sm:text-base">
        <thead className="bg-pink-100 text-gray-700">
          <tr>
            <th className="py-3 px-4 text-right whitespace-nowrap">صورة الخدمة</th>
            <th className="py-3 px-4 text-right whitespace-nowrap">قبل / بعد</th>
            <th className="py-3 px-4 text-right whitespace-nowrap">اسم الخدمة</th>
            <th className="py-3 px-4 text-right whitespace-nowrap">مدة الجلسة</th>
            <th className="py-3 px-4 text-right whitespace-nowrap">مدة النتائج</th>
            <th className="py-3 px-4 text-right whitespace-nowrap">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.key} className="border-b hover:bg-gray-50 transition duration-150">
              {/* صورة الخدمة */}
              <td className="py-3 px-4 text-center">
                {service.serviceImageUrl ? (
                  <img
                    src={service.serviceImageUrl}
                    alt={service.title}
                    className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-full mx-auto"
                    onError={(e) => {
                      e.target.src = 'https://res.cloudinary.com/demo/image/upload/v1627583529/default-product.png';
                    }}
                  />
                ) : (
                  <span className="text-gray-400">لا يوجد</span>
                )}
              </td>

              {/* صورة قبل / بعد */}
              <td className="py-3 px-4 text-center">
                {service.beforeAfterImageUrl ? (
                  <img
                    src={service.beforeAfterImageUrl}
                    alt={`قبل وبعد ${service.title}`}
                    className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-full mx-auto"
                  />
                ) : (
                  <span className="text-gray-400">لا يوجد</span>
                )}
              </td>

              {/* اسم الخدمة */}
              <td className="py-3 px-4 text-right font-medium text-gray-800">
                <span className="block sm:hidden">{service.title?.split(' ').slice(0, 2).join(' ')}...</span>
                <span className="hidden sm:block">{service.title}</span>
              </td>

              {/* مدة الجلسة */}
              <td className="py-3 px-4 text-right">
              <span className="block sm:hidden">
                  {service.sessionDuration?.split(' ').slice(0, 2).join(' ')}...
                </span>
                <span className="hidden sm:block">{service.sessionDuration || 'غير محدد'}</span>

                </td>

              {/* مدة النتائج */}
              <td className="py-3 px-4 text-right">
                <span className="block sm:hidden">
                  {service.resultsDuration?.split(' ').slice(0, 2).join(' ')}...
                </span>
                <span className="hidden sm:block">{service.resultsDuration}</span>
              </td>

              {/* الإجراءات */}
              <td className="py-3 px-4 text-right">
                <div className="flex flex-col sm:flex-row sm:space-x-2 sm:space-x-reverse items-start sm:items-center gap-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(service.key)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition"
                  >
                    حذف
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}

  {editingService && (
    <EditServiceModal
      service={editingService}
      onClose={() => setEditingService(null)}
      onSave={handleUpdate}
    />
  )}
</div>
    );
};

export default ServiceList;
