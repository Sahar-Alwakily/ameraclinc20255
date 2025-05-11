import React, { useState } from 'react';
import { assets } from '../../assets/assets';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { ref, push, set } from 'firebase/database';
import { database } from '../../APIFirebase/Apidata';

const AddProduct = () => {
    const [productImg, setProductImg] = useState(null);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [title, setTitle] = useState('');
    const [use, setUse] = useState('');
    const [catalog, setCatalog] = useState('Skin care');
    const [uploading, setUploading] = useState(false);

    const uploadImageToCloudinary = async (file) => {
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
                throw new Error(`Cloudinary error: ${errorData.error?.message || 'Unknown error'}`);
            }
            
            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            throw new Error(`Failed to upload image: ${error.message}`);
        }
    };

    const saveProductToFirebase = async (productData) => {
        try {
            const productsRef = ref(database, 'products');
            const newProductRef = push(productsRef);
            await set(newProductRef, productData);
            return true;
        } catch (error) {
            throw error;
        }
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        setUploading(true);

        try {
            if (!productImg) {
                toast.error('الرجاء اختيار صورة المنتج');
                return;
            }

            if (!name || !price || !title || !use) {
                toast.error('الرجاء ملء جميع الحقول المطلوبة');
                return;
            }

            const imageUrl = await uploadImageToCloudinary(productImg);
            
            const productData = {
                id: uuidv4(),
                photo: imageUrl,
                name,
                price: Number(price),
                title,
                use,
                catalog,
                createdAt: new Date().toISOString()
            };

            await saveProductToFirebase(productData);
            
            toast.success('تم إضافة المنتج بنجاح!');
            
            // Reset form
            setProductImg(null);
            setName('');
            setPrice('');
            setTitle('');
            setUse('');
            setCatalog('Skin care');

        } catch (error) {
            toast.error(error.message || 'فشل في إضافة المنتج');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen" dir="rtl">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 bg-gradient-to-r text-black">
                    <h1 className="text-2xl font-bold">إضافة منتج جديد</h1>
                    <p className="text-black-100">املأ التفاصيل أدناه لإضافة منتج جديد</p>
                </div>

                <form onSubmit={onSubmitHandler} className="p-6">
                    <div className="mb-8">
                        <label className="block mb-4">
                            <span className="block text-sm font-medium text-gray-700 mb-2">صورة المنتج</span>
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-pink-500 transition-colors">
                                    {productImg ? (
                                        <img 
                                            src={URL.createObjectURL(productImg)} 
                                            alt="معاينة صورة المنتج" 
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <svg className="w-10 h-10 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                            </svg>
                                            <p className="mb-1 text-sm text-gray-200">انقر لرفع صورة</p>
                                            <p className="text-xs text-gray-200">PNG, JPG (يفضل 1:1)</p>
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        onChange={(e) => setProductImg(e.target.files[0])}
                                        accept="image/*"
                                    />
                                </label>
                            </div>
                        </label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                                        placeholder="أدخل اسم المنتج"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">السعر</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                                            placeholder="أدخل السعر"
                                            required
                                        />
                                        <span className="absolute left-3 top-3 text-gray-500">ر.س</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف</label>
                                    <select
                                        value={catalog}
                                        onChange={(e) => setCatalog(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                                    >
                                        <option value="Skin care">العناية بالبشرة</option>
                                        <option value="Hair care">العناية بالشعر</option>
                                        <option value="Body care">العناية بالجسم</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                                    <textarea
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all h-32"
                                        placeholder="أدخل وصف المنتج"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">طريقة الاستخدام</label>
                                    <textarea
                                        value={use}
                                        onChange={(e) => setUse(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all h-32"
                                        placeholder="أدخل طريقة الاستخدام"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={uploading}
                            className={`px-8 py-3 rounded-lg font-medium text-white transition-all ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-pink-600 hover:bg-pink-700 shadow-lg hover:shadow-xl'}`}
                        >
                            {uploading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    جاري الحفظ...
                                </span>
                            ) : (
                                'إضافة المنتج'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;