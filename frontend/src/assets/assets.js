import header_img from './unnamed.png'
import homebgk from './homebgk.png'
import group_profiles from './group_profiles.png'
import profile_pic from './profile_pic.png'
import contact_image from './contact_image.png'
import contact from './contact.jpg'

import about_image from './about_image.png'
import logo from './logo.jpeg'
import dropdown_icon from './dropdown_icon.svg'
import menu_icon from './menu_icon.svg'
import cross_icon from './cross_icon.png'
import chats_icon from './chats_icon.svg'
import verified_icon from './verified_icon.svg'
import arrow_icon from './arrow_icon.svg'
import info_icon from './info_icon.svg'
import upload_icon from './upload_icon.png'
import stripe_logo from './stripe_logo.png'
import razorpay_logo from './razorpay_logo.png'
import amira from './amira.jpeg'
import cart from './cart.png'

import Dermatologist from './botox.png'
import Gastroenterologist from './vitm.png'
import General_physician from './laserfra.png'
import laserhair from './laser.png'
import mezo from './mezo.png'
import collagen from './collagen.png'
import blood from './blood.png'

import Gynecologist from './skin.png'
import Neurologist from './glu.png'
import Pediatricians from './filler.png'
import vlog from './vlog.jpg'
import pro1 from './pro1.jpg'
import facebookIcon from './facebook.png'
import whatsappIcon from './whatsapp.png'
import tiktokIcon from './tiktok.png'
import instagramIcon from './instagram.jpg'

import wazeicon from './waze-logo.png'

export const assets = {
    amira,
    vlog,
    pro1,
    header_img,
    group_profiles,
    logo,
    chats_icon,
    verified_icon,
    info_icon,
    profile_pic,
    arrow_icon,
    contact,
    cart,
    about_image,
    menu_icon,
    cross_icon,
    dropdown_icon,
    upload_icon,
    stripe_logo,
    razorpay_logo,
    facebookIcon,
    instagramIcon,
    tiktokIcon,
    whatsappIcon,
    wazeicon
}

export const specialityData = [
    {
        speciality: 'ليزر فراكشنال',
        image: General_physician
    },
    {
        speciality: 'ابرة النضارة',
        image: Gynecologist
    },
    {
        speciality: 'بوتوكس',
        image: Dermatologist
    },
    {
        speciality: 'فيلر',
        image: Pediatricians
    },
    {
        speciality: 'حقن جلوتاثيون',
        image: Neurologist
    },
    {
        speciality: 'حقن فيتامينات',
        image: Gastroenterologist
    },
    {
        speciality: ' ليزر ازاله الشعر',
        image: laserhair
    },
    {
        speciality: 'ميزوثرابي ',
        image: mezo
    },
    {
        speciality: 'محفزات كولاجين ',
        image: collagen
    },
    {
        speciality: ' بلازما الشعر والوجه ',
        image: blood
    },
]

export const doctors = [
    {
        _id: 'doc1',
        name: 'Dr. Richard James',
        image: header_img,
        speciality: 'General physician',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 50,
        address: {
            line1: '17th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc2',
        name: 'Dr. Emily Larson',
        image: header_img,
        speciality: 'Gynecologist',
        degree: 'MBBS',
        experience: '3 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 60,
        address: {
            line1: '27th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc3',
        name: 'Dr. Sarah Patel',
        image: header_img,
        speciality: 'Dermatologist',
        degree: 'MBBS',
        experience: '1 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 30,
        address: {
            line1: '37th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
]