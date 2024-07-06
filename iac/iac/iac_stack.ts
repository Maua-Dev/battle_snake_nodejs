import {
  Stack,
  StackProps,
  aws_iam as iam,
  aws_cloudwatch as cloudwatch,
  aws_sns as sns,
  aws_cloudwatch_actions as actions,
  Duration,
  CfnOutput,
  SecretValue,
  RemovalPolicy
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { LambdaStack } from './lambda_stack';

export class IacStack extends Stack {
  constructor(scope: Construct, constructId: string, props?: StackProps) {
      super(scope, constructId, props);
      const githubRef = process.env.GITHUB_REF || '';

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
          'STAGE': stage
      };

      const lambdaStack = new LambdaStack(this, envs);

      // user IAM com senha
      const userName = `${stage}User`;
      const password = `${stage}UserPassword7@`;
      const user = new iam.User(this, userName, {
          userName: userName,
          password: SecretValue.unsafePlainText(password),
          passwordResetRequired: true
      });

      // políticas do IAM para ver os logs chefia
      user.addToPolicy(new iam.PolicyStatement({
          actions: ['lambda:*', 'logs:*'],
          resources: ['*']
      }));

      user.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('IAMUserChangePassword'));

      // Output do IAM chefe
      new CfnOutput(this, 'IAMUserOutput', {
          value: user.userName,
          exportName: `${stage}UserName`
      });

      new CfnOutput(this, 'IAMUserPasswordOutput', {
          value: password,
          exportName: `${stage}UserPassword`
      });

      // alarme aquiiii
      const alarm = new cloudwatch.Alarm(this, 'LambdaAlarm', {
          metric: lambdaStack.lambdaFunction.metricInvocations({ period: Duration.hours(6) }),
          threshold: 5000,
          evaluationPeriods: 1,
          comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD
      });

      const topic = new sns.Topic(this, 'AlarmTopic', {
          displayName: 'Alarm Notification Topic'
      });

      alarm.addAlarmAction(new actions.SnsAction(topic));

      // Adicionar auto destroy
      // this.applyRemovalPolicy(RemovalPolicy.DESTROY);
  }
}
