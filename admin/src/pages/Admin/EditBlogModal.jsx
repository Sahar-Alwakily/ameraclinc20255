import React, { useState } from 'react';
import { assets } from '../../assets/assets';
import { toast } from 'react-toastify';

const EditBlogModal = ({ blog, onClose, onSave }) => {
    const [editedBlog, setEditedBlog] = useState(blog);
    const [newImage, setNewImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedBlog(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        setNewImage(e.target.files[0]);
    };

    const uploadImageToCloudinary = async (file) => {
        if (!file) return null;
        
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'ml_default');
            
            const response = await fetch('https://api.cloudinary.com/v1_1/dh5pjhxgn/image/upload', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) throw new Error('Failed to upload image');
            
            const data = await response.json();
            return data.secure_url || null;
        } catch (error) {
            console.error('Error uploading image:', error);
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
    
        try {
            // تحميل الصورة الجديدة إذا تم تغييرها
            const imageUrl = newImage ? await uploadImageToCloudinary(newImage) : editedBlog.imageUrl;
    
            // إنشاء كائن التحديث
            const updatedBlog = {
                ...editedBlog,
                imageUrl: imageUrl || null,
                updatedAt: new Date().toISOString()
            };
    
            await onSave(updatedBlog);
        } catch (error) {
            console.error('Error updating blog:', error);
            toast.error('حدث خطأ أثناء تحديث المقالة');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold mb-4">تعديل المقالة</h3>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2">صورة المقالة</label>
                        <div className="flex items-center gap-4">
                            <label htmlFor="blog-image-edit" className="cursor-pointer">
                                <img 
                                    src={newImage ? URL.createObjectURL(newImage) : editedBlog.imageUrl || assets.upload_area} 
                                    alt="Blog" 
                                    className="w-16 h-16 object-cover rounded"
                                />
                            </label>
                            <input 
                                type="file" 
                                id="blog-image-edit" 
                                onChange={handleImageChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <button 
                                type="button" 
                                onClick={() => setNewImage(null)}
                                className="text-red-500 text-sm"
                            >
                                إزالة الصورة
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block mb-2">العنوان</label>
                            <input
                                type="text"
                                name="title"
                                value={editedBlog.title || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-2">المؤلف</label>
                            <input
                                type="text"
                                name="author"
                                value={editedBlog.author || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2">التصنيف</label>
                        <select
                            name="category"
                            value={editedBlog.category || 'General'}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        >
                            <option value="General">عام</option>
                            <option value="Technology">تكنولوجيا</option>
                            <option value="Health">صحة</option>
                            <option value="Business">أعمال</option>
                            <option value="Lifestyle">أسلوب حياة</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2">المحتوى</label>
                        <textarea
                            name="content"
                            value={editedBlog.content || ''}
                            onChange={handleChange}
                            className="w-full p-2 border rounded h-40"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 rounded"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-4 py-2 text-white rounded ${isSubmitting ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
                        >
                            {isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditBlogModal;