import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
// import * as s3 from "aws-cdk-lib/aws-s3";
// import * as s3notifications from "aws-cdk-lib/aws-s3-notifications";
// import * as sqs from "aws-cdk-lib/aws-sqs";
// import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
// import { HttpApi, HttpMethod, CorsHttpMethod } from "@aws-cdk/aws-apigatewayv2-alpha";

import dotenv from 'dotenv'

export class AuthorizationServiceStack extends cdk.Stack {
    readonly basicAuthorizationLambdaPath = './src/lambdas/basicAuthorizer/basicAuthorizer.lambda.ts'

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        /* Create basicAuthorization Lambda */
        const basicAuthorizationLambda = this.getBasicAuthorizationLambda()

        new cdk.aws_lambda.CfnPermission(this, 'basic-authorizer-permission', {
          action: 'lambda:InvokeFunction',
          functionName: basicAuthorizationLambda.functionName,
          principal: 'apigateway.amazonaws.com',
          sourceAccount: this.account,
        });
    }

    /**
   * Creating basicAuthorization Lambda
   *
   * @private
   * @return {*}  {cdk.aws_lambda.IFunction}
   */
  private getBasicAuthorizationLambda(): cdk.aws_lambda.IFunction {
    const authEnvironmentsVariables = dotenv.config({ path: './.env-auth' })  

    return new cdk.aws_lambda_nodejs.NodejsFunction(this, "basic-authorization-lambda", {
      runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
      bundling: {
        sourceMap: true,
        minify: true,
      },
      description: 'Get basic authorization Lambda',
      functionName: 'basicAuthorization',
      entry: this.basicAuthorizationLambdaPath,
      environment: {
        NODE_OPTIONS: '--enable-source-maps',
        ...authEnvironmentsVariables?.parsed
      },
      logRetention: cdk.aws_logs.RetentionDays.ONE_DAY,
      // Default value
      memorySize: 128,
      timeout: cdk.Duration.seconds(5),
    });
  }
}