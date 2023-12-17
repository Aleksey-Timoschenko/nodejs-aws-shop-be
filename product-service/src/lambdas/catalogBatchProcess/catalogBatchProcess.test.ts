import { SQSEvent } from 'aws-lambda';

import * as lambda from './catalogBatchProcess.lambda'

describe('Tests for importFileParser lambda', () => {
    let processMessageAsyncSpy: jest.SpyInstance;
    let logSpy: jest.SpyInstance;

    beforeEach(() => {
        processMessageAsyncSpy = jest.spyOn(lambda, "processMessageAsync");
        logSpy = jest.spyOn(console, 'log');
    });

    afterEach(() => {
        processMessageAsyncSpy.mockClear();
        logSpy.mockClear()
    });

    afterAll(() => {
        processMessageAsyncSpy.mockRestore();
        logSpy.mockRestore();
    });

    test('Test executing of processMessageAsync method', async () => {
        const mockProduct = {
            title: 'Test',
            description: 'Test description',
            price: 100,
            count: 2
        }
        const eventMockData = {
            Records: [
                {
                    body: mockProduct
                }
            ]
        }

        processMessageAsyncSpy.mockResolvedValueOnce(true)

        await lambda.handler(eventMockData as unknown as SQSEvent)

        expect(processMessageAsyncSpy).toHaveBeenCalledTimes(1)
        expect(logSpy).toHaveBeenNthCalledWith(1, 'Incoming request event: ', eventMockData);
        expect(logSpy).toHaveBeenNthCalledWith(2, 'Records successfully created');
    })
})