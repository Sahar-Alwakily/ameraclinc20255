import React, { useState, useEffect } from 'react';
import { ref, onValue, remove, update } from 'firebase/database';
import { database } from '../../APIFirebase/Apidata';
import { toast } from 'react-toastify';
import EditBlogModal from './EditBlogModal';

const BlogList = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingBlog, setEditingBlog] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const blogsRef = ref(database, 'blogs');
        const unsubscribe = onValue(blogsRef, (snapshot) => {
            const blogsData = snapshot.val();
            if (blogsData) {
                const blogsArray = Object.entries(blogsData).map(([key, value]) => ({
                    key,
                    ...value,
                }));
                setBlogs(blogsArray);
            } else {
                setBlogs([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async (blogKey) => {
        if (window.confirm('هل أنت متأكد من حذف هذه المقالة؟')) {
            try {
                await remove(ref(database, `blogs/${blogKey}`));
                setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog.key !== blogKey));
                toast.success('تم حذف المقالة بنجاح');
            } catch (error) {
                console.error('خطأ في الحذف:', error);
                toast.error('فشل في حذف المقالة');
            }
        }
    };

    const handleEdit = (blog) => {
        setEditingBlog(blog);
        setIsModalOpen(true);
    };

    const handleUpdate = async (updatedBlog) => {
        try {
            const { key, ...updateData } = updatedBlog;

            if (!key) throw new Error('مفتاح المقالة غير موجود');

            await update(ref(database, `blogs/${key}`), {
                ...updateData,
                updatedAt: new Date().toISOString(),
            });

            setBlogs((prevBlogs) =>
                prevBlogs.map((blog) => (blog.key === key ? { ...blog, ...updateData } : blog))
            );

            toast.success('تم تحديث المقالة');
            setIsModalOpen(false);
        } catch (error) {
            console.error('خطأ في التحديث:', error);
            toast.error('فشل في تحديث المقالة');
        }
    };

    return (
        <div className="container mx-auto p-4 lg:p-6" dir="rtl">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">قائمة المقالات</h2>

            {loading ? (
                <div className="text-center py-8">جاري التحميل...</div>
            ) : blogs.length === 0 ? (
                <p className="text-center py-8">لا توجد مقالات</p>
            ) : (
                <div className="overflow-x-auto rounded-lg shadow">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-right text-sm md:text-base hidden sm:table-cell">الصورة</th>
                                <th className="p-3 text-right text-sm md:text-base">العنوان</th>
                                <th className="p-3 text-right text-sm md:text-base hidden md:table-cell">المحتوى</th>
                                <th className="p-3 text-right text-sm md:text-base">التصنيف</th>
                                <th className="p-3 text-right text-sm md:text-base hidden sm:table-cell">المؤلف</th>
                                <th className="p-3 text-right text-sm md:text-base">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {blogs.map((blog) => (
                                <tr key={blog.key} className="border-b hover:bg-gray-50">
                                    <td className="p-3 hidden sm:table-cell">
                                        {blog.imageUrl ? (
                                            <img
                                                src={blog.imageUrl}
                                                alt={blog.title}
                                                className="w-12 h-12 md:w-16 md:h-16 rounded object-cover mx-auto"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/100';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded flex items-center justify-center">
                                                <span className="text-gray-500">—</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-3 text-sm md:text-base max-w-[150px] truncate">
                                        {blog.title}
                                    </td>
                                    <td className="p-3 text-sm md:text-base max-w-[200px] truncate hidden md:table-cell">
                                        {blog.content}
                                    </td>
                                    <td className="p-3 text-sm md:text-base">
                                        {blog.category}
                                    </td>
                                    <td className="p-3 text-sm md:text-base hidden sm:table-cell">
                                        {blog.author || '—'}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex flex-col sm:flex-row gap-2 justify-end">
                                            <button
                                                onClick={() => handleEdit(blog)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 md:px-3 rounded text-xs md:text-sm transition-colors"
                                            >
                                                تعديل
                                            </button>
                                            <button
                                                onClick={() => handleDelete(blog.key)}
                                                className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 md:px-3 rounded text-xs md:text-sm transition-colors"
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

            {isModalOpen && editingBlog && (
                <EditBlogModal
                    key={editingBlog.key}
                    blog={editingBlog}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleUpdate}
                />
            )}
        </div>
    );
};

export default BlogList;
