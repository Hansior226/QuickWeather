// src/components/__tests__/ErrorPopup.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorPopup from '../ErrorPopup';

describe('ErrorPopup', () => {
    test('renders error message', () => {
        const mockOnClose = jest.fn();

        render(
            <ErrorPopup
                message="Test error message"
                type="error"
                onClose={mockOnClose}
            />
        );

        expect(screen.getByText('Test error message')).toBeInTheDocument();
        expect(screen.getByText('Błąd')).toBeInTheDocument();
    });

    test('calls onClose when close button clicked', () => {
        const mockOnClose = jest.fn();

        render(
            <ErrorPopup
                message="Test message"
                type="error"
                onClose={mockOnClose}
            />
        );

        fireEvent.click(screen.getByText('Zamknij'));
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('renders different types correctly', () => {
        const { rerender } = render(
            <ErrorPopup message="Success" type="success" onClose={() => { }} />
        );
        expect(screen.getByText('Sukces')).toBeInTheDocument();

        rerender(<ErrorPopup message="Warning" type="warning" onClose={() => { }} />);
        expect(screen.getByText('Ostrzeżenie')).toBeInTheDocument();
    });

    test('does not render when no message', () => {
        const { container } = render(
            <ErrorPopup message="" type="error" onClose={() => { }} />
        );
        expect(container.firstChild).toBeNull();
    });
});
