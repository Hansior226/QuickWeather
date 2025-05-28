// components/ErrorPopup.jsx
import React from 'react';

export default function ErrorPopup({ message, type = 'error', onClose }) {
    if (!message) return null;

    const getIcon = () => {
        switch (type) {
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            case 'success': return '✅';
            default: return '❌';
        }
    };

    const getColors = () => {
        switch (type) {
            case 'error': return 'border-red-500 bg-red-50 text-red-800';
            case 'warning': return 'border-yellow-500 bg-yellow-50 text-yellow-800';
            case 'info': return 'border-blue-500 bg-blue-50 text-blue-800';
            case 'success': return 'border-green-500 bg-green-50 text-green-800';
            default: return 'border-red-500 bg-red-50 text-red-800';
        }
    };

    const getButtonColors = () => {
        switch (type) {
            case 'error': return 'bg-red-600 hover:bg-red-700';
            case 'warning': return 'bg-yellow-600 hover:bg-yellow-700';
            case 'info': return 'bg-blue-600 hover:bg-blue-700';
            case 'success': return 'bg-green-600 hover:bg-green-700';
            default: return 'bg-red-600 hover:bg-red-700';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border-2 ${getColors()} transform transition-all duration-300 scale-100`}>
                <div className="flex items-center space-x-3 mb-4">
                    <span className="text-2xl">{getIcon()}</span>
                    <h2 className="text-xl font-semibold">
                        {type === 'error' && 'Błąd'}
                        {type === 'warning' && 'Ostrzeżenie'}
                        {type === 'info' && 'Informacja'}
                        {type === 'success' && 'Sukces'}
                    </h2>
                </div>

                <p className="mb-6 text-gray-700 leading-relaxed">{message}</p>

                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className={`px-6 py-2 text-white rounded-lg transition-colors duration-200 ${getButtonColors()}`}
                    >
                        Zamknij
                    </button>
                </div>
            </div>
        </div>
    );
}
