import { APIGatewayEvent } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"

import { AvailableProduct } from '../../entities/product'
import { httpStatusCode } from '../../shared/constants/httpConstants';
import { getResponse } from '../../shared/utils/httpUtils';
import { scan } from '../../shared/utils/dbUtils';
import { ProductModel } from '../../models/product';
import { StockModel } from '../../models/stock';

// Create DynamoDB service object
const ddb = new DynamoDBClient({
    region: process?.env?.PRODUCT_AWS_REGION || 'eu-north-1',
});

export const handler = async (event: APIGatewayEvent) => {
    console.log('Incoming request event: ', event);
    
    try {
        const [products, stocks] = await Promise.all([
            scan<ProductModel>(ddb, { TableName: process.env.PRODUCTS_TABLE_NAME }),
            scan<StockModel>(ddb, { TableName: process.env.STOCKS_TABLE_NAME })
        ])

        const productsWithCount: AvailableProduct[] = products.map(
            product => ({ 
                ...product,
                count: stocks.find(({ product_id }) => product_id === product.id)?.count ?? 0 
            })
        )
        
        return getResponse<AvailableProduct[]>({ statusCode: httpStatusCode.OK, body: productsWithCount, headers: { "Content-Type": "application/json" } })
    } catch(error) {
        return getResponse({ statusCode: httpStatusCode.SERVER_ERROR, body: JSON.stringify({ error }) })
    }
}
