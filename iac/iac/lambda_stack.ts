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
    const lambdaFunction = new lambda.Function(this, 'BattleSnake', {
      functionName: `${envs.PROJECT_NAME}`,
      code: lambda.Code.fromAsset(path.join(__dirname, `../../dist/src/`)),
      handler: `app.index.handler`,
      runtime: lambda.Runtime.NODEJS_20_X,
      layers: [this.libLayer],
      environment: environmentVariables,
      timeout: Duration.seconds(30),
      memorySize: 512
    })
    
    return lambdaFunction
  }

  constructor(scope: Construct, environmentVariables: Record<string, any>) {
    super(scope, 'DailyTasksMssLambdaStack')

    const projectName = envs.PROJECT_NAME

    this.libLayer = new lambda.LayerVersion(this, `${projectName}-express-layer-2024`, {
      code: lambda.Code.fromAsset(path.join(__dirname, '../node_modules')),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
    })
    
    const lambdaFunc = this.createLambdaSimpleAPI(environmentVariables)
    const lambdaUrl = lambdaFunc.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE
    })

    new CfnOutput(this, projectName + "Url", {
      value: lambdaUrl.url,
      exportName: projectName + 'UrlValue'
    })
      
  }
}