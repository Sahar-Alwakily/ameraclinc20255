import { createContext, useEffect, useState } from "react";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
    const currencySymbol = 'شيكل';
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [cartItems, setCartItems] = useState([]);
    const [notification, setNotification] = useState({
        show: false,
        message: ''
    });

    // تحميل السلة من localStorage عند التحميل
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCartItems(JSON.parse(savedCart));
        }
    }, []);

    // حفظ السلة في localStorage عند التغيير
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    // دالة عرض الإشعار
    const showNotification = (message) => {
        setNotification({
            show: true,
            message: message
        });
        
        setTimeout(() => {
            setNotification({
                show: false,
                message: ''
            });
        }, 3000);
    };

    // دوال إدارة السلة
    const addToCart = (product) => {
        setCartItems(prev => {
            const existingItem = prev.find(item => item.id === product.id);
            let newItems;
            
            if (existingItem) {
                newItems = prev.map(item => 
                    item.id === product.id 
                        ? { ...item, quantity: item.quantity + (product.quantity || 1) } 
                        : item
                );
            } else {
                newItems = [...prev, { ...product, quantity: product.quantity || 1 }];
            }
            
            showNotification(`تمت إضافة ${product.name} إلى السلة`);
            return newItems;
        });
    };

    const removeFromCart = (productId) => {
        setCartItems(prev => {
            const product = prev.find(item => item.id === productId);
            if (product) {
                showNotification(`تمت إزالة ${product.name} من السلة`);
            }
            return prev.filter(item => item.id !== productId);
        });
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) return;
        setCartItems(prev => 
            prev.map(item => 
                item.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
        showNotification('تم تفريغ السلة');
    };

    const value = {
        currencySymbol,
        backendUrl,
        cartItems, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart,
        notification,
        showNotification
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;