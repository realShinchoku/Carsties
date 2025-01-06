'use server'

import {Auction, Bid, PagedResult} from "@/types";
import {FieldValues} from "react-hook-form";
import {revalidatePath} from "next/cache";
import {fetchWrapper} from "@/app/lib/fetchWrapper";

const baseUrl = process.env.API_URL;

const handleError = (error: any) => {
    console.error(error);
    return { error: error.message || 'An unexpected error occurred' };
};

/**
 * Fetches auction data based on the provided query.
 * @param query - The query string for fetching auction data.
 * @returns A promise that resolves to a PagedResult of Auction objects.
 */
export const getData = async (query: string): Promise<PagedResult<Auction>> => {
    try {
        return await fetchWrapper.get(`search${query}`);
    } catch (error) {
        return handleError(error);
    }
};

/**
 * Updates the mileage of a specific auction for testing purposes.
 * @returns A promise that resolves to the updated auction data.
 */
export const updateAuctionTest = async () => {
    const data = {
        mileage: Math.floor(Math.random() * 100000) + 1,
    };

    try {
        return await fetchWrapper.put('auctions/afbee524-5972-4075-8800-7d1f9d7b0a0c', data);
    } catch (error) {
        return handleError(error);
    }
};

/**
 * Creates a new auction with the provided data.
 * @param data - The data for the new auction.
 * @returns A promise that resolves to the created auction data.
 */
export const createAuction = async (data: FieldValues) => {
    try {
        return await fetchWrapper.post('auctions', data);
    } catch (error) {
        return handleError(error);
    }
};

/**
 * Fetches detailed view data for a specific auction by ID.
 * @param id - The ID of the auction to fetch.
 * @returns A promise that resolves to the detailed auction data.
 */
export const getDetailedViewData = async (id: string): Promise<Auction> => {
    try {
        return await fetchWrapper.get(`auctions/${id}`);
    } catch (error) {
        return handleError(error);
    }
};

/**
 * Updates an existing auction with the provided data.
 * @param id - The ID of the auction to update.
 * @param data - The updated data for the auction.
 * @returns A promise that resolves to the updated auction data.
 */
export const updateAuction = async (id: string, data: FieldValues) => {
    try {
        const res = await fetchWrapper.put(`auctions/${id}`, data);
        revalidatePath(`/auctions/${id}`);
        return res;
    } catch (error) {
        return handleError(error);
    }
};

/**
 * Deletes a specific auction by ID.
 * @param id - The ID of the auction to delete.
 * @returns A promise that resolves to the deletion result.
 */
export const deleteAuction = async (id: string) => {
    try {
        return await fetchWrapper.del(`auctions/${id}`);
    } catch (error) {
        return handleError(error);
    }
};

/**
 * Fetches bids for a specific auction by ID.
 * @param id - The ID of the auction to fetch bids for.
 * @returns A promise that resolves to a list of Bid objects.
 */
export const getBidsForAuction = async (id: string): Promise<Bid[]> => {
    try {
        return await fetchWrapper.get(`bids/${id}`);
    } catch (error) {
        return handleError(error);
    }
};

/**
 * Places a bid for a specific auction.
 * @param auctionId - The ID of the auction to place a bid on.
 * @param amount - The amount of the bid.
 * @returns A promise that resolves to the placed Bid object.
 */
export const placeBidForAuction = async (auctionId: string, amount: number): Promise<Bid> => {
    try {
        return await fetchWrapper.post(`bids?auctionId=${auctionId}&amount=${amount}`, {});
    } catch (error) {
        return handleError(error);
    }
};
