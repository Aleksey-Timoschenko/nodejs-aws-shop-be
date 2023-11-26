import { unmarshall } from "@aws-sdk/util-dynamodb";
import { 
    DynamoDBClient,
    ScanCommand, 
    ScanCommandInput, 
    QueryCommandInput, 
    TransactWriteItemsCommand, 
    QueryCommand, 
    TransactWriteItemsCommandInput, 
    TransactWriteItemsCommandOutput
} from "@aws-sdk/client-dynamodb"

export const scan = async <Model>(ddb: DynamoDBClient, scanParams: ScanCommandInput): Promise<Model[]> => {
    let params: ScanCommandInput = { ...scanParams };

    let scanResults: Model[] = [];
    let items;

    // We do a loop here, because scan only scans up to 1MB of data
    do {
        items = await ddb.send(new ScanCommand({ ...scanParams }));

        if (!items.Items) {
            break;
        }

        items.Items.forEach((item) => scanResults.push(unmarshall(item) as Model));
        params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey != "undefined");

    return scanResults
}

export const query = async <Model>(ddb: DynamoDBClient, queryParams: QueryCommandInput): Promise<Model | null> => {
    const result = await ddb.send(new QueryCommand({ ...queryParams }))

    return result.Items?.[0] ? unmarshall(result.Items[0]) as Model : null
}

export const transactWriteItems = async (ddb: DynamoDBClient, transactParams: TransactWriteItemsCommandInput): Promise<TransactWriteItemsCommandOutput | null> => {
    try {
        const result = await ddb.send(new TransactWriteItemsCommand({ ...transactParams }));

        return result
    } catch(error) {
        return null
    }
}