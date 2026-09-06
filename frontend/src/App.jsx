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
import AdoptionApplicationsPanel from './pages/AdoptionApplicationsPanel.jsx';
import AdminDogList from './pages/AdminDogList.jsx';
import DogForm from './pages/DogForm.jsx';
import ChatBotWidget from './components/ChatBotWidget.jsx';

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
                    <AdoptionApplicationsPanel/>
                  </ProtectedRoute>
                }
          />

          <Route path="/admin/dogs" 
                element ={
                  <AdminRoute>
                    <AdminDogList />
                  </AdminRoute>
                } />
          
          {/* EDIT A DOG */}
          <Route path="/dogs/:id/edit" 
              element ={
                <AdminRoute>
                  <DogForm />
                </AdminRoute>
              } />

          { /* ADD A ADD */}
          <Route path="/admin/dogs/add" 
              element ={
                <AdminRoute>
                  <DogForm />
                </AdminRoute>
              } />

          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register /> } />
          <Route path='*' element={<p>404: Página no encontrada</p>} />
        </Routes>
        <ChatBotWidget></ChatBotWidget>
        {/* FOOTER */}
        <Footer></Footer>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
