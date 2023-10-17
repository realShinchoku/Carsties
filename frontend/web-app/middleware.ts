export {default} from "next-auth/middleware";

export const config = {
    matcher: [
        '/session',
    ],
    pages: {
        singIn: '/api/auth/signin',
    }
}