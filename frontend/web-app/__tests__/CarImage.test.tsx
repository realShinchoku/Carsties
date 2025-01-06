import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import CarImage from '../app/auctions/CarImage';

const mockImageUrl = 'https://example.com/car.jpg';

describe('CarImage', () => {
    test('renders CarImage component', () => {
        render(<CarImage imageUrl={mockImageUrl} />);
        const image = screen.getByRole('img');
        expect(image).toBeInTheDocument();
    });

    test('displays the correct image', () => {
        render(<CarImage imageUrl={mockImageUrl} />);
        const image = screen.getByRole('img');
        expect(image).toHaveAttribute('src', mockImageUrl);
    });

    test('applies loading styles initially', () => {
        render(<CarImage imageUrl={mockImageUrl} />);
        const image = screen.getByRole('img');
        expect(image).toHaveClass('grayscale blur-2xl');
    });

    test('removes loading styles after loading', () => {
        render(<CarImage imageUrl={mockImageUrl} />);
        const image = screen.getByRole('img');
        image.dispatchEvent(new Event('load'));
        expect(image).not.toHaveClass('grayscale blur-2xl');
    });
});
