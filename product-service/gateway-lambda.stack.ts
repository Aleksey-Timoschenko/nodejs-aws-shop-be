import * as cdk from "aws-cdk-lib";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { HttpApi, HttpMethod, CorsHttpMethod } from "@aws-cdk/aws-apigatewayv2-alpha";

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

  readonly getProductsListLambdaPath = './src/lambdas/getProductsList/getProductsList.lambda.ts'
  readonly getProductByIdLambdaPath = './src/lambdas/getProductById/getProductById.lambda.ts'

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.region = props?.env?.region ?? 'eu-north-1'    

    /** Creating getProductsList Lambda */
    let productsListLambda = this.getProductsListLambda();

    /** Creating getProductById Lambda */
    let productByIdLambda = this.getProductByIdLambda();
    
    /** Creating Lambda HTTP API, which integrates Endpoint to Lambda */
    let lambdaHttpApi = this.createHttpApi(productsListLambda, productByIdLambda);

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
        PRODUCT_AWS_REGION: this.region
      },
      logRetention: cdk.aws_logs.RetentionDays.ONE_DAY,
      // Default value
      memorySize: 128,
      // Default value
      timeout: cdk.Duration.seconds(3),
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
        PRODUCT_AWS_REGION: this.region
      },
      logRetention: cdk.aws_logs.RetentionDays.ONE_DAY,
      // Default value
      memorySize: 128,
      // Default value
      timeout: cdk.Duration.seconds(3),
    });
  }


  /**
   * Creating Lambda Http API
   *
   * @private
   * @param {cdk.aws_lambda.IFunction} getProductsList
   * @param {cdk.aws_lambda.IFunction} getProductById
   * @return {*}  {cdk.aws_apigateway.LambdaHttpApi}
   */
  private createHttpApi(
    getProductsListLambda: cdk.aws_lambda.IFunction,
    getProductByIdLambda: cdk.aws_lambda.IFunction,
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

    return httpApi
  }
}
