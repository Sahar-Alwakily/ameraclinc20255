import React, { useState, useEffect } from 'react';
import { ref, onValue, update, remove } from 'firebase/database';
import { database } from '../../APIFirebase/Apidata';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiInfo, FiX, FiTrash2 } from 'react-icons/fi';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        const ordersRef = ref(database, 'orders');
        const unsubscribe = onValue(ordersRef, (snapshot) => {
            const ordersData = snapshot.val();
            if (ordersData) {
                const ordersArray = Object.keys(ordersData).map(key => ({
                    id: key,
                    ...ordersData[key]
                }));
                setOrders(ordersArray);
            } else {
                setOrders([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            // تحديث حالة الطلب
            await update(ref(database, `orders/${orderId}`), {
                status: newStatus
            });
            toast.success(`تم تحديث حالة الطلب #${orderId.slice(0, 6)}`);
        } catch (error) {
            toast.error('حدث خطأ أثناء تحديث حالة الطلب');
            console.error(error);
        }
    };

    const handleRowClick = (order) => {
        setSelectedOrder(order);
        setShowDetails(true);
    };

    const deleteOrder = async (orderId) => {
        const confirmDelete = window.confirm('هل أنت متأكد أنك تريد حذف هذه الطلبية؟');
        if (confirmDelete) {
            try {
                await remove(ref(database, `orders/${orderId}`));
                toast.success(`تم حذف الطلب #${orderId.slice(0, 6)}`);
            } catch (error) {
                toast.error('حدث خطأ أثناء حذف الطلب');
                console.error(error);
            }
        }
    };

    const statusBadge = (status) => {
        const classes = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            shipped: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs ${classes[status] || 'bg-gray-100'}`}>
                {status === 'pending' && 'قيد الانتظار'}
                {status === 'processing' && 'قيد التجهيز'}
                {status === 'shipped' && 'تم الشحن'}
                {status === 'delivered' && 'تم التسليم'}
                {status === 'cancelled' && 'ملغي'}
            </span>
        );
    };

    const filteredOrders = orders.filter(order =>
        selectedStatus === 'all' || order.status === selectedStatus
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div dir="rtl" className="p-4 md:p-6">
            <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">إدارة الطلبات</h1>

            <div className="mb-4 md:mb-6 flex flex-col md:flex-row items-start md:items-center gap-2">
                <label className="text-sm md:text-base">تصفية حسب الحالة:</label>
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="border rounded p-2 text-sm md:text-base w-full md:w-auto"
                >
                    <option value="all">الكل</option>
                    <option value="pending">قيد الانتظار</option>
                    <option value="processing">قيد التجهيز</option>
                    <option value="shipped">تم الشحن</option>
                    <option value="delivered">تم التسليم</option>
                    <option value="cancelled">ملغي</option>
                </select>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 md:px-6 py-3 text-right text-xs md:text-sm font-medium text-gray-500 uppercase">رقم الطلب</th>
                            <th className="px-4 md:px-6 py-3 text-right text-xs md:text-sm font-medium text-gray-500 uppercase">العميل</th>
                            <th className="px-4 md:px-6 py-3 text-right text-xs md:text-sm font-medium text-gray-500 uppercase hidden md:table-cell">المجموع</th>
                            <th className="px-4 md:px-6 py-3 text-right text-xs md:text-sm font-medium text-gray-500 uppercase hidden md:table-cell">التاريخ</th>
                            <th className="px-4 md:px-6 py-3 text-right text-xs md:text-sm font-medium text-gray-500 uppercase">الحالة</th>
                            <th className="px-4 md:px-6 py-3 text-right text-xs md:text-sm font-medium text-gray-500 uppercase">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOrders.map(order => (
                            <tr
                                key={order.id}
                                className="hover:bg-gray-50 cursor-pointer"
                                onClick={() => handleRowClick(order)}
                            >
                                <td className="px-4 md:px-6 py-4 text-sm font-medium text-gray-900">
                                    #{order.id.slice(0, 6)}
                                    <div className="md:hidden mt-1 text-xs text-gray-500">
                                        {order.total} شيكل
                                    </div>
                                </td>
                                <td className="px-4 md:px-6 py-4 text-sm text-gray-500">
                                    {order.customerInfo?.name || 'غير معروف'}
                                    <p className="text-xs text-gray-400">{order.customerInfo?.phone}</p>
                                </td>
                                <td className="px-4 md:px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                                    {order.total} شيكل
                                </td>
                                <td className="px-4 md:px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                                    {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                                </td>
                                <td className="px-4 md:px-6 py-4">
                                    {statusBadge(order.status)}
                                </td>
                                <td className="px-4 md:px-6 py-4 text-sm font-medium flex justify-center gap-2">
                                    <select
                                        value={order.status}
                                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                        className="border rounded p-1 text-xs md:text-sm"
                                    >
                                        <option value="pending">قيد الانتظار</option>
                                        <option value="processing">قيد التجهيز</option>
                                        <option value="shipped">تم الشحن</option>
                                        <option value="delivered">تم التسليم</option>
                                        <option value="cancelled">ملغي</option>
                                    </select>
                                    <button
                                        onClick={() => deleteOrder(order.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <FiTrash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredOrders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    لا توجد طلبات متطابقة مع الفلتر المحدد
                </div>
            )}

            {/* Order Details Modal */}
            {showDetails && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 relative">
                            <button
                                onClick={() => setShowDetails(false)}
                                className="absolute left-4 top-4 text-gray-500 hover:text-gray-700"
                            >
                                <FiX size={24} />
                            </button>

                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <FiInfo /> تفاصيل الطلب #{selectedOrder.id.slice(0, 6)}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-semibold mb-2">معلومات العميل</h3>
                                    <p>الاسم: {selectedOrder.customerInfo?.name || 'غير معروف'}</p>
                                    <p>الهاتف: {selectedOrder.customerInfo?.phone}</p>
                                    <p>البريد: {selectedOrder.customerInfo?.email}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">المجموع</h3>
                                    <p>{selectedOrder.total} شيكل</p>
                                </div>
                            </div>

                            <h3 className="font-semibold mt-6">تفاصيل الطلب</h3>
                            <ul className="list-disc pl-6">
                                {selectedOrder.items.map((item, index) => (
                                    <li key={index}>
                                        {item.name} (×{item.quantity})
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer />
        </div>
    );
};

export default AdminOrders;
