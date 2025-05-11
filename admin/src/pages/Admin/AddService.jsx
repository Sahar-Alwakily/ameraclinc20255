import React, { useState } from 'react';
import { assets } from '../../assets/assets';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { ref, push, set } from 'firebase/database';
import { database } from '../../APIFirebase/Apidata';

const AddService = () => {
    const [serviceImage, setServiceImage] = useState(null);
    const [beforeAfterImage, setBeforeAfterImage] = useState(null);
    const [title, setTitle] = useState('');
    const [sessionDuration, setSessionDuration] = useState('');
    const [description, setDescription] = useState('');
    const [resultsDuration, setResultsDuration] = useState('');
    const [advantages, setAdvantages] = useState('');
    const [uploading, setUploading] = useState(false);

    const uploadImageToCloudinary = async (file) => {
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
                const errorData = await response.json();
                console.error('Cloudinary error details:', errorData);
                throw new Error(`Cloudinary error: ${errorData.error?.message || 'Unknown error'}`);
            }
            
            const data = await response.json();
            console.log('Cloudinary response:', data);
            
            if (!data.secure_url) {
                throw new Error('Cloudinary did not return secure_url');
            }
            
            return data.secure_url;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw new Error(`Failed to upload image: ${error.message}`);
        }
    };

    const saveServiceToFirebase = async (serviceData) => {
        try {
            const servicesRef = ref(database, 'services');
            const newServiceRef = push(servicesRef);
            await set(newServiceRef, serviceData);
            return true;
        } catch (error) {
            console.error('Error saving to Firebase:', error);
            throw error;
        }
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        setUploading(true);

        try {
            // التحقق من البيانات الأساسية
            if (!title || !description || !sessionDuration) {
                toast.error('الرجاء إدخال جميع الحقول المطلوبة');
                return;
            }

            // رفع الصور إلى Cloudinary
            const serviceImageUrl = serviceImage ? await uploadImageToCloudinary(serviceImage) : null;
            const beforeAfterImageUrl = beforeAfterImage ? await uploadImageToCloudinary(beforeAfterImage) : null;

            // إنشاء بيانات الخدمة
            const serviceData = {
                id: uuidv4(),
                title,
                description,
                sessionDuration,
                resultsDuration,
                advantages,
                serviceImageUrl,
                beforeAfterImageUrl,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // حفظ البيانات في Firebase
            await saveServiceToFirebase(serviceData);
            
            toast.success('تمت إضافة الخدمة بنجاح!');
            console.log('Service saved:', serviceData);
            
            // إعادة تعيين الحقول
            setServiceImage(null);
            setBeforeAfterImage(null);
            setTitle('');
            setDescription('');
            setSessionDuration('');
            setResultsDuration('');
            setAdvantages('');

        } catch (error) {
            console.error('Error adding service:', error);
            toast.error(error.message || 'فشل في إضافة الخدمة');
        } finally {
            setUploading(false);
        }
    };

    return (
        <form onSubmit={onSubmitHandler} className='m-5 w-full'>
            <p className='mb-3 text-lg font-medium'>إضافة خدمة جديدة</p>

            <div className='bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll'>
                <div className='flex flex-col lg:flex-row items-start gap-10 text-gray-600'>
                    <div className='w-full lg:flex-1 flex flex-col gap-4'>
                        {/* حقل صورة الخدمة */}
                        <div className='flex items-center gap-4 mb-4 text-gray-500'>
                            <label htmlFor="service-img">
                                <img 
                                    className='w-16 h-16 object-cover bg-gray-100 rounded cursor-pointer' 
                                    src={serviceImage ? URL.createObjectURL(serviceImage) : assets.upload_area} 
                                    alt="Service" 
                                />
                            </label>
                            <input 
                                onChange={(e) => setServiceImage(e.target.files[0])} 
                                type="file" 
                                id="service-img" 
                                accept="image/*"
                                hidden 
                            />
                            <p>صورة الخدمة <br /> (اختياري)</p>
                        </div>

                        {/* حقل صورة قبل وبعد */}
                        <div className='flex items-center gap-4 mb-4 text-gray-500'>
                            <label htmlFor="before-after-img">
                                <img 
                                    className='w-16 h-16 object-cover bg-gray-100 rounded cursor-pointer' 
                                    src={beforeAfterImage ? URL.createObjectURL(beforeAfterImage) : assets.upload_area} 
                                    alt="Before and After" 
                                />
                            </label>
                            <input 
                                onChange={(e) => setBeforeAfterImage(e.target.files[0])} 
                                type="file" 
                                id="before-after-img" 
                                accept="image/*"
                                hidden 
                            />
                            <p>صورة قبل وبعد العلاج <br /> (اختياري)</p>
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <label>اسم الخدمة *</label>
                            <input 
                                onChange={e => setTitle(e.target.value)} 
                                value={title} 
                                className='border rounded px-3 py-2' 
                                type="text" 
                                placeholder='أدخل اسم الخدمة' 
                                required 
                            />
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <label>مدة الجلسة *</label>
                            <input 
                                onChange={e => setSessionDuration(e.target.value)} 
                                value={sessionDuration} 
                                className='border rounded px-3 py-2' 
                                type="text" 
                                placeholder='مثال: 30 دقيقة' 
                                required
                            />
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <label>مدة بقاء النتائج</label>
                            <input 
                                onChange={e => setResultsDuration(e.target.value)} 
                                value={resultsDuration} 
                                className='border rounded px-3 py-2' 
                                type="text" 
                                placeholder='مثال: من 6 إلى 12 شهر' 
                            />
                        </div>
                    </div>

                    <div className='w-full lg:flex-1 flex flex-col gap-4'>
                        <div className='flex-1 flex flex-col gap-1'>
                            <label>وصف الخدمة *</label>
                            <textarea 
                                onChange={e => setDescription(e.target.value)} 
                                value={description} 
                                className='border rounded px-3 py-2 h-40' 
                                placeholder='أدخل وصف مفصل للخدمة...' 
                                required 
                            />
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <label>مميزات الخدمة في عيادتنا</label>
                            <textarea 
                                onChange={e => setAdvantages(e.target.value)} 
                                value={advantages} 
                                className='border rounded px-3 py-2 h-40' 
                                placeholder='اذكر مميزات هذه الخدمة في عيادتنا...' 
                            />
                        </div>
                    </div>
                </div>

                <button 
                    type='submit' 
                    className={`px-10 py-3 mt-4 text-white rounded-full ${uploading ? 'bg-gray-400' : 'bg-primary'}`}
                    disabled={uploading}
                >
                    {uploading ? 'جاري الحفظ...' : 'إضافة الخدمة'}
                </button>
            </div>
        </form>
    );
};

export default AddService;