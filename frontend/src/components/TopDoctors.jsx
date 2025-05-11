import React from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';

const TopDoctors = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col md:flex-row items-center bg-white shadow-lg rounded-lg overflow-hidden max-w-5xl mx-auto p-8 gap-8 text-right" dir="rtl">
            {/* المعلومات الشخصية */}
            <div className="flex-1">
                <h2 className="text-3xl font-semibold text-gray-800">الدكتورة أميرة أبو قرن</h2>
                <p className="text-pink-500 text-lg font-medium mt-1">طبيب مختص في الطب التجميلي</p>

                {/* السيرة الذاتية المعدلة */}
                <p className="text-gray-700 text-sm mt-4 leading-relaxed">
                    طبيبة أسنان حاصلة على دبلوم <span className="font-semibold text-gray-900">DMD</span> في طب الأسنان والتجميل الطبي،
                    مع خبرة واسعة في مجال التجميل الطبي والعلاجات التكميلية. حصلت على تدريبات متقدمة في أحدث تقنيات العناية بالبشرة
                    والتجميل غير الجراحي. تتمتع بمهارات متميزة في التشخيص الدقيق وتقديم حلول علاجية متكاملة تلبي احتياجات كل مريض
                    بشكل فردي، مع التركيز على تحقيق نتائج طبيعية وآمنة.
                </p>

                {/* الخدمات (كما كانت في النسخة الأصلية) */}
                <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">الخدمات التي تقدمها:</h3>
                    <h4 className="text-base font-semibold text-gray-700 mt-3">عناية بالبشرة</h4>
                            <ul className="list-inside pl-0 text-gray-600 text-sm space-y-1">
                             <li>• بروتوكولات مخصصة للبشرة حسب النوع (دهنية، جافة، مختلطة، حساسة)</li>
                              <li>• حقن الفيلر والبوتوكس لإعادة الشباب والنضارة</li>
                              <li>• تصحيح التجاعيد وإعادة تحديد ملامح الوجه</li>
                              <li>• علاجات البشرة بالليزر لتوحيد اللون وإزالة التصبغات</li>
                              <li>• ليزر فراكشنال لتجديد البشرة وتحفيز الكولاجين</li>
                              <li>• إبر النضارة والميزوثيرابي للبشرة</li>
                              <li>• إزالة الشعر بالليزر بتقنيات آمنة ومتطورة</li>
                            </ul>
                          
                            {/* قسم الشعر */}
                            <h4 className="text-base font-semibold text-gray-700 mt-4">عناية بالشعر</h4>
                            <ul className="list-inside pl-0 text-gray-600 text-sm space-y-1">
                            <li>• حقن البلازما الغنية بالصفائح الدموية (PRP) لتقوية بصيلات الشعر</li>
                            <li>• علاج تساقط الشعر بالخلايا الجذعية لتحفيز النمو الطبيعي</li>
                            <li>• فيتامينات مغذية لفروة الرأس لتعزيز النمو والكثافة</li>    
                            <li>• بروتوكولات مقترحة حسب حالة الشعر: ضعف، تساقط، أو قشرة</li>
                            </ul>
                          
                            {/* قسم الطاقة والصحة */}
                            <h4 className="text-base font-semibold text-gray-700 mt-4">تعزيز الصحة والطاقة</h4>
                            <ul className="list-inside pl-0 text-gray-600 text-sm space-y-1">
                              <li>• حقن الفيتامينات والحديد لتعويض النقص واستعادة النشاط</li>
                              <li>• NAD+ لتحسين الطاقة الخلوية ومقاومة علامات التقدم في السن</li>
                              <li>• حقن جلوتاثيون لتفتيح البشرة بفعالية وأمان</li>
                              <li>• حقن NAD+ لتحسين النشاط الذهني والطاقة الخلوية</li>
                              <li>• حقن Alpha Lipoic Acid كمضاد أكسدة قوي لتحسين صحة الجسم</li>
                              <li>• حقن RawanQ VIP Cocktail للعناية بالبشرة، الأظافر، الشعر، الطاقة الحيوية، الصحة النفسية، وتخفيف الألم</li>
                              <li>• حقن NAH+ لترميم الصحة العامة وتعزيز النشاط الحيوي</li>

                            </ul>
    </div>

                {/* معلومات العيادة (كما كانت) */}
                <p className="text-gray-500 text-sm mt-4">📍 العيادة: متحام 3 مقابل الهودج رهط</p>

                {/* زر الحجز (كما كان) */}
                <button 
                    onClick={() => navigate('/appointment')} 
                    className="mt-4 bg-pink-500 text-white px-4 py-2 text-xs rounded-full hover:bg-pink-600 transition-all duration-300">
                    احجزي الآن
                </button>
            </div>

            {/* صورة الدكتورة (كما كانت) */}
            <div className="w-40 h-40 md:w-56 md:h-56 flex-shrink-0">
                <img 
                    className="w-full h-full object-cover rounded-full border-4 border-pink-300" 
                    src={assets.amira} 
                    alt="الدكتورة أميرة أبو قرن" 
                />
            </div>
        </div>
    );
};

export default TopDoctors;