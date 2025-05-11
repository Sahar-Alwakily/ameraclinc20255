import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../dataApi/firebaseApi';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const ServiceListPage = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);

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

    if (loading) {
        return (
            <div dir="rtl" className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-600">جاري تحميل الخدمات...</p>
                </div>
            </div>
        );
    }

    return (
        <div dir="rtl" className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-12 text-gray-800">خدماتنا التجميلية</h1>
                
                {services.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-gray-400 text-5xl mb-4">💅</div>
                        <h3 className="text-lg font-medium text-gray-900">لا توجد خدمات متاحة حالياً</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {services.map(service => (
                            <div 
                                key={service.id} 
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col items-center p-6 text-center"
                            >
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-pink-100 mb-4">
                                    {service.serviceImageUrl ? (
                                        <img 
                                            src={service.serviceImageUrl} 
                                            alt={service.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                                            <span>لا توجد صورة</span>
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                    {service.title || "بدون عنوان"}
                                </h3>
                                
                                <div className="flex flex-col w-full gap-3 mt-auto">
                                    <button
                                        onClick={() => navigate(`/services/${service.id}`)}
                                        className="w-full border border-pink-500 text-pink-500 hover:bg-pink-50 py-2 px-4 rounded-lg font-medium transition-colors"
                                    >
                                        عرض التفاصيل
                                    </button>
                                    <button
                                        onClick={() => navigate(`/appointment?service=${service.id}`)}
                                        className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white py-2 px-4 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                                    >
                                        احجز الخدمة الآن
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServiceListPage;