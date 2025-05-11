import React from 'react';
import { assets } from '../assets/assets';

const Footer = () => {
  return (
    <div className="bg-gradient-to-b from-white to-gray-50 pt-20 pb-10 px-4 md:px-10" style={{ direction: 'rtl' }}>
      <div className="max-w-7xl mx-auto">
        {/* الجزء العلوي */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* العمود الأول - معلومات العيادة */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <img className="w-32" src={assets.logo} alt="Clinic Logo" />
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                د. أميره ابو قرن
              </span>
            </div>
            <p className="text-gray-600 leading-relaxed mb-8">
              نقدم في عيادتنا أفضل خدمات التجميل والحقن التي تهدف إلى تعزيز جمالك الطبيعي. نحن متخصصون في الفيلر، البوتوكس، والعلاجات الحديثة لإعادة نضارة البشرة وحيويتها.
            </p>
            
            {/* أيقونات التواصل الاجتماعي */}
            <div className="flex gap-4">
              <a href="https://www.facebook.com/profile.php?id=100090357903411&ref=ig_profile_ac" className="w-10 h-10 rounded-full  flex items-center justify-center hover:bg-pink-200 transition-colors">
                <img src={assets.facebookIcon} alt="Facebook" className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/ameraclinic/" className="w-10 h-10 rounded-full  flex items-center justify-center hover:bg-blue-200 transition-colors">
                <img src={assets.instagramIcon} alt="Instagram" className="w-5 h-5" />
              </a>
              <a href="https://wa.me/+972545812191" className="w-10 h-10 rounded-full  flex items-center justify-center hover:bg-green-200 transition-colors">
                <img src={assets.whatsappIcon} alt="WhatsApp" className="w-5 h-5" />
              </a>
              <a href="https://www.tiktok.com/@dramerakaren" className="w-10 h-10 rounded-full  flex items-center justify-center hover:bg-green-200 transition-colors">
                <img src={assets.tiktokIcon} alt="tiktok" className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* العمود الثاني - خدماتنا */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-6">
              خدماتنا
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                'حقن البوتوكس',
                'حقن فيلر',
                'إبر النضارة',
                'حقن جلوتاثيون',
                'ليزر فراكشنال',
                'ليزر إزالة الشعر',
                'حقن فيتامينات',
                'بلازما الشعر والوجه',
                'الميزوثرابي',
                'محفزات الكولاجين',
                'تقشير بارد',
                'الابتسامة اللثوية'
              ].map((service, index) => (
                <div key={index} className="flex items-center group gap-2">
                  <span className="w-2 h-2 bg-pink-500 rounded-full group-hover:animate-pulse"></span>
                  <span className="text-gray-600 hover:text-pink-600 transition-colors text-sm">
                    {service}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* العمود الثالث - تواصل معنا */}
          <div className="space-y-6">
  <h3 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-6">
    تواصل معنا
  </h3>
  <div className="space-y-4">
    {/* الهاتف */}
    <div className="flex items-center gap-3">
      <div className="bg-pink-100 p-2 rounded-lg flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      </div>
      <span className="text-gray-600 text-base">0545812191</span>
    </div>
    
    {/* الإيميل */}
    <div className="flex items-center gap-3">
      <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <span className="text-gray-600 text-base">ameraabukaren@gmail.com</span>
    </div>
    
    {/* العنوان */}
    <div className="flex items-center gap-3">
      <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <div className="flex items-center">
        <span className="text-gray-600 text-base">العيادة: متحام 3 مقابل الهودج رهط</span>
        <a 
          href="https://waze.com/ul/hsv8dx09v7" 
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors ml-2"
        >
          <img src={assets.wazeicon} alt="waze" className="w-6 h-6" />
        </a>
      </div>
    </div>
  </div>
</div>
        </div>

        {/* الخط الفاصل */}
        <div className="border-t border-gray-200 my-8"></div>

        {/* حقوق النشر */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Copyright © 2024 <span className="font-semibold text-pink-600">Dr. Amira Clinic</span> - جميع الحقوق محفوظة
          </p>
          <p className="text-xs text-gray-400 mt-3">
          Developed by <span className="font-medium text-gray-600">Sahar Alwakily</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;