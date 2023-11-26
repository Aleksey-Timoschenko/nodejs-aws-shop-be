import lambdaTester from 'lambda-tester'

import { HttpResponse } from '../../shared/interfaces/httpInterfaces'
import { httpStatusCode, productResponseMessages } from '../../shared/constants/httpConstants'
import { productsMocks } from '../../shared/constants/productsConstants'
import { handler } from './getProductById.lambda'

describe('Tests for getProductById lambda function', () => {
    test('Get success response', async () => {
        const productMockId = '1';
        const eventMockData = {
            pathParameters: { id: productMockId }
        }

        await lambdaTester<any>(handler).event(eventMockData).expectResult((result: HttpResponse) => {
            expect(result.statusCode).toBe(httpStatusCode.OK)
            expect(result.body).toEqual(JSON.stringify(productsMocks.find(({ id }) => id === productMockId)))
        })
    })

    test('Get error response: path parameter is not provided', async () => {
        const eventMockData = {
            pathParameters: {  }
        }

        await lambdaTester<any>(handler).event(eventMockData).expectResult((result: HttpResponse) => {
            expect(result.statusCode).toBe(httpStatusCode.BAD_REQUEST)
            expect(result.message).toBe(productResponseMessages.ID_NOT_VALID)
        })
    })

    test('Get error response: product not found', async () => {
        const productMockId = '100';
        const eventMockData = {
            pathParameters: { id: productMockId }
        }

        await lambdaTester<any>(handler).event(eventMockData).expectResult((result: HttpResponse) => {
            expect(result.statusCode).toBe(httpStatusCode.NOT_FOUND)
            expect(result.message).toBe(productResponseMessages.NOT_FOUND)
        })
    })
})