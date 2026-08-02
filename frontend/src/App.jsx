import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import './App.css'
import Home from './pages/Home.jsx'
import NavBar from './components/NavBar.jsx'
import Footer from './components/Footer.jsx'
import Dog from './pages/Dog.jsx'
import DogDetails from './pages/DogDetails.jsx'
import AdoptionApplicationForm from './pages/AdoptionApplicationForm.jsx'
import Login from "./pages/Login.jsx"
import Register from './pages/Register.jsx';
import AuthProvider from "./context/authentication/AuthProvider";
import ProtectedRoute from './context/authentication/ProtectedRoute.jsx';
import AdminRoute from './context/authentication/AdminRoute.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import UserPanel from './pages/UserPanel.jsx';

function App() {
  return (

    <BrowserRouter>
      <AuthProvider>
        {/* NAVBAR */}
        <NavBar> </NavBar>

        {/* RUTAS */}
        <Routes>
          <Route path="/" element={<Home />} /> 
          <Route path="/dogs" element={<Dog />} /> 
          <Route path="/dogs/:id" element={<DogDetails />} /> 
          <Route path="/dogs/:id/adoption" 
                element={
                  <ProtectedRoute>
                    <AdoptionApplicationForm />
                  </ProtectedRoute>
                } />
          <Route path= "/dog-panel/"
                element = {
                  <ProtectedRoute>
                    <UserPanel/>
                  </ProtectedRoute>
                }
          />

          <Route path="/admin" 
                element ={
                  <AdminRoute>
                    <AdminPanel />
                  </AdminRoute>
                } />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register /> } />
          <Route path='*' element={<p>404: Página no encontrada</p>} />
        </Routes>

        {/* FOOTER */}
        <Footer></Footer>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
