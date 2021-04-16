#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ChatbotSlackDemoStack } from '../lib/chatbot-slack-demo-stack';

const app = new cdk.App();
new ChatbotSlackDemoStack(app, 'ChatbotSlackDemoStack');
