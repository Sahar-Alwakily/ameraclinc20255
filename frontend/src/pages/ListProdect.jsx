import React, { useState, useEffect, useContext } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../dataApi/firebaseApi';
import { AppContext } from '../context/AppContext';
import { Dialog, Transition } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';

const ListProduct = () => {
    const categories = [
        { value: "all", label: "الكل" },
        { value: "Skincare", label: "عناية البشرة" },
        { value: "Haircare", label: "عناية الشعر" },
        { value: "Bodycare", label: "عناية الجسم" }
    ];
    
    const { addToCart } = useContext(AppContext);
    const navigate = useNavigate();

    const [selectedCategories, setSelectedCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationProduct, setNotificationProduct] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        const productsRef = ref(database, 'products');
        const unsubscribe = onValue(productsRef, (snapshot) => {
            const productsData = snapshot.val();
            if (productsData) {
                const productsArray = Object.keys(productsData).map(key => ({
                    id: key,
                    ...productsData[key]
                }));
                setProducts(productsArray);
            } else {
                setProducts([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleCategoryChange = (categoryValue) => {
        if (categoryValue === "all") {
            setSelectedCategories([]);
        } else {
            setSelectedCategories(prev =>
                prev.includes(categoryValue)
                    ? prev.filter(c => c !== categoryValue)
                    : [...prev, categoryValue]
            );
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategories.length === 0 || 
                            selectedCategories.some(cat => product.catalog?.toLowerCase().includes(cat));
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const openProductDetails = (product) => {
        setSelectedProduct(product);
        setIsOpen(true);
    };

    const handleAddToCart = (product) => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            photo: product.photo
        });
        setNotificationProduct(product);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
    };

    if (loading) {
        return (
            <div className='p-6 md:p-10 lg:p-12 bg-gray-50 min-h-screen flex justify-center items-center'>
                <div className="text-center">
                    <p className="text-lg text-gray-600">جاري تحميل المنتجات...</p>
                </div>
            </div>
        );
    }

    return (
        <div dir="rtl" className='p-4 sm:p-6 md:p-10 lg:p-12 bg-gray-50 min-h-screen'>
            {/* شريط البحث والفلاتر */}
            <div className='flex flex-col md:flex-row-reverse gap-4 items-center mb-8'>
                <div className='flex gap-2 sm:gap-4 flex-wrap justify-center'>
                    {categories.map((category) => (
                        <button
                            key={category.value}
                            onClick={() => handleCategoryChange(category.value)}
                            className={`p-2 px-3 sm:px-4 text-xs sm:text-sm rounded-full transition-all ${
                                (selectedCategories.length === 0 && category.value === "all") || 
                                selectedCategories.includes(category.value)
                                    ? 'bg-pink-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-pink-100'
                            }`}
                        >
                            {category.label}
                        </button>
                    ))}
                </div>

                <input
                    type="text"
                    placeholder="ابحث عن منتج..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='flex-1 p-2 border-b border-gray-300 focus:outline-none focus:border-pink-500 text-sm bg-transparent text-right'
                />
            </div>

            {/* عرض المنتجات */}
            {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600">لا توجد منتجات متطابقة مع بحثك</p>
                </div>
            ) : (
                <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'>
                    {filteredProducts.map(product => (
                        <div key={product.id} className="bg-white rounded-lg sm:rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
                            {/* صورة المنتج */}
                            <div className="relative h-40 sm:h-48 w-full overflow-hidden">
                                <img
                                    src={product.photo || 'https://via.placeholder.com/300'}
                                    alt={product.name}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                                    onClick={() => openProductDetails(product)}
                                />
                            </div>

                            {/* تفاصيل المنتج */}
                            <div className="p-3 sm:p-4 flex-grow flex flex-col">
                                <div className="mb-2">
                                    <h3 className="font-bold text-gray-800 text-sm sm:text-base md:text-lg line-clamp-2">{product.name}</h3>
                                    {product.catalog && (
                                        <p className="text-gray-600 text-xs sm:text-sm">{product.catalog}</p>
                                    )}
                                </div>
                                
                                <p className="text-pink-600 font-bold text-base sm:text-lg md:text-xl mb-3 sm:mb-4 mt-auto">
                                    {product.price ? `${product.price} شيكل` : 'السعر غير متوفر'}
                                </p>
                                
                                <div className="flex justify-between items-center mt-auto gap-2">
                                    <button
                                        onClick={() => openProductDetails(product)}
                                        className="text-xs sm:text-sm text-blue-500 hover:text-blue-700"
                                    >
                                        التفاصيل
                                    </button>
                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        className="bg-pink-500 hover:bg-pink-600 text-white px-2 py-1 sm:px-3 sm:py-1 rounded text-xs sm:text-sm transition-colors"
                                    >
                                        أضف للسلة
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* نافذة تفاصيل المنتج المنبثقة */}
            <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
                    <Dialog.Panel className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl rounded-xl sm:rounded-2xl bg-white shadow-xl overflow-hidden mx-auto">
                        {selectedProduct && (
                            <div className="flex flex-col md:flex-row">
                                {/* قسم الصورة */}
                                <div className="bg-white-100 p-4 sm:p-6 flex items-center justify-center w-full md:w-1/2">
                                    <img
                                        src={selectedProduct.photo || 'https://via.placeholder.com/500'}
                                        alt={selectedProduct.name}
                                        className="w-full h-48 sm:h-64 md:h-80 object-contain rounded-lg"
                                    />
                                </div>

                                {/* قسم التفاصيل */}
                                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 md:space-y-6 w-full md:w-1/2">
                                    <div className="flex justify-between items-start">
                                        <Dialog.Title className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                                            {selectedProduct.name}
                                        </Dialog.Title>
                                        <button 
                                            onClick={() => setIsOpen(false)}
                                            className="text-gray-400 hover:text-gray-600 text-xl"
                                        >
                                            &times;
                                        </button>
                                    </div>

                                    {/* معلومات أساسية */}
                                    <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg">
                                        <div>
                                            <p className="text-xs sm:text-sm text-gray-500">السعر</p>
                                            <p className="text-base sm:text-lg md:text-xl font-bold text-pink-600">
                                                {selectedProduct.price ? `${selectedProduct.price} شيكل` : 'السعر غير متوفر'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs sm:text-sm text-gray-500">التصنيف</p>
                                            <p className="font-medium text-gray-800 text-xs sm:text-sm">{selectedProduct.catalog}</p>
                                        </div>
                                    </div>

                                    {/* تفاصيل إضافية */}
                                    <div className="border-t border-b border-gray-200 py-3 sm:py-4">
                                        <div className="space-y-3 sm:space-y-4">
                                            {selectedProduct.title && (
                                                <div>
                                                    <h4 className="font-semibold text-gray-700 flex items-center text-sm sm:text-base">
                                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        الوصف
                                                    </h4>
                                                    <p className="text-gray-600 mt-1 text-xs sm:text-sm">{selectedProduct.title}</p>
                                                </div>
                                            )}

                                            {selectedProduct.use && (
                                                <div>
                                                    <h4 className="font-semibold text-gray-700 flex items-center text-sm sm:text-base">
                                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        طريقة الاستعمال
                                                    </h4>
                                                    <p className="text-gray-600 mt-1 whitespace-pre-line text-xs sm:text-sm">{selectedProduct.use}</p>
                                                </div>
                                            )}

                                            {selectedProduct.description && (
                                                <div>
                                                    <h4 className="font-semibold text-gray-700 flex items-center text-sm sm:text-base">
                                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        الوصف
                                                    </h4>
                                                    <p className="text-gray-600 mt-1 text-xs sm:text-sm">{selectedProduct.description}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* زر الإضافة إلى السلة */}
                                    <button
                                        onClick={() => {
                                            handleAddToCart(selectedProduct);
                                            setIsOpen(false);
                                        }}
                                        className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white py-2 sm:py-3 rounded-lg font-bold shadow hover:shadow-md transition-all duration-300 text-sm sm:text-base"
                                    >
                                        أضف إلى السلة
                                    </button>
                                </div>
                            </div>
                        )}
                    </Dialog.Panel>
                </div>
            </Dialog>

            {/* إشعار الإضافة إلى السلة */}
            <Transition
                show={showNotification}
                enter="transition-opacity duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                className="fixed bottom-4 right-4 z-50"
            >
                <div className="bg-white shadow-lg rounded-lg p-4 max-w-xs border border-gray-200 flex items-center gap-4">
                    <div className="flex-shrink-0">
                        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <div className="flex-grow">
                        <p className="text-sm text-gray-800">تمت إضافة {notificationProduct?.name} إلى السلة</p>
                    </div>
                    <button 
                        onClick={() => {
                            navigate('/checkout');
                            setShowNotification(false);
                        }}
                        className="text-xs bg-pink-500 text-white px-2 py-1 rounded hover:bg-pink-600 transition"
                    >
                        الذهاب إلى السلة
                    </button>
                </div>
            </Transition>
        </div>
    );
};

export default ListProduct;