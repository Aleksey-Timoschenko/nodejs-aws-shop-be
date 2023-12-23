import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3notifications from "aws-cdk-lib/aws-s3-notifications";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { HttpLambdaAuthorizer, HttpLambdaResponseType } from '@aws-cdk/aws-apigatewayv2-authorizers-alpha';
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { HttpApi, HttpMethod, CorsHttpMethod } from "@aws-cdk/aws-apigatewayv2-alpha";
import { Duration } from 'aws-cdk-lib/core';

import { Construct } from "constructs";
import { PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";

/**
 * Stack, which creates LambdaHttpApi Gateway
 *
 * @export
 * @class GatewayLambda
 * @extends {cdk.Stack}
 */
export class GatewayLambda extends cdk.Stack {
  readonly region: string;
  readonly filesBucketName: string;
  readonly uploadedFilesFolderName: string;
  readonly parsedFilesFolderName: string;
  readonly catalogItemsQueueURL: string;
  readonly authorizerARN: string;

  readonly importProductsFileLambdaPath = './src/lambdas/importProductsFile/importProductsFile.lambda.ts'
  readonly importFileParserLambdaPath = './src/lambdas/importFileParser/importFileParser.lambda.ts'

  constructor(scope: Construct, id: string, options: any, props?: cdk.StackProps) {
    super(scope, id, props);

    this.region = props?.env?.region ?? 'eu-north-1'    
    this.filesBucketName = options?.filesBucketName ?? 'rs-site-aws-files-bucket'
    this.uploadedFilesFolderName = options?.uploadedFilesFolderName ?? 'uploaded'
    this.parsedFilesFolderName = options?.parsedFilesFolderName ?? 'parsed'
    this.authorizerARN = options.authorizerARN

    const filesBucket = this.getS3BucketForFiles()
    
    /** Get catalogItemsQueue */
    const catalogItemsQueue = this.getCatalogItemsQueue(options.catalogItemsQueueARN);
    this.catalogItemsQueueURL = catalogItemsQueue.queueUrl

    /** Creating importProductsFile Lambda */
    const importProductsFileLambda = this.getImportProductsFileLambda();

    /** Creating importFileParser Lambda */
    const importFileParserLambda = this.importFileParserLambda();

    /* Grant read/write access to bucket */
    filesBucket.grantReadWrite(importProductsFileLambda)
    filesBucket.grantReadWrite(importFileParserLambda)

    /* Grant delete access to bucket */
    filesBucket.grantDelete(importFileParserLambda)

    /* Grant send messages to catalogItemsQueue */
    catalogItemsQueue.grantSendMessages(importFileParserLambda)

    /* Add event notifications to lambda function */
    filesBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3notifications.LambdaDestination(importFileParserLambda),
      {
        prefix: `${this.uploadedFilesFolderName}/`
      }
    )
    
    /** Creating Lambda HTTP API, which integrates Endpoint to Lambda */
    const lambdaHttpApi = this.createHttpApi(importProductsFileLambda);

    // /** Returning Output with URL made as part of lambdaHttpApi */
    new cdk.CfnOutput(this, "apiUrl", { value: lambdaHttpApi.url ?? '' });
  }

  /**
   * Get s3 bucket for files
   *
   * @private
   * @return {*}  {cdk.aws_lambda.IFunction}
   */
  private getS3BucketForFiles(): cdk.aws_s3.IBucket {
    // Get already created S3 bucket
    // Or you can create your own bucket here
    return cdk.aws_s3.Bucket.fromBucketName(this, 'filesBucket', this.filesBucketName)
  }

  /**
   * Creating importProductsFile Lambda
   *
   * @private
   * @return {*}  {cdk.aws_lambda.IFunction}
   */
  private getImportProductsFileLambda(): cdk.aws_lambda.IFunction {
    return new cdk.aws_lambda_nodejs.NodejsFunction(this, "import-products-file-lambda", {
      runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
      bundling: {
        sourceMap: true,
        minify: true,
      },
      description: 'Get import products file Lambda',
      functionName: 'importProductsFile',
      entry: this.importProductsFileLambdaPath,
      environment: {
        NODE_OPTIONS: '--enable-source-maps',
        PRODUCT_AWS_REGION: this.region,
        BUCKET_NAME_FOR_FILES: this.filesBucketName,
        UPLOADED_FILES_FOLDER_NAME: this.uploadedFilesFolderName
      },
      logRetention: cdk.aws_logs.RetentionDays.ONE_DAY,
      // Default value
      memorySize: 128,
      timeout: cdk.Duration.seconds(5),
    });
  }


  /**
   * Creating importFileParser Lambda
   *
   * @private
   * @return {*}  {cdk.aws_lambda.IFunction}
   */
  private importFileParserLambda(): cdk.aws_lambda.IFunction {
    return new cdk.aws_lambda_nodejs.NodejsFunction(this, "import-file-parser-lambda", {
      runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
      bundling: {
        sourceMap: true,
        minify: true,
      },
      description: 'Import file parser Lambda',
      functionName: 'importFileParser',
      entry: this.importFileParserLambdaPath,
      environment: {
        NODE_OPTIONS: '--enable-source-maps',
        PRODUCT_AWS_REGION: this.region,
        BUCKET_NAME_FOR_FILES: this.filesBucketName,
        UPLOADED_FILES_FOLDER_NAME: this.uploadedFilesFolderName,
        PARSED_FILES_FOLDER_NAME: this.parsedFilesFolderName,
        CATALOG_ITEMS_QUEUE_URL: this.catalogItemsQueueURL,
      },
      logRetention: cdk.aws_logs.RetentionDays.ONE_DAY,
      // Default value
      memorySize: 128,
      timeout: cdk.Duration.seconds(5),
    });
  }

 /**
   * Creating importFileParser Lambda
   *
   * @private
   * @param {string} queueArn
   * @return {*}  {cdk.aws_lambda.IFunction}
   */
  private getCatalogItemsQueue(queueArn: string): sqs.IQueue {
    return sqs.Queue.fromQueueAttributes(this, 'catalog-items-queue-for-import', { 
      queueArn
    })
  }

  /**
   * Creating Lambda Http API
   *
   * @private
   * @param {cdk.aws_lambda.IFunction} importProductsFileLambda
   * @return {*}  {cdk.aws_apigateway.LambdaHttpApi}
   */
  private createHttpApi(
    importProductsFileLambda: cdk.aws_lambda.IFunction,
  ): HttpApi {
    // Create an API Gateway
    const httpApi = new HttpApi(this, "AWS-Shop-Import-Service-API", {
        apiName: "AWS Shop Import Service API",
        corsPreflight: {
          allowMethods: [
            CorsHttpMethod.ANY
          ],
          allowOrigins: ["*"],
          allowHeaders: ['*']
        },
    });

    const importProductsFileIntegration = new HttpLambdaIntegration(
      'ImportProductsFileIntegration',
      importProductsFileLambda
    );

    /* Create lambda authorizer */
    const authHandler = cdk.aws_lambda_nodejs.NodejsFunction.fromFunctionArn(this, 'import-file-authorization', this.authorizerARN)

    const authorizer = new HttpLambdaAuthorizer('import-api-authorizer', authHandler, {
      responseTypes: [HttpLambdaResponseType.SIMPLE], // Define if returns simple and/or iam response,
      resultsCacheTtl: Duration.seconds(0)
    });

    httpApi.addRoutes({
        path: '/import',
        methods: [ HttpMethod.GET ],
        integration: importProductsFileIntegration,
        authorizer
    })

    return httpApi
  }
}
