// Frontend/app/src/setupTests.js
import '@testing-library/jest-dom';

// Mock geolocation
global.navigator.geolocation = {
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn()
};

// Mock fetch
global.fetch = jest.fn();
