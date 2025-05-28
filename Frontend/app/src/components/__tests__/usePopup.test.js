// src/hooks/__tests__/usePopup.test.js
import { renderHook, act } from '@testing-library/react';
import usePopup from '../usePopup';

describe('usePopup', () => {
    test('initial state is correct', () => {
        const { result } = renderHook(() => usePopup());

        expect(result.current.popup.show).toBe(false);
        expect(result.current.popup.message).toBe('');
        expect(result.current.popup.type).toBe('error');
    });

    test('showError displays error popup', () => {
        const { result } = renderHook(() => usePopup());

        act(() => {
            result.current.showError('Test error');
        });

        expect(result.current.popup.show).toBe(true);
        expect(result.current.popup.message).toBe('Test error');
        expect(result.current.popup.type).toBe('error');
    });

    test('hidePopup hides popup', () => {
        const { result } = renderHook(() => usePopup());

        act(() => {
            result.current.showError('Test error');
        });

        act(() => {
            result.current.hidePopup();
        });

        expect(result.current.popup.show).toBe(false);
    });

    test('different popup types work correctly', () => {
        const { result } = renderHook(() => usePopup());

        act(() => {
            result.current.showSuccess('Success message');
        });

        expect(result.current.popup.type).toBe('success');
        expect(result.current.popup.message).toBe('Success message');
    });
});
