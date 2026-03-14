import type { Topic } from '../../types/topic';
import { globalInfrastructureTopic } from './globalInfrastructure';
import { iamTopic } from './iam';
import { vpcTopic } from './vpc';
import { wellArchitectedTopic } from './wellArchitected';

// Placeholder for topics not yet fully authored
const placeholderTopic = (id: string, slug: string, title: string, shortTitle: string, icon: string, color: string, hours = 5): Topic => ({
  id,
  slug,
  title,
  shortTitle,
  icon,
  color,
  examDomains: ['new-solutions'],
  estimatedStudyHours: hours,
  summaryBullets: [
    `Comprehensive coverage of ${title} for SA Professional exam`,
    'Key architecture patterns and service comparisons',
    'Exam-focused tips and common gotchas',
    'Service limits, quotas, and best practices',
    'Scenario-based decision frameworks',
  ],
  relatedTopics: [],
  subtopics: [
    {
      id: `${id}-overview`,
      title: 'Overview & Key Concepts',
      sections: [
        {
          id: `${id}-intro`,
          title: `${title} — SA Pro Overview`,
          content: `This section covers **${title}** at the depth required for the AWS Solutions Architect Professional exam. Content includes architecture patterns, service comparisons, limits, and exam-specific scenarios.\n\nFocus areas: service selection tradeoffs, integration patterns, security configurations, cost optimization strategies, and failure mode analysis.`,
          keyPoints: [
            { text: 'Understand core service capabilities and hard limits', examTip: true },
            { text: 'Know when to choose this service vs alternatives (comparison tables)', examTip: true },
            { text: 'Understand failure modes and HA configurations', examTip: true },
            { text: 'Know pricing model and cost optimization strategies', examTip: true },
          ],
        },
      ],
    },
  ],
});

export const allTopics: Topic[] = [
  globalInfrastructureTopic,
  iamTopic,
  vpcTopic,
  placeholderTopic('dns-cdn', 'dns-cdn', 'Route 53, CloudFront & Global Accelerator', 'DNS & CDN', 'Globe', 'cyan', 6),
  placeholderTopic('compute', 'compute', 'EC2, Auto Scaling & Load Balancing', 'Compute', 'Cpu', 'orange', 8),
  placeholderTopic('serverless', 'serverless', 'Serverless: Lambda, API Gateway & Step Functions', 'Serverless', 'Zap', 'yellow', 7),
  placeholderTopic('containers', 'containers', 'Containers: ECS, EKS & Fargate', 'Containers', 'Box', 'blue', 6),
  placeholderTopic('s3', 's3', 'Amazon S3 & Object Storage', 'S3', 'Cloud', 'green', 5),
  placeholderTopic('block-file-storage', 'block-file-storage', 'Block & File Storage: EBS, EFS & FSx', 'Block/File', 'HardDrive', 'gray', 5),
  placeholderTopic('databases', 'databases', 'Databases: RDS, Aurora, DynamoDB & More', 'Databases', 'Database', 'indigo', 8),
  placeholderTopic('messaging', 'messaging', 'Messaging: SQS, SNS, EventBridge & Kinesis', 'Messaging', 'MessageSquare', 'pink', 5),
  placeholderTopic('observability', 'observability', 'Observability: CloudWatch, CloudTrail & Config', 'Observability', 'Eye', 'teal', 5),
  placeholderTopic('security', 'security', 'Security: KMS, WAF, Shield & GuardDuty', 'Security', 'Lock', 'red', 7),
  placeholderTopic('iac', 'iac', 'Infrastructure as Code: CloudFormation & CDK', 'IaC', 'GitBranch', 'violet', 4),
  placeholderTopic('networking', 'networking', 'Hybrid Networking: Direct Connect & VPN', 'Hybrid Net', 'Server', 'slate', 6),
  placeholderTopic('migration', 'migration', 'Migration Strategies & Tools', 'Migration', 'Truck', 'amber', 5),
  placeholderTopic('analytics', 'analytics', 'Analytics: Athena, Glue, EMR & Kinesis', 'Analytics', 'BarChart3', 'emerald', 5),
  placeholderTopic('ml', 'ml', 'Machine Learning: SageMaker & AI Services', 'ML/AI', 'Brain', 'fuchsia', 4),
  wellArchitectedTopic,
  placeholderTopic('cost-optimization', 'cost-optimization', 'Cost Optimization Strategies', 'Cost Opt', 'DollarSign', 'lime', 4),
  placeholderTopic('disaster-recovery', 'disaster-recovery', 'Disaster Recovery Patterns', 'DR', 'RefreshCw', 'rose', 5),
];

export function getTopicBySlug(slug: string): Topic | undefined {
  return allTopics.find(t => t.slug === slug);
}

export function getTopicCount(): number {
  return allTopics.length;
}
