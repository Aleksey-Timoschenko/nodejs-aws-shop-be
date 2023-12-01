import { APIGatewayEvent } from 'aws-lambda'

import { httpStatusCode } from '../../shared/constants/httpConstants'
import * as dbUtils from '../../shared/utils/dbUtils'
import { ProductModel } from '../../models/product'
import { StockModel } from '../../models/stock'
import { AvailableProduct } from '../../entities/product'
import { handler } from './getProductsList.lambda'

const productsMocks: ProductModel[] = [
    { id: '1', title: 'Product 1', description: 'Product 1 description', price: 10 },
    { id: '2', title: 'Product 2', description: 'Product 2 description', price: 20 }
]
const stocksMocks: StockModel[] = [
    { product_id: '1', count: 10 },
    { product_id: '2', count: 20 },
]
const availableProducts: AvailableProduct[] = [
    { id: '1', title: 'Product 1', description: 'Product 1 description', price: 10, count: 10 },
    { id: '2', title: 'Product 2', description: 'Product 2 description', price: 20, count: 20 }
] 

describe('Tests for getProductsList lambda function', () => {
    let getProductsListSpy: jest.SpyInstance;

    beforeEach(() => {
        getProductsListSpy = jest.spyOn(dbUtils, "scan");
    });

    afterEach(() => {
        getProductsListSpy.mockClear();
    });

    afterAll(() => {
        getProductsListSpy.mockRestore();
    });

    test('Get success response', async () => {
        getProductsListSpy.mockResolvedValueOnce(productsMocks);
        getProductsListSpy.mockResolvedValueOnce(stocksMocks);

        const response = await handler({ } as APIGatewayEvent)

        expect(response.statusCode).toBe(httpStatusCode.OK)
        expect(response.body).toEqual(JSON.stringify(availableProducts))
    })
})