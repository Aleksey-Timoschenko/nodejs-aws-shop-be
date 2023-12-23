export enum httpStatusCode {
    'OK' = 200,
    "BAD_REQUEST" = 400,
    'NOT_FOUND' = 404,
    'SERVER_ERROR' = 500
}

export const importResponseMessages = {
    FILE_NAME_NOT_VALID: 'File name is not provided',
    FILE_EXTENSION_NOT_VALID: 'File is not in csv format',
}