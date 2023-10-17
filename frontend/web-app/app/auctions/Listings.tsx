'use client'

import AuctionCard from "@/app/auctions/AuctionCard";
import {Auction, PagedResult} from "@/types";
import AppPagination from "@/app/components/AppPagination";
import {useEffect, useState} from "react";
import Filters from "@/app/auctions/Filters";
import {useParamsStore} from "@/hooks/useParamsStore";
import {shallow} from "zustand/shallow";
import qs from "query-string";
import EmptyFilter from "@/app/components/EmptyFilter";
import {getData} from "@/app/actions/auctionActions";

export default function Listings() {
    const [data, setData] = useState<PagedResult<Auction>>();
    const params = useParamsStore(state => ({
        pageNumber: state.pageNumber,
        pageSize: state.pageSize,
        searchTerm: state.searchTerm,
        orderBy: state.orderBy,
        filterBy: state.filterBy,
    }), shallow);

    const setParams = useParamsStore(state => state.setParams);
    const url = qs.stringifyUrl({url: '', query: params});

    function setPageNumber(pageNumber: number) {
        setParams({pageNumber});
    }

    useEffect(() => {
        getData(url)
            .then(data => {
                setData(data);
            });
    }, [url]);

    if (!data) return <h3>Loading...</h3>

    return (
        <>
            <Filters/>
            {data.totalCount == 0
                ? <EmptyFilter showReset/>
                : <>
                    <div className={'grid grid-cols-4 gap-6'}>
                        {data.results.map(auction => <AuctionCard key={auction.id} auction={auction}/>)}
                    </div>
                    <div className={'flex justify-center mt-4'}>
                        <AppPagination currentPage={params.pageNumber} pageCount={data.pageCount}
                                       pageChanged={setPageNumber}/>
                    </div>
                </>
            }
        </>
    )
}

