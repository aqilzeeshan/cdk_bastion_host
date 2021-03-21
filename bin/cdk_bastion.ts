#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkBastionStack } from '../lib/cdk_bastion-stack';

const app = new cdk.App();
new CdkBastionStack(app, 'CdkBastionStack');
