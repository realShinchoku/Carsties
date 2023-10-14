'use client'
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