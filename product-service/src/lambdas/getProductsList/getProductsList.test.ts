import { httpStatusCode } from '../../shared/constants/httpConstants'
import { productsMocks } from '../../shared/constants/productsConstants'
import { handler } from './getProductsList.lambda'

describe('Tests for getProductsList lambda function', () => {
    test('Get success response', async () => {
        const response = await handler()

        expect(response.statusCode).toBe(httpStatusCode.OK)
        expect(response.body).toEqual(JSON.stringify(productsMocks))
    })
})