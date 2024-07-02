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
    new LambdaStack(this);
  }
}