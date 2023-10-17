'use client';
import {useState} from "react";
import {Button} from "flowbite-react";
import {useRouter} from "next/navigation";
import {deleteAuction} from "@/app/actions/auctionActions";
import toast from "react-hot-toast";

export default function DeleteButton({id}: { id: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    function doDelete() {
        setLoading(true);
        deleteAuction(id)
            .then(res => {
                if (res.error) throw res.error;
                router.push('/');
            })
            .catch(e => toast.error(e.status + ' ' + e.message))
            .finally(() => setLoading(false));
    }

    return (
        <Button isProcessing={loading} color={'failure'} onClick={doDelete}>
            Delete Auction
        </Button>
    )
}