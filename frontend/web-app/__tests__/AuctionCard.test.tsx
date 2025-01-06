import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AuctionCard from '../app/auctions/AuctionCard';
import { Auction } from '@/types';

const mockAuction: Auction = {
    id: '1',
    make: 'Toyota',
    model: 'Corolla',
    year: 2020,
    color: 'Red',
    mileage: 10000,
    imageUrl: 'https://example.com/car.jpg',
    auctionEnd: new Date().toISOString(),
    reservePrice: 5000,
    currentHighBind: 4500,
    seller: 'testSeller'
};

describe('AuctionCard', () => {
    test('renders AuctionCard component', () => {
        render(<AuctionCard auction={mockAuction} />);
        expect(screen.getByText(/Toyota Corolla/i)).toBeInTheDocument();
        expect(screen.getByText(/2020/i)).toBeInTheDocument();
    });

    test('displays the correct image', () => {
        render(<AuctionCard auction={mockAuction} />);
        const image = screen.getByRole('img');
        expect(image).toHaveAttribute('src', mockAuction.imageUrl);
    });

    test('displays the correct auction end time', () => {
        render(<AuctionCard auction={mockAuction} />);
        expect(screen.getByText(/Auction finished/i)).toBeInTheDocument();
    });

    test('displays the correct current bid', () => {
        render(<AuctionCard auction={mockAuction} />);
        expect(screen.getByText(/\$4500/i)).toBeInTheDocument();
    });
});
