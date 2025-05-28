// components/UVWidget.jsx
import React, { useState, useEffect } from 'react';

export default function UVWidget({ city, lat, lon }) {
    const [uvData, setUvData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if ((city || (lat && lon))) {
            fetchUVIndex();
        }
    }, [city, lat, lon]);

    const fetchUVIndex = async () => {
        setLoading(true);
        try {
            let url = 'http://localhost:5000/api/uv-index?';
            if (city) {
                url += `city=${encodeURIComponent(city)}`;
            } else if (lat && lon) {
                url += `lat=${lat}&lon=${lon}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (response.ok) {
                setUvData(data);
            } else {
                console.error('Błąd pobierania UV:', data.error);
            }
        } catch (error) {
            console.error('Błąd połączenia:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-800 rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="h-8 bg-gray-700 rounded w-1/2"></div>
            </div>
        );
    }

    if (!uvData) return null;

    return (
        <div className="bg-gray-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
                ☀️ Indeks UV
            </h3>

            <div className="flex items-center space-x-4 mb-4">
                <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                    style={{ backgroundColor: uvData.color }}
                >
                    {uvData.uv_index}
                </div>
                <div>
                    <p className="text-xl font-semibold">{uvData.level}</p>
                    {uvData.peak_time && (
                        <p className="text-sm text-gray-400">Szczyt: {uvData.peak_time}</p>
                    )}
                </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-3">
                <p className="text-sm text-gray-300">💡 {uvData.recommendation}</p>
            </div>
        </div>
    );
}
