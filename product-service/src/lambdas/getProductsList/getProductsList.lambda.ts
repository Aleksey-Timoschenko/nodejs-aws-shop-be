import { Product } from '../../entities/product'
import { productsMocks } from '../../shared/constants/productsConstants';
import { httpStatusCode } from '../../shared/constants/httpConstants';
import { getResponse } from '../../shared/utils/httpUtils';

export const handler = async () => {
    try {
        return getResponse<Product[]>({ statusCode: httpStatusCode.OK, body: productsMocks, headers: { "Content-Type": "application/json" } })
    } catch(error) {
        return getResponse({ statusCode: httpStatusCode.SERVER_ERROR, body: JSON.stringify({ error }) })
    }
}
