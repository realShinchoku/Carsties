import {getTokenWorkaround} from "@/app/actions/authActions";

const baseUrl = process.env.API_URL;

/**
 * Handles the response from an API request.
 * @param response - The response object from the fetch request.
 * @returns The parsed response data or an error object.
 */
const handleResponse = async (response: Response) => {
    const text = await response.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        data = text;
    }

    if (response.ok)
        return data || response.statusText;

    const error = {
        status: response.status,
        message: typeof data === 'string' && data.length > 0 ? data : response.statusText,
    };

    return {error};
};

/**
 * Handles errors that occur during an API request.
 * @param error - The error object.
 * @returns An object containing the error message.
 */
const handleError = (error: any) => {
    console.error(error);
    return { error: error.message || 'An unexpected error occurred' };
};

/**
 * Retrieves the headers for an API request, including the authorization token if available.
 * @returns An object containing the headers.
 */
const getHeaders = async () => {
    const token = await getTokenWorkaround();

    const headers = {
        'Content-type': 'application/json'
    } as any;

    if (token)
        headers.Authorization = 'Bearer ' + token.access_token;

    return headers;
};

/**
 * Sends a GET request to the specified URL.
 * @param url - The URL to send the request to.
 * @returns The response data or an error object.
 */
const get = async (url: string) => {
    try {
        const requestOptions = {
            method: 'GET',
            headers: await getHeaders(),
        }

        const response = await fetch(baseUrl + url, requestOptions);
        return await handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
};

/**
 * Sends a POST request to the specified URL with the provided body.
 * @param url - The URL to send the request to.
 * @param body - The body of the request.
 * @returns The response data or an error object.
 */
const post = async (url: string, body: {}) => {
    try {
        const requestOptions = {
            method: 'POST',
            headers: await getHeaders(),
            body: JSON.stringify(body)
        }

        const response = await fetch(baseUrl + url, requestOptions);
        return await handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
};

/**
 * Sends a PUT request to the specified URL with the provided body.
 * @param url - The URL to send the request to.
 * @param body - The body of the request.
 * @returns The response data or an error object.
 */
const put = async (url: string, body: {}) => {
    try {
        const requestOptions = {
            method: 'PUT',
            headers: await getHeaders(),
            body: JSON.stringify(body)
        }

        const response = await fetch(baseUrl + url, requestOptions);
        return await handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
};

/**
 * Sends a DELETE request to the specified URL.
 * @param url - The URL to send the request to.
 * @returns The response data or an error object.
 */
const del = async (url: string) => {
    try {
        const requestOptions = {
            method: 'DELETE',
            headers: await getHeaders()
        }

        const response = await fetch(baseUrl + url, requestOptions);
        return await handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
};

export const fetchWrapper = {
    get, post, put, del
}
