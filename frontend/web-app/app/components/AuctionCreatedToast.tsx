import {Auction} from "@/types";
import Link from "next/link";
import Image from "next/image";

export default function AuctionCreatedToast({auction}: { auction: Auction }) {
    return (
        <Link href={`/auctions/details/${auction.id}`} className={'flex items-center flex-col'}>
            <div className={'flex flex-row items-center gap-2'}>
                <Image src={auction.imageUrl} alt={'image'} height={80} width={80}
                       className={'rounded-lg w-auto h-auto'}/>
                <span>New Auction! {auction.make} {auction.model} has been added</span>
            </div>
        </Link>
    )
}