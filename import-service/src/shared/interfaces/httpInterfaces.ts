export interface HttpResponse {
    statusCode: number;
    body?: string;
    headers?: Record<string, any>;
}