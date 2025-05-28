// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AirQuality from './pages/AirQuality';
import UVIndex from './pages/UVIndex';
import WeatherAlerts from './pages/WeatherAlerts';
import CompareCity from './pages/CompareCity';
import SearchLocation from './pages/SearchLocation';
import About from './pages/About';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-gray-100">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/air-quality" element={<AirQuality />} />
            <Route path="/uv-index" element={<UVIndex />} />
            <Route path="/alerts" element={<WeatherAlerts />} />
            <Route path="/compare" element={<CompareCity />} />
            <Route path="/search" element={<SearchLocation />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
