import React from 'react';
import { assets } from '../assets/assets';

const Contact = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* العنوان الرئيسي */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          تواصل <span className="text-primary">معنا</span>
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-center">
        {/* صورة التواصل */}
        <div className="w-full lg:w-1/2">
          <img 
            className="w-full rounded-xl shadow-lg object-cover h-[350px] lg:h-[400px]" 
            src={assets.contact} 
            alt="Contact us" 
          />
        </div>

        {/* معلومات التواصل */}
        <div className="w-full lg:w-1/2 bg-white p-6 lg:p-8 rounded-xl shadow-lg">
          {/* معلومات العيادة */}
          <div className="mb-6">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-3">📍 موقع العيادة</h2>
            <p className="text-gray-600 mb-2 flex items-center gap-2 text-sm lg:text-base">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              العيادة: متحام 3 مقابل الهودج رهط
            </p>
            <p className="text-gray-600 mb-2 flex items-center gap-2 text-sm lg:text-base">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              الهاتف: 0545812191
            </p>
          </div>

          {/* قسم واتساب */}
          <div className="bg-green-50 p-4 lg:p-6 rounded-lg border border-green-100 text-center mb-6">
            <div className="flex flex-col items-center mb-3">
              <img 
                src={assets.whatsappIcon} 
                alt="WhatsApp" 
                className="w-14 h-14 lg:w-16 lg:h-16 object-contain mb-2"
              />
              <h3 className="text-lg lg:text-xl font-bold text-green-800">للتواصل المباشر عبر واتساب</h3>
            </div>
            <a 
              href="https://wa.me/+972545812191" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block w-full text-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 lg:py-3 px-4 lg:px-6 rounded-lg transition-colors text-sm lg:text-base"
            >
              تواصل معنا عبر واتساب
            </a>
          </div>

          {/* وسائل التواصل الاجتماعي */}
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4 text-center">تابعنا على وسائل التواصل</h2>
            <div className="flex justify-center gap-4 lg:gap-6">
              {/* فيسبوك */}
              <a href="https://www.facebook.com/profile.php?id=100090357903411&ref=ig_profile_ac" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
                <img 
                  src={assets.facebookIcon} 
                  alt="Facebook" 
                  className="w-12 h-12 lg:w-14 lg:h-14 object-contain hover:scale-110 transition-transform"
                />
                <span className="mt-1 text-xs lg:text-sm">فيسبوك</span>
              </a>

              {/* إنستغرام */}
              <a href="https://www.instagram.com/ameraclinic/" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
                <img 
                  src={assets.instagramIcon} 
                  alt="Instagram" 
                  className="w-12 h-12 lg:w-14 lg:h-14 object-contain hover:scale-110 transition-transform"
                />
                <span className="mt-1 text-xs lg:text-sm">إنستغرام</span>
              </a>

              {/* تيك توك */}
              <a href="https://www.tiktok.com/@dramerakaren" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
                <img 
                  src={assets.tiktokIcon} 
                  alt="TikTok" 
                  className="w-12 h-12 lg:w-14 lg:h-14 object-contain hover:scale-110 transition-transform"
                />
                <span className="mt-1 text-xs lg:text-sm">تيك توك</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;