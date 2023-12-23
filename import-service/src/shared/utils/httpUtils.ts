import { HttpResponse } from '../interfaces/httpInterfaces'

interface ResponseProps<Body> {
    statusCode: number;
    body?: Body;
    headers?: Record<string, any>
}

export const getResponse = <Body = any>({ statusCode, body, headers }: ResponseProps<Body>): HttpResponse => {
    return {
        statusCode,
        body: JSON.stringify(body),
        headers
    }
}