import {
    Stack,
    StackProps,
    aws_iam as iam,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { LambdaStack } from './lambda_stack';

export class IacStack extends Stack {
  constructor(scope: Construct, constructId: string, props?: StackProps) {
    super(scope, constructId, props);
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

    const envs = {
      "STAGE": stage
    }


    new LambdaStack(this, envs);
  }
}