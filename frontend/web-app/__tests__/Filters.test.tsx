import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Filters from '../app/auctions/Filters';
import { useParamsStore } from '@/hooks/useParamsStore';

jest.mock('@/hooks/useParamsStore', () => ({
    useParamsStore: jest.fn()
}));

const mockSetParams = jest.fn();

beforeEach(() => {
    useParamsStore.mockReturnValue({
        pageSize: 4,
        setParams: mockSetParams,
        orderBy: 'make',
        filterBy: 'live'
    });
});

describe('Filters', () => {
    test('renders Filters component', () => {
        render(<Filters />);
        expect(screen.getByText(/Filter by/i)).toBeInTheDocument();
        expect(screen.getByText(/Order by/i)).toBeInTheDocument();
        expect(screen.getByText(/Page size/i)).toBeInTheDocument();
    });

    test('calls setParams with correct filter value', () => {
        render(<Filters />);
        fireEvent.click(screen.getByText(/Ending < 6 hours/i));
        expect(mockSetParams).toHaveBeenCalledWith({ filterBy: 'endingSoon' });
    });

    test('calls setParams with correct order value', () => {
        render(<Filters />);
        fireEvent.click(screen.getByText(/Recently added/i));
        expect(mockSetParams).toHaveBeenCalledWith({ orderBy: 'new' });
    });

    test('calls setParams with correct page size value', () => {
        render(<Filters />);
        fireEvent.click(screen.getByText(/8/i));
        expect(mockSetParams).toHaveBeenCalledWith({ pageSize: 8 });
    });
});
