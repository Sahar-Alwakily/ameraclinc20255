import React from 'react'
import Navbar from './components/Navbar'
import { Routes, Route } from 'react-router-dom'
import ListProdect from './pages/ListProdect'
import Home from './pages/Home'
import Blogs from './pages/blogs'

import ServiceDetailsPage from './pages/ServiceDetailsPage'
import BlogDetailsPage from './pages/BlogDetailsPage'

import ServiceListPage from './pages/ServiceListPage'
import About from './pages/About'
import Contact from './pages/Contact'
import Appointment from './pages/Appointment'
import Footer from './components/Footer'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Checkout from './pages/Checkout';

const App = () => {
  return (
    <div className='mx-4 sm:mx-[10%]'>
      <ToastContainer />
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path="/blog/:id" element={<BlogDetailsPage />} />
        
        <Route path="/services/:id" element={<ServiceDetailsPage />} />
        <Route path='/ServiceListPage' element={<ServiceListPage />} />

        <Route path='/ListProdect' element={<ListProdect />} />
        <Route path='/about' element={<About />} />
        <Route path='/checkout' element={<Checkout />} />
        
        <Route path='/contact' element={<Contact />} />
        <Route path='/appointment' element={<Appointment />} />
        <Route path='/blogs' element={<Blogs />} />

      </Routes>
      <Footer />
    </div>
  )
}

export default App