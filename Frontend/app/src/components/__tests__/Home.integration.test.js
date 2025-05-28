// src/pages/__tests__/Home.integration.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../Home';

// Mock geolocation
const mockGeolocation = {
    getCurrentPosition: jest.fn()
};
global.navigator.geolocation = mockGeolocation;

const HomeWithRouter = () => (
    <BrowserRouter>
        <Home />
    </BrowserRouter>
);

describe('Home Integration Tests', () => {
    beforeEach(() => {
        fetch.mockClear();
        mockGeolocation.getCurrentPosition.mockClear();
    });

    test('loads weather data on geolocation success', async () => {
        // Mock geolocation success
        mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
            success({
                coords: { latitude: 52.2297, longitude: 21.0122 }
            });
        });

        // Mock API response
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                city: 'Warszawa',
                current: {
                    temp: 20.5,
                    humidity: 65,
                    pressure: 1013,
                    wind: { speed: 3.5, direction: 180 },
                    description: 'bezchmurnie',
                    icon: '01d'
                },
                forecast: [],
                coordinates: { lat: 52.2297, lon: 21.0122 }
            })
        });

        render(<HomeWithRouter />);

        await waitFor(() => {
            expect(screen.getByText('Warszawa')).toBeInTheDocument();
        });
    });

    test('handles geolocation error gracefully', async () => {
        mockGeolocation.getCurrentPosition.mockImplementationOnce((success, error) => {
            error({ code: 1, message: 'Permission denied' });
        });

        render(<HomeWithRouter />);

        await waitFor(() => {
            expect(screen.getByText(/Dostęp do lokalizacji został zablokowany/)).toBeInTheDocument();
        });
    });

    test('searches for city weather', async () => {
        render(<HomeWithRouter />);

        // Mock API response
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                city: 'Kraków',
                current: {
                    temp: 18.0,
                    humidity: 70,
                    pressure: 1010,
                    wind: { speed: 2.5, direction: 90 },
                    description: 'pochmurno',
                    icon: '04d'
                },
                forecast: []
            })
        });

        const searchInput = screen.getByPlaceholderText('Wyszukaj miasto...');
        const searchButton = screen.getByText('Szukaj');

        fireEvent.change(searchInput, { target: { value: 'Kraków' } });
        fireEvent.click(searchButton);

        await waitFor(() => {
            expect(screen.getByText('Kraków')).toBeInTheDocument();
        });
    });

    test('toggles temperature units', async () => {
        // Setup initial weather data
        fetch.mockResolvedValue({
            ok: true,
            json: async () => ({
                city: 'Warszawa',
                current: {
                    temp: 20.5,
                    humidity: 65,
                    pressure: 1013,
                    wind: { speed: 3.5, direction: 180 },
                    description: 'bezchmurnie',
                    icon: '01d'
                },
                forecast: []
            })
        });

        render(<HomeWithRouter />);

        const unitsButton = screen.getByText('°C');
        fireEvent.click(unitsButton);

        expect(screen.getByText('°F')).toBeInTheDocument();
    });
});
