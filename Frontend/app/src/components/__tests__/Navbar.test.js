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

        // Menu powinno być widoczne
        expect(screen.getAllByText('Główna')).toHaveLength(2); // Desktop + Mobile
    });

    test('closes mobile menu when clicking outside', () => {
        render(<NavbarWithRouter />);

        const menuButton = screen.getByLabelText('Toggle menu');
        fireEvent.click(menuButton);

        // Kliknij poza menu
        fireEvent.click(document.body);

        expect(screen.getAllByText('Główna')).toHaveLength(1); // Tylko desktop
    });
});
