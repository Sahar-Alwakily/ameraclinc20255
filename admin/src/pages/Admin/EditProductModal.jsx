import React, { useState, useRef } from 'react';
import axios from 'axios';

const EditProductModal = ({ product, onClose, onSave }) => {
    const [editedProduct, setEditedProduct] = useState({ ...product });
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const cloudinaryUploadPreset = 'your_upload_preset'; // استبدل بالقيمة الصحيحة
    const cloudinaryCloudName = 'your_cloud_name'; // استبدل بالقيمة الصحيحة

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedProduct(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', cloudinaryUploadPreset);

        try {
            setUploading(true);
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
                formData
            );
            
            setEditedProduct(prev => ({
                ...prev,
                photo: response.data.secure_url
            }));
            toast.success('تم رفع الصورة بنجاح');
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('فشل في رفع الصورة');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(editedProduct);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-pink-600">تعديل المنتج</h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        {/* حقل رفع الصورة */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">صورة المنتج</label>
                            <div className="flex items-center space-x-4">
                                {editedProduct.photo && (
                                    <img 
                                        src={editedProduct.photo} 
                                        alt="صورة المنتج الحالية"
                                        className="w-16 h-16 object-cover rounded-full"
                                    />
                                )}
                                <div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current.click()}
                                        disabled={uploading}
                                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                                    >
                                        {uploading ? 'جاري الرفع...' : 'اختر صورة'}
                                    </button>
                                    <p className="text-xs text-gray-500 mt-1">يُفضل صورة مربعة 1:1</p>
                                </div>
                            </div>
                        </div>

                        {/* باقي الحقول */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج</label>
                            <input
                                type="text"
                                name="name"
                                value={editedProduct.name || ''}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">السعر</label>
                            <input
                                type="number"
                                name="price"
                                value={editedProduct.price || ''}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                            <input
                                type="text"
                                name="title"
                                value={editedProduct.title || ''}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">الاستخدام</label>
                            <input
                                type="text"
                                name="use"
                                value={editedProduct.use || ''}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف</label>
                            <select
                                name="catalog"
                                value={editedProduct.catalog || 'Skincare'}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            >
                                <option value="Skincare">عناية البشرة</option>
                                <option value="Bodycare">عناية الجسم</option>
                                <option value="Haircare">عناية الشعر</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                            disabled={uploading}
                        >
                            {uploading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProductModal;