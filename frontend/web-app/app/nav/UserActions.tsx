'use client';

import {Dropdown} from "flowbite-react";
import {User} from "next-auth";
import {HiCog, HiUser} from "react-icons/hi2";
import Link from "next/link";
import {AiFillCar, AiFillTrophy, AiOutlineLogout} from "react-icons/ai";
import {signOut} from "next-auth/react";
import {usePathname, useRouter} from "next/navigation";
import {useParamsStore} from "@/hooks/useParamsStore";

type Props = {
    user: User
}

export default function UserActions({user}: Props) {
    const router = useRouter();
    const pathName = usePathname();
    const setParams = useParamsStore(state => state.setParams);

    function setWinner() {
        setParams({winner: user.username, seller: undefined});
        if (pathName !== '/') router.push('/');
    }

    function setSeller() {
        setParams({winner: undefined, seller: user.username});
        if (pathName !== '/') router.push('/');
    }

    return (
        <Dropdown label={`Welcome ${user.name}`} inline>
            <Dropdown.Item icon={HiUser} onClick={setSeller}>
                My Auctions
            </Dropdown.Item>
            <Dropdown.Item icon={AiFillTrophy} onClick={setWinner}>
                Auctions won
            </Dropdown.Item>
            <Dropdown.Item icon={AiFillCar}>
                <Link href={'/auctions/create'}>
                    Sell my car
                </Link>
            </Dropdown.Item>
            <Dropdown.Item icon={HiCog}>
                <Link href={'/session'}>
                    Session (dev only)
                </Link>
            </Dropdown.Item>
            <Dropdown.Divider/>
            <Dropdown.Item icon={AiOutlineLogout} onClick={() => signOut({callbackUrl: '/'})}>
                Sign out
            </Dropdown.Item>
        </Dropdown>
    )
}