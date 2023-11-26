import 'dotenv/config';
import { v4 as uuidv4 } from 'uuid';
// Load the AWS SDK for Node.js
import AWS from 'aws-sdk'

// Set Region
AWS.config.update({region: process.env.AWS_REGION});

// Create DynamoDB service object
const ddb = new AWS.DynamoDB({ apiVersion: 'latest' });

// Tables names
const PRODUCTS_TABLE_NAME = process.env.PRODUCTS_TABLE_NAME;
const STOCKS_TABLE_NAME = process.env.STOCKS_TABLE_NAME;

// Add new items
addNewItem(1)
addNewItem(2)
addNewItem(3)
addNewItem(4)
addNewItem(5)

function addNewItem(index: number) {
    const productId = uuidv4()
    const stockId = uuidv4()

    const productsTableItem1 = {
        TableName: PRODUCTS_TABLE_NAME,
        Item: {
            'id': { S: productId },
            'title': { S: `Product ${index}` },
            'description': { S: `Product description ${index}` },
            'price': { N: `${Math.floor(Math.random() * 100) + 1}` }
        }
    };

    const stocksTableItem1 = {
        TableName: STOCKS_TABLE_NAME,
        Item: {
          'product_id': { S: productId }, 'count': { N: `${index + 10}` }
        }
    };

    populate(productsTableItem1);
    populate(stocksTableItem1);
}

function populate(params: AWS.DynamoDB.PutItemInput) {
  ddb.putItem(params, function (err, data) {
    if (err) {
      console.log("Error: ", err);
    } else {
      console.log("Success: ", data);
    }
  });
}