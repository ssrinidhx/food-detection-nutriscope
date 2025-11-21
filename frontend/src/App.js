import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import FoodDetector from './components/FoodDetector';
import ManualFoodInput from './components/ManualFoodInput';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/detector" element={<FoodDetector />} />
          <Route path="/manual" element={<ManualFoodInput />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;