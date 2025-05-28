// components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const navItems = [
        { path: '/', name: 'Główna', icon: '🏠' },
        { path: '/air-quality', name: 'Jakość powietrza', icon: '🌬️' },
        { path: '/uv-index', name: 'Indeks UV', icon: '☀️' },
        { path: '/alerts', name: 'Ostrzeżenia', icon: '⚠️' },
        { path: '/compare', name: 'Porównaj miasta', icon: '📊' },
        { path: '/search', name: 'Wyszukaj', icon: '🔍' },
        { path: '/about', name: 'O aplikacji', icon: 'ℹ️' }
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-blue-800/90 backdrop-blur-sm border-b border-blue-600 sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="text-2xl font-bold text-white hover:text-blue-200 transition">
                        🌤️ QuickWeather
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex space-x-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${isActive(item.path)
                                        ? 'bg-blue-600 text-white'
                                        : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                                    }`}
                            >
                                <span className="mr-1">{item.icon}</span>
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 rounded-lg text-blue-100 hover:bg-blue-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden py-4 border-t border-blue-600">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={`block px-4 py-2 text-sm font-medium transition ${isActive(item.path)
                                        ? 'bg-blue-600 text-white'
                                        : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                                    }`}
                            >
                                <span className="mr-2">{item.icon}</span>
                                {item.name}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
}
