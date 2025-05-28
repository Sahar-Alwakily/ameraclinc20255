import React, { useState, useContext, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { assets } from '../assets/assets';
import { AppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showMenu, setShowMenu] = useState(false);
    const [showCart, setShowCart] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { 
        cartItems, 
        removeFromCart, 
        updateQuantity,
        currencySymbol
    } = useContext(AppContext);

    // تتبع حالة التمرير لتغيير مظهر شريط التنقل
    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 20;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [scrolled]);

    const navLinks = [
        { to: '/contact', text: 'اتصل بنا', icon: 'M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z' },
        { to: '/blogs', text: 'مدوّنتي', icon: 'M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z' },
        { to: '/appointment', text: 'احجزي الآن', special: true, icon: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z' },
        { to: '/ServiceListPage', text: 'الخدمات', icon: 'M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z' },
        { to: '/ListProdect', text: 'المنتجات', icon: 'M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z' },
        { to: '/', text: 'الرئيسية', icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' }
    ];

    // تأثيرات الحركة للعناصر
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { 
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: { type: 'spring', stiffness: 300, damping: 24 }
        }
    };

    const cartItemVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 500, damping: 30 } },
        exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
    };

    return (
        <>
            <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`fixed top-0 left-0 right-0 z-50 mx-auto my-4 max-w-7xl px-4 ${scrolled ? 'py-2' : 'py-4'} transition-all duration-300`}
            >
                <div className={`
                    flex items-center justify-between 
                    rounded-2xl 
                    backdrop-blur-xl 
                    ${scrolled ? 'bg-gradient-to-r from-pink-500/10 to-purple-600/10 shadow-lg' : 'bg-gradient-to-r from-pink-500/15 to-purple-600/15'} 
                    dark:bg-gray-900/80 
                    px-6 py-3
                    border border-pink-500/20
                    transition-all duration-300
                `}>
                    <motion.img 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/')} 
                        className='w-[70px] h-[70px] cursor-pointer' 
                        src={assets.logo} 
                        alt="Logo" 
                    />

                    <motion.ul 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className='hidden md:flex items-center gap-6 font-medium'
                    >
                        {navLinks.map((link) => (
                            <motion.li key={link.to} variants={itemVariants}>
                                <NavLink 
                                    to={link.to}
                                    className={({ isActive }) => `
                                        relative flex items-center gap-1 px-3 py-2 
                                        ${isActive ? 'text-pink-500' : 'text-gray-700 dark:text-gray-200'} 
                                        ${link.special ? 
                                            'bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 hover:scale-105' :
                                            'hover:text-pink-500 transition-all'
                                        }
                                    `}
                                >
                                    {link.text}
                                    {({ isActive }) => 
                                        isActive && !link.special ? (
                                            <motion.span 
                                                layoutId="navbar-indicator"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        ) : null
                                    }
                                </NavLink>
                            </motion.li>
                        ))}
                    </motion.ul>

                    <div className='flex items-center gap-4'>
                        <motion.div 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className='relative cursor-pointer transition-all'
                            onClick={() => setShowCart(!showCart)}
                        >
                            <div className="p-2 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30">
                                <img src={assets.cart} className='w-6 h-6' alt="Cart" />
                            </div>
                            {cartItems.length > 0 && (
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className='absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full shadow-lg'
                                >
                                    {cartItems.reduce((total, item) => total + item.quantity, 0)}
                                </motion.div>
                            )}
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="md:hidden p-2 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30"
                            onClick={() => setShowMenu(true)}
                        >
                            <img 
                                src={assets.menu_icon} 
                                className='w-6 h-6 cursor-pointer' 
                                alt="Menu" 
                            />
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* قائمة الجوال */}
            <AnimatePresence>
                {showMenu && (
                    <motion.div 
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className='fixed top-0 right-0 w-full sm:w-80 h-full bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900/90 dark:to-purple-900/90 backdrop-blur-xl shadow-2xl p-6 z-50 flex flex-col gap-6 items-center text-lg font-medium'
                    >
                        <div className="w-full flex justify-end">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowMenu(false)}
                                className="p-2 rounded-full bg-pink-100 dark:bg-pink-900/30 cursor-pointer"
                            >
                                <img 
                                    src={assets.cross_icon} 
                                    className='w-6 h-6' 
                                    alt="Close" 
                                />
                            </motion.div>
                        </div>
                        
                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="flex flex-col items-center gap-4 w-full mt-8"
                        >
                            {[...navLinks].reverse().map((link) => (
                                <motion.div 
                                    key={link.to}
                                    variants={itemVariants}
                                    className="w-full"
                                >
                                    <NavLink 
                                        onClick={() => setShowMenu(false)} 
                                        to={link.to}
                                        className={({ isActive }) => `
                                            flex items-center justify-center gap-2 py-3 px-4 rounded-xl w-full
                                            ${isActive ? 
                                                'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30' : 
                                                'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-200'
                                            }
                                        `}
                                    >
                                        {link.text}
                                    </NavLink>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* سلة التسوق */}
            <AnimatePresence>
                {showCart && (
                    <motion.div 
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className='fixed top-0 right-0 w-full sm:w-96 h-full bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900/90 dark:to-purple-900/90 backdrop-blur-xl shadow-2xl z-50 p-6'
                    >
                        <div className='flex justify-between items-center mb-6'>
                            <h2 className='text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent'>سلة التسوق</h2>
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowCart(false)}
                                className="p-2 rounded-full bg-pink-100 dark:bg-pink-900/30 cursor-pointer"
                            >
                                <img 
                                    src={assets.cross_icon} 
                                    className='w-5 h-5' 
                                    alt="Close" 
                                />
                            </motion.div>
                        </div>

                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className='flex flex-col gap-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2'
                        >
                            {cartItems.length > 0 ? (
                                cartItems.map(item => (
                                    <motion.div 
                                        key={item.id} 
                                        variants={cartItemVariants}
                                        className='border-b border-gray-200 dark:border-gray-700 pb-4 group'
                                    >
                                        <div className='flex justify-between items-start mb-2'>
                                            <div className='flex-1'>
                                                <h3 className='text-sm font-medium text-gray-800 dark:text-gray-200'>{item.name}</h3>
                                                <p className='font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent'>{item.price} {currencySymbol}</p>
                                            </div>
                                            <motion.button 
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => removeFromCart(item.id)}
                                                className='text-xs text-gray-500 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100'
                                            >
                                                إزالة
                                            </motion.button>
                                        </div>
                                        
                                        <div className="flex items-center justify-between bg-white/50 dark:bg-gray-800/50 rounded-xl p-1 mt-2 backdrop-blur-sm">
                                            <motion.button 
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-700 rounded-lg text-pink-500 shadow-sm hover:shadow-md transition-all"
                                                disabled={item.quantity <= 1}
                                            >
                                                -
                                            </motion.button>
                                            <span className="text-sm font-medium mx-2 dark:text-white">{item.quantity}</span>
                                            <motion.button 
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-700 rounded-lg text-pink-500 shadow-sm hover:shadow-md transition-all"
                                            >
                                                +
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-12 text-gray-500 dark:text-gray-400"
                                >
                                    <div className="flex justify-center mb-4">
                                        <img src={assets.cart} className="w-16 h-16 opacity-30" alt="Empty Cart" />
                                    </div>
                                    السلة فارغة
                                </motion.div>
                            )}
                        </motion.div>

                        {cartItems.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="absolute bottom-6 left-6 right-6"
                            >
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium dark:text-white">الإجمالي:</span>
                                        <span className="font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent text-lg">
                                            {cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)} {currencySymbol}
                                        </span>
                                    </div>
                                </div>
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className='w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 font-medium transition-all'
                                    onClick={() => {
                                        navigate('/checkout');
                                        setShowCart(false);
                                    }}
                                >
                                    شراء الآن
                                </motion.button>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* مساحة للتعويض عن شريط التنقل الثابت */}
            <div className={`${scrolled ? 'h-24' : 'h-32'} transition-all duration-300`}></div>
        </>
    );
};

export default Navbar;
