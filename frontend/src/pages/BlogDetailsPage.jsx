import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../dataApi/firebaseApi';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCalendarAlt, FaUser } from 'react-icons/fa';

const BlogDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('المعرف المستلم من الرابط:', id);
        
        const blogsRef = ref(database, 'blogs');
        const unsubscribe = onValue(blogsRef, (snapshot) => {
            try {
                const blogsData = snapshot.val();
                console.log('بيانات المدونة كاملة:', blogsData);
                
                if (blogsData) {

                    const foundBlog = Object.entries(blogsData).find(([key, value]) => {
                        console.log('مقارنة:', key, 'مع', id);
                        return key.toLowerCase().includes(id.toLowerCase()) || 
                               value.id?.toLowerCase() === id.toLowerCase();
                    });
                    
                    if (foundBlog) {
                        console.log('تم العثور على المقال:', foundBlog);
                        setBlog({ id: foundBlog[0], ...foundBlog[1] });
                    } else {
                        console.log('لم يتم العثور على المقال');
                        setError('المقال غير موجود في قاعدة البيانات');
                    }
                } else {
                    setError('لا توجد مقالات في قاعدة البيانات');
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
                    <p className="mt-4 text-lg text-gray-600">جاري تحميل المقال...</p>
                </div>
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
                    <div className="text-red-500 text-5xl mb-4">!</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">عذراً</h2>
                    <p className="text-gray-600 mb-6">{error || 'المقال غير موجود'}</p>
                    <button
                        onClick={() => navigate('/blogs')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <FaArrowLeft className="inline ml-2" />
                        العودة إلى المدونة
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div dir="rtl" className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/blogs')}
                    className="flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors"
                >
                    <FaArrowLeft className="ml-2" />
                    العودة إلى المدونة
                </button>

                <article className="bg-white rounded-xl shadow-md overflow-hidden">
                    {blog.imageUrl && (
                        <div className="h-64 md:h-96 overflow-hidden">
                            <img 
                                src={blog.imageUrl} 
                                alt={blog.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/800x400?text=صورة+المقال';
                                }}
                            />
                        </div>
                    )}
                    
                    <div className="p-6 md:p-8">
                        <div className="flex items-center mb-6 space-x-4 space-x-reverse">
                            {blog.author && (
                                <div className="flex items-center text-gray-500">
                                    <FaUser className="ml-1" />
                                    <span>{blog.author}</span>
                                </div>
                            )}
                            
                            <div className="flex items-center text-gray-500">
                                <FaCalendarAlt className="ml-1" />
                                <span>
                                    {new Date(blog.createdAt).toLocaleDateString('ar-EG', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>
                        
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                            {blog.title}
                        </h1>
                        
                        <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                            {blog.content}
                        </div>
                    </div>
                </article>
            </div>
        </div>
    );
};

export default BlogDetailsPage;