import './globals.css'
import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import React from "react";
import Navbar from "@/app/nav/Navbar";
import ToasterProvider from "@/app/providers/ToasterProvider";

const inter = Inter({subsets: ['latin']})

export const metadata: Metadata = {
    title: 'Carsties',
    description: 'Generated by create next app',
}

export default function RootLayout({children,}: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body>
        <ToasterProvider/>
        <Navbar/>
        <main className={'container mx-auto px-5 pt-10'}>
            {children}
        </main>
        </body>
        </html>
    )
}
