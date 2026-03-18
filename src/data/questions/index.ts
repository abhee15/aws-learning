import type { Question } from '../../types/question';

export type { Question };

// Import all topic-specific question files
import { iamQuestions } from './iam';
import { networkingQuestions } from './networking';
import { vpcQuestions } from './vpc';
import { computeQuestions } from './compute';
import { s3Questions } from './s3';
import { databasesQuestions } from './databases';
import { serverlessQuestions } from './serverless';
import { securityQuestions } from './security';
import { containersQuestions } from './containers';
import { messagingQuestions } from './messaging';
import { observabilityQuestions } from './observability';
import { disasterRecoveryQuestions } from './disasterRecovery';
import { iacQuestions } from './iac';
import { dnsCdnQuestions } from './dnsCdn';
import { migrationQuestions } from './migration';
import { analyticsQuestions } from './analytics';
import { mlQuestions } from './ml';
import { costOptimizationQuestions } from './costOptimization';
import { blockFileStorageQuestions } from './blockFileStorage';
import { wellArchitectedQuestions } from './wellArchitected';
import { globalInfrastructureQuestions } from './globalInfrastructure';

export const allQuestions: Question[] = [
  ...iamQuestions,
  ...networkingQuestions,
  ...vpcQuestions,
  ...computeQuestions,
  ...s3Questions,
  ...databasesQuestions,
  ...serverlessQuestions,
  ...securityQuestions,
  ...containersQuestions,
  ...messagingQuestions,
  ...observabilityQuestions,
  ...disasterRecoveryQuestions,
  ...iacQuestions,
  ...dnsCdnQuestions,
  ...migrationQuestions,
  ...analyticsQuestions,
  ...mlQuestions,
  ...costOptimizationQuestions,
  ...blockFileStorageQuestions,
  ...wellArchitectedQuestions,
  ...globalInfrastructureQuestions,
];
