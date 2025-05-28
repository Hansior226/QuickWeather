// src/components/__tests__/CityList.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CityList from '../CityList';

// Mock fetch
global.fetch = jest.fn();

describe('CityList', () => {
    beforeEach(() => {
        fetch.mockClear();
        // Wyczyść console.error mock
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    test('renders loading state initially', () => {
        fetch.mockImplementation(() => new Promise(() => { })); // Never resolves

        render(<CityList units="metric" />);

        expect(screen.getByText('Inne duże miasta')).toBeInTheDocument();
        expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    test('renders city data successfully', async () => {
        // Mock różnych danych dla każdego miasta
        const mockCities = [
            {
                city: 'Bielsko-Biała',
                current: { temp: 18.5, description: 'pochmurno', icon: '04d' }
            },
            {
                city: 'Katowice',
                current: { temp: 19.0, description: 'słonecznie', icon: '01d' }
            },
            {
                city: 'Warszawa',
                current: { temp: 20.5, description: 'bezchmurnie', icon: '01d' }
            }
        ];

        // Mock fetch żeby zwracał różne dane dla każdego wywołania
        fetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockCities[0]
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockCities[1]
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockCities[2]
            });

        render(<CityList units="metric" />);

        await waitFor(() => {
            expect(screen.getByText('Bielsko-Biała')).toBeInTheDocument();
        });

        // Sprawdź wszystkie miasta
        expect(screen.getByText('Bielsko-Biała')).toBeInTheDocument();
        expect(screen.getByText('Katowice')).toBeInTheDocument();
        expect(screen.getByText('Warszawa')).toBeInTheDocument();

        // Sprawdź temperatury
        expect(screen.getByText('19°C')).toBeInTheDocument();
        expect(screen.getByText('19°C')).toBeInTheDocument();
        expect(screen.getByText('21°C')).toBeInTheDocument();
    });

    test('handles API errors gracefully', async () => {
        fetch.mockRejectedValue(new Error('API Error'));

        render(<CityList units="metric" />);

        await waitFor(() => {
            expect(screen.getByText('Nie udało się pobrać danych o miastach')).toBeInTheDocument();
        });
    });

    test('updates when units change', async () => {
        const mockDataMetric = {
            city: 'Warszawa',
            current: { temp: 20, description: 'sunny', icon: '01d' }
        };

        const mockDataImperial = {
            city: 'Warszawa',
            current: { temp: 68, description: 'sunny', icon: '01d' }
        };

        // Mock dla metric units (3 miasta)
        fetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ ...mockDataMetric, city: 'Bielsko-Biała' })
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ ...mockDataMetric, city: 'Katowice' })
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockDataMetric
            })
            // Mock dla imperial units (3 miasta)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ ...mockDataImperial, city: 'Bielsko-Biała' })
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ ...mockDataImperial, city: 'Katowice' })
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockDataImperial
            });

        const { rerender } = render(<CityList units="metric" />);

        await waitFor(() => {
            expect(screen.getByText('20°C')).toBeInTheDocument();
        });

        // Change units
        rerender(<CityList units="imperial" />);

        await waitFor(() => {
            expect(screen.getByText('68°F')).toBeInTheDocument();
        });
    });

    test('renders empty state when no cities', async () => {
        fetch.mockResolvedValue({
            ok: false,
            json: async () => ({ error: 'Not found' })
        });

        render(<CityList units="metric" />);

        await waitFor(() => {
            expect(screen.getByText('Nie udało się pobrać danych o miastach')).toBeInTheDocument();
        });
    });
});
