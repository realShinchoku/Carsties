import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {getToken} from "next-auth/jwt";
import {cookies, headers} from "next/headers";
import {NextApiRequest} from "next";

export const getSession = async () => await getServerSession(authOptions);

export async function getCurrentUser() {
    try {
        const session = await getSession();

        console.log(session);

        if (!session) return null;

        return session.user;
    } catch (e) {
        return null;
    }
}

export async function getTokenWorkaround() {
    const req = {
        headers: Object.fromEntries(headers() as Headers),
        cookies: Object.fromEntries(cookies().getAll().map(c => [c.name, c.value])),
    } as NextApiRequest;

    return await getToken({req});
}