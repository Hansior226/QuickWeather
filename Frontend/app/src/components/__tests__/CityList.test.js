// src/components/__tests__/CityList.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CityList from '../CityList';

global.fetch = jest.fn();

describe('CityList', () => {
    beforeEach(() => {
        fetch.mockClear();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    test('renders loading state initially', () => {
        fetch.mockImplementation(() => new Promise(() => { }));

        render(<CityList units="metric" />);

        expect(screen.getByText('Inne duże miasta')).toBeInTheDocument();
        expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    test('renders city data successfully', async () => {
        const mockCities = [
            {
                city: 'Bielsko-Biała',
                current: { temp: 15.6, description: 'pochmurno', icon: '04d' }
            },
            {
                city: 'Katowice',
                current: { temp: 17.4, description: 'słonecznie', icon: '01d' }
            },
            {
                city: 'Warszawa',
                current: { temp: 20.5, description: 'bezchmurnie', icon: '01d' }
            }
        ];

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

        expect(screen.getByText('Bielsko-Biała')).toBeInTheDocument();
        expect(screen.getByText('Katowice')).toBeInTheDocument();
        expect(screen.getByText('Warszawa')).toBeInTheDocument();

        expect(screen.getByText('16°C')).toBeInTheDocument();
        expect(screen.getByText('17°C')).toBeInTheDocument();
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
        const mockDataMetric = [
            { city: 'Bielsko-Biała', current: { temp: 15.0, description: 'sunny', icon: '01d' } },
            { city: 'Katowice', current: { temp: 18.0, description: 'sunny', icon: '01d' } },
            { city: 'Warszawa', current: { temp: 20.0, description: 'sunny', icon: '01d' } }
        ];

        const mockDataImperial = [
            { city: 'Bielsko-Biała', current: { temp: 59.0, description: 'sunny', icon: '01d' } },
            { city: 'Katowice', current: { temp: 64.0, description: 'sunny', icon: '01d' } },
            { city: 'Warszawa', current: { temp: 68.0, description: 'sunny', icon: '01d' } }
        ];

        fetch
            .mockResolvedValueOnce({ ok: true, json: async () => mockDataMetric[0] })
            .mockResolvedValueOnce({ ok: true, json: async () => mockDataMetric[1] })
            .mockResolvedValueOnce({ ok: true, json: async () => mockDataMetric[2] })
            .mockResolvedValueOnce({ ok: true, json: async () => mockDataImperial[0] })
            .mockResolvedValueOnce({ ok: true, json: async () => mockDataImperial[1] })
            .mockResolvedValueOnce({ ok: true, json: async () => mockDataImperial[2] });

        const { rerender } = render(<CityList units="metric" />);

        await waitFor(() => {
            expect(screen.getByText('15°C')).toBeInTheDocument();
        });

        // Change units
        rerender(<CityList units="imperial" />);

        await waitFor(() => {
            expect(screen.getByText('59°F')).toBeInTheDocument();
        });
    });
});
