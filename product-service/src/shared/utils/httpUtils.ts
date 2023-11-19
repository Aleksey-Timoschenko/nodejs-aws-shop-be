import { HttpResponse } from '../interfaces/httpInterfaces'

interface ResponseProps<Body> {
    statusCode: number;
    body?: Body;
    message?: string
}

export const getResponse = <Body = any>({ statusCode, body, message }: ResponseProps<Body>): HttpResponse => {
    return {
        statusCode,
        body: JSON.stringify(body),
        message,
    }
}