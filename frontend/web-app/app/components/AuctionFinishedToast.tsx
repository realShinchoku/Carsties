import {numberWithCommas} from "@/app/lib/numberWithComma";
import {Auction, AuctionFinished} from "@/types";
import Link from "next/link";
import Image from "next/image";

export default function AuctionFinishedToast({finishedAuction, auction}: {
    finishedAuction: AuctionFinished,
    auction: Auction
}) {
    return (
        <Link href={`/auctions/details/${auction.id}`} className={'flex items-center flex-col'}>
            <div className={'flex flex-row items-center gap-2'}>
                <Image src={auction.imageUrl} alt={'image'} height={80} width={80}
                       className={'rounded-lg w-auto h-auto'}/>
                <div className={'flex flex-col'}>
                    <span>Auction for {auction.make} {auction.model} has finished</span>
                    {finishedAuction.itemSold && finishedAuction.amount
                        ? <p>Congrats to {finishedAuction.winner} who has won this auction for
                            ${numberWithCommas(finishedAuction.amount)}</p>
                        : <p>This item did not sell</p>
                    }
                </div>
            </div>
        </Link>
    )
}