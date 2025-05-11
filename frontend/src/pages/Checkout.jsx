import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, push } from 'firebase/database';
import { database } from '../dataApi/firebaseApi';
import { AppContext } from '../context/AppContext';

const Checkout = () => {
    const navigate = useNavigate();
    const { cartItems, clearCart } = useContext(AppContext);
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        phone: '',
        address: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomerInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // إنشاء معرف فريد للعميل (بدون تسجيل دخول)
            const customerId = `guest_${Date.now()}`;
            
            // إنشاء الطلب
            const order = {
                customerId,
                customerInfo,
                items: cartItems,
                total: cartItems.reduce((sum, item) => sum + (parseInt(item.price) * item.quantity), 0),
                paymentMethod: 'cash_on_delivery',
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            // حفظ الطلب في Firebase
            const ordersRef = ref(database, 'orders');
            await push(ordersRef, order);

            // تفريغ السلة
            clearCart();
            
            setOrderSuccess(true);
        } catch (error) {
            console.error('Error submitting order:', error);
            alert('حدث خطأ أثناء تقديم الطلب');
        } finally {
            setLoading(false);
        }
    };

    if (orderSuccess) {
        return (
            <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-xl shadow-md max-w-md text-center">
                    <div className="text-green-500 text-5xl mb-4">✓</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">تم تقديم طلبك بنجاح!</h2>
                    <p className="text-gray-600 mb-6">سيتم التواصل معك لتأكيد الطلب وتحديد موعد التوصيل</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                    >
                        العودة إلى الصفحة الرئيسية
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div dir="rtl" className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-center mb-8">إتمام الطلب</h1>
                
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-lg font-semibold mb-4">عناصر الطلب</h2>
                    {cartItems.map(item => (
                        <div key={item.id} className="flex justify-between py-2 border-b">
                            <div>
                                <p>{item.name}</p>
                                <p className="text-sm text-gray-500">{item.quantity} × {item.price} شيكل</p>
                            </div>
                            <p>{item.quantity * parseInt(item.price)} شيكل</p>
                        </div>
                    ))}
                    <div className="flex justify-between font-bold mt-4">
                        <p>المجموع:</p>
                        <p>
                            {cartItems.reduce((sum, item) => sum + (parseInt(item.price) * item.quantity), 0)} شيكل
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmitOrder} className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold mb-4">معلومات العميل</h2>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">الاسم الكامل</label>
                        <input
                            type="text"
                            name="name"
                            value={customerInfo.name}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">رقم الهاتف</label>
                        <input
                            type="tel"
                            name="phone"
                            value={customerInfo.phone}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">العنوان</label>
                        <textarea
                            name="address"
                            value={customerInfo.address}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">ملاحظات (اختياري)</label>
                        <textarea
                            name="notes"
                            value={customerInfo.notes}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    
                    <div className="mb-6 p-4 bg-gray-100 rounded-lg">
    <h3 className="font-semibold mb-2">طريقة الدفع</h3>
    <div className="flex items-center">
        <input
            type="radio"
            id="pay_by_phone"
            name="paymentMethod"
            value="pay_by_phone"
            checked={customerInfo.paymentMethod === 'pay_by_phone'}
            onChange={handleInputChange}
            className="ml-2"
        />
        <label htmlFor="pay_by_phone">سيتم الاتصال بك لتأكيد الطلب والدفع</label>
    </div>
</div>
                    
                    <button
                        type="submit"
                        disabled={loading || cartItems.length === 0}
                        className={`w-full py-3 rounded-lg text-white ${loading ? 'bg-gray-400' : 'bg-pink-500 hover:bg-pink-600'} transition-colors`}
                    >
                        {loading ? 'جاري تقديم الطلب...' : 'تأكيد الطلب'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Checkout;