// hooks/usePopup.js
import { useState } from 'react';

export default function usePopup() {
    const [popup, setPopup] = useState({ message: '', type: 'error', show: false });

    const showPopup = (message, type = 'error') => {
        setPopup({ message, type, show: true });
    };

    const hidePopup = () => {
        setPopup({ message: '', type: 'error', show: false });
    };

    const showError = (message) => showPopup(message, 'error');
    const showWarning = (message) => showPopup(message, 'warning');
    const showInfo = (message) => showPopup(message, 'info');
    const showSuccess = (message) => showPopup(message, 'success');

    return {
        popup,
        showPopup,
        hidePopup,
        showError,
        showWarning,
        showInfo,
        showSuccess
    };
}
