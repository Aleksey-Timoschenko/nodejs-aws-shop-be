import lambdaTester from 'lambda-tester'

import { HttpResponse } from '../../shared/interfaces/httpInterfaces'
import { httpStatusCode, productResponseMessages } from '../../shared/constants/httpConstants'
import * as dbUtils from '../../shared/utils/dbUtils'
import { ProductModel } from '../../models/product'
import { StockModel } from '../../models/stock'
import { AvailableProduct } from '../../entities/product'
import { handler } from './getProductById.lambda'

const productMocks: ProductModel = { id: '1', title: 'Product 1', description: 'Product 1 description', price: 10 }
const stockMocks: StockModel = { product_id: '1', count: 10 }
const availableProduct: AvailableProduct = { id: '1', title: 'Product 1', description: 'Product 1 description', price: 10, count: 10 }

describe('Tests for getProductById lambda function', () => {
    let getProductByIdSpy: jest.SpyInstance;

    beforeEach(() => {
        getProductByIdSpy = jest.spyOn(dbUtils, "query");
    });

    afterEach(() => {
        getProductByIdSpy.mockClear();
    });

    afterAll(() => {
        getProductByIdSpy.mockRestore();
    });

    test('Get success response', async () => {
        const productMockId = '1';
        const eventMockData = {
            pathParameters: { id: productMockId }
        }

        getProductByIdSpy.mockResolvedValueOnce(productMocks);
        getProductByIdSpy.mockResolvedValueOnce(stockMocks);

        await lambdaTester<any>(handler).event(eventMockData).expectResult((result: HttpResponse) => {
            expect(result.statusCode).toBe(httpStatusCode.OK)
            expect(result.body).toEqual(JSON.stringify(availableProduct))
        })
    })

    test('Get error response: path parameter is not provided', async () => {
        const eventMockData = {
            pathParameters: {  }
        }

        await lambdaTester<any>(handler).event(eventMockData).expectResult((result: HttpResponse) => {
            expect(result.statusCode).toBe(httpStatusCode.BAD_REQUEST)
            expect(result.body).toBe(JSON.stringify(productResponseMessages.ID_NOT_VALID))
        })
    })

    test('Get error response: product not found', async () => {
        const productMockId = '100';
        const eventMockData = {
            pathParameters: { id: productMockId }
        }

        getProductByIdSpy.mockResolvedValueOnce(null);
        getProductByIdSpy.mockResolvedValueOnce(null);

        await lambdaTester<any>(handler).event(eventMockData).expectResult((result: HttpResponse) => {
            expect(result.statusCode).toBe(httpStatusCode.NOT_FOUND)
            expect(result.body).toBe(JSON.stringify(productResponseMessages.NOT_FOUND))
        })
    })
})