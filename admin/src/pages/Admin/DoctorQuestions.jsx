import React, { useState, useEffect } from 'react';
import { ref, onValue, off, update } from 'firebase/database';
import { database } from '../../APIFirebase/Apidata';
import { toast } from 'react-toastify';

const DoctorQuestions = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [answer, setAnswer] = useState('');
    const [publish, setPublish] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const questionsRef = ref(database, 'doctorQuestions');
        
        const fetchData = onValue(questionsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const questionsArray = Object.entries(data).map(([key, value]) => ({
                    id: key,
                    ...value
                })).sort((a, b) => {
                    // الأسئلة غير المجابة أولاً
                    if (a.status === 'pending' && b.status !== 'pending') return -1;
                    if (a.status !== 'pending' && b.status === 'pending') return 1;
                    return new Date(b.timestamp) - new Date(a.timestamp);
                });
                setQuestions(questionsArray);
            } else {
                setQuestions([]);
            }
            setLoading(false);
        });

        return () => off(questionsRef);
    }, []);

    const filteredQuestions = questions.filter(q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.answer && q.answer.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleAnswerSubmit = async (questionId) => {
        if (!answer.trim()) {
            toast.error('الرجاء إدخال إجابة');
            return;
        }

        try {
            await update(ref(database, `doctorQuestions/${questionId}`), {
                answer,
                status: 'answered',
                answeredAt: new Date().toISOString(),
                publish
            });
            toast.success('تم حفظ الإجابة بنجاح');
            setEditingId(null);
            setAnswer('');
            setPublish(true);
        } catch (error) {
            console.error('Error saving answer:', error);
            toast.error('حدث خطأ أثناء حفظ الإجابة');
        }
    };

    const togglePublishStatus = async (questionId, currentStatus) => {
        try {
            await update(ref(database, `doctorQuestions/${questionId}`), {
                publish: !currentStatus
            });
            toast.success(`تم ${currentStatus ? 'إخفاء' : 'نشر'} السؤال بنجاح`);
        } catch (error) {
            console.error('Error updating publish status:', error);
            toast.error('حدث خطأ أثناء تحديث حالة النشر');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 lg:p-6" dir="rtl">
            <h1 className="text-2xl font-bold mb-6">إدارة الأسئلة</h1>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-100">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-800">إجمالي الأسئلة</h3>
                        <p className="text-2xl">{questions.length}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-yellow-800">في انتظار الرد</h3>
                        <p className="text-2xl">{questions.filter(q => q.status === 'pending').length}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-green-800">تم الرد</h3>
                        <p className="text-2xl">{questions.filter(q => q.status === 'answered').length}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-purple-800">منشور للجمهور</h3>
                        <p className="text-2xl">{questions.filter(q => q.publish === true).length}</p>
                    </div>
                </div>

                <div className="p-4 border-b">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="ابحث في الأسئلة أو الإجابات..."
                            className="w-full p-2 pl-10 border rounded-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span className="absolute left-3 top-3 text-gray-400">🔍</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-right">السؤال</th>
                                <th className="p-3 text-right">الحالة</th>
                                <th className="p-3 text-right">النشر</th>
                                <th className="p-3 text-right">التاريخ</th>
                                <th className="p-3 text-right">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredQuestions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center p-4 text-gray-500">
                                        لا توجد أسئلة تطابق البحث
                                    </td>
                                </tr>
                            ) : (
                                filteredQuestions.map((question) => (
                                    <React.Fragment key={question.id}>
                                        <tr className="border-b hover:bg-gray-50">
                                            <td className="p-3 max-w-xs">
                                                <div className="font-medium">{question.question}</div>
                                                {question.answer && (
                                                    <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                                                        {question.answer}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    question.status === 'answered' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {question.status === 'answered' ? 'تم الرد' : 'في انتظار الرد'}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                {question.status === 'answered' && (
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        question.publish 
                                                            ? 'bg-blue-100 text-blue-800' 
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {question.publish ? 'منشور' : 'غير منشور'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3 whitespace-nowrap">
                                                {new Date(question.timestamp).toLocaleDateString('ar-EG')}
                                            </td>
                                            <td className="p-3 space-x-2">
                                                {question.status === 'answered' ? (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setEditingId(question.id);
                                                                setAnswer(question.answer);
                                                                setPublish(question.publish);
                                                            }}
                                                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                                                        >
                                                            تعديل
                                                        </button>
                                                        <button
                                                            onClick={() => togglePublishStatus(question.id, question.publish)}
                                                            className={`px-3 py-1 rounded text-sm ${
                                                                question.publish
                                                                    ? 'bg-gray-500 hover:bg-gray-600'
                                                                    : 'bg-purple-500 hover:bg-purple-600'
                                                            } text-white`}
                                                        >
                                                            {question.publish ? 'إخفاء' : 'نشر'}
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(question.id);
                                                            setAnswer('');
                                                            setPublish(true);
                                                        }}
                                                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                                                    >
                                                        أجب
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                        {editingId === question.id && (
                                            <tr className="bg-gray-50">
                                                <td colSpan="5" className="p-4">
                                                    <div className="space-y-4">
                                                        <div className="font-medium text-gray-700">
                                                            السؤال: {question.question}
                                                        </div>
                                                        <textarea
                                                            value={answer}
                                                            onChange={(e) => setAnswer(e.target.value)}
                                                            placeholder="أدخل إجابة الطبيب هنا..."
                                                            className="w-full p-3 border rounded-lg"
                                                            rows="4"
                                                        />
                                                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                                                            <div className="flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    id={`publish-${question.id}`}
                                                                    checked={publish}
                                                                    onChange={(e) => setPublish(e.target.checked)}
                                                                    className="ml-2 h-4 w-4 text-blue-600 rounded"
                                                                    disabled={question.status !== 'answered'}
                                                                />
                                                                <label htmlFor={`publish-${question.id}`} className="text-sm text-gray-700">
                                                                    نشر السؤال والإجابة للجمهور
                                                                </label>
                                                            </div>
                                                            <div className="flex gap-2 flex-1 justify-end">
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingId(null);
                                                                        setPublish(true);
                                                                    }}
                                                                    className="bg-gray-500 text-white px-4 py-2 rounded"
                                                                >
                                                                    إلغاء
                                                                </button>
                                                                <button
                                                                    onClick={() => handleAnswerSubmit(question.id)}
                                                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                                                >
                                                                    {question.status === 'answered' ? 'حفظ التعديلات' : 'حفظ الإجابة'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DoctorQuestions;