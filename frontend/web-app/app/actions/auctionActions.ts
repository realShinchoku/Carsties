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

export const getData = async (query: string): Promise<PagedResult<Auction>> => {
    try {
        return await fetchWrapper.get(`search${query}`);
    } catch (error) {
        return handleError(error);
    }
};

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

export const createAuction = async (data: FieldValues) => {
    try {
        return await fetchWrapper.post('auctions', data);
    } catch (error) {
        return handleError(error);
    }
};

export const getDetailedViewData = async (id: string): Promise<Auction> => {
    try {
        return await fetchWrapper.get(`auctions/${id}`);
    } catch (error) {
        return handleError(error);
    }
};

export const updateAuction = async (id: string, data: FieldValues) => {
    try {
        const res = await fetchWrapper.put(`auctions/${id}`, data);
        revalidatePath(`/auctions/${id}`);
        return res;
    } catch (error) {
        return handleError(error);
    }
};

export const deleteAuction = async (id: string) => {
    try {
        return await fetchWrapper.del(`auctions/${id}`);
    } catch (error) {
        return handleError(error);
    }
};

export const getBidsForAuction = async (id: string): Promise<Bid[]> => {
    try {
        return await fetchWrapper.get(`bids/${id}`);
    } catch (error) {
        return handleError(error);
    }
};

export const placeBidForAuction = async (auctionId: string, amount: number): Promise<Bid> => {
    try {
        return await fetchWrapper.post(`bids?auctionId=${auctionId}&amount=${amount}`, {});
    } catch (error) {
        return handleError(error);
    }
};
