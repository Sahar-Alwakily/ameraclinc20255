import React, { useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { AppContext } from '../context/AppContext';

const Navbar = () => {
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);
    const [showCart, setShowCart] = useState(false);
    const { 
        cartItems, 
        removeFromCart, 
        updateQuantity,
        currencySymbol
    } = useContext(AppContext);

    const navLinks = [
        { to: '/contact', text: 'اتصل بنا' },
        { to: '/blogs', text: 'مدوّنتي' },
        { to: '/appointment', text: 'احجزي الآن', special: true },
        { to: '/ServiceListPage', text: 'الخدمات' },
        { to: '/ListProdect', text: 'المنتجات' },
        { to: '/', text: 'الرئيسية' }
    ];

    return (
        <>
            <div className='flex items-center justify-between py-4 px-6 bg-white rounded-xl mx-4 mt-4'>
                <img 
                    onClick={() => navigate('/')} 
                    className='w-[80px] h-[80px] cursor-pointer hover:scale-105 transition-transform' 
                    src={assets.logo} 
                    alt="Logo" 
                />

                <ul className='hidden md:flex items-center gap-4 font-medium text-gray-700'>
                    {navLinks.map((link) => (
                        <li key={link.to}>
                            <NavLink 
                                to={link.to}
                                className={({ isActive }) => 
                                    isActive ? 'text-pink-500' : 
                                    link.special ? 
                                        'px-4 py-2 border-2 border-pink-500 text-pink-500 rounded-lg hover:bg-pink-500 hover:text-white transition animate-pulse' :
                                        'hover:text-pink-500 transition'
                                }
                            >
                                {link.text}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                <div className='flex items-center gap-4'>
                    <div 
                        className='relative cursor-pointer hover:opacity-80 transition flex items-center gap-1'
                        onClick={() => setShowCart(!showCart)}
                    >
                        <img src={assets.cart} className='w-8' alt="Cart" />
                        {cartItems.length > 0 && (
                            <div className='absolute -top-2 -right-2 bg-pink-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full'>
                                {cartItems.reduce((total, item) => total + item.quantity, 0)}
                            </div>
                        )}
                    </div>

                    <img 
                        src={assets.menu_icon} 
                        onClick={() => setShowMenu(true)} 
                        className='w-8 cursor-pointer md:hidden hover:opacity-80 transition' 
                        alt="Menu" 
                    />
                </div>
            </div>

            {showMenu && (
                <div className='fixed top-0 right-0 w-2/3 h-full bg-white shadow-lg p-6 z-50 flex flex-col gap-6 items-center text-lg font-medium text-gray-700'>
                    <img 
                        src={assets.cross_icon} 
                        onClick={() => setShowMenu(false)} 
                        className='w-8 cursor-pointer self-end hover:opacity-80 transition' 
                        alt="Close" 
                    />
                    {[...navLinks].reverse().map((link) => (
                        <NavLink 
                            key={link.to}
                            onClick={() => setShowMenu(false)} 
                            to={link.to}
                            className={({ isActive }) => isActive ? 'text-pink-500' : ''}
                        >
                            {link.text}
                        </NavLink>
                    ))}
                </div>
            )}

            {showCart && (
                <div className='fixed top-0 right-0 w-80 h-full bg-white shadow-lg z-50 p-6'>
                    <div className='flex justify-between items-center mb-6'>
                        <h2 className='text-xl font-semibold text-gray-800'>سلة التسوق</h2>
                        <img 
                            src={assets.cross_icon} 
                            onClick={() => setShowCart(false)} 
                            className='w-6 cursor-pointer hover:opacity-80 transition' 
                            alt="Close" 
                        />
                    </div>

                    <div className='flex flex-col gap-4'>
                        {cartItems.length > 0 ? (
                            cartItems.map(item => (
                                <div key={item.id} className='border-b pb-4'>
                                    <div className='flex justify-between items-start mb-2'>
                                        <div className='flex-1'>
                                            <h3 className='text-sm font-medium text-gray-800'>{item.name}</h3>
                                            <p className='text-pink-600 font-bold'>{item.price} {currencySymbol}</p>
                                        </div>
                                        <button 
                                            onClick={() => removeFromCart(item.id)}
                                            className='text-xs text-gray-500 hover:text-red-500 transition'
                                        >
                                            إزالة
                                        </button>
                                    </div>
                                    
                                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-1 mt-2">
                                        <button 
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-pink-500 hover:bg-pink-50 transition"
                                            disabled={item.quantity <= 1}
                                        >
                                            -
                                        </button>
                                        <span className="text-sm font-medium mx-2">{item.quantity}</span>
                                        <button 
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-pink-500 hover:bg-pink-50 transition"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                السلة فارغة
                            </div>
                        )}
                    </div>

                    {cartItems.length > 0 && (
                        <>
                            <div className="border-t pt-4 mt-4">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">الإجمالي:</span>
                                    <span className="font-bold text-pink-600">
    {cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)} {currencySymbol}
</span>
                                </div>
                            </div>
                            <button 
                                className='w-full bg-pink-500 text-white py-2 rounded-lg mt-4 hover:bg-pink-600 transition'
                                onClick={() => {
                                    navigate('/checkout');
                                    setShowCart(false);
                                }}
                            >
                                شراء الآن
                            </button>
                        </>
                    )}
                </div>
            )}
        </>
    );
};

export default Navbar;