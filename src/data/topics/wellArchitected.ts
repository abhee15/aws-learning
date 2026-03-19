import type { Topic } from '../../types/topic';

export const wellArchitectedTopic: Topic = {
  id: 'well-architected',
  slug: 'well-architected',
  title: 'AWS Well-Architected Framework',
  shortTitle: 'Well-Arch',
  icon: 'Layers',
  color: 'sky',
  examDomains: ['new-solutions', 'continuous-improvement'],
  estimatedStudyHours: 6,
  summaryBullets: [
    'Six pillars: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability',
    'Well-Architected Tool and formal review process',
    'Trusted Advisor vs Compute Optimizer vs Service Quotas — distinct tools, distinct scope',
    'Chaos engineering and GameDay for reliability validation',
    'AWS Architecture Center patterns and reference architectures',
  ],
  relatedTopics: ['cost-optimization', 'disaster-recovery', 'security'],
  subtopics: [
    {
      id: 'wa-pillars',
      title: 'The Six Pillars',
      sections: [
        {
          id: 'wa-op-excellence',
          title: 'Operational Excellence',
          content: '**Operational Excellence** focuses on running and monitoring systems to deliver business value and continually improving supporting processes and procedures. Key design principles: **perform operations as code** (runbooks and playbooks in SSM Automation), make frequent, small, reversible changes (deploy with feature flags and blue/green), **refine operations procedures frequently** (conduct GameDay exercises), anticipate failure, and learn from all operational failures.\n\nCore AWS services: CloudFormation (IaC), Systems Manager (Ops Center, Run Command, Patch Manager, Automation), CloudWatch (dashboards, anomaly detection, composite alarms), X-Ray (distributed tracing), EventBridge (operational event routing), Config (configuration change tracking).\n\nSA Pro focus: Design **event-driven remediation** — EventBridge detects Config non-compliance → SSM Automation remediates → SNS notifies. Prefer **automated runbooks** over manual intervention. CloudWatch Contributor Insights for analyzing high-cardinality data.',
          keyPoints: [
            { text: 'Operations as code: CloudFormation + SSM Automation + EventBridge + Config rules', examTip: true },
            { text: 'CloudWatch Synthetics (canaries) for proactive endpoint monitoring — catches issues before users do', examTip: true },
            { text: 'Systems Manager OpsCenter aggregates operational issues from multiple AWS services into a single view', examTip: true },
            { text: 'X-Ray service map shows downstream dependencies — critical for diagnosing distributed system issues', examTip: true },
          ],
        },
        {
          id: 'wa-security',
          title: 'Security Pillar',
          content: '**Security** focuses on protecting information, systems, and assets while delivering business value through risk assessment and mitigation strategies. Key design principles: implement a **strong identity foundation** (least privilege, MFA, no long-term credentials), enable **traceability** (audit all actions with CloudTrail + Config), apply **security at all layers** (VPC, SG, WAF, encryption), automate security best practices, **protect data in transit and at rest** (TLS everywhere, KMS encryption), keep people away from data (use role-based access, not shared credentials), and prepare for security events (incident response playbooks in SSM).\n\n**Defense in depth** layers: network layer (VPC, NACLs, Security Groups, Network Firewall), application layer (WAF, Shield), identity layer (IAM, Organizations SCPs), data layer (KMS, S3 encryption, Macie).\n\nSA Pro scenarios: design multi-account security governance (Security Hub + Organizations + Firewall Manager), incident response automation (GuardDuty finding → EventBridge → Lambda remediation).',
          keyPoints: [
            { text: 'Principle of least privilege: start with zero permissions and grant only what is needed, use IAM Access Analyzer to verify', examTip: true },
            { text: 'No long-term credentials: prefer IAM Roles, instance profiles, and STS AssumeRole over access keys', examTip: true },
            { text: 'IAM Access Analyzer identifies resources shared outside the account or Organization — catches unintended public access', examTip: true },
            { text: 'Security Hub provides a single aggregated security score across accounts using standards (CIS, PCI DSS, AWS FSBP)', examTip: true },
          ],
        },
        {
          id: 'wa-reliability',
          title: 'Reliability Pillar',
          content: '**Reliability** ensures a workload performs its intended function correctly and consistently. Key design principles: **automatically recover from failure** (CloudWatch alarms → Auto Scaling, RDS Multi-AZ failover), **test recovery procedures** (Fault Injection Simulator), **scale horizontally** (replace one large resource with multiple smaller), **stop guessing capacity** (Auto Scaling, serverless), **manage change in automation** (blue/green deployments, canary releases).\n\n**Resiliency patterns**: circuit breakers (prevent cascading failures), bulkheads (isolate failures to one component), retry with exponential backoff (SQS dead-letter queues), graceful degradation (serve stale content, degrade non-critical features).\n\n**Recovery metrics**: RTO (Recovery Time Objective — how long until back online) and RPO (Recovery Point Objective — how much data loss is acceptable). Design your architecture to meet business-defined RTO/RPO requirements.',
          keyPoints: [
            { text: 'Use multiple AZs for every critical component. Never design for single-AZ resilience if availability matters', examTip: true },
            { text: 'AWS Fault Injection Simulator (FIS) enables controlled chaos experiments — inject CPU stress, kill instances, block connectivity', examTip: true },
            { text: 'SQS dead-letter queues capture failed messages for analysis — always set up DLQ for Lambda SQS triggers in production', examTip: true },
            { text: 'Service quotas are often the hidden reliability risk — proactively request increases for EC2, Lambda concurrency, etc.', gotcha: true },
          ],
          useCases: [
            {
              scenario: 'A payments API experiences a cascading failure: a database slowdown causes Lambda functions to wait for responses, exhausting the Lambda concurrency limit (1000), which causes the API to reject all requests — including health check endpoints needed by the upstream load balancer.',
              wrongChoices: ['Increase Lambda concurrency limit — delays the problem but doesn\'t prevent cascading failures', 'Switch to a different database — the root cause is the architecture pattern, not the database'],
              correctChoice: 'Apply bulkhead pattern: set Reserved Concurrency on the database-dependent Lambda (e.g., 800) and a separate Reserved Concurrency for health check Lambdas (e.g., 50). Add circuit breaker logic to detect DB slowness and return cached/fallback responses',
              reasoning: 'Bulkheads isolate failure domains. Reserved Concurrency on the DB Lambda caps how many concurrent executions it can consume, protecting health check endpoints from being starved. A circuit breaker detects DB latency and fails fast (returns fallback) instead of waiting and consuming concurrency slots.',
            },
            {
              scenario: 'A company wants to verify their disaster recovery plan actually works before a real incident. Their documented RTO is 4 hours for a full region failure. The last DR test was 2 years ago and the team has changed significantly.',
              wrongChoices: ['Trust the DR documentation — if the runbook is detailed enough, it will work during an actual incident', 'Wait for a real incident to test the DR plan — the cost of a DR test is too high'],
              correctChoice: 'Run a GameDay using AWS Fault Injection Simulator (FIS): inject a simulated AZ failure in a staging environment, execute the documented recovery runbook with the current team, and measure actual RTO vs documented RTO',
              reasoning: 'The Reliability pillar requires testing recovery procedures regularly, not just documenting them. FIS enables controlled chaos experiments without impacting production. A GameDay reveals gaps: outdated runbooks, missing team knowledge, dependencies that weren\'t documented, and actual RTO vs assumed RTO. The only way to prove DR works is to test it.',
            },
          ],
        },
        {
          id: 'wa-performance',
          title: 'Performance Efficiency',
          content: '**Performance Efficiency** focuses on using computing resources efficiently to meet system requirements. Key design principles: **democratize advanced technologies** (use managed services instead of building), go **global in minutes** (CloudFront, Global Accelerator, multi-region), use **serverless architectures** (eliminate OS management), experiment more often, consider **mechanical sympathy** (understand how services work internally).\n\nKey services: CloudFront (caching, edge delivery), ElastiCache (in-memory caching), Auto Scaling (right-size dynamically), Lambda (no server management), Compute Optimizer (ML-based right-sizing recommendations for EC2, Lambda, ECS, EBS), AWS Graviton (better price-performance for non-x86 workloads), EC2 instance type selection (C5 for compute, R5 for memory, I3 for storage IOPS, P3 for ML/GPU).\n\n**Benchmarking**: use AWS Systems Manager Run Command to run performance tests across fleets. Use CloudWatch detailed monitoring and custom metrics to identify bottlenecks.',
          keyPoints: [
            { text: 'Compute Optimizer uses ML to analyze 14 days of CloudWatch metrics and provides right-sizing recommendations — free service', examTip: true },
            { text: 'AWS Graviton3 processors offer up to 40% better price-performance than x86 for compute workloads', examTip: true },
            { text: 'ElastiCache reduces database load — cache frequently read data, session state, and expensive query results', examTip: true },
            { text: 'CloudFront Cache-Control headers control TTL — always set appropriate headers at origin to maximize cache hit ratio', examTip: true },
          ],
        },
        {
          id: 'wa-cost',
          title: 'Cost Optimization Pillar',
          content: '**Cost Optimization** focuses on avoiding unnecessary costs. Key design principles: implement **cloud financial management** (FinOps practice, tagging strategy), adopt a **consumption model** (pay only for what you use — serverless, Auto Scaling), measure **overall efficiency** (output vs cost), **stop spending on undifferentiated heavy lifting** (managed services reduce operations cost), **analyze and attribute expenditure** (cost allocation tags, AWS Cost Explorer).\n\n**Pricing instruments**: On-Demand (no commitment), Reserved Instances/Savings Plans (1 or 3 year commitment, up to 72% discount), Spot Instances (up to 90% discount, interruptible), Dedicated (on-demand pricing, compliance). Compute Savings Plans apply across EC2, Lambda, Fargate. EC2 Instance Savings Plans apply to specific instance family/region.\n\nKey tools: Cost Explorer (historical trends, RI recommendations), Budgets (alerts when thresholds crossed), Cost and Usage Reports (detailed billing, Athena queryable), Compute Optimizer (right-sizing), Savings Plans recommendations.',
          keyPoints: [
            { text: 'Compute Savings Plans are more flexible than EC2 Instance Savings Plans — apply to EC2, Lambda, and Fargate', examTip: true },
            { text: 'S3 Intelligent-Tiering has no retrieval fee but has a per-object monitoring fee ($0.0025/1000 objects/month) — not worth it for small objects', gotcha: true },
            { text: 'Reserved Instances can be shared across accounts in an Organization via RI Sharing — enabled by default', examTip: true },
            { text: 'Cost allocation tags must be activated in the Billing console to appear in Cost Explorer reports', gotcha: true },
          ],
          useCases: [
            {
              scenario: 'A company\'s AWS bill is $850,000/month. The CFO demands a 30% cost reduction within 6 months. The CTO doesn\'t know where to start. What is the right sequence of cost optimization actions?',
              wrongChoices: ['Immediately purchase 3-year Reserved Instances for all EC2 instances — locks in potentially over-provisioned resources for 3 years', 'Shut down all non-production environments immediately — disrupts development without analysis'],
              correctChoice: 'Follow the FinOps sequence: (1) Enable Cost Explorer + cost allocation tags to identify top spenders. (2) Run Compute Optimizer to rightsize. (3) Purchase Savings Plans for rightsized baseline. (4) Migrate applicable workloads to Spot. (5) Implement S3 Intelligent-Tiering and delete unattached EBS volumes',
              reasoning: 'The Well-Architected Cost Optimization pillar requires understanding expenditure before committing. Buying RIs before rightsizing locks in waste. The correct sequence: visibility first (what am I spending?), optimize utilization second (eliminate waste), commit last (buy discounts for confirmed baseline). This approach typically achieves 30-50% savings.',
            },
          ],
        },
        {
          id: 'wa-sustainability',
          title: 'Sustainability Pillar',
          content: '**Sustainability** focuses on minimizing the environmental impact of running cloud workloads. Key design principles: understand your **environmental impact** (Customer Carbon Footprint Tool), establish sustainability goals, maximize utilization (right-sizing, Auto Scaling), anticipate and adopt **more efficient hardware and software** (Graviton, managed services), use **managed services** (provider optimizes utilization at scale), reduce the downstream impact.\n\nPractical actions: right-size infrastructure (idle resources waste energy), use Spot Instances (fill otherwise unused capacity), prefer serverless and containers (higher density), select efficient EC2 instance types (Graviton), optimize data transfer (CloudFront reduces data traversal).\n\nSA Pro exam: Sustainability is the newest pillar (2021). Questions may ask to identify the sustainable choice — typically: smallest/most efficient instance, serverless, or managed services over self-managed.',
          keyPoints: [
            { text: 'Sustainability pillar was added in December 2021 — expect 1-2 questions on the SA Pro exam', examTip: true },
            { text: 'AWS Graviton processors are more energy-efficient than x86 — preferred choice for sustainability questions', examTip: true },
            { text: 'Serverless (Lambda, Fargate) has higher utilization density than dedicated servers — better sustainability profile', examTip: true },
          ],
        },
      ],
    },
    {
      id: 'wa-tools',
      title: 'Well-Architected Tools & Reviews',
      sections: [
        {
          id: 'wa-review-process',
          title: 'Well-Architected Tool & Review Process',
          content: '**AWS Well-Architected Tool** (free in the console) guides you through a structured review of your workload against each pillar. It presents lens-specific questions, identifies high-risk issues (HRIs) and medium-risk issues (MRIs), and generates an improvement plan.\n\n**Review process**: Define workload scope → Answer pillar questions → Review findings (HRIs prioritized) → Create improvement plan → Track milestones → Re-review after improvements.\n\n**Custom Lenses**: Organizations can create custom lenses for industry-specific or internal requirements. Partner lenses available for SaaS, IoT, ML workloads.\n\n**When to review**: at design phase (pre-production), before major feature launches, annually for existing workloads, post-incident.',
          keyPoints: [
            { text: 'Well-Architected Tool is free — it generates a list of HRIs (High Risk Issues) that must be addressed', examTip: true },
            { text: 'Custom Lenses allow organizations to define their own Well-Architected review questions (JSON schema)', examTip: true },
          ],
        },
        {
          id: 'wa-trusted-advisor',
          title: 'Trusted Advisor vs Compute Optimizer vs Service Quotas',
          content: '**AWS Trusted Advisor** performs automated best-practice checks across 5 categories: **Cost Optimization** (idle/underutilized resources, RI recommendations), **Performance** (overutilized EC2, CloudFront optimization), **Security** (open S3 buckets, weak IAM passwords, MFA on root, security group exposure), **Fault Tolerance** (Multi-AZ, backup checks, Auto Scaling groups), **Service Limits** (approaching quota limits). Free tier: 6 core checks. Business/Enterprise support: full 500+ checks.\n\n**AWS Compute Optimizer**: ML-based right-sizing recommendations specifically for EC2, Lambda, ECS on Fargate, EBS volumes, and Auto Scaling groups. Analyzes CloudWatch metrics over 14 days. Identifies over-provisioned and under-provisioned resources. More granular than Trusted Advisor for right-sizing.\n\n**Service Quotas**: view all service quotas (formerly "limits"), request increases, set CloudWatch alarms when approaching limits. Previously managed through Support Cases.',
          keyPoints: [
            { text: 'Trusted Advisor = broad best-practice checks across all 5 categories. Compute Optimizer = deep ML right-sizing for specific services', examTip: true },
            { text: 'Full Trusted Advisor requires Business or Enterprise Support Plan — exam questions may ask which support tier enables specific checks', gotcha: true },
            { text: 'Service Quotas (not Trusted Advisor) is the correct tool to request limit increases and set quota alerts', examTip: true },
          ],
          comparisons: [
            {
              headers: ['Feature', 'Trusted Advisor', 'Compute Optimizer', 'Service Quotas'],
              rows: [
                ['Purpose', 'Broad best-practice checks', 'Right-sizing recommendations', 'View & manage service limits'],
                ['Scope', 'Cost, security, performance, FT, limits', 'EC2, Lambda, ECS, EBS, ASG', 'All service quotas'],
                ['Intelligence', 'Rule-based checks', 'ML on CloudWatch metrics', 'Usage-based alerts'],
                ['Cost', 'Free (limited) / Support Plan', 'Free', 'Free'],
                ['Limit increase', 'Alert only', 'None', 'Yes, request via console'],
              ],
            },
          ],
        },
        {
          id: 'wa-chaos',
          title: 'Chaos Engineering & Reliability Testing',
          content: '**Chaos Engineering** intentionally introduces failures to validate that systems recover gracefully. At SA Pro level, understand how to design **resilient systems that self-heal**.\n\n**AWS Fault Injection Simulator (FIS)**: a managed service for running controlled chaos experiments. FIS actions: EC2 terminate/stop/reboot, CPU/memory stress, network latency/packet loss (via SSM agent), ECS task stop, EKS pod failure, RDS failover, availability zone impairment. Uses **experiment templates** (YAML/JSON), target resources via tags, define safety guardrails (stop conditions using CloudWatch alarms).\n\n**GameDay**: structured simulation exercise where a team attempts to disrupt a system and another team responds. Documents procedures, identifies gaps in runbooks, validates RTO/RPO assumptions.\n\n**Canary deployments with CloudWatch Synthetics**: continuously run scripts (canaries) that simulate user actions to detect regressions before real users are impacted.',
          keyPoints: [
            { text: 'FIS experiments need Stop Conditions — CloudWatch alarms that automatically halt the experiment if things go too wrong', examTip: true },
            { text: 'FIS can simulate full AZ impairment — tests multi-AZ failover without taking down a real AZ', examTip: true },
            { text: 'GameDay validates operational readiness for disaster scenarios — required for enterprise reliability programs', examTip: true },
          ],
        },
      ],
    },
    {
      id: 'wa-cost-details',
      title: 'Cost Optimization Deep Dive',
      sections: [
        {
          id: 'wa-savings-plans',
          title: 'Savings Plans & Reserved Instances',
          content: '**Savings Plans** (preferred over Reserved Instances for flexibility):\n- **Compute Savings Plans**: applies to EC2, Lambda, Fargate across any region/family/OS — most flexible, up to 66% savings\n- **EC2 Instance Savings Plans**: applies to specific instance family in a specific region — up to 72% savings (less flexible)\n- **SageMaker Savings Plans**: for ML workloads\n\n**Reserved Instances** (EC2 only):\n- Standard RI: up to 72% savings, limited modification options\n- Convertible RI: up to 66% savings, can exchange for different instance type/OS/tenancy\n- Payment: All Upfront (max discount), Partial Upfront, No Upfront\n- Can be sold on **Reserved Instance Marketplace** (except Convertible RIs)\n- Shared across accounts via RI sharing in Organizations (enabled by default)\n\n**Spot Instances**: up to 90% savings, 2-minute interruption notice (check instance metadata), best for fault-tolerant/flexible workloads. Spot Fleet and EC2 Fleet for managing multiple Spot pools.',
          keyPoints: [
            { text: 'Compute Savings Plans > EC2 Instance Savings Plans in flexibility. Prefer Compute SP for most workloads unless committed to specific family', examTip: true },
            { text: 'Convertible RIs cannot be sold on the RI Marketplace — unlike Standard RIs', gotcha: true },
            { text: 'Spot interruption: instance gets 2-minute notice via instance metadata (http://169.254.169.254/latest/meta-data/spot/termination-time)', examTip: true },
          ],
          comparisons: [
            {
              headers: ['Type', 'Max Discount', 'Commitment', 'Flexibility', 'Applies To'],
              rows: [
                ['On-Demand', '0%', 'None', 'Maximum', 'Any workload'],
                ['Compute Savings Plan', '~66%', '1 or 3 year', 'High (any EC2/Lambda/Fargate)', 'Compute services'],
                ['EC2 Instance SP', '~72%', '1 or 3 year', 'Medium (family+region)', 'EC2 only'],
                ['Standard RI', '~72%', '1 or 3 year', 'Low (specific type)', 'EC2 only'],
                ['Convertible RI', '~66%', '1 or 3 year', 'Medium (exchangeable)', 'EC2 only'],
                ['Spot Instance', '~90%', 'None', 'Must handle interruption', 'Flexible workloads'],
              ],
            },
          ],
        },
        {
          id: 'wa-tagging',
          title: 'Cost Allocation Tags & FinOps',
          content: '**Cost Allocation Tags** enable attribute-based cost reporting. Two types: **AWS-generated tags** (aws:createdBy) and **user-defined tags**. Tags must be activated in the Billing console before they appear in Cost Explorer and CUR.\n\n**AWS Cost and Usage Report (CUR)**: most granular billing data, delivered to S3 in CSV or Parquet. Query with Athena. Integrates with QuickSight for BI dashboards. CUR is the data source for third-party FinOps tools.\n\n**Cost Explorer**: historical and forecast analysis, RI recommendations, Savings Plans recommendations, rightsizing recommendations (powered by Compute Optimizer). Supports filter by service, account, region, tag, instance type.\n\n**AWS Budgets**: set cost, usage, RI/SP coverage, or RI/SP utilization budgets. Alert via SNS/Chatbot when thresholds crossed. Budget Actions: automatically apply IAM policy or SCP to restrict spending when budget is exceeded.',
          keyPoints: [
            { text: 'Activate cost allocation tags in Billing console first — unapplied tags do not appear in Cost Explorer', gotcha: true },
            { text: 'AWS Budgets Actions can automatically apply SCPs to deny new resource creation when a budget threshold is breached', examTip: true },
            { text: 'CUR (Cost and Usage Report) + Athena is the standard approach for large-scale billing analysis and chargebacks', examTip: true },
          ],
        },
      ],
    },
  ],
};
