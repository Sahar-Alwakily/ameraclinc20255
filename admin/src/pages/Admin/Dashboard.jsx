import React, { useState, useEffect, useMemo } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../APIFirebase/Apidata';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaCalendarAlt, FaSearch } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
    const [orders, setOrders] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [notificationCount, setNotificationCount] = useState(0);

    useEffect(() => {
        let isMounted = true;

        const ordersRef = ref(database, 'orders');
        const appointmentsRef = ref(database, 'appointments');
        
        const unsubscribeOrders = onValue(ordersRef, (snapshot) => {
            if (!isMounted) return;
            const ordersData = snapshot.val();
            setOrders(ordersData ? Object.values(ordersData) : []);
        });

        const unsubscribeAppointments = onValue(appointmentsRef, (snapshot) => {
            if (!isMounted) return;
            
            const appointmentsData = snapshot.val();
            const formattedAppointments = appointmentsData 
                ? Object.keys(appointmentsData).map(key => ({
                    id: key,
                    ...appointmentsData[key],
                    date: new Date(appointmentsData[key].date).toLocaleDateString('en-US')
                })) 
                : [];
            
            setAppointments(formattedAppointments);
            setLoading(false);

            // إشعارات التحديثات مع زر إغلاق يدوي
            if (formattedAppointments.length > 0 && isMounted) {
                const latestAppointment = formattedAppointments[formattedAppointments.length - 1];
                
                // زيادة عداد الإشعارات
                setNotificationCount(prev => prev + 1);
                
                // إعداد زر الإغلاق المخصص
                const CloseButton = ({ closeToast }) => (
                    <button
                        onClick={closeToast}
                        className="text-white hover:text-gray-300 text-lg font-bold mr-2"
                        aria-label="إغلاق"
                    >
                        ×
                    </button>
                );

                toast(
                    <div dir="rtl" className="text-right flex items-start justify-between">
                        <div>
                            <strong className="text-white">حجز جديد 🔔</strong>
                            <div className="text-white mt-1 text-sm">
                                {latestAppointment.service} - {latestAppointment.customerName}
                            </div>
                            <div className="text-white text-xs mt-1">
                                {latestAppointment.time} | {latestAppointment.date}
                            </div>
                        </div>
                    </div>,
                    {
                        position: "top-left",
                        autoClose: false, // لا يختفي تلقائياً
                        rtl: true,
                        theme: "colored",
                        closeButton: CloseButton,
                        className: "notification-toast",
                        style: {
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            borderRadius: '8px',
                            padding: '12px',
                            marginTop: '10px'
                        }
                    }
                );
            }
        });

        return () => {
            isMounted = false;
            unsubscribeOrders();
            unsubscribeAppointments();
        };
    }, []);

    // دالة لمسح جميع الإشعارات
    const clearAllNotifications = () => {
        toast.dismiss();
        setNotificationCount(0);
    };

    // دالة لتفعيل الإشعارات لفترة محدودة
    const enableTemporaryNotifications = () => {
        // تفعيل الإشعارات لمدة 5 دقائق فقط
        setTimeout(() => {
            // إغلاق جميع الإشعارات بعد 5 دقائق
            toast.dismiss();
        }, 5 * 60 * 1000); // 5 دقائق
    };

    const stats = useMemo(() => {
        const today = new Date().toLocaleDateString('en-US');
        const todayOrders = orders.filter(order => 
            order.createdAt && new Date(order.createdAt).toLocaleDateString('en-US') === today
        );
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        const todayAppointments = appointments.filter(app => app.date === today);

        return {
            orders: {
                total: orders.length,
                today: todayOrders.length,
                revenue: totalRevenue
            },
            appointments: {
                today: todayAppointments.length
            }
        };
    }, [orders, appointments]);

    const chartData = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toLocaleDateString('en-US');
            const dayOrders = orders.filter(order => 
                order.createdAt && new Date(order.createdAt).toLocaleDateString('en-US') === dateStr
            );
            return {
                name: date.toLocaleDateString('ar-EG', { weekday: 'short' }),
                orders: dayOrders.length,
                revenue: dayOrders.reduce((sum, order) => sum + (order.total || 0), 0)
            };
        }).reverse();
    }, [orders]);

    const filteredAppointments = useMemo(() => {
        const today = new Date().toLocaleDateString('en-US');
        const currentTime = new Date();
        
        const getTimeValue = (timeStr) => {
            const [time, period] = timeStr.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            
            if (period === 'مساءً' && hours !== 12) hours += 12;
            if (period === 'صباحًا' && hours === 12) hours = 0;
            
            return hours * 60 + minutes;
        };

        return (appointments || [])
            .filter(app => {
                const appDate = new Date(app.date);
                const isToday = app.date === today;
                const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
                const appMinutes = getTimeValue(app.time);
                
                return isToday && appMinutes >= currentMinutes;
            })
            .sort((a, b) => getTimeValue(a.time) - getTimeValue(b.time))
            .filter(app => 
                app.customerName?.includes(searchTerm) || 
                app.service?.includes(searchTerm) || 
                app.phoneNumber?.includes(searchTerm)
            );
    }, [appointments, searchTerm]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div dir="rtl" className="p-4 md:p-6">
            {/* ToastContainer مخصص */}
            <ToastContainer
                position="top-left"
                autoClose={false}
                hideProgressBar
                newestOnTop={false}
                closeOnClick={false}
                rtl={true}
                pauseOnFocusLoss={false}
                draggable={false}
                pauseOnHover
                theme="colored"
                style={{ width: "350px", top: "70px" }}
            />

            {/* زر التحكم في الإشعارات */}
            {notificationCount > 0 && (
                <div className="mb-4 flex justify-end">
                    <button
                        onClick={clearAllNotifications}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <span>إغلاق جميع الإشعارات ({notificationCount})</span>
                        <span className="text-lg">×</span>
                    </button>
                </div>
            )}

            {/* قسم الحجوزات */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                    <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold flex items-center">
                            <FaCalendarAlt className="ml-2" /> حجوزات اليوم
                        </h3>
                        {notificationCount > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                {notificationCount}
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <div className="relative w-full md:w-64">
                            <FaSearch className="absolute right-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="ابحث بالاسم أو الخدمة..."
                                className="w-full pr-10 pl-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={enableTemporaryNotifications}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                            title="تفعيل الإشعارات لمدة 5 دقائق"
                        >
                            🔔
                        </button>
                    </div>
                </div>

                {filteredAppointments && filteredAppointments.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-3 text-right">الوقت</th>
                                    <th className="p-3 text-right">الخدمة</th>
                                    <th className="p-3 text-right">العميل</th>
                                    <th className="p-3 text-right">الهاتف</th>
                                    <th className="p-3 text-right">الحالة</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAppointments.map(app => (
                                    <tr key={app.id} className="border-b hover:bg-blue-50">
                                        <td className="p-3">{app.time}</td>
                                        <td className="p-3">{app.service}</td>
                                        <td className="p-3">{app.customerName}</td>
                                        <td className="p-3">{app.phoneNumber}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                app.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                app.status === 'rescheduled' ? 'bg-blue-100 text-blue-800' :
                                                app.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {
                                                  app.status === 'confirmed' ? 'مؤكد' 
                                                    : app.status === 'cancelled' ? 'ملغي'
                                                    : app.status === 'rescheduled' ? 'إعادة الجدولة'
                                                    : app.status === 'pending' ? 'بأنتظار التاكيد'
                                                    : 'حالة غير معروفة'
                                                }
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-4">لا توجد حجوزات اليوم</p>
                )}
            </div>

            {/* بقية الكود... */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
                {[
                    { title: 'إجمالي الطلبات', value: stats.orders.total },
                    { title: 'طلبات اليوم', value: stats.orders.today },
                    { title: 'حجوزات اليوم', value: stats.appointments.today },
                    { title: 'إجمالي الإيرادات', value: `${stats.orders.revenue} شيكل` }
                ].map((card, index) => (
                    <div key={index} className="bg-white p-4 md:p-6 rounded-lg shadow">
                        <h3 className="text-sm md:text-base text-gray-500 mb-2">{card.title}</h3>
                        <p className="text-2xl md:text-3xl font-bold">{card.value}</p>
                    </div>
                ))}
            </div>

            {/* الرسوم البيانية */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
                <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                    <h3 className="text-sm md:text-base mb-4">الطلبات حسب اليوم (آخر 7 أيام)</h3>
                    <div className="h-48 md:h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="orders" fill="#8884d8" name="عدد الطلبات" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                
                <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                    <h3 className="text-sm md:text-base mb-4">الإيرادات حسب اليوم (آخر 7 أيام)</h3>
                    <div className="h-48 md:h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="revenue" fill="#82ca9d" name="الإيرادات (شيكل)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;