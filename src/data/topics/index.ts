import type { Topic } from '../../types/topic';
import { globalInfrastructureTopic } from './globalInfrastructure';
import { iamTopic } from './iam';
import { vpcTopic } from './vpc';
import { serverlessTopic } from './serverless';
import { computeTopic } from './compute';
import { s3Topic } from './s3';
import { databasesTopic } from './databases';
import { messagingTopic } from './messaging';
import { securityTopic } from './security';
import { networkingTopic } from './networking';
import { containersTopic } from './containers';
import { observabilityTopic } from './observability';
import { disasterRecoveryTopic } from './disasterRecovery';
import { wellArchitectedTopic } from './wellArchitected';
import { iacTopic } from './iac';
import { dnsCdnTopic } from './dnsCdn';
import { migrationTopic } from './migration';
import { analyticsTopic } from './analytics';
import { mlTopic } from './ml';
import { blockFileStorageTopic } from './blockFileStorage';
import { costOptimizationTopic } from './costOptimization';


export const allTopics: Topic[] = [
  globalInfrastructureTopic,
  iamTopic,
  vpcTopic,
  dnsCdnTopic,
  computeTopic,
  serverlessTopic,
  containersTopic,
  s3Topic,
  blockFileStorageTopic,
  databasesTopic,
  messagingTopic,
  observabilityTopic,
  securityTopic,
  iacTopic,
  networkingTopic,
  migrationTopic,
  analyticsTopic,
  mlTopic,
  wellArchitectedTopic,
  costOptimizationTopic,
  disasterRecoveryTopic,
];

export function getTopicBySlug(slug: string): Topic | undefined {
  return allTopics.find(t => t.slug === slug);
}

export function getTopicCount(): number {
  return allTopics.length;
}
