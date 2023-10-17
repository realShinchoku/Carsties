'use client';
import {FaSearch} from "react-icons/fa";
import {useParamsStore} from "@/hooks/useParamsStore";
import {ChangeEvent} from "react";
import {usePathname, useRouter} from "next/navigation";

export default function Search() {
    const router = useRouter();
    const pathname = usePathname();
    const setParams = useParamsStore(state => state.setParams);
    const searchValue = useParamsStore(state => state.searchValue);
    const setSearchValue = useParamsStore(state => state.setSearchValue);

    function onChange(event: ChangeEvent<HTMLInputElement>) {
        setSearchValue(event.target.value);
    }

    function search() {
        if (pathname !== '/') router.push('/');
        setParams({searchTerm: searchValue});
    }

    return (
        <div className={'flex w-[50%] items-center border-2 rounded-full py-2 shadow-sm'}>
            <input
                value={searchValue}
                type="text"
                placeholder={'Search for a car by make, model or color'}
                className={'flex-grow pl-5 bg-transparent focus:outline-none border-transparent focus:border-transparent focus:ring-0 text-sm text-gray-600'}
                onChange={onChange}
                onKeyDown={e => {
                    if (e.key === 'Enter') search();
                }}
            />
            <button onClick={search}>
                <FaSearch size={34} className={'bg-red-400 text-white rounded-full p-2 cursor-pointer mx-2'}/>
            </button>
        </div>
    )
}