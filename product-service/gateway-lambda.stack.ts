import * as cdk from "aws-cdk-lib";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { HttpApi, HttpMethod, CorsHttpMethod } from "@aws-cdk/aws-apigatewayv2-alpha";
import { TableV2 } from "aws-cdk-lib/aws-dynamodb";

import { Construct } from "constructs";

/**
 * Stack, which creates LambdaHttpApi Gateway
 *
 * @export
 * @class GatewayLambda
 * @extends {cdk.Stack}
 */
export class GatewayLambda extends cdk.Stack {
  readonly region: string;
  readonly productsTableName: string;
  readonly stocksTableName: string;

  readonly getProductsListLambdaPath = './src/lambdas/getProductsList/getProductsList.lambda.ts'
  readonly getProductByIdLambdaPath = './src/lambdas/getProductById/getProductById.lambda.ts'
  readonly createProductLambdaPath = './src/lambdas/createProduct/createProduct.lambda.ts'

  constructor(scope: Construct, id: string, options: any, props?: cdk.StackProps) {
    super(scope, id, props);

    this.region = props?.env?.region ?? 'eu-north-1'    
    this.productsTableName = options.productsTableName
    this.stocksTableName = options.stocksTableName  

    /** Creating getProductsList Lambda */
    let productsListLambda = this.getProductsListLambda();

    /** Creating getProductById Lambda */
    let productByIdLambda = this.getProductByIdLambda();

     /** Creating createProduct Lambda */
     let createProductLambda = this.createProductLambda();

    const productsTable = TableV2.fromTableName(this, 'productsTable', options.productsTableName)
    const stocksTable = TableV2.fromTableName(this, 'stocksTable', options.stocksTableName)

    /* Grant read access */
    productsTable.grantReadData(productsListLambda);
    stocksTable.grantReadData(productsListLambda);

    productsTable.grantReadData(productByIdLambda);
    stocksTable.grantReadData(productByIdLambda);

    /* Grant write access */
    productsTable.grantWriteData(createProductLambda);
    stocksTable.grantWriteData(createProductLambda);
    
    /** Creating Lambda HTTP API, which integrates Endpoint to Lambda */
    let lambdaHttpApi = this.createHttpApi(productsListLambda, productByIdLambda, createProductLambda);

    /** Returning Output with URL made as part of lambdaHttpApi */
    new cdk.CfnOutput(this, "apiUrl", { value: lambdaHttpApi.url ?? '' });
  }


  /**
   * Creating getProductsList Lambda
   *
   * @private
   * @return {*}  {cdk.aws_lambda.IFunction}
   */
  private getProductsListLambda(): cdk.aws_lambda.IFunction {
    return new cdk.aws_lambda_nodejs.NodejsFunction(this, "get-products-list-lambda", {
      runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
      bundling: {
        sourceMap: true,
        minify: true,
      },
      description: 'Get products list Lambda',
      functionName: 'getProductsList',
      entry: this.getProductsListLambdaPath,
      environment: {
        NODE_OPTIONS: '--enable-source-maps',
        PRODUCT_AWS_REGION: this.region,
        PRODUCTS_TABLE_NAME: this.productsTableName,
        STOCKS_TABLE_NAME: this.stocksTableName,
      },
      logRetention: cdk.aws_logs.RetentionDays.ONE_DAY,
      // Default value
      memorySize: 128,
      timeout: cdk.Duration.seconds(5),
    });
  }


  /**
   * Creating getProductById Lambda
   *
   * @private
   * @return {*}  {cdk.aws_lambda.IFunction}
   */
  private getProductByIdLambda(): cdk.aws_lambda.IFunction {
    return new cdk.aws_lambda_nodejs.NodejsFunction(this, "get-product-by-id-lambda", {
      runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
      bundling: {
        sourceMap: true,
        minify: true,
      },
      description: 'Get product by id Lambda',
      functionName: 'getProductById',
      entry: this.getProductByIdLambdaPath,
      environment: {
        NODE_OPTIONS: '--enable-source-maps',
        PRODUCT_AWS_REGION: this.region,
        PRODUCTS_TABLE_NAME: this.productsTableName,
        STOCKS_TABLE_NAME: this.stocksTableName,
      },
      logRetention: cdk.aws_logs.RetentionDays.ONE_DAY,
      // Default value
      memorySize: 128,
      timeout: cdk.Duration.seconds(5),
    });
  }

  /**
   * Creating createProduct Lambda
   *
   * @private
   * @return {*}  {cdk.aws_lambda.IFunction}
   */
  private createProductLambda(): cdk.aws_lambda.IFunction {
    return new cdk.aws_lambda_nodejs.NodejsFunction(this, "create-product-lambda", {
      runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
      bundling: {
        sourceMap: true,
        minify: true,
      },
      description: 'Create product Lambda',
      functionName: 'createProduct',
      entry: this.createProductLambdaPath,
      environment: {
        NODE_OPTIONS: '--enable-source-maps',
        PRODUCT_AWS_REGION: this.region,
        PRODUCTS_TABLE_NAME: this.productsTableName,
        STOCKS_TABLE_NAME: this.stocksTableName,
      },
      logRetention: cdk.aws_logs.RetentionDays.ONE_DAY,
      // Default value
      memorySize: 128,
      timeout: cdk.Duration.seconds(5),
    });
  }

  /**
   * Creating Lambda Http API
   *
   * @private
   * @param {cdk.aws_lambda.IFunction} getProductsList
   * @param {cdk.aws_lambda.IFunction} getProductById
   * @param {cdk.aws_lambda.IFunction} createProduct
   * @return {*}  {cdk.aws_apigateway.LambdaHttpApi}
   */
  private createHttpApi(
    getProductsListLambda: cdk.aws_lambda.IFunction,
    getProductByIdLambda: cdk.aws_lambda.IFunction,
    createProductLambda: cdk.aws_lambda.IFunction,
  ): HttpApi {
    // Create an API Gateway
    const httpApi = new HttpApi(this, "AWS-Shop-API", {
        apiName: "AWS Shop API",
        corsPreflight: {
          allowMethods: [
            CorsHttpMethod.ANY
          ],
          allowOrigins: ["*"],
          allowHeaders: ['*']
        },
    });

    const getProductsListIntegration = new HttpLambdaIntegration('GetProductsListIntegration', getProductsListLambda);
    const getProductByIdIntegration = new HttpLambdaIntegration('GetProductByIdIntegration', getProductByIdLambda);
    const createProductIntegration = new HttpLambdaIntegration('CreateProductIntegration', createProductLambda);

    httpApi.addRoutes({
        path: '/products',
        methods: [ HttpMethod.GET ],
        integration: getProductsListIntegration,
    })

    httpApi.addRoutes({
        path: '/products/{id}',
        methods: [ HttpMethod.GET ],
        integration: getProductByIdIntegration,
    })

    httpApi.addRoutes({
      path: '/products',
      methods: [ HttpMethod.POST ],
      integration: createProductIntegration,
  })

    return httpApi
  }
}
