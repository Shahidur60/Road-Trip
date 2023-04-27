import axios from "axios";
import { useRouter } from "next/router";
import { useEffect } from "react";

export const BASE_URL = process.env.API_URL;

export const myAxios = axios.create({
    baseURL: BASE_URL,
    headers: {'Allow-Cross-Allow-Origin': '*'}
});

export const loggedInRedirect = (url) => {
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('traveler-token');

        if (token) {
            router.push(url);
        }
    }, [])
}

export const loggedOutRedirect = (url) => {
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('traveler-token');

        if (!token) {
            router.push(url);
        }
    }, [])
}