import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../dataApi/firebaseApi';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaStar } from 'react-icons/fa';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const ServiceDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);

    useEffect(() => {
        const servicesRef = ref(database, 'services');
        const unsubscribe = onValue(servicesRef, (snapshot) => {
            try {
                const servicesData = snapshot.val();
                
                if (servicesData) {
                    const foundService = Object.entries(servicesData).find(([key, value]) => {
                        return key.toLowerCase().includes(id.toLowerCase()) || 
                               value.id?.toLowerCase() === id.toLowerCase();
                    });
                    
                    if (foundService) {
                        setService({ id: foundService[0], ...foundService[1] });
                    } else {
                        setError('الخدمة غير موجودة في قاعدة البيانات');
                    }
                } else {
                    setError('لا توجد خدمات في قاعدة البيانات');
                }
            } catch (err) {
                console.error('حدث خطأ أثناء جلب البيانات:', err);
                setError('حدث خطأ في الاتصال بقاعدة البيانات');
            } finally {
                setLoading(false);
            }
        }, (error) => {
            console.error('خطأ في قراءة البيانات:', error);
            setError('فشل في جلب البيانات من الخادم');
            setLoading(false);
        });

        return () => unsubscribe();
    }, [id]);

    if (loading) {
        return (
            <div dir="rtl" className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-600">جاري تحميل الخدمة...</p>
                </div>
            </div>
        );
    }

    if (error || !service) {
        return (
            <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
                    <div className="text-red-500 text-5xl mb-4">!</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">عذراً</h2>
                    <p className="text-gray-600 mb-6">{error || 'الخدمة غير موجودة'}</p>
                    <button
                        onClick={() => navigate('/services')}
                        className="px-6 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 transition-colors shadow-md hover:shadow-lg"
                    >
                        <FaArrowLeft className="inline ml-2" />
                        العودة إلى الخدمات
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div dir="rtl" className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => navigate('/services')}
                    className="flex items-center text-pink-600 hover:text-pink-800 mb-8 transition-colors"
                >
                    <FaArrowLeft className="ml-2" />
                    العودة إلى الخدمات
                </button>

                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="flex flex-col md:flex-row items-center p-6 border-b">
                        <div className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0 mb-4 md:mb-0 md:ml-6">
                            <img 
                                src={service.serviceImageUrl} 
                                alt={service.title}
                                className="w-full h-full object-cover rounded-full border-4 border-pink-100 shadow-md"
                            />
                        </div>
                        <div className="flex-1 text-right">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                {service.title}
                            </h1>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {service.isFeatured && (
                                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm flex items-center">
                                        <FaStar className="ml-1" />
                                        مميزة
                                    </span>
                                )}
                            </div>
                            <div className="text-gray-600">
                                {service.sessionDuration && (
                                    <p className="mb-1">
                                        <span className="font-medium">مدة الجلسة:</span> {service.sessionDuration}
                                    </p>
                                )}
                                {service.resultsDuration && (
                                    <p className="mb-1">
                                        <span className="font-medium">مدة بقاء النتائج:</span> {service.resultsDuration}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 md:p-8">
                        {service.beforeAfterImageUrl && (
                            <div className="mb-8">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    النتائج قبل وبعد
                                </h3>
                                <div 
                                    className="bg-gray-100 rounded-lg overflow-hidden h-80 flex items-center justify-center cursor-pointer"
                                    onClick={() => setIsGalleryOpen(true)}
                                >
                                    <img 
                                        src={service.beforeAfterImageUrl} 
                                        alt="قبل وبعد العلاج"
                                        className="max-h-full max-w-full object-contain"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="bg-gray-50 p-5 rounded-lg mb-8">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <svg className="w-5 h-5 text-pink-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                وصف الخدمة
                            </h3>
                            <p className="text-gray-600 whitespace-pre-line">{service.description}</p>
                        </div>

                        {service.advantages && (
                                                        <div className="bg-pink-50 p-5 rounded-lg">
                                                            <h3 className="text-lg font-semibold text-pink-800 mb-3 flex items-center">
                                                                <svg className="w-5 h-5 text-pink-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                                                </svg>
                                                                مميزات الخدمة في عيادتنا
                                                            </h3>
                                                            <div className="text-pink-700 whitespace-pre-line">
                                                                {service.advantages}
                                                            </div>
                                                        </div>
                                                    )}

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => navigate(`/appointment?service=${service.id}`)}
                                className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white py-3 px-6 rounded-lg font-medium text-center transition-all shadow-md hover:shadow-lg"
                            >
                                احجز الخدمة الآن
                            </button>
                            <button
                                onClick={() => navigate('/ServiceListPage')}
                                className="flex-1 border border-pink-500 text-pink-500 hover:bg-pink-50 py-3 px-6 rounded-lg font-medium text-center transition-colors"
                            >
                                استكشف خدمات أخرى
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} className="relative z-50" dir="rtl">
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden">
                        <div className="relative">
                            <button
                                onClick={() => setIsGalleryOpen(false)}
                                className="absolute top-4 left-4 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
                            >
                                <XMarkIcon className="h-6 w-6 text-gray-600" />
                            </button>
                            
                            <div className="h-[70vh] flex items-center justify-center bg-black p-4">
                                {service.beforeAfterImageUrl && (
                                    <img 
                                        src={service.beforeAfterImageUrl} 
                                        alt="قبل وبعد العلاج"
                                        className="max-h-full max-w-full object-contain"
                                    />
                                )}
                            </div>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </div>
    );
};

export default ServiceDetailsPage;