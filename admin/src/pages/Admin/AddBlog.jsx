import React, { useState } from 'react';
import { assets } from '../../assets/assets';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { ref, push, set } from 'firebase/database';
import { database } from '../../APIFirebase/Apidata';

const AddBlog = () => {
    const [blogImage, setBlogImage] = useState(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('General');
    const [author, setAuthor] = useState('');
    const [uploading, setUploading] = useState(false);

    const uploadImageToCloudinary = async (file) => {
        if (!file) return null; // إذا لم يتم تحميل صورة
        
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
                console.error('Cloudinary error details:', errorData);
                throw new Error(`Cloudinary error: ${errorData.error?.message || 'Unknown error'}`);
            }
            
            const data = await response.json();
            console.log('Cloudinary response:', data);
            
            if (!data.secure_url) {
                throw new Error('Cloudinary did not return secure_url');
            }
            
            return data.secure_url;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw new Error(`Failed to upload image: ${error.message}`);
        }
    };

    const saveBlogToFirebase = async (blogData) => {
        try {
            const blogsRef = ref(database, 'blogs');
            const newBlogRef = push(blogsRef);
            await set(newBlogRef, blogData);
            return true;
        } catch (error) {
            console.error('Error saving to Firebase:', error);
            throw error;
        }
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        setUploading(true);

        try {
            // التحقق من البيانات الأساسية
            if (!title || !content) {
                toast.error('الرجاء إدخال العنوان والمحتوى');
                return;
            }

            // رفع الصورة إلى Cloudinary (إذا وجدت)
            const imageUrl = blogImage ? await uploadImageToCloudinary(blogImage) : null;

            // إنشاء بيانات المقال
            const blogData = {
                id: uuidv4(),
                title,
                content,
                category,
                author,
                imageUrl, // يمكن أن تكون null إذا لم يتم تحميل صورة
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // حفظ البيانات في Firebase
            await saveBlogToFirebase(blogData);
            
            toast.success('تمت إضافة المقال بنجاح!');
            console.log('Blog saved:', blogData);
            
            // إعادة تعيين الحقول
            setBlogImage(null);
            setTitle('');
            setContent('');
            setCategory('General');
            setAuthor('');

        } catch (error) {
            console.error('Error adding blog:', error);
            toast.error(error.message || 'فشل في إضافة المقال');
        } finally {
            setUploading(false);
        }
    };

    return (
        <form onSubmit={onSubmitHandler} className='m-5 w-full'>
            <p className='mb-3 text-lg font-medium'>إضافة مقال جديد</p>

            <div className='bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll'>
                <div className='flex flex-col lg:flex-row items-start gap-10 text-gray-600'>
                    <div className='w-full lg:flex-1 flex flex-col gap-4'>
                        {/* حقل الصورة (اختياري) */}
                        <div className='flex items-center gap-4 mb-4 text-gray-500'>
                            <label htmlFor="blog-img">
                                <img 
                                    className='w-16 h-16 object-cover bg-gray-100 rounded cursor-pointer' 
                                    src={blogImage ? URL.createObjectURL(blogImage) : assets.upload_area} 
                                    alt="Blog" 
                                />
                            </label>
                            <input 
                                onChange={(e) => setBlogImage(e.target.files[0])} 
                                type="file" 
                                id="blog-img" 
                                accept="image/*"
                                hidden 
                            />
                            <p>صورة المقال <br /> (اختياري)</p>
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <label>عنوان المقال *</label>
                            <input 
                                onChange={e => setTitle(e.target.value)} 
                                value={title} 
                                className='border rounded px-3 py-2' 
                                type="text" 
                                placeholder='أدخل عنوان المقال' 
                                required 
                            />
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <label>المؤلف</label>
                            <input 
                                onChange={e => setAuthor(e.target.value)} 
                                value={author} 
                                className='border rounded px-3 py-2' 
                                type="text" 
                                placeholder='اسم الكاتب' 
                            />
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <label>التصنيف</label>
                            <select 
                                onChange={e => setCategory(e.target.value)} 
                                value={category} 
                                className='border rounded px-2 py-2'
                            >
                                <option value="General">عام</option>
                                <option value="Technology">تكنولوجيا</option>
                                <option value="Health">صحة</option>
                                <option value="Business">أعمال</option>
                                <option value="Lifestyle">أسلوب حياة</option>
                            </select>
                        </div>
                    </div>

                    <div className='w-full lg:flex-1 flex flex-col gap-4'>
                        <div className='flex-1 flex flex-col gap-1'>
                            <label>محتوى المقال *</label>
                            <textarea 
                                onChange={e => setContent(e.target.value)} 
                                value={content} 
                                className='border rounded px-3 py-2 h-64' 
                                placeholder='أدخل محتوى المقال هنا...' 
                                required 
                            />
                        </div>
                    </div>
                </div>

                <button 
                    type='submit' 
                    className={`px-10 py-3 mt-4 text-white rounded-full ${uploading ? 'bg-gray-400' : 'bg-primary'}`}
                    disabled={uploading}
                >
                    {uploading ? 'جاري الحفظ...' : 'نشر المقال'}
                </button>
            </div>
        </form>
    );
};

export default AddBlog;