This is a [Next.js](https://nextjs.org/) project bootstrapped
with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and
load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions
are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use
the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)
from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Services and Components

### Auction Service

The Auction Service is responsible for managing auctions. It provides endpoints for creating, updating, deleting, and retrieving auctions.

#### Endpoints

- `GET /api/auctions`: Retrieves a list of all auctions.
- `GET /api/auctions/{id}`: Retrieves a specific auction by ID.
- `POST /api/auctions`: Creates a new auction.
- `PUT /api/auctions/{id}`: Updates an existing auction.
- `DELETE /api/auctions/{id}`: Deletes an auction.

#### Example

```csharp
[HttpGet]
public async Task<ActionResult<List<AuctionDto>>> GetAllAuctions(string date)
{
    try
    {
        return await _repo.GetAuctionsAsync(date);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error occurred while getting all auctions.");
        return StatusCode(500, "Internal server error");
    }
}
```

### Bidding Service

The Bidding Service is responsible for managing bids on auctions. It provides endpoints for placing bids and retrieving bids for a specific auction.

#### Endpoints

- `POST /api/bids`: Places a new bid on an auction.
- `GET /api/bids/{auctionId}`: Retrieves all bids for a specific auction.

#### Example

```csharp
[HttpPost]
public async Task<ActionResult<Bid>> PlaceBid([FromQuery] string auctionId, int amount)
{
    try
    {
        var auction = await DB.Find<Auction>().OneAsync(auctionId);

        if (auction == null)
        {
            auction = _grpcClient.GetAuction(auctionId);

            if (auction == null) return BadRequest("Cannot access bids on this auction at this time");
        }

        if (auction.Seller == User.Identity.Name)
            return BadRequest("You cannot bid on your own auction");

        var bid = new Bid
        {
            Amount = amount,
            AuctionId = auctionId,
            Bidder = User.Identity.Name
        };

        if (auction.AuctionEnd < DateTime.UtcNow)
        {
            bid.BidStatus = BidStatus.Finished;
        }

        else
        {
            var highBid = await DB.Find<Bid>()
                .Match(a => a.AuctionId == auctionId)
                .Sort(b => b.Descending(x => x.Amount))
                .ExecuteFirstAsync();

            if ((highBid != null && amount > highBid.Amount) || highBid == null)
                bid.BidStatus = amount > auction.ReservePrice
                    ? BidStatus.Accepted
                    : BidStatus.AcceptedBelowReserve;

            if (highBid != null && amount <= highBid.Amount)
                bid.BidStatus = BidStatus.TooLow;
        }

        await DB.SaveAsync(bid);

        await _publishEndpoint.Publish(_mapper.Map<BidPlaced>(bid));

        return Ok(_mapper.Map<BidDto>(bid));
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error occurred while placing bid.");
        return StatusCode(500, "Internal server error");
    }
}
```

### Frontend Components

#### AuctionCard

The `AuctionCard` component displays information about an auction, including the make, model, year, and current bid.

#### Example

```tsx
import {Auction} from "@/types";
import Link from "next/link";
import CarImage from "@/app/auctions/CarImage";
import CountdownTimer from "@/app/auctions/CountdownTimer";
import CurrentBid from "@/app/auctions/CurrentBid";

type Props = {
    auction: Auction;
}

export default function AuctionCard({auction}: Props) {
    return (
        <Link href={`/auctions/details/${auction.id}`} className={'group'}>
            <div className={'w-full bg-gray-200 aspect-w-16 aspect-h-10 rounded-lg overflow-hidden'}>
                <div>
                    <CarImage imageUrl={auction.imageUrl}/>
                    <div className={'absolute bottom-2 left-2'}>
                        <CountdownTimer auctionEnd={auction.auctionEnd}/>
                    </div>
                    <div className={'absolute top-2 right-2'}>
                        <CurrentBid reversePrice={auction.reservePrice} amount={auction.currentHighBind}/>
                    </div>
                </div>
            </div>
            <div className={'flex justify-between items-center mt-4'}>
                <h3 className={'text-gray-700'}>{auction.make} {auction.model}</h3>
                <p className={'font-semibold text-sm'}>{auction.year}</p>
            </div>
        </Link>
    )
}
```

#### AuctionForm

The `AuctionForm` component provides a form for creating or updating an auction.

#### Example

```tsx
import {FieldValues, useForm} from "react-hook-form";
import {Button} from "flowbite-react";
import Input from "@/app/components/Input";
import {useEffect} from "react";
import DateInput from "@/app/components/DateInput";
import {createAuction, updateAuction} from "@/app/actions/auctionActions";
import {usePathname, useRouter} from "next/navigation";
import toast from "react-hot-toast";
import {Auction} from "@/types";

type Props = {
    auction?: Auction
}

export default function AuctionForm({auction}: Props) {
    const router = useRouter();
    const pathname = usePathname();

    const {
        control,
        handleSubmit,
        setFocus,
        reset,
        formState: {isSubmitting, isValid, isDirty}
    } = useForm({mode: 'onTouched'});

    useEffect(() => {
        if (auction) {
            const {make, model, color, mileage, year} = auction;
            reset({make, model, color, mileage, year});
        }
        setFocus('make');
    }, [setFocus, reset, auction]);

    async function onSubmit(data: FieldValues) {
        try {
            let id = '';
            let res;
            if (pathname === '/auctions/create') {
                res = await createAuction(data);
                id = res.id;
            } else {
                if (auction) {
                    res = await updateAuction(auction.id, data);
                    id = auction.id;
                }
            }
            if (res.error) {
                throw res.error;
            }
            router.push(`/auctions/details/${id}`);
        } catch (e: any) {
            toast.error(e.status + ' ' + e.message)
        }
    }

    return (
        <form className={'flex flex-col mt-3'} onSubmit={handleSubmit(onSubmit)}>
            <Input label={'Make'} name={'make'} control={control} rules={{required: 'Make is required'}}/>
            <Input label={'Model'} name={'model'} control={control} rules={{required: 'Model is required'}}/>
            <Input label={'Color'} name={'color'} control={control} rules={{required: 'Color is required'}}/>

            <div className={'grid grid-cols-2 gap-3'}>
                <Input label={'Year'} name={'year'} control={control} rules={{required: 'Year is required'}}/>
                <Input label={'Mileage'} name={'mileage'} control={control} rules={{required: 'Mileage is required'}}
                       type={'number'}/>
            </div>

            {pathname === '/auctions/create' &&
                <>
                    <Input label={'Image URL'} name={'imageUrl'} control={control}
                           rules={{required: 'Image URL is required'}}/>

                    <div className={'grid grid-cols-2 gap-3'}>
                        <Input label={'Reserve Price (enter 0 if no reserve)'} name={'reservePrice'} type={'number'}
                               control={control} rules={{required: 'Reserve Price is required'}}/>
                        <DateInput
                            label={'Auction end date/time'}
                            name={'auctionEnd'}
                            control={control}
                            rules={{required: 'Auction end date is required'}}
                            dateFormat={'dd MMMM yyyy h:mm a'}
                            showTimeSelect
                        />
                    </div>
                </>
            }

            <div className={'flex justify-between'}>
                <Button outline color={'gray'}>Cancel</Button>
                <Button
                    isProcessing={isSubmitting}
                    outline color={'success'} type={'submit'}
                    disabled={!isValid || !isDirty || isSubmitting}
                >
                    Submit
                </Button>
            </div>
        </form>
    )
}
```

#### CarImage

The `CarImage` component displays an image of a car with loading effects.

#### Example

```tsx
import Image from "next/image";
import {useState} from "react";

type Props = {
    imageUrl: string;
}

export default function CarImage({imageUrl}: Props) {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <Image
            src={imageUrl}
            sizes={'(max-width:768px) 100vw, (max-width:1200px) 50vw, 25vw'}
            alt={"image"}
            fill
            className={`object-cover group-hover:opacity-75 ease-in-out duration-700 ${isLoading ? "grayscale blur-2xl" : "grayscale-0 blur-0 scale-100"}`}
            onLoadingComplete={() => setIsLoading(false)}
        />
    )
}
```

#### CountdownTimer

The `CountdownTimer` component displays a countdown timer for an auction.

#### Example

```tsx
import Countdown, {zeroPad} from "react-countdown";
import {useBidStore} from "@/hooks/useBidStore";
import {usePathname} from "next/navigation";

type Props = {
    auctionEnd: string;
}

const renderer = ({days, hours, minutes, seconds, completed}: {
    days: number,
    hours: number,
    minutes: number,
    seconds: number,
    completed: boolean
}) => {
    return (
        <div className={`
            border-2 border-white text-white py-1 px-2 rounded-lg flex justify-center
            ${completed ? 'bg-red-600' : (days === 0 && hours < 10) ? 'bg-amber-600' : 'bg-green-600'}
        `}>
            {completed
                ? <span>Auction finished</span>
                : <span
                    suppressHydrationWarning>{zeroPad(days)}:{zeroPad(hours)}:{zeroPad(minutes)}:{zeroPad(seconds)}</span>}
        </div>
    )
}

export default function CountdownTimer({auctionEnd}: Props) {
    const setOpen = useBidStore(state => state.setOpen);
    const pathname = usePathname();

    function auctionFinished() {
        if (pathname?.startsWith('/auctions/details')) {
            setOpen(false);
        }
    }

    return (
        <div>
            <Countdown date={auctionEnd} renderer={renderer} onComplete={auctionFinished}/>
        </div>
    )
}
```

#### Filters

The `Filters` component provides filtering options for the auction listings.

#### Example

```tsx
import {Button} from "flowbite-react";
import {useParamsStore} from "@/hooks/useParamsStore";
import {AiOutlineClockCircle, AiOutlineSortAscending} from "react-icons/ai";
import {BsFillStopCircleFill, BsStopwatchFill} from "react-icons/bs";
import {GiFinishLine, GiFlame} from "react-icons/gi";

const pageSizeButtons = [4, 8, 12];

const orderButtons = [
    {label: 'Alphabetical', icon: AiOutlineSortAscending, value: 'make'},
    {label: 'End date', icon: AiOutlineClockCircle, value: 'endingSoon'},
    {label: 'Recently added', icon: BsFillStopCircleFill, value: 'new'},
]

const filterButtons = [
    {label: 'Live Auctions', icon: GiFlame, value: 'live'},
    {label: 'Ending < 6 hours', icon: GiFinishLine, value: 'endingSoon'},
    {label: 'Completed', icon: BsStopwatchFill, value: 'finished'},
]

export default function Filters() {
    const pageSize = useParamsStore(state => state.pageSize);
    const setParams = useParamsStore(state => state.setParams);
    const orderBy = useParamsStore(state => state.orderBy);
    const filterBy = useParamsStore(state => state.filterBy);

    return (
        <div className={'flex justify-between items-center mb-4'}>

            <div>
                <span className={'text-gray-500 uppercase text-sm mb-4'}>Filter by </span>
                <Button.Group>
                    {filterButtons.map(({label, icon: Icon, value}) =>
                        <Button
                            key={value}
                            onClick={() => setParams({filterBy: value})}
                            color={`${filterBy === value ? 'red' : 'gray'}`}
                            className={'focus:ring-0'}
                        >
                            <Icon className={'mr-3 h-4 w-4'}/>
                            {label}
                        </Button>
                    )}
                </Button.Group>
            </div>

            <div>
                <span className={'text-gray-500 uppercase text-sm mb-4'}>Order by </span>
                <Button.Group>
                    {orderButtons.map(({label, icon: Icon, value}) =>
                        <Button
                            key={value}
                            onClick={() => setParams({orderBy: value})}
                            color={`${orderBy === value ? 'red' : 'gray'}`}
                            className={'focus:ring-0'}
                        >
                            <Icon className={'mr-3 h-4 w-4'}/>
                            {label}
                        </Button>
                    )}
                </Button.Group>
            </div>

            <div>
                <span className={'text-gray-500 uppercase text-sm mb-4'}>Page size </span>
                <Button.Group>
                    {pageSizeButtons.map((v, i) =>
                        <Button
                            key={i}
                            onClick={() => setParams({pageSize: v})}
                            color={pageSize === v ? 'red' : 'gray'}
                            className={'focus:ring-0'}
                        >
                            {v}
                        </Button>
                    )}
                </Button.Group>
            </div>
        </div>
    );
}
```
