import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../dataApi/firebaseApi';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt } from 'react-icons/fa';

const Banner = () => {
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const blogsRef = ref(database, 'blogs');
        const unsubscribe = onValue(blogsRef, (snapshot) => {
            const blogsData = snapshot.val();
            if (blogsData) {
                const blogsArray = Object.keys(blogsData).map(key => ({
                    id: key,
                    ...blogsData[key]
                })).sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return dateB - dateA;
                }).slice(0, 3); // عرض 3 مدونات فقط
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
            <div className="px-6 sm:px-10 md:px-14 lg:px-12 my-20 text-center">
                <p className="text-lg text-gray-600">جاري تحميل المدونات...</p>
            </div>
        );
    }

    return (
        <div className="px-6 sm:px-10 md:px-14 lg:px-12 my-20">
            {/* العنوان الرئيسي */}
            <div className="text-center mb-10">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-primary">
                    اكتشف أحدث المدونات
                </h2>
            </div>

            {/* Grid Layout - متجاوب مع حجم الشاشة */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {blogs.map((blog) => (
                    <div 
                        key={blog.id} 
                        className="flex flex-col items-center text-center bg-white p-4 sm:p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                    >
                        {/* الصورة */}
                        <div className="w-32 h-32 sm:w-40 sm:h-40 overflow-hidden rounded-full mb-4 border-2 border-pink-200 flex items-center justify-center">
                            {blog.imageUrl ? (
                                <img 
                                    className="w-full h-full object-cover" 
                                    src={blog.imageUrl} 
                                    alt={blog.title}
                                    onError={(e) => {
                                        e.target.src = assets.vlog;
                                    }}
                                />
                            ) : (
                                <img className="w-full h-full object-cover" src={assets.vlog} alt="صورة افتراضية" />
                            )}
                        </div>

                        {/* عنوان المدونة */}
                        <h3 className="text-lg sm:text-xl font-semibold text-primary">{blog.title || "بدون عنوان"}</h3>

                        {/* تاريخ النشر */}
                        {blog.createdAt && (
                            <div className="flex items-center text-gray-500 text-xs sm:text-sm mt-2">
                                <FaCalendarAlt className="ml-1" />
                                <span>
                                    {new Date(blog.createdAt).toLocaleDateString('ar-EG')}
                                </span>
                            </div>
                        )}

                        {/* وصف مختصر */}
                        <p className="text-xs sm:text-sm text-gray-600 mt-2">
                            {blog.summary || blog.content?.substring(0, 100) + '...' || "مدونة جديدة من موريا"}
                        </p>

                        {/* زر قراءة المزيد */}
                        <button 
                            onClick={() => { 
                                navigate(`/blog/${blog.id}`); 
                                window.scrollTo(0, 0); 
                            }} 
                            className="bg-pink-500 text-white text-xs px-4 py-1 sm:px-6 sm:py-2 rounded-full mt-4 hover:bg-pink-600 transition-all"
                        >
                            قراءة المزيد
                        </button>
                    </div>
                ))}
            </div>

            {/* زر لمزيد من المدونات */}
            {blogs.length > 0 && (
                <div className="text-center mt-8">
                    <button 
                        onClick={() => navigate('/blogs')}
                        className="bg-white text-pink-500 border border-pink-500 px-6 py-2 sm:px-8 sm:py-3 rounded-full hover:bg-pink-50 transition-all"
                    >
                        لمزيد من المدونات
                    </button>
                </div>
            )}
        </div>
    );
};

export default Banner;