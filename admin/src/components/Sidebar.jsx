import React, { useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* زر القائمة للجوال (في اليمين) */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-primary text-white rounded-lg shadow-lg"
        onClick={toggleSidebar}
        aria-label="تبديل القائمة"
      >
        {/* استخدام أيقونة القائمة (هامبورجر) بدلاً من الشعار */}
        <div className="flex flex-col justify-center items-center w-6 h-6">
          <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
          <span className={`block h-0.5 w-6 bg-white my-1 transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
        </div>
      </button>

      {/* طبقة التغطية للجوال */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* محتوى الـ Sidebar (يظهر من اليمين) */}
      <div
        dir="rtl"
        className={`fixed md:static inset-y-0 right-0 w-64 bg-white border-l z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 mt-16' : 'translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* قائمة الروابط */}
          <nav className="flex-1 overflow-y-auto">
            <ul className="py-2">
              <NavItem 
                to="/admin-dashboard" 
                icon={assets.home_icon} 
                label="الرئيسية" 
                onClick={toggleSidebar}
              />
              <NavItem 
                to="/all-appointments" 
                icon={assets.appointment_icon} 
                label="المواعيد" 
                onClick={toggleSidebar}
              />
              <NavItem 
                to="/Orders" 
                icon={assets.product_icon} 
                label="الطلبات" 
                onClick={toggleSidebar}
              />
              
              <NavItem 
                to="/DoctorQuestions" 
                icon={assets.faq} 
                label="أسأل د.اميرة" 
                onClick={toggleSidebar}
              />
              <NavItem 
                to="/AddProduct" 
                icon={assets.add_icon} 
                label="إضافة منتج" 
                onClick={toggleSidebar}
              />
              <NavItem 
                to="/AddService" 
                icon={assets.add_icon} 
                label="إضافة خدمة" 
                onClick={toggleSidebar}
              />
              <NavItem 
                to="/AddBlog" 
                icon={assets.add_icon} 
                label="إضافة مدونة" 
                onClick={toggleSidebar}
              />
              <NavItem 
                to="/ServiceList" 
                icon={assets.list_icon} 
                label="قائمة الخدمات" 
                onClick={toggleSidebar}
              />
              <NavItem 
                to="/ProductList" 
                icon={assets.list_icon} 
                label="قائمة المنتجات" 
                onClick={toggleSidebar}
              />

              <NavItem 
                to="/BlogList" 
                icon={assets.list_icon} 
                label="قائمة المدونات" 
                onClick={toggleSidebar}
              />
            </ul>
          </nav>

          {/* تذييل الـ Sidebar */}
          <div className="p-4 border-t">
            <div className="text-sm text-gray-500 text-center">
              © {new Date().getFullYear()} S7R
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const NavItem = ({ to, icon, label, onClick }) => (
  <li>
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-[#F2F3FF] transition-colors ${
          isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''
        }`
      }
      onClick={onClick}
    >
      <img src={icon} alt="" className="w-5 h-5" />
      <span>{label}</span>
    </NavLink>
  </li>
);

export default Sidebar;