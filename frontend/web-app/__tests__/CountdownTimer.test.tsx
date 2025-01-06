import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import CountdownTimer from '../app/auctions/CountdownTimer';

const mockAuctionEnd = new Date(Date.now() + 10000).toISOString();

describe('CountdownTimer', () => {
    test('renders CountdownTimer component', () => {
        render(<CountdownTimer auctionEnd={mockAuctionEnd} />);
        expect(screen.getByText(/Auction finished/i)).toBeInTheDocument();
    });

    test('displays the correct countdown time', () => {
        render(<CountdownTimer auctionEnd={mockAuctionEnd} />);
        expect(screen.getByText(/00:00:10/i)).toBeInTheDocument();
    });

    test('changes color based on time remaining', () => {
        render(<CountdownTimer auctionEnd={mockAuctionEnd} />);
        const countdownElement = screen.getByText(/00:00:10/i).parentElement;
        expect(countdownElement).toHaveClass('bg-green-600');
    });

    test('calls auctionFinished function when countdown completes', () => {
        const auctionFinished = jest.fn();
        render(<CountdownTimer auctionEnd={mockAuctionEnd} />);
        setTimeout(() => {
            expect(auctionFinished).toHaveBeenCalled();
        }, 10000);
    });
});
