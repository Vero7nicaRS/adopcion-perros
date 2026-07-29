import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import './App.css'
import Home from './pages/Home.jsx'
import NavBar from './components/NavBar.jsx'
import Footer from './components/Footer.jsx'
import Dog from './pages/Dog.jsx'
import DogDetails from './pages/DogDetails.jsx'
import AdoptionApplicationForm from './pages/AdoptionApplicationForm.jsx'

function App() {
  return (

    <BrowserRouter>
      {/* NAVBAR */}
      <NavBar> </NavBar>

      {/* RUTAS */}
      <Routes>
        <Route path="/" element={<Home />} /> 
        <Route path="/dogs" element={<Dog />} /> 
        <Route path="/dogs/:id" element={<DogDetails />} /> 
        <Route path="/dogs/:id/adoption" element={<AdoptionApplicationForm />} />
        <Route path='*' element={<p>404: Página no encontrada</p>} />
      </Routes>

      {/* FOOTER */}
      <Footer></Footer>
    
    </BrowserRouter>
  )
}

export default App
