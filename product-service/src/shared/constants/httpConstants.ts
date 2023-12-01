export enum httpStatusCode {
    'OK' = 200,
    "BAD_REQUEST" = 400,
    'NOT_FOUND' = 404,
    'SERVER_ERROR' = 500
}

export const productResponseMessages = {
    ID_NOT_VALID: 'Product id is not valid',
    NOT_FOUND: 'Product not found',
    PRODUCT_DATA_NOT_VALID: 'Product data is not valid',
    PRODUCT_SUCCESSFULLY_CREATED: 'Product was successfully created',
    PRODUCT_NOT_CREATED: 'Product was not created, please try again',
}