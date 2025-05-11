import React, { useState, useEffect } from 'react';
import { ref, onValue, remove, update } from 'firebase/database';
import { database } from '../../APIFirebase/Apidata';
import { toast } from 'react-toastify';
import EditProductModal from './EditProductModal';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingKey, setEditingKey] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const productsRef = ref(database, 'products');
        const unsubscribe = onValue(productsRef, (snapshot) => {
            const productsData = snapshot.val();
            if (productsData) {
                const productsArray = Object.entries(productsData).map(([key, value]) => ({
                    key,
                    ...value
                }));
                setProducts(productsArray);
            } else {
                setProducts([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async (productKey) => {
        if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
            try {
                await remove(ref(database, `products/${productKey}`));
                toast.success('تم حذف المنتج بنجاح');
            } catch (error) {
                console.error('Error deleting product:', error);
                toast.error('فشل في حذف المنتج');
            }
        }
    };

    const handleEdit = (productKey) => {
        setEditingKey(productKey);
        setIsModalOpen(true);
    };

    const handleUpdate = async (updatedProduct) => {
        try {
            await update(ref(database, `products/${editingKey}`), updatedProduct);
            toast.success('تم تحديث المنتج بنجاح');
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error('فشل في تحديث المنتج');
        }
    };

    if (loading) {
        return <div className="text-center py-8">جاري تحميل المنتجات...</div>;
    }
    
    const getFirstFiveWords = (text) => {
        if (!text) return '';
        const words = text.split(' ');
        return words.slice(0, 5).join(' ');
    };

    return (
        <div className="container mx-auto p-4 lg:p-6" dir="rtl">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">قائمة المنتجات</h2>
            
            {products.length === 0 ? (
                <p className="text-center py-8">لا توجد منتجات</p>
            ) : (
                <div className="overflow-x-auto rounded-lg shadow">
                    <table className="min-w-full bg-white">
                        <thead className="bg-pink-100">
                            <tr>
                                <th className="py-3 px-2 md:px-4 text-right text-sm md:text-base">الصورة</th>
                                <th className="py-3 px-2 md:px-4 text-right text-sm md:text-base">الاسم</th>
                                <th className="py-3 px-2 md:px-4 text-right text-sm md:text-base">السعر</th>
                                <th className="py-3 px-2 md:px-4 text-right text-sm md:text-base hidden md:table-cell">العنوان</th>
                                <th className="py-3 px-2 md:px-4 text-right text-sm md:text-base">التصنيف</th>
                                <th className="py-3 px-2 md:px-4 text-right text-sm md:text-base">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.key} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-2 md:px-4">
                                        {product.photo && (
                                            <img 
                                                src={product.photo} 
                                                alt={product.name} 
                                                className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-full mx-auto"
                                                onError={(e) => {
                                                    e.target.src = 'https://res.cloudinary.com/demo/image/upload/v1627583529/default-product.png';
                                                }}
                                            />
                                        )}
                                    </td>
                                    <td className="py-3 px-2 md:px-4 text-sm md:text-base">{product.name}</td>
                                    <td className="py-3 px-2 md:px-4 text-sm md:text-base">{product.price} شيقل</td>
                                    <td className="py-3 px-2 md:px-4 text-sm md:text-base hidden md:table-cell">
                                        {getFirstFiveWords(product.title)}
                                    </td>
                                    <td className="py-3 px-2 md:px-4 text-sm md:text-base">{product.catalog}</td>
                                    <td className="py-3 px-2 md:px-4">
                                        <div className="flex flex-col sm:flex-row gap-2 justify-end">
                                            <button
                                                onClick={() => handleEdit(product.key)}
                                                className="bg-blue-500 text-white px-2 py-1 md:px-3 md:py-1 rounded hover:bg-blue-600 transition-colors text-xs md:text-sm"
                                            >
                                                تعديل
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.key)}
                                                className="bg-red-500 text-white px-2 py-1 md:px-3 md:py-1 rounded hover:bg-red-600 transition-colors text-xs md:text-sm"
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

            {isModalOpen && (
                <EditProductModal
                    product={products.find(p => p.key === editingKey)}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleUpdate}
                />
            )}
        </div>
    );
};

export default ProductList;
