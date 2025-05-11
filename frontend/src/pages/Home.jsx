import React from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'
import Products from '../components/Products'
import FAQ from '../components/faq'

const Home = () => {
  return (
    <div>
      <Header />
      <TopDoctors />
      <SpecialityMenu />
      <Products />
      <Banner />
      <FAQ></FAQ>

    </div>
  )
}

export default Home