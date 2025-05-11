import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../dataApi/firebaseApi';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaUser } from 'react-icons/fa';

const BlogListPage = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);

        const blogsRef = ref(database, 'blogs');
        const unsubscribe = onValue(blogsRef, (snapshot) => {
            const blogsData = snapshot.val();
            if (blogsData) {
                const blogsArray = Object.keys(blogsData).map(key => ({
                    id: key,
                    ...blogsData[key]
                }));
                setBlogs(blogsArray);
            } else {
                setBlogs([]);
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
                    <p className="mt-4 text-lg text-gray-600">جاري تحميل المقالات...</p>
                </div>
            </div>
        );
    }

    return (
        <div dir="rtl" className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-12 text-gray-800">مدوّنتنا</h1>
                
                {blogs.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-gray-400 text-5xl mb-4">📝</div>
                        <h3 className="text-lg font-medium text-gray-900">لا توجد مقالات متاحة بعد</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs.map(blog => (
                            <div 
                                key={blog.id} 
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
                                onClick={() => navigate(`/blog/${blog.id}`)}
                            >
                                <div className="h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
                                    {blog.imageUrl ? (
                                        <img 
                                            src={blog.imageUrl} 
                                            alt={blog.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="text-gray-400 text-5xl">📄</div>
                                    )}
                                </div>
                                
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {blog.title || "بدون عنوان"}
                                    </h3>
                                    
                                    <div className="flex items-center text-gray-500 text-sm mt-4 space-x-4 space-x-reverse">
                                        <div className="flex items-center">
                                            <FaUser className="ml-1" />
                                            <span>{blog.author || "مجهول"}</span>
                                        </div>
                                        
                                        <div className="flex items-center">
                                            <FaCalendarAlt className="ml-1" />
                                            <span>
                                                {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('ar-EG') : "غير معروف"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogListPage;