// pages/UVIndex.jsx
import React, { useState } from 'react';
import UVWidget from '../components/UVWidget';

export default function UVIndex() {
    const [city, setCity] = useState('');
    const [searchCity, setSearchCity] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (city.trim()) {
            setSearchCity(city.trim());
        }
    };

    const uvLevels = [
        { range: '0-2', level: 'Niski', color: '#289500', icon: '🟢', advice: 'Można przebywać na słońcu bez ochrony' },
        { range: '3-5', level: 'Umiarkowany', color: '#f7e400', icon: '🟡', advice: 'Zalecana ochrona przeciwsłoneczna' },
        { range: '6-7', level: 'Wysoki', color: '#f85900', icon: '🟠', advice: 'Konieczna ochrona przeciwsłoneczna' },
        { range: '8-10', level: 'Bardzo wysoki', color: '#d8001d', icon: '🔴', advice: 'Unikaj przebywania na słońcu w godzinach 10-16' },
        { range: '11+', level: 'Ekstremalny', color: '#6b49c8', icon: '🟣', advice: 'Unikaj przebywania na słońcu' }
    ];

    return (
        <div className="space-y-6">
            <div className="bg-blue-700/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                <h1 className="text-3xl font-bold mb-4 flex items-center">
                    ☀️ Indeks UV
                </h1>
                <p className="text-blue-200 mb-6">
                    Sprawdź indeks promieniowania UV w wybranym mieście. Indeks UV informuje o intensywności promieniowania słonecznego.
                </p>

                <form onSubmit={handleSubmit} className="flex space-x-4">
                    <input
                        type="text"
                        placeholder="Wprowadź nazwę miasta..."
                        className="flex-1 px-4 py-3 bg-blue-800/70 border border-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-blue-200"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-500 transition"
                    >
                        Sprawdź
                    </button>
                </form>
            </div>

            {searchCity && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <UVWidget city={searchCity} />

                    <div className="bg-blue-700/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                        <h3 className="text-xl font-semibold mb-4">📋 Skala indeksu UV</h3>
                        <div className="space-y-3">
                            {uvLevels.map((item, index) => (
                                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-800/50 rounded-lg">
                                    <span className="text-2xl">{item.icon}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className="font-semibold">{item.level}</span>
                                            <span className="text-sm text-gray-400">({item.range})</span>
                                        </div>
                                        <p className="text-sm text-gray-300">{item.advice}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-blue-700/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-semibold mb-4">💡 Porady ochronne</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold text-blue-200 mb-2">🧴 Ochrona skóry</h4>
                        <ul className="text-sm text-gray-300 space-y-1">
                            <li>• Używaj kremu z filtrem SPF 30+</li>
                            <li>• Nakładaj krem 30 min przed wyjściem</li>
                            <li>• Odnawiaj krem co 2 godziny</li>
                            <li>• Chroń szczególnie nos, uszy i ramiona</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-blue-200 mb-2">👕 Odzież ochronna</h4>
                        <ul className="text-sm text-gray-300 space-y-1">
                            <li>• Noś kapelusz z szerokim rondem</li>
                            <li>• Używaj okularów przeciwsłonecznych</li>
                            <li>• Wybieraj luźną, długą odzież</li>
                            <li>• Szukaj cienia w godzinach 10-16</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
