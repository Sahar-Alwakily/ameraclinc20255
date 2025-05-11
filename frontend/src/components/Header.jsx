import React from 'react';
import { assets } from '../assets/assets';

const Header = () => {
    return (
        <div className='flex flex-col md:flex-row bg-pink-100 rounded-lg px-6 md:px-10 lg:px-20 text-right overflow-hidden items-start py-8 md:py-0'>

            {/* --------- Header Left --------- */}
            <div className='md:w-1/2 flex flex-col items-end justify-center gap-4 pt-2 text-gray-800'>
                <p className='text-2xl md:text-3xl lg:text-4xl text-gray-800 font-semibold leading-tight md:leading-tight lg:leading-tight'>
                    ✨  جمالك يبدأ من الداخل في  <br />  Amera Clinic 
                </p>
                <div className='flex flex-col md:flex-row items-center gap-3 text-gray-700 text-sm font-light'>
                    <p>
                        نقدم لك أحدث علاجات البشرة والتجميل
                        من الحقن المغذية بالفيتامينات إلى الفيلر، البوتوكس، 
                        وإبر النضارة لتمنحك إشراقة طبيعية وثقة دائمة
                    </p>
                </div>
                <a 
                    href='/appointment' 
                    className='flex items-center gap-2 bg-pink-500 px-8 py-3 rounded-full text-white text-sm m-auto md:m-0 hover:scale-105 transition-all duration-300'
                >
                    احجزي موعدك الآن <img className='w-3' alt="" />
                </a>
            </div>

            {/* --------- Header Right --------- */}
            <div className='md:w-1/2 flex items-center justify-center relative mt-6 md:mt-0'>
                <img 
                    className='w-full md:w-[80%] h-auto rounded-lg' 
                    src={assets.header_img} 
                    alt="عيادة الرونق" 
                />
            </div>
        </div>
    );
}

export default Header;