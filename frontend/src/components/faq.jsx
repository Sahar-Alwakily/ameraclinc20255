import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ref, push, onValue, off } from 'firebase/database';
import { database } from '../dataApi/firebaseApi';
import { toast } from 'react-toastify';

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const [newQuestion, setNewQuestion] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const faqsRef = ref(database, 'doctorQuestions');
        
        const fetchData = onValue(faqsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const faqsArray = Object.entries(data).map(([key, value]) => ({
                    id: key,
                    ...value,
                })).filter(item => 
                    item.status === 'answered' && 
                    item.publish === true // عرض فقط الأسئلة المنشورة
                ).sort((a, b) => 
                    new Date(b.answeredAt) - new Date(a.answeredAt)
                );
                setFaqs(faqsArray);
            } else {
                setFaqs([]);
            }
            setLoading(false);
        });

        return () => off(faqsRef);
    }, []);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newQuestion.trim()) return;

        setIsSubmitting(true);
        try {
            await push(ref(database, 'doctorQuestions'), {
                question: newQuestion,
                timestamp: new Date().toISOString(),
                status: 'pending',
                answer: '',
                answeredAt: null,
                publish: false // القيمة الافتراضية
            });
            setNewQuestion("");
            setSubmitSuccess(true);
            setTimeout(() => setSubmitSuccess(false), 3000);
        } catch (error) {
            console.error("Error submitting question:", error);
            toast.error("حدث خطأ أثناء إرسال السؤال");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
            <motion.h2 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center text-3xl font-bold text-pink-600 mb-8"
            >
                الأسئلة الشائعة
            </motion.h2>

            <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="p-6 space-y-4">
                    {faqs.length === 0 ? (
                        <p className="text-center py-4 text-gray-500">لا توجد أسئلة منشورة حالياً</p>
                    ) : (
                        faqs.map((faq, index) => (
                            <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                <motion.button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full text-lg font-medium text-gray-800 px-6 py-4 flex justify-between items-center focus:outline-none hover:bg-pink-50 transition-colors"
                                    whileHover={{ scale: 1.01 }}
                                >
                                    <span>{faq.question}</span>
                                    <motion.span 
                                        animate={{ rotate: openIndex === index ? 180 : 0 }}
                                        className="text-lg text-pink-400"
                                        style={{ fontSize: '0.8em' }}
                                    >
                                        ▼
                                    </motion.span>
                                </motion.button>
                                
                                <AnimatePresence>
                                    {openIndex === index && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="px-6 pb-4 text-gray-600 border-t border-gray-100"
                                        >
                                            <p className="text-md leading-relaxed">{faq.answer}</p>
                                            {faq.answeredAt && (
                                                <p className="text-sm text-gray-400 mt-2">
                                                    تمت الإجابة في: {new Date(faq.answeredAt).toLocaleDateString('ar-EG')}
                                                </p>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))
                    )}
                </div>

                <div className="bg-pink-50 p-6 border-t border-pink-100">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">اطرح سؤالك</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <textarea
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            placeholder="اكتب سؤالك هنا وسيقوم الطبيب بالرد عليك"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            rows="3"
                            required
                        />
                        <div className="flex justify-between items-center">
                            <motion.button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-pink-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-pink-700 transition-colors"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isSubmitting ? 'جاري الإرسال...' : 'إرسال السؤال'}
                            </motion.button>
                            
                            {submitSuccess && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-green-600 font-medium"
                                >
                                    تم إرسال سؤالك بنجاح!
                                </motion.div>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FAQ;