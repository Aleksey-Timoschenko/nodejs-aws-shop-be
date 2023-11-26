import { APIGatewayEvent } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"

import { AvailableProduct } from '../../entities/product';
import { getResponse } from '../../shared/utils/httpUtils';
import { query } from '../../shared/utils/dbUtils';
import { httpStatusCode, productResponseMessages } from '../../shared/constants/httpConstants';
import { ProductModel } from '../../models/product';
import { StockModel } from '../../models/stock';

// Create DynamoDB service objects
const ddb = new DynamoDBClient({
    region: process?.env?.PRODUCT_AWS_REGION || 'eu-north-1',
});

export const handler = async (event: APIGatewayEvent) => {
    console.log('Incoming request event: ', event);

    try {
        const { id } = event.pathParameters;

        if (!id) {
            return getResponse({ statusCode: httpStatusCode.BAD_REQUEST, body: productResponseMessages.ID_NOT_VALID });
        }

        const product = await query<ProductModel>(ddb, { 
            TableName: process.env.PRODUCTS_TABLE_NAME,
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: { ':id': { S: id } }
        })

        if (!product) {
            return getResponse({ statusCode: httpStatusCode.NOT_FOUND, body: productResponseMessages.NOT_FOUND });
        }

        const stock = await query<StockModel>(ddb, { 
            TableName: process.env.STOCKS_TABLE_NAME,
            KeyConditionExpression: 'product_id = :productId',
            ExpressionAttributeValues: { ':productId': { S: id } }
        })

        const productWithCount: AvailableProduct = { ...product, count: stock.count || 0 } 

        return getResponse<AvailableProduct>({ statusCode: httpStatusCode.OK, body: productWithCount, headers: { "Content-Type": "application/json" } });
    } catch(error) {
        return getResponse({ statusCode: httpStatusCode.SERVER_ERROR, body: JSON.stringify({ error }) });
    }
}