import React from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const logout = () => {
    navigate('/');
  };

  return (
<div 
  dir="rtl"
  className='flex justify-between items-center px-4 sm:px-10 py-3 border-b z-50 fixed w-full bg-white h-16' // تحديد ارتفاع ثابت (h-16)
>
      <div className='flex items-center gap-2 text-xs'>
        <img 
          onClick={() => navigate('/admin-dashboard')} 
          className='w-10 sm:w-10 cursor-pointer ml-2' // استبدال mr-2 بـ ml-2 للهامش الأيسر
          src={assets.patients_icon} 
          alt="شعار التطبيق" 
        />
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">لوحة المشرف</h2>
        </div>
      </div>
      <button 
        onClick={logout} 
        className='bg-primary text-white text-sm px-10 py-2 rounded-full'
      >
        تسجيل الخروج {/* تغيير النص إلى العربية */}
      </button>
    </div>
  );
};

export default Navbar;