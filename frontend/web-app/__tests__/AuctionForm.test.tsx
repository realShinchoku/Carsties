import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AuctionForm from '../app/auctions/AuctionForm';
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

describe('AuctionForm', () => {
    test('renders AuctionForm component', () => {
        render(<AuctionForm auction={mockAuction} />);
        expect(screen.getByLabelText(/Make/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Model/i)).toBeInTheDocument();
    });

    test('displays the correct initial values', () => {
        render(<AuctionForm auction={mockAuction} />);
        expect(screen.getByLabelText(/Make/i)).toHaveValue(mockAuction.make);
        expect(screen.getByLabelText(/Model/i)).toHaveValue(mockAuction.model);
    });

    test('submits the form with correct data', () => {
        render(<AuctionForm auction={mockAuction} />);
        fireEvent.change(screen.getByLabelText(/Make/i), { target: { value: 'Honda' } });
        fireEvent.change(screen.getByLabelText(/Model/i), { target: { value: 'Civic' } });
        fireEvent.click(screen.getByText(/Submit/i));
        expect(screen.getByLabelText(/Make/i)).toHaveValue('Honda');
        expect(screen.getByLabelText(/Model/i)).toHaveValue('Civic');
    });
});
