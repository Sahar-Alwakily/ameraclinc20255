import React, { useState, useEffect } from 'react';
import { assets } from '../../assets/assets';
import { toast } from 'react-toastify';

const EditServiceModal = ({ service, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        key: '', // نضيف حقل المفتاح هنا
        title: '',
        description: '',
        sessionDuration: '',
        resultsDuration: '',
        advantages: '',
        serviceImageUrl: '',
        beforeAfterImageUrl: ''
    });
    const [serviceImageFile, setServiceImageFile] = useState(null);
    const [beforeAfterImageFile, setBeforeAfterImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (service) {
            setFormData({
                key: service.key, // نحفظ مفتاح Firebase
                title: service.title || '',
                description: service.description || '',
                sessionDuration: service.sessionDuration || '',
                resultsDuration: service.resultsDuration || '',
                advantages: service.advantages || '',
                serviceImageUrl: service.serviceImageUrl || '',
                beforeAfterImageUrl: service.beforeAfterImageUrl || ''
            });
            setServiceImageFile(null);
            setBeforeAfterImageFile(null);
        }
    }, [service]);

    const uploadToCloudinary = async (file) => {
        if (!file) return null;
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'ml_default');
        
        try {
            const response = await fetch('https://api.cloudinary.com/v1_1/dh5pjhxgn/image/upload', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Failed to upload image');
            }
            
            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error('Error uploading image:', error);
            return null;
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e, setImage) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
    
        try {
            const [serviceImageUrl, beforeAfterImageUrl] = await Promise.all([
                serviceImageFile ? uploadToCloudinary(serviceImageFile) : Promise.resolve(formData.serviceImageUrl),
                beforeAfterImageFile ? uploadToCloudinary(beforeAfterImageFile) : Promise.resolve(formData.beforeAfterImageUrl)
            ]);
    
            const updatedData = {
                ...formData,
                serviceImageUrl,
                beforeAfterImageUrl,
                updatedAt: new Date().toISOString()
            };
    
            await onSave(updatedData);
        } catch (error) {
            console.error('Error updating service:', error);
            toast.error('حدث خطأ أثناء تحديث الخدمة');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!service) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">تعديل الخدمة</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            &times;
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                            <div>
    <label className="block mb-1">صورة الخدمة</label>
    <div className="flex items-center gap-4">
        <label htmlFor="edit-service-img" className="cursor-pointer">
            <img 
                src={serviceImageFile ? URL.createObjectURL(serviceImageFile) : 
                    formData.serviceImageUrl || assets.upload_area} 
                alt="Service" 
                className="w-16 h-16 object-cover rounded"
            />
        </label>
        <input 
            type="file" 
            id="edit-service-img" 
            onChange={(e) => handleImageChange(e, setServiceImageFile)}
            className="hidden"
            accept="image/*"
        />
    </div>
</div>

<div>
    <label className="block mb-1">صورة قبل/بعد العلاج</label>
    <div className="flex items-center gap-4">
        <label htmlFor="edit-before-after-img" className="cursor-pointer">
            <img 
                src={beforeAfterImageFile ? URL.createObjectURL(beforeAfterImageFile) : 
                    formData.beforeAfterImageUrl || assets.upload_area} 
                alt="Before and After" 
                className="w-16 h-16 object-cover rounded"
            />
        </label>
        <input 
            type="file" 
            id="edit-before-after-img" 
            onChange={(e) => handleImageChange(e, setBeforeAfterImageFile)}
            className="hidden"
            accept="image/*"
        />
    </div>
</div>

                                <div>
                                    <label className="block mb-1">اسم الخدمة *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full border rounded px-3 py-2"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1">مدة الجلسة *</label>
                                    <input
                                        type="text"
                                        name="sessionDuration"
                                        value={formData.sessionDuration}
                                        onChange={handleChange}
                                        className="w-full border rounded px-3 py-2"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block mb-1">مدة بقاء النتائج</label>
                                    <input
                                        type="text"
                                        name="resultsDuration"
                                        value={formData.resultsDuration}
                                        onChange={handleChange}
                                        className="w-full border rounded px-3 py-2"
                                        placeholder="مثال: من 6 إلى 12 شهر"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1">وصف الخدمة *</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full border rounded px-3 py-2 h-32"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1">مميزات الخدمة في عيادتنا</label>
                                    <textarea
                                        name="advantages"
                                        value={formData.advantages}
                                        onChange={handleChange}
                                        className="w-full border rounded px-3 py-2 h-32"
                                        placeholder="اذكر مميزات هذه الخدمة في عيادتنا..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border rounded"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                حفظ التغييرات
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditServiceModal;