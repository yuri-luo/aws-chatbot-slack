import * as cdk from '@aws-cdk/core';
import * as sns from '@aws-cdk/aws-sns';
import * as chatBot from '@aws-cdk/aws-chatbot';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cloudWatch from '@aws-cdk/aws-cloudwatch';
import * as cloudWatchActions from '@aws-cdk/aws-cloudwatch-actions';
import * as iam from '@aws-cdk/aws-iam';

export class ChatbotSlackDemoStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create SNS
    const topic = new sns.Topic(this, 'alarmTopic', {
      displayName: 'alarm topic',
      topicName: 'alarm-topic'
    });

    // chatBot Role & Policy
    const chatBotRole = new iam.Role(this, 'chatBot-slack-role', {
      assumedBy: new iam.ServicePrincipal('chatbot.amazonaws.com'),
      description: "chatBot slack role",
      roleName: "chatBot-slack-role"
    });

    chatBotRole.addToPolicy(
      new iam.PolicyStatement({
        resources: ['*'],
        actions: [
          'cloudwatch:Describe*',
          'cloudwatch:Get*',
          'cloudwatch:List*'
        ]
      })
    );

    // create chatBot by slack
    new chatBot.SlackChannelConfiguration(this, 'MySlackChannel', {
      slackChannelConfigurationName: 'aws-chatBot-demo',
      role: chatBotRole,
      slackWorkspaceId: 'T0675A0CX',
      slackChannelId: 'C01UN886248',
      notificationTopics: [topic]
    });

    // create Lambda
    new lambda.Function(this, 'testLambda', {
      functionName: 'testLambda',
      code: lambda.AssetCode.fromAsset('lambda'),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_12_X
    });

    // create cloudwatch Metric by Lambda
    const metric = new cloudWatch.Metric({
      namespace: 'AWS/Lambda',
      metricName: 'Invocations',
      period: cdk.Duration.minutes(1),
    });

    // create cloudwatch Alarm event
    const alarm = new cloudWatch.Alarm(this, 'Alarm', {
      metric,
      alarmName: 'lambda invocations alarm',
      threshold: 1,
      evaluationPeriods: 1
    });

    // cloudwatch Alarm event bind SNS
    alarm.addAlarmAction(new cloudWatchActions.SnsAction(topic));
  }
}
