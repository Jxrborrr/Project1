import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
//import App from './App';
import Login from './main/Login';
import HotelBooking from './main/HotelBooking';
import Register from './main/register'; 
import Profile from './components/Profile.js';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HotelBooking />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} /> 
      <Route path="/HotelBooking" element={<HotelBooking />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  </BrowserRouter>
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();