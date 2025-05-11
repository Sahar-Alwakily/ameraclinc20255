import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../dataApi/firebaseApi';
import { Link } from 'react-router-dom';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const SpecialityMenu = () => {
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const servicesRef = ref(database, 'services');
        const unsubscribe = onValue(servicesRef, (snapshot) => {
            const servicesData = snapshot.val();
            if (servicesData) {
                const servicesArray = Object.keys(servicesData).map(key => ({
                    id: key,
                    ...servicesData[key]
                }));
                setServices(servicesArray);
            } else {
                setServices([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const openModal = (service) => {
        setSelectedService(service);
        setIsOpen(true);
    };

    if (loading) {
        return (
            <div id='speciality' className='flex flex-col items-center gap-4 py-16 text-[#262626]' dir="rtl">
                <div className="text-center mb-10">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-primary">
                        خدماتنا التجميلية
                    </h2>
                </div>
                <p className='text-center'>جاري تحميل الخدمات...</p>
            </div>
        );
    }

    return (
        <div id='speciality' className='flex flex-col items-center gap-4 py-16 text-[#262626] px-4' dir="rtl">
            <div className="text-center mb-10">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-primary">
                    خدماتنا التجميلية
                </h2>
                <div className="w-20 h-1 bg-pink-400 mx-auto mt-4 rounded-full"></div>
            </div>
            
            <div className="text-center space-y-2 max-w-2xl">
                <p className='text-gray-600'>
                    استمتعِ بأفضل الخدمات التجميلية والعناية بالبشرة مع دكتورة أميرة أبو قرن!
                </p>
                <p className='text-gray-600'>
                    احجزي موعدك بكل سهولة الآن!
                </p>
            </div>

            {services.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-5xl mb-4">💅</div>
                    <p className="text-gray-600">لا توجد خدمات متاحة حالياً</p>
                </div>
            ) : (
                <>
                    <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 pt-8 w-full max-w-6xl'>
                        {services.map((service) => (
                            <div 
                                onClick={() => openModal(service)}
                                className='flex flex-col items-center text-center cursor-pointer flex-shrink-0 hover:scale-105 transition-transform duration-300 group'
                                key={service.id}
                            >
                                <div className='relative w-24 h-24 mb-3'>
                                    <div className='absolute inset-0 bg-pink-100 rounded-full group-hover:bg-pink-200 transition-all duration-300'></div>
                                    {service.serviceImageUrl ? (
                                        <img 
                                            className='w-full h-full object-cover rounded-full border-2 border-pink-300 relative z-10' 
                                            src={service.serviceImageUrl} 
                                            alt={service.title}
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className='w-full h-full rounded-full border-2 border-pink-300 relative z-10 bg-gray-100 flex items-center justify-center'>
                                            <span className='text-xs text-gray-500'>لا توجد صورة</span>
                                        </div>
                                    )}
                                </div>

                                <p className='text-sm font-semibold text-gray-800 mt-2'>{service.title}</p>
                                {service.isFeatured && (
                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full mt-1 flex items-center">
                                        <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292z" />
                                        </svg>
                                        مميزة
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* نافذة عرض التفاصيل */}
                    <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50" dir="rtl">
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
                        <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
                            <Dialog.Panel className="w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden h-auto max-h-[90vh] flex flex-col">
                                {selectedService && (
                                    <div className="relative flex-1 overflow-y-auto">
                                        <button
                                            onClick={() => setIsOpen(false)}
                                            className="absolute top-4 left-4 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
                                        >
                                            <XMarkIcon className="h-6 w-6 text-gray-600" />
                                        </button>

                                        <div className="flex flex-col md:flex-row">
                                            {/* قسم صور قبل/بعد */}
                                            {selectedService.beforeAfterImageUrl && (
                                                <div className="w-full md:w-1/3 bg-gray-50 p-6 border-b md:border-b-0 md:border-r border-gray-200">
                                                    <div className="sticky top-0">
                                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                                            <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            النتائج قبل وبعد
                                                        </h3>
                                                        <div className="h-64 md:h-96 flex items-center justify-center bg-white p-3 rounded-lg shadow-sm">
                                                            <img
                                                                src={selectedService.beforeAfterImageUrl}
                                                                alt="قبل وبعد العلاج"
                                                                className="max-h-full max-w-full object-contain rounded"
                                                                loading="lazy"
                                                            />
                                                        </div>
                                                        <div className="flex justify-center gap-4 mt-3">
                                                            <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                                                                قبل
                                                            </span>
                                                            <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                                                                بعد
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* المحتوى الرئيسي */}
                                            <div className={`${selectedService.beforeAfterImageUrl ? 'w-full md:w-2/3' : 'w-full'} p-6 md:p-8`}>
                                                <div className="flex flex-col items-center gap-6 mb-8">
                                                    <div className="flex-shrink-0">
                                                        <div className="w-24 h-24 rounded-full border-4 border-pink-100 overflow-hidden shadow-md">
                                                            {selectedService.serviceImageUrl ? (
                                                                <img 
                                                                    src={selectedService.serviceImageUrl} 
                                                                    alt={selectedService.title}
                                                                    className="w-full h-full object-cover"
                                                                    loading="lazy"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                                    <span className="text-xs text-gray-500">لا توجد صورة</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <Dialog.Title className="text-2xl font-bold text-gray-800">
                                                            {selectedService.title}
                                                        </Dialog.Title>
                                                        {selectedService.isFeatured && (
                                                            <span className="inline-flex items-center mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full mx-auto">
                                                                <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292z" />
                                                                </svg>
                                                                مميزة
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="bg-gray-50 p-5 rounded-lg">
                                                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                                            <svg className="w-5 h-5 text-pink-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            وصف الخدمة
                                                        </h3>
                                                        <p className="text-gray-600 whitespace-pre-line">
                                                            {selectedService.description}
                                                        </p>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div className="bg-blue-50 p-4 rounded-lg">
                                                            <div className="flex items-center mb-2">
                                                                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                <h4 className="font-medium text-blue-800">مدة الجلسة</h4>
                                                            </div>
                                                            <p className="text-blue-600">
                                                                {selectedService.sessionDuration || 'غير محدد'}
                                                            </p>
                                                        </div>

                                                        <div className="bg-green-50 p-4 rounded-lg">
                                                            <div className="flex items-center mb-2">
                                                                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                <h4 className="font-medium text-green-800">مدة بقاء النتائج</h4>
                                                            </div>
                                                            <p className="text-green-600">
                                                                {selectedService.resultsDuration || 'غير محدد'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {selectedService.advantages && (
                                                        <div className="bg-pink-50 p-5 rounded-lg">
                                                            <h3 className="text-lg font-semibold text-pink-800 mb-3 flex items-center">
                                                                <svg className="w-5 h-5 text-pink-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                                                </svg>
                                                                مميزات الخدمة في عيادتنا
                                                            </h3>
                                                            <div className="text-pink-700 whitespace-pre-line">
                                                                {selectedService.advantages}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <Link
                                                    to={`/appointment?service=${selectedService.id}`}
                                                    className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium text-center transition-all shadow-md hover:shadow-lg flex items-center justify-center"
                                                >
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    احجز موعد الآن
                                                </Link>
                                                <button
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex-1 border border-pink-500 text-pink-500 hover:bg-pink-50 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                                                >
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                    إغلاق
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Dialog.Panel>
                        </div>
                    </Dialog>
                </>
            )}
        </div>
    );
};

export default SpecialityMenu;