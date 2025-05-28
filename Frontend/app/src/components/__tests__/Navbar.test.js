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

        expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();

        expect(screen.getAllByText('Główna')).toHaveLength(2);
    });

    test('closes mobile menu when clicking menu item', () => {
        render(<NavbarWithRouter />);

        const menuButton = screen.getByLabelText('Toggle menu');
        fireEvent.click(menuButton);

        expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();

        const mobileLink = screen.getByTestId('mobile-menu').querySelector('a[href="/air-quality"]');
        fireEvent.click(mobileLink);

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
