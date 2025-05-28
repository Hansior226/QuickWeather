// src/components/__tests__/Navbar.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../Navbar';

const NavbarWithRouter = () => (
    <BrowserRouter>
        <Navbar />
    </BrowserRouter>
);

describe('Navbar', () => {
    test('renders logo and navigation items', () => {
        render(<NavbarWithRouter />);

        expect(screen.getByText(/QuickWeather/)).toBeInTheDocument();
        expect(screen.getByText('Główna')).toBeInTheDocument();
        expect(screen.getByText('Jakość powietrza')).toBeInTheDocument();
    });

    test('toggles mobile menu', () => {
        render(<NavbarWithRouter />);

        const menuButton = screen.getByLabelText('Toggle menu');
        fireEvent.click(menuButton);

        // Sprawdź czy mobile menu się pojawiło
        expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();

        // Menu powinno być widoczne - sprawdź przez testid zamiast liczenia
        expect(screen.getAllByText('Główna')).toHaveLength(2); // Desktop + Mobile
    });

    test('closes mobile menu when clicking menu item', () => {
        render(<NavbarWithRouter />);

        const menuButton = screen.getByLabelText('Toggle menu');
        fireEvent.click(menuButton);

        // Sprawdź czy menu jest otwarte
        expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();

        // Kliknij w link w mobile menu
        const mobileLink = screen.getByTestId('mobile-menu').querySelector('a[href="/air-quality"]');
        fireEvent.click(mobileLink);

        // Menu powinno się zamknąć (nie ma już testid)
        expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();
    });

    test('menu button has correct accessibility attributes', () => {
        render(<NavbarWithRouter />);

        const menuButton = screen.getByLabelText('Toggle menu');

        expect(menuButton).toHaveAttribute('aria-label', 'Toggle menu');
        expect(menuButton).toHaveAttribute('aria-expanded', 'false');

        fireEvent.click(menuButton);

        expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    });

    test('navigation links have correct hrefs', () => {
        render(<NavbarWithRouter />);

        expect(screen.getByRole('link', { name: /Główna/ })).toHaveAttribute('href', '/');
        expect(screen.getByRole('link', { name: /Jakość powietrza/ })).toHaveAttribute('href', '/air-quality');
        expect(screen.getByRole('link', { name: /Indeks UV/ })).toHaveAttribute('href', '/uv-index');
    });
});
