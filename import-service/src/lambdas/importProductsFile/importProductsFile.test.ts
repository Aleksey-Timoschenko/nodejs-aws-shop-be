import lambdaTester from 'lambda-tester'

import { httpStatusCode, importResponseMessages } from '../../../shared/constants/httpConstants'
import { HttpResponse } from '../../../shared/interfaces/httpInterfaces'
import * as s3Utils from '../../../shared/utils/s3Utils'
import { handler } from './importProductsFile.lambda'

describe('Tests for importProductsFile lambda', () => {
    let getSignedUrl: jest.SpyInstance;

    beforeEach(() => {
        getSignedUrl = jest.spyOn(s3Utils, "getSignedUrl");
    });

    afterEach(() => {
        getSignedUrl.mockClear();
    });

    afterAll(() => {
        getSignedUrl.mockRestore();
    });

    test('Get error response: File name is not provided', async () => {
        const eventMockData = {
            queryStringParameters: {  }
        }

        await lambdaTester<any>(handler).event(eventMockData).expectResult((result: HttpResponse) => {
            expect(result.statusCode).toBe(httpStatusCode.BAD_REQUEST)
            expect(result.body).toBe(JSON.stringify(importResponseMessages.FILE_NAME_NOT_VALID))
        })
    })

    test('Get success response: Get signed url', async () => {
        const signedUrl = 'test signed url'
        const eventMockData = {
            queryStringParameters: { name: 'test' }
        }

        getSignedUrl.mockReturnValueOnce(signedUrl);

        await lambdaTester<any>(handler).event(eventMockData).expectResult(async (result: HttpResponse) => {    
            expect(result.statusCode).toBe(httpStatusCode.OK)
            expect(signedUrl).toBe(signedUrl)
        })
    })
})