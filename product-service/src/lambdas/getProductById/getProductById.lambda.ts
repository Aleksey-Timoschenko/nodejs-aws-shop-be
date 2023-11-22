import { APIGatewayEvent } from 'aws-lambda';

import { Product } from '../../entities/product';
import { getResponse } from '../../shared/utils/httpUtils';
import { productsMocks } from '../../shared/constants/productsConstants';
import { httpStatusCode, productResponseMessages } from '../../shared/constants/httpConstants';

export const handler = async (event: APIGatewayEvent) => {
    try {
        const { id } = event.pathParameters;

        if (!id) {
            return getResponse({ statusCode: httpStatusCode.BAD_REQUEST, message: productResponseMessages.ID_NOT_VALID });
        }

        const product = productsMocks.find(({ id: productId }) => productId === id); 

        if (!product) {
            return getResponse({ statusCode: httpStatusCode.NOT_FOUND, message: productResponseMessages.NOT_FOUND });
        }

        return getResponse<Product>({ statusCode: httpStatusCode.OK, body: product, headers: { "Content-Type": "application/json" } });
    } catch(error) {
        return getResponse({ statusCode: httpStatusCode.SERVER_ERROR, body: JSON.stringify({ error }) });
    }
}