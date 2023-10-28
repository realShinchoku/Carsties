'use server'

import {Auction, Bid, PagedResult} from "@/types";
import {fetchWrapper} from "@/lib/fetchWrapper";
import {FieldValues} from "react-hook-form";
import {revalidatePath} from "next/cache";

export const getData = async (query: string): Promise<PagedResult<Auction>> => await fetchWrapper.get(`search${query}`);

export const updateAuctionTest = async () => {
    const data = {
        mileage: Math.floor(Math.random() * 100000) + 1,
    }

    return await fetchWrapper.put('auctions/afbee524-5972-4075-8800-7d1f9d7b0a0c', data);
};

export const createAuction = async (data: FieldValues) => await fetchWrapper.post('auctions', data);

export const getDetailedViewData = async (id: string): Promise<Auction> => await fetchWrapper.get(`auctions/${id}`);

export const updateAuction = async (id: string, data: FieldValues) => {
    const res = await fetchWrapper.put(`auctions/${id}`, data)
    revalidatePath(`/auctions/${id}`);
    return res;
};

export const deleteAuction = async (id: string) => await fetchWrapper.del(`auctions/${id}`);

export const getBidsForAuction = async (id: string): Promise<Bid[]> => await fetchWrapper.get(`bids/${id}`);

export const placeBidForAuction = async (auctionId: string, amount: number): Promise<Bid> => await fetchWrapper.post(`bids?auctionId=${auctionId}&amount=${amount}`, {});