import { S3Event } from 'aws-lambda';

import * as s3Utils from '../../../shared/utils/s3Utils'
import { handler } from './importFileParser.lambda'

describe('Tests for importFileParser lambda', () => {
    let parseS3CSVObjectStream: jest.SpyInstance;
    let logSpy: jest.SpyInstance;

    beforeEach(() => {
        parseS3CSVObjectStream = jest.spyOn(s3Utils, "parseS3CSVObjectStream");
        logSpy = jest.spyOn(console, 'log');
    });

    afterEach(() => {
        parseS3CSVObjectStream.mockClear();
        logSpy.mockClear()
    });

    afterAll(() => {
        parseS3CSVObjectStream.mockRestore();
        logSpy.mockRestore();
    });

    test('Test executing of parseS3CSVObjectStream method', async () => {
        const eventMockData = {
            Records: [
                {
                    s3: {
                        bucket: {
                            name: 'name'
                        },
                        object: {
                            key: 'key'
                        }
                    }
                }
            ]
        } as S3Event

        parseS3CSVObjectStream.mockResolvedValueOnce(true)

        await handler(eventMockData)

        expect(parseS3CSVObjectStream).toHaveBeenCalledTimes(1)
        expect(logSpy).toHaveBeenLastCalledWith('FILE SUCCESSFULLY PARSED');
    })

    test('Test executing of parseS3CSVObjectStream method with error', async () => {
        const eventMockData = {
            Records: [
                {
                    s3: {
                        bucket: {
                            name: 'name'
                        },
                        object: {
                            key: 'key'
                        }
                    }
                }
            ]
        } as S3Event
        const mockError = 'Error'

        parseS3CSVObjectStream.mockRejectedValueOnce(mockError)

        await handler(eventMockData)

        expect(parseS3CSVObjectStream).toHaveBeenCalledTimes(1)
        expect(logSpy).toHaveBeenLastCalledWith('ERROR: ', mockError);
    })
})