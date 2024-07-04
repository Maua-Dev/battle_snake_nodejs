/* eslint-disable @typescript-eslint/no-explicit-any */
import {Construct} from 'constructs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import {CfnOutput, Duration} from 'aws-cdk-lib'
import * as path from 'path'
import { envs } from '../envs'

export class LambdaStack extends Construct {
  lambdaLayer: lambda.LayerVersion
  libLayer: lambda.LayerVersion

  createLambdaSimpleAPI(environmentVariables: Record<string, any>) {
    const githubRef = process.env.GITHUB_REF || ''

    let stage;
    if (githubRef.includes('prod')) {
        stage = 'PROD';
    } else if (githubRef.includes('homolog')) {
        stage = 'HOMOLOG';
    } else if (githubRef.includes('dev')) {
        stage = 'DEV';
    } else {
        stage = 'TEST';
    }

    const lambdaFunction = new lambda.Function(this, `${envs.STACK_NAME}-${stage}`, {
      functionName: `${envs.PROJECT_NAME}-${stage}`,
      code: lambda.Code.fromAsset(path.join(__dirname, `../../dist/`)),
      handler: `index.handler`,
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: environmentVariables,
      timeout: Duration.seconds(30),
      memorySize: 512
    })
    
    return lambdaFunction
  }

  constructor(scope: Construct, environmentVariables: Record<string, any>) {
    super(scope, `${envs.STACK_NAME}`)

    const projectName = envs.PROJECT_NAME
    
    const lambdaFunc = this.createLambdaSimpleAPI(environmentVariables)
    const lambdaUrl = lambdaFunc.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE
    })

    new CfnOutput(this, `${envs.STACK_NAME}UrlValue`, {
      value: lambdaUrl.url,
      exportName: projectName + 'UrlValue'
    })
      
  }
}