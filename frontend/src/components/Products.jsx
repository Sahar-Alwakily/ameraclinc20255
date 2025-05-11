import React, { useState, useEffect, useContext } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../dataApi/firebaseApi';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { Dialog } from '@headlessui/react';
import { AppContext } from '../context/AppContext';

const Products = () => {
    const navigate = useNavigate();
    const { addToCart, showNotification,notification  } = useContext(AppContext);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const productsRef = ref(database, 'products');
        const unsubscribe = onValue(productsRef, (snapshot) => {
            const productsData = snapshot.val();
            if (productsData) {
                const productsArray = Object.keys(productsData).map(key => ({
                    id: key,
                    ...productsData[key]
                })).slice(0, 4);
                setProducts(productsArray);
            } else {
                setProducts([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const openProductDetails = (product) => {
        setSelectedProduct(product);
        setIsOpen(true);
    };

    const handleAddToCart = (product) => {
        addToCart(product);
        showNotification(`${product.name} تمت إضافته إلى السلة`);
    };

    if (loading) {
        return (
            <div className="px-6 sm:px-10 md:px-14 lg:px-12 my-20 text-center">
                <p className="text-lg text-gray-600">جاري تحميل المنتجات...</p>
            </div>
        );
    }

    return (
    
<div className="px-6 sm:px-10 md:px-14 lg:px-12 my-20">
        {/* إشعار الإضافة إلى السلة */}
        {notification.show && (
            <div className="fixed top-20 right-4 z-50 animate-fade-in">
                <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {notification.message}
                </div>
            </div>
        )}
            <div className="text-center mb-10">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-primary">
                    اكتشف أحدث المنتجات
                </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                    <div key={product.id} className="flex flex-col bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                        <div className="h-40 sm:h-48 overflow-hidden flex items-center justify-center p-4">
                            <img 
                                className="w-full h-full object-contain cursor-pointer"
                                src={product.photo || assets.pro1} 
                                alt={product.name}
                                onClick={() => openProductDetails(product)}
                                onError={(e) => {
                                    e.target.src = assets.pro1;
                                }}
                            />
                        </div>

                        <div className="p-3 sm:p-4 flex flex-col flex-grow">
                            <h3 className="text-base sm:text-lg font-semibold text-primary text-right mb-2 line-clamp-2 h-12 sm:h-14">
                                {product.name}
                            </h3>

                            {product.catalog && (
                                <p className="text-xs sm:text-sm text-gray-500 text-right mb-2">
                                    {product.catalog}
                                </p>
                            )}

                            <p className="text-base sm:text-lg font-bold text-pink-600 text-right mb-3 sm:mb-4">
                                {product.price ? `${product.price} شيكل` : 'السعر غير متوفر'}
                            </p>

                            <div className="mt-auto flex justify-between gap-2">
                                <button
                                    onClick={() => openProductDetails(product)}
                                    className="flex-1 text-xs sm:text-sm text-blue-500 hover:text-blue-700 border border-blue-500 px-2 py-1 sm:px-3 sm:py-2 rounded-lg"
                                >
                                    التفاصيل
                                </button>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddToCart(product);
                                    }}
                                    className="flex-1 bg-pink-500 text-white text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 rounded-lg hover:bg-pink-600 transition-all"
                                >
                                    أضف للسلة
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {products.length > 0 && (
                <div className="text-center mt-12">
                    <button 
                        onClick={() => navigate('/ListProdect')}
                        className="bg-white text-pink-500 border border-pink-500 px-6 py-2 sm:px-8 sm:py-3 rounded-full hover:bg-pink-50 transition-all text-sm sm:text-base"
                    >
                        لمزيد من المنتجات
                    </button>
                </div>
            )}

            <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
                    <Dialog.Panel className="w-full max-w-md md:max-w-2xl lg:max-w-4xl rounded-2xl bg-white shadow-xl overflow-hidden mx-auto">
                        {selectedProduct && (
                            <div className="flex flex-col md:flex-row">
                                <div className="bg-white-100 p-4 md:p-6 flex items-center justify-center w-full md:w-1/2">
                                    <img
                                        src={selectedProduct.photo || 'https://via.placeholder.com/500'}
                                        alt={selectedProduct.name}
                                        className="w-full h-48 md:h-64 lg:h-80 object-contain rounded-lg"
                                    />
                                </div>

                                <div className="p-4 md:p-6 space-y-3 md:space-y-4 lg:space-y-6 w-full md:w-1/2">
                                    <div className="flex justify-between items-start">
                                        <Dialog.Title className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
                                            {selectedProduct.name}
                                        </Dialog.Title>
                                        <button 
                                            onClick={() => setIsOpen(false)}
                                            className="text-gray-400 hover:text-gray-600 text-xl"
                                        >
                                            &times;
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg">
                                        <div>
                                            <p className="text-xs md:text-sm text-gray-500">السعر</p>
                                            <p className="text-base md:text-lg lg:text-xl font-bold text-pink-600">
                                                {selectedProduct.price ? `${selectedProduct.price} شيكل` : 'السعر غير متوفر'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs md:text-sm text-gray-500">التصنيف</p>
                                            <p className="font-medium text-gray-800 text-xs md:text-sm lg:text-base">
                                                {selectedProduct.catalog}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="border-t border-b border-gray-200 py-3">
                                        <div className="space-y-3">
                                            {selectedProduct.title && (
                                                <div>
                                                    <h4 className="font-semibold text-gray-700 flex items-center text-sm md:text-base">
                                                        <svg className="w-4 h-4 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        الوصف
                                                    </h4>
                                                    <p className="text-gray-600 mt-1 text-xs md:text-sm">{selectedProduct.title}</p>
                                                </div>
                                            )}

                                            {selectedProduct.use && (
                                                <div>
                                                    <h4 className="font-semibold text-gray-700 flex items-center text-sm md:text-base">
                                                        <svg className="w-4 h-4 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        طريقة الاستعمال
                                                    </h4>
                                                    <p className="text-gray-600 mt-1 whitespace-pre-line text-xs md:text-sm">{selectedProduct.use}</p>
                                                </div>
                                            )}

                                            {selectedProduct.description && (
                                                <div>
                                                    <h4 className="font-semibold text-gray-700 flex items-center text-sm md:text-base">
                                                        <svg className="w-4 h-4 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        الوصف
                                                    </h4>
                                                    <p className="text-gray-600 mt-1 text-xs md:text-sm">{selectedProduct.description}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            handleAddToCart(selectedProduct);
                                            setIsOpen(false);
                                        }}
                                        className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white py-2 md:py-3 rounded-lg font-bold shadow hover:shadow-md transition-all duration-300 text-sm md:text-base"
                                    >
                                        أضف إلى السلة
                                    </button>
                                </div>
                            </div>
                        )}
                    </Dialog.Panel>
                </div>
            </Dialog>
        </div>
    );
};

export default Products;