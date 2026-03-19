import type { Question } from './index';

export const wellArchitectedQuestions: Question[] = [
  {
    id: 'wa-001',
    stem: 'A company is reviewing their architecture using the AWS Well-Architected Framework. They have a web application running on EC2 instances behind an ALB in a single availability zone. The architecture review identifies this as a reliability concern. What is the minimum change to address the reliability pillar finding?',
    type: 'single',
    difficulty: 1,
    topicSlug: 'well-architected',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Deploy EC2 instances across at least two AZs in an Auto Scaling group and configure ALB to distribute traffic across both AZs', correct: true, explanation: 'The Well-Architected Reliability pillar requires eliminating single points of failure. Deploying across multiple AZs with Auto Scaling ensures the application survives an AZ failure. ALB automatically routes to healthy instances in available AZs.' },
      { id: 'b', text: 'Increase the EC2 instance size to handle more traffic and reduce failure probability', correct: false, explanation: 'Scaling up (vertical scaling) increases capacity but does not eliminate the single AZ SPOF. A larger instance in a single AZ is still vulnerable to AZ-level failures. Multi-AZ deployment is required for reliability.' },
      { id: 'c', text: 'Enable CloudWatch detailed monitoring to detect and respond to failures faster', correct: false, explanation: 'Monitoring improves MTTR (Mean Time To Recovery) but does not prevent the single AZ failure or reduce the blast radius. The Well-Architected finding requires architectural change, not improved monitoring alone.' },
      { id: 'd', text: 'Add an RDS read replica in the same AZ for database high availability', correct: false, explanation: 'The finding is about the EC2 tier being in a single AZ. Adding a read replica in the same AZ does not address the EC2 single AZ issue. Multi-AZ RDS would address database HA, but the primary issue is the application tier.' }
    ],
    explanation: {
      overall: 'The AWS Well-Architected Framework Reliability pillar requires: REL 6 — Deploy the workload to multiple locations. Minimum viable multi-AZ: EC2 in Auto Scaling group spanning 2+ AZs + ALB routing across AZs. When one AZ fails, Auto Scaling launches replacement instances in remaining AZs, and ALB only routes to healthy instances. This pattern provides ~99.99% availability vs ~99.9% for single-AZ deployments.',
      examTip: 'Well-Architected Reliability pillar pillars: Foundations (service limits), Workload Architecture (multi-AZ, loose coupling), Change Management (Auto Scaling, CloudWatch), Failure Management (backup, DR). Key design principle: "Test recovery procedures" — chaos engineering, game days. Single AZ = single point of failure. Always spread across 2 minimum, 3 recommended AZs. Multi-AZ also protects against: EC2 hardware failures, network disruptions, power failures within an AZ.'
    },
    tags: ['well-architected', 'reliability', 'multi-az', 'auto-scaling', 'spof']
  },
  {
    id: 'wa-002',
    stem: 'A company conducts an AWS Well-Architected Review and receives a High Risk finding: "The workload has no mechanism to recover from data corruption or accidental deletion." The application uses RDS MySQL and S3. What remediation addresses both data stores?',
    type: 'multiple',
    difficulty: 2,
    topicSlug: 'well-architected',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Enable RDS automated backups with a 30-day retention period and test PITR recovery procedures quarterly', correct: true, explanation: 'RDS automated backups enable Point-In-Time Recovery (PITR) to any second within the retention window, allowing recovery from data corruption at a specific point before it occurred. Regular testing validates the recovery procedure.' },
      { id: 'b', text: 'Enable S3 Versioning on all buckets to preserve, retrieve, and restore previous object versions after accidental deletion or corruption', correct: true, explanation: 'S3 Versioning maintains all object versions. For accidental deletion (DeleteMarker added), restore the previous version. For corruption, restore a previous version. Combined with MFA Delete, prevents authorized but accidental permanent deletion.' },
      { id: 'c', text: 'Enable RDS Multi-AZ for automatic failover and database high availability', correct: false, explanation: 'Multi-AZ provides HA (availability) by failing over to a standby replica, but does NOT protect against data corruption or accidental deletion — those changes are synchronously replicated to the standby. PITR (automated backups) is the correct remedy for data corruption.' },
      { id: 'd', text: 'Configure AWS CloudTrail to log all data access events for S3 and RDS', correct: false, explanation: 'CloudTrail logs API calls for audit purposes. It can identify WHO deleted or corrupted data and WHEN, but it does not help RECOVER the data. S3 Versioning is the recovery mechanism for S3.' }
    ],
    explanation: {
      overall: 'Data protection requires both backup (for corruption/deletion recovery) and HA (for availability). These are separate concerns: RDS Multi-AZ = HA only (standby inherits corruption). RDS PITR = data protection (restore to pre-corruption time). S3 Versioning = object history and recovery. Well-Architected Data Protection: REL 9 — Back up data. REL 10 — Use fault isolation to protect against failures. Test recovery — verify you can actually restore from backups (backup without tested restore is not a backup).',
      examTip: 'RDS backup vs Multi-AZ: Backups (PITR) = recovery from logical corruption, deletion. Multi-AZ = recovery from infrastructure failure. BOTH are needed for full protection. RDS PITR: restores to a NEW database instance (not in-place). Specify restore time within backup retention window. S3 Object Lock + Versioning: Versioning protects against accidental deletion. Object Lock (WORM) prevents any deletion. MFA Delete = requires MFA to permanently delete versioned objects. AWS Backup adds policy-based management across services.'
    },
    tags: ['well-architected', 'reliability', 'data-protection', 'rds-backup', 's3-versioning']
  },
  {
    id: 'wa-003',
    stem: 'A company\'s security team performs a Well-Architected Security Review and identifies that EC2 instances in private subnets are using SSH key pairs for administrative access, keys are shared among team members, and there is no audit trail of individual user actions. What Well-Architected Security best practice addresses this?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'well-architected',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Implement AWS Systems Manager Session Manager for browser-based SSH access with CloudTrail logging and IAM-based authorization, eliminating SSH keys', correct: true, explanation: 'Session Manager eliminates SSH key management: no open port 22, no SSH keys, IAM-based access control (individual users, not shared keys), full session audit trail in CloudTrail and CloudWatch Logs. Each session logged to individual IAM user identity.' },
      { id: 'b', text: 'Distribute unique SSH key pairs to each team member and rotate keys quarterly', correct: false, explanation: 'Unique keys per user improves accountability but still requires managing SSH keys (distribution, rotation, revocation) and maintaining port 22 open. Session Manager provides a more secure, key-free solution.' },
      { id: 'c', text: 'Use a bastion host with MFA and log all SSH connections to CloudTrail', correct: false, explanation: 'Bastion hosts centralize access but require managing the bastion itself (patching, HA). SSH still requires keys and port 22 access. Session Manager is operationally simpler and more secure — no bastion infrastructure needed.' },
      { id: 'd', text: 'Implement AWS Certificate Manager for SSH certificate-based authentication', correct: false, explanation: 'ACM manages SSL/TLS certificates for HTTPS, not SSH certificates. SSH certificate-based authentication (distinct from ACM) would improve key management but still requires port 22 and does not provide the same audit trail as Session Manager.' }
    ],
    explanation: {
      overall: 'Well-Architected Security: SEC 6 — Protect compute resources. Session Manager implements: (1) No inbound security group rules (no port 22/3389 open). (2) IAM-based access control — policies define who can start sessions to which instances. (3) Complete audit trail — CloudTrail logs session start/end, CloudWatch Logs/S3 captures session content. (4) No SSH key management. (5) Works with private subnets (SSM endpoint access or VPC endpoints). Individual accountability: IAM user ARN logged per session.',
      examTip: 'Session Manager vs Bastion Host: Bastion = jump server requiring maintenance, SSH keys, security group management. Session Manager = agent-based, no inbound ports, IAM auth, full audit. Requires: SSM Agent on instance, IAM role with SSM permissions, VPC endpoint for SSM (private subnets without NAT). Session recording: store session logs in S3 or CloudWatch Logs for compliance. Port forwarding: Session Manager supports port forwarding for accessing private RDS, ElastiCache endpoints via tunnel without exposing ports directly.'
    },
    tags: ['well-architected', 'security', 'session-manager', 'least-privilege', 'audit-trail']
  },
  {
    id: 'wa-004',
    stem: 'During a Well-Architected Performance Efficiency review, an architect notices the team chose c5.4xlarge instances (16 vCPU, 32 GB RAM) for a workload that consistently uses 2 vCPU and 4 GB RAM. The team chose large instances "to be safe" and hasn\'t reviewed sizing in 18 months. What Well-Architected principle does this violate and how should it be addressed?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'well-architected',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'It violates "Select the right resource types and sizes based on workload requirements" — use Compute Optimizer recommendations and implement ongoing review cadence', correct: true, explanation: 'Well-Architected Performance Efficiency requires right-sizing resources to workload needs. Compute Optimizer analyzes 14 days of CloudWatch metrics and recommends appropriate instance types. Establish quarterly reviews to prevent over-provisioning drift.' },
      { id: 'b', text: 'It violates the Reliability pillar — large instances reduce failure probability and should be maintained for stability', correct: false, explanation: 'Oversized instances do not improve reliability — they create a false sense of safety. Reliability comes from redundancy (multi-AZ, Auto Scaling), not oversized single instances. Reliability and sizing are separate concerns.' },
      { id: 'c', text: 'It violates "Use serverless architectures" — migrate all workloads to Lambda to eliminate sizing decisions', correct: false, explanation: 'Not all workloads are appropriate for serverless. The Performance Efficiency principle is about choosing APPROPRIATE resources, not mandating serverless for all use cases. Rightsizing the current c5 instance is the appropriate response.' },
      { id: 'd', text: 'There is no violation — over-provisioning provides capacity for unexpected traffic spikes', correct: false, explanation: 'Well-Architected explicitly identifies over-provisioning as an anti-pattern. Capacity for unexpected spikes should come from Auto Scaling (dynamic) or overprovisioning measured against actual peak utilization, not permanent 8x overprovisioning.' }
    ],
    explanation: {
      overall: 'Well-Architected Performance Efficiency pillar: PERF 1 — Select appropriately sized resources. Ongoing rightsizing process: (1) Enable Compute Optimizer (opt-in). (2) Review recommendations monthly. (3) Test recommended instance types in staging. (4) Implement changes during maintenance windows. (5) Monitor for 2 weeks. (6) If stable, move to Production. Establish a quarterly architecture review process to prevent "set and forget" resource configurations from accumulating.',
      examTip: 'Performance Efficiency design principles: Go global in minutes (deploy globally with low effort). Use serverless architectures (eliminate operational overhead). Experiment more often (easy to try new instance types). Consider mechanical sympathy (understand hardware characteristics). Key metrics to track: CPU utilization (right-sizing), memory utilization (requires CloudWatch Agent), network throughput. For rightsizing schedule: monthly for instances, quarterly for reserved purchases. Compute Optimizer requires 30+ days of data for enhanced recommendations.'
    },
    tags: ['well-architected', 'performance-efficiency', 'rightsizing', 'compute-optimizer', 'review-cadence']
  },
  {
    id: 'wa-005',
    stem: 'A company performs a Well-Architected Cost Optimization review. They identify that 40% of their EC2 spend is on On-Demand instances running 24/7 that could be Spot Instances, and 60% of database costs are on Aurora instances that are idle 80% of the time (development databases). What cost optimization actions are recommended?',
    type: 'multiple',
    difficulty: 2,
    topicSlug: 'well-architected',
    examDomain: 'cost-optimization',
    options: [
      { id: 'a', text: 'Convert fault-tolerant EC2 workloads (batch processing, CI/CD workers) to Spot Instances for up to 90% savings', correct: true, explanation: 'Well-Architected Cost Optimization recommends using Spot Instances for fault-tolerant, flexible workloads. CI/CD workers and batch jobs can easily handle interruptions with proper retry logic, achieving 70-90% cost savings vs On-Demand.' },
      { id: 'b', text: 'Convert idle development Aurora databases to Aurora Serverless v2 which scales to near-zero when idle', correct: true, explanation: 'Aurora Serverless v2 scales to 0 ACU (paused) when configured, eliminating database costs during idle periods. Development databases used only during business hours can save 70%+ vs always-on provisioned clusters.' },
      { id: 'c', text: 'Purchase 3-year Reserved Instances for all current On-Demand usage to maximize savings', correct: false, explanation: '3-year RIs for workloads that should be Spot Instances locks the wrong purchasing model. Spot + Savings Plans for stable baseline is more optimal than 3-year RIs for all workloads. RIs are appropriate for stable, non-interruptible baseline workloads.' },
      { id: 'd', text: 'Enable detailed billing and Cost Explorer dashboards to better understand spending', correct: false, explanation: 'Visibility tools (Cost Explorer, CUR) are important for analysis but do not reduce costs. The question asks about cost optimization ACTIONS — the actual changes that reduce spending, not the monitoring that identifies them.' }
    ],
    explanation: {
      overall: 'Well-Architected Cost Optimization: COST 6 — Implement cloud financial management. Match resources to workload type: interruptible → Spot, predictable → Savings Plans/RIs, intermittent → Serverless/on-demand. Development databases represent a classic cost optimization opportunity: deploy Schedule (stop at night/weekends) or Serverless (auto-pause). Production databases: Reserved DB Instances. CI/CD pipelines: Spot Instances with Auto Scaling and retry logic.',
      examTip: 'Cost optimization by workload pattern: Batch/CI-CD/test workers = Spot Instances (70-90% savings). Development databases = Serverless or scheduled start/stop. Production databases = Reserved DB Instances. Stable compute = Savings Plans (Compute) or EC2 Instance Savings Plans. Lambda/Fargate = Compute Savings Plans. S3 = Intelligent-Tiering + lifecycle policies. Well-Architected Cost tool: run the AWS Well-Architected Tool in the console to formally document review findings and track remediation.'
    },
    tags: ['well-architected', 'cost-optimization', 'spot-instances', 'aurora-serverless', 'finops']
  },
  {
    id: 'wa-006',
    stem: 'An architect is reviewing a microservices architecture using the Well-Architected Framework. They identify that all microservices communicate synchronously via REST APIs. When Service A calls Service B, which calls Service C, a failure in Service C causes cascading failures up the chain. What design patterns address this reliability issue?',
    type: 'multiple',
    difficulty: 3,
    topicSlug: 'well-architected',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Implement circuit breakers in Service A and B to fail fast and prevent cascading failures when downstream services are unhealthy', correct: true, explanation: 'Circuit breakers monitor downstream service health. When failure rate exceeds threshold, the circuit "opens" and immediately returns errors to callers instead of waiting for timeouts — preventing resource exhaustion and cascading failures.' },
      { id: 'b', text: 'Replace synchronous REST calls with asynchronous messaging (SQS/SNS) where business requirements permit', correct: true, explanation: 'Asynchronous messaging decouples services temporally. If Service C is slow or down, Service A and B continue processing by queuing messages. Service C processes when available — failures are contained and do not cascade.' },
      { id: 'c', text: 'Implement API Gateway with caching enabled to serve cached responses when backend services are unavailable', correct: false, explanation: 'API Gateway caching serves cached responses for read operations when backends are unavailable — a partial solution. However, it does not address write operations or the fundamental tight coupling between services.' },
      { id: 'd', text: 'Implement timeouts and retries with exponential backoff in all service-to-service calls', correct: true, explanation: 'Timeouts prevent waiting indefinitely for failed services (releases threads). Retries with exponential backoff and jitter handle transient failures without overwhelming recovering services. Essential for resilient synchronous communication.' }
    ],
    explanation: {
      overall: 'Resilient microservices patterns (Well-Architected Reliability): (1) Circuit Breaker — fail fast when downstream is unhealthy (AWS App Mesh, custom implementation). (2) Bulkhead — isolate failures to prevent cascading (separate thread pools per service). (3) Timeout — do not wait forever for responses. (4) Retry with backoff — handle transient failures gracefully. (5) Async messaging — decouple services temporally using SQS/SNS/EventBridge. (6) Health checks + graceful degradation — continue with reduced functionality.',
      examTip: 'Cascading failure prevention: Timeouts + circuit breakers + bulkheads form the core defensive pattern. AWS tools: App Mesh circuit breaking (Envoy proxy), API Gateway timeout settings, Step Functions retry logic, SQS/SNS for async decoupling. The Well-Architected Reliability pillar specifically addresses: workload architecture (loose coupling), change management (Auto Scaling), failure management (backups, DR). Tight synchronous coupling between microservices is a High Risk finding in Well-Architected Reviews.'
    },
    tags: ['well-architected', 'reliability', 'circuit-breaker', 'async-messaging', 'cascading-failure']
  },
  {
    id: 'wa-007',
    stem: 'A company uses the AWS Well-Architected Tool to formally review their workloads. After completing a review, they receive 5 High Risk items and 12 Medium Risk items. The team wants to track remediation progress and integrate findings with their project management workflow. What capability does the Well-Architected Tool provide?',
    type: 'single',
    difficulty: 1,
    topicSlug: 'well-architected',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Improvement Plans with milestone tracking, notes on each finding, and integration with third-party tools via Well-Architected API', correct: true, explanation: 'The Well-Architected Tool generates Improvement Plans listing all risk items with AWS recommended practices. You can add notes, assign owners, mark items as resolved, and create milestones. The API allows integration with Jira, ServiceNow, or custom project management systems.' },
      { id: 'b', text: 'AWS Config conformance packs that automatically remediate Well-Architected findings', correct: false, explanation: 'Config conformance packs detect AWS resource configuration compliance issues. They do not correspond to Well-Architected Framework findings (architectural and process questions) and cannot auto-remediate architecture decisions.' },
      { id: 'c', text: 'AWS Trusted Advisor integration to automatically fix identified risks', correct: false, explanation: 'Trusted Advisor identifies resource-level optimization opportunities (idle resources, security groups). It does not integrate with Well-Architected Tool findings or automatically fix architectural risks identified in Well-Architected Reviews.' },
      { id: 'd', text: 'Automated CloudFormation remediation templates generated for each Well-Architected finding', correct: false, explanation: 'The Well-Architected Tool does not automatically generate CloudFormation templates. It provides guidance and links to relevant AWS documentation and best practices for each finding.' }
    ],
    explanation: {
      overall: 'AWS Well-Architected Tool: (1) Define workloads (application name, description, environment). (2) Select lenses (Well-Architected Framework, SaaS, Serverless, FTR, etc.). (3) Answer questionnaire (pillar-specific questions). (4) Review generates: risk summary (HRI/MRI count per pillar), Improvement Plan (list of identified risks with remediation guidance). (5) Save milestones to track progress over time. (6) Share workloads with review partners. (7) API for programmatic access and third-party integration.',
      examTip: 'Well-Architected Tool features: Free service (pay for AWS services needed for remediation). Lenses available: Well-Architected Framework (6 pillars), SaaS Lens, Serverless Lens, FTR (Foundational Technical Review) Lens, Partner Lenses. Custom Lenses: define organization-specific questions and best practices. Trusted Advisor Partner: Technology Partners can use Well-Architected API to create workload reviews programmatically. The Tool does NOT automatically fix issues — it identifies and tracks them.'
    },
    tags: ['well-architected-tool', 'improvement-plan', 'risk-tracking', 'governance', 'review']
  },
  {
    id: 'wa-008',
    stem: 'The Operational Excellence pillar of the Well-Architected Framework emphasizes "Perform operations as code." A company currently manages infrastructure changes through manual console updates by operations staff. What practices implement this principle?',
    type: 'multiple',
    difficulty: 2,
    topicSlug: 'well-architected',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Define all infrastructure as CloudFormation or CDK templates stored in version control with peer review required for changes', correct: true, explanation: 'Infrastructure as Code (IaC) means infrastructure changes are made by modifying code (CloudFormation/CDK templates), reviewed, tested, and applied via automated pipelines — not manual console clicks. Version control provides change history and rollback capability.' },
      { id: 'b', text: 'Implement AWS Systems Manager runbooks for operational procedures (patch, deploy, backup, incident response)', correct: true, explanation: 'SSM runbooks automate operational procedures as code (JSON/YAML automation documents). Runbooks for common operations (patching, deployments, backups) are reviewed, tested, and version-controlled — eliminating manual ad-hoc procedures.' },
      { id: 'c', text: 'Train all operations staff on console navigation for faster manual changes', correct: false, explanation: 'Training on console navigation improves manual efficiency but does not implement "operations as code." This approach still relies on human execution, which introduces variation and lacks the auditability, repeatability, and speed of automated code-based operations.' },
      { id: 'd', text: 'Use CloudFormation StackSets to deploy infrastructure across multiple accounts and regions via pipeline', correct: true, explanation: 'StackSets deploy CloudFormation templates across multiple accounts/regions via automated pipelines — a direct implementation of "operations as code" for multi-account infrastructure management.' }
    ],
    explanation: {
      overall: 'Operational Excellence "Operations as Code" principle: ALL infrastructure changes should be: (1) Defined as code (CloudFormation, CDK, Terraform). (2) Stored in version control. (3) Reviewed through pull requests. (4) Tested in non-production environments. (5) Applied through automated CI/CD pipelines. (6) Audited via CloudTrail. This eliminates "configuration drift" (manual console changes that differ from what\'s documented), enables disaster recovery (redeploy from code), and creates a full change audit trail.',
      examTip: 'Operational Excellence pillars: Organization, Prepare (runbooks, game days), Operate (monitoring, event response), Evolve (learn from operations). "Operations as code" includes: IaC (CloudFormation/CDK), runbook automation (SSM), event-driven remediation (EventBridge + Lambda), and CI/CD pipelines for application + infrastructure. Key metric: deployment frequency (how often do you deploy?), change failure rate, mean time to recovery — these DevOps metrics directly reflect operational excellence maturity.'
    },
    tags: ['well-architected', 'operational-excellence', 'operations-as-code', 'cloudformation', 'ssm-runbooks']
  },
  {
    id: 'wa-009',
    stem: 'A company wants to implement the AWS Well-Architected Sustainability Pillar. Their main compute workload is batch data processing that runs on EC2. What changes improve sustainability (reduce environmental impact) while maintaining the same outcomes?',
    type: 'multiple',
    difficulty: 2,
    topicSlug: 'well-architected',
    examDomain: 'cost-optimization',
    options: [
      { id: 'a', text: 'Right-size EC2 instances to match actual workload requirements, eliminating wasted energy from idle compute capacity', correct: true, explanation: 'Oversized instances consume more energy than necessary. Rightsizing reduces energy consumption proportionally. The sustainability pillar directly aligns with cost optimization — unused capacity wastes both money and energy.' },
      { id: 'b', text: 'Schedule batch jobs to run during off-peak hours when renewable energy generation is higher in the AWS region', correct: true, explanation: 'AWS publishes hourly carbon intensity data by region. Scheduling workloads during high renewable energy periods reduces carbon footprint. AWS Customer Carbon Footprint Tool helps measure current impact.' },
      { id: 'c', text: 'Use AWS Graviton (ARM-based) processors which provide better performance per watt than x86 processors', correct: true, explanation: 'AWS Graviton processors deliver up to 60% better price-performance and significantly better energy efficiency vs comparable x86 instances. For batch workloads compatible with ARM/Linux, Graviton3 instances reduce energy consumption per compute unit.' },
      { id: 'd', text: 'Migrate to a private data center to have direct control over renewable energy sources', correct: false, explanation: 'AWS achieves 100% renewable energy matching for operations and benefits from economies of scale in efficiency. Private data centers typically have WORSE sustainability characteristics than hyperscalers. Moving to AWS from on-premises improves sustainability.' }
    ],
    explanation: {
      overall: 'AWS Well-Architected Sustainability Pillar (6th pillar, introduced 2021): Design principles: understand your impact, establish sustainability goals, maximize utilization, anticipate and adopt newer more efficient offerings, use managed services, reduce downstream impact. Key practices: Right-size resources, use Graviton, schedule workloads to reduce idle compute, use serverless (scales to zero), migrate to managed services (AWS optimizes their infrastructure), optimize storage (delete unused data, use appropriate storage classes).',
      examTip: 'Sustainability improvements that also reduce cost: Right-sizing, Spot Instances (preemptible = better utilization), serverless (scale to zero), Graviton instances. AWS Customer Carbon Footprint Tool: shows estimated carbon emissions for your AWS usage. AWS commits to 100% renewable energy by 2025. Graviton vs x86: Graviton2 = 20% lower energy, Graviton3 = 60% better performance/watt. For batch workloads: AWS Batch with Graviton Spot Instances optimizes both cost and sustainability.'
    },
    tags: ['well-architected', 'sustainability', 'graviton', 'rightsizing', 'carbon-footprint']
  },
  {
    id: 'wa-010',
    stem: 'A company\'s development team regularly deploys changes that cause production incidents. Post-incident reviews show that most issues stem from untested configuration changes and missing rollback procedures. Which Well-Architected Operational Excellence practices address the root causes?',
    type: 'multiple',
    difficulty: 2,
    topicSlug: 'well-architected',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Implement pre-production testing environments that mirror production configuration for all changes', correct: true, explanation: 'Testing in production-like environments catches configuration issues before they affect users. Well-Architected OPS 4: "Use change control processes." Configuration changes tested in staging reduce production incident rate.' },
      { id: 'b', text: 'Implement AWS CodeDeploy with blue/green deployments and automatic rollback on CloudWatch alarms', correct: true, explanation: 'Blue/green deployments maintain the previous version (blue) while deploying new version (green). If CloudWatch alarms detect errors in the new version, CodeDeploy automatically rolls back — providing a tested rollback mechanism.' },
      { id: 'c', text: 'Conduct post-incident reviews (PIRs) and document lessons learned after each production incident', correct: true, explanation: 'Well-Architected OPS 7: "Learn from experience." PIRs with blameless culture identify root causes and preventive measures. Action items from PIRs (like "add test coverage for X," "implement rollback for Y") directly improve reliability over time.' },
      { id: 'd', text: 'Restrict production deployments to senior engineers only, requiring approval from the CTO for all changes', correct: false, explanation: 'Restricting deployments by seniority is a process control that does not address the root causes (untested changes, missing rollbacks). Well-Architected favors automated testing and automated rollback over manual approval gates that create bottlenecks without improving quality.' }
    ],
    explanation: {
      overall: 'Operational Excellence incident prevention: (1) Define change management process (review, test, approve). (2) Test changes in staging first. (3) Deploy with rollback capability (blue/green, canary, feature flags). (4) Monitor for deployment impact (CloudWatch alarms on error rates). (5) Automate rollback when alarms trigger. (6) Conduct blameless PIRs. (7) Track action items from PIRs. (8) Measure MTTR improvement over time. The goal is to reduce deployment risk through process and automation, not through gatekeeping.',
      examTip: 'Deployment strategies (from safest/slowest to riskiest/fastest): Blue/Green (full parallel environment) → Canary (small percentage first) → Rolling (gradually replace old with new) → All-at-once (immediate replacement). CodeDeploy supports: In-place (rolling on existing instances), Blue/Green (for EC2 and ECS), Lambda traffic shifting (canary, linear). Automatic rollback: CodeDeploy triggers rollback based on CloudWatch alarms or deployment failure thresholds. Always define "success criteria" before deploying (target error rate, latency thresholds).'
    },
    tags: ['well-architected', 'operational-excellence', 'change-management', 'blue-green', 'post-incident-review']
  },
  {
    id: 'wa-011',
    stem: 'A company wants to validate their SaaS application against AWS Well-Architected best practices before launching it to enterprise customers. Enterprise customers require specific compliance posture documentation. What AWS program and tool provides a formal architectural review and validation for SaaS workloads?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'well-architected',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'AWS Well-Architected Tool with the SaaS Lens applied, conducted by an AWS Partner with Well-Architected expertise', correct: true, explanation: 'The Well-Architected Tool has a SaaS Lens with SaaS-specific questions (multi-tenancy, onboarding, isolation, metering). AWS Partners with Well-Architected Partner Program (WAPP) certification can conduct formal reviews and provide partners\' validation reports for enterprise customers.' },
      { id: 'b', text: 'AWS Security Hub with CIS AWS Foundations Benchmark assessment for compliance validation', correct: false, explanation: 'Security Hub CIS Benchmark assesses infrastructure security configuration (MFA enabled, S3 public access, etc.) — a subset of security concerns. It does not cover the full Well-Architected review across all 6 pillars or SaaS-specific architectural patterns.' },
      { id: 'c', text: 'AWS Audit Manager with AWS Well-Architected Framework as an assessment framework', correct: false, explanation: 'Audit Manager helps collect evidence for compliance audits (SOC 2, PCI, HIPAA). While it has a Well-Architected Framework assessment, it focuses on evidence collection for auditors, not architectural guidance and partner review.' },
      { id: 'd', text: 'AWS Trusted Advisor Business or Enterprise check to validate the SaaS architecture', correct: false, explanation: 'Trusted Advisor checks resource-level configurations (idle resources, security groups, service limits). It does not provide architectural review, SaaS-specific guidance, or the formal review report suitable for enterprise customers.' }
    ],
    explanation: {
      overall: 'AWS Well-Architected Partner Program (WAPP): AWS Partners who are Well-Architected certified can conduct formal reviews using the Well-Architected Tool. They can generate PDF reports of findings (appropriate for customer-facing documentation). The SaaS Lens adds SaaS-specific questions: tenant isolation (NoSQL, SaaS, compute boundaries), tenant onboarding (automated provisioning), metering and billing, SaaS operations (per-tenant monitoring), SaaS governance (tiering, entitlements). Results provide a structured report customers can share with enterprise buyers for due diligence.',
      examTip: 'Well-Architected Lenses (specialized frameworks for specific workload types): Well-Architected Framework (core 6 pillars), SaaS Lens, Serverless Lens, Machine Learning Lens, Data Analytics Lens, SAP Lens, Games Industry Lens, IoT Lens, HPC Lens, FTR (Foundational Technical Review) Lens, and partner-created custom lenses. Custom Lenses: organizations create their own questions and best practices to supplement or replace standard pillar questions for specialized internal standards.'
    },
    tags: ['well-architected-tool', 'saas-lens', 'formal-review', 'partner-program', 'enterprise']
  },
  {
    id: 'wa-012',
    stem: 'An architect is implementing the Well-Architected Security pillar recommendation "Implement a strong identity foundation." The company currently uses long-term IAM user credentials (access keys) for all API access, shared across multiple applications. What should they implement?',
    type: 'multiple',
    difficulty: 2,
    topicSlug: 'well-architected',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Replace IAM user long-term credentials with IAM roles and instance profiles for EC2 applications', correct: true, explanation: 'IAM roles attached to EC2 via instance profiles provide automatically rotated short-term credentials. Applications call the metadata service to get temporary credentials — no long-term access keys stored in code or configuration files.' },
      { id: 'b', text: 'Enable AWS IAM Identity Center (SSO) for human user authentication with short-term credentials', correct: true, explanation: 'IAM Identity Center provides centralized identity management with SAML federation. Human users authenticate through SSO (corporate IdP or IAM Identity Center IdP) and receive short-term credentials — no IAM user permanent credentials needed.' },
      { id: 'c', text: 'Implement AWS Secrets Manager to store and rotate IAM access keys automatically', correct: false, explanation: 'While Secrets Manager can store access keys, this does not eliminate long-term credential risk — keys still exist and can be compromised. The Well-Architected approach is to use roles/temporary credentials that eliminate long-term keys entirely, not just rotate them.' },
      { id: 'd', text: 'Use Amazon Cognito for machine-to-machine authentication with OAuth 2.0 client credentials', correct: true, explanation: 'For application-to-application or machine-to-machine API calls, Cognito machine-to-machine (M2M) OAuth 2.0 with client credentials flow provides short-term tokens, eliminating static API keys for service integration.' }
    ],
    explanation: {
      overall: 'Well-Architected SEC 2: Manage identities for people and machines. Strong identity foundation: (1) Human users: IAM Identity Center (SSO) with corporate IdP, MFA required, short-term credentials. (2) Workloads (EC2/ECS/Lambda): IAM roles with instance profiles/execution roles — automatic credential rotation. (3) Cross-account: IAM roles with AssumeRole, not cross-account access keys. (4) External services: OIDC federation or Cognito. NEVER use long-term static credentials for programmatic access.',
      examTip: 'IAM identity best practices: Eliminate root account usage (use for billing only, enable MFA). No IAM user access keys for production (use roles). Enable MFA for all human IAM users. Use IAM Identity Center for SSO + temporary credentials. Principle of least privilege: start with minimum permissions, expand based on access advisor data. Access Analyzer: identifies cross-account and internet-accessible resources. Credential Report: audit all IAM user credentials and rotation status.'
    },
    tags: ['well-architected', 'security', 'identity-foundation', 'iam-roles', 'sso']
  },
  {
    id: 'wa-013',
    stem: 'A company wants to proactively test their disaster recovery procedures. Their architecture uses multi-region active-passive with Route 53 failover routing. Currently, they have never actually tested failover. The Well-Architected Reliability pillar recommends testing recovery procedures. What approach implements chaos engineering for DR testing without customer impact?',
    type: 'single',
    difficulty: 3,
    topicSlug: 'well-architected',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Use AWS Fault Injection Simulator (FIS) with experiment templates to simulate regional failures in staging environments, measuring RTO and RPO against targets', correct: true, explanation: 'AWS FIS supports chaos engineering experiments: inject failures (terminate EC2 instances, throttle APIs, introduce network latency, stop EBS I/O). Run DR experiments in staging that mirrors production architecture to measure actual RTO/RPO without customer impact.' },
      { id: 'b', text: 'Document the failover procedure and review it annually with the operations team', correct: false, explanation: 'Documentation review does not constitute testing. The Well-Architected principle is "Test recovery procedures" — actually execute the failover, measure the time, and validate the system recovers. Documentation alone creates false confidence.' },
      { id: 'c', text: 'Monitor Route 53 health check states during production incidents as natural DR tests', correct: false, explanation: 'Waiting for production incidents to "test" DR is reactive, not proactive. Production incidents affect real customers and do not allow controlled measurement or safe debugging. FIS provides controlled, repeatable, observable experiments.' },
      { id: 'd', text: 'Conduct annual disaster recovery drills by failing over production to the DR region during a maintenance window', correct: false, explanation: 'While better than no testing, annual production DR drills are infrequent, risky (maintenance windows have customer impact), and do not support the iterative improvement that regular chaos engineering experiments provide.' }
    ],
    explanation: {
      overall: 'AWS Fault Injection Simulator (FIS) implements chaos engineering: define experiments (what to break), hypothesis (what should happen), steady-state baseline (normal metrics), then inject failures and observe. FIS supports: EC2 StopInstances, ECS StopTask, RDS Failover, Terminate Spot Instances, Inject API errors, Network latency/packet loss. For DR testing: create experiment that simulates primary region failure (terminate all EC2 in primary AZ) → verify Route 53 failover triggers → measure time to traffic shift to DR region → validate RPO from last backup.',
      examTip: 'FIS experiment structure: Targets (which resources), Actions (what failure to inject), Stop Conditions (safety guardrail to halt experiment), IAM Role (FIS permissions to terminate/modify resources). Key FIS actions: aws:ec2:terminate-instances, aws:rds:failover-db-cluster, aws:ecs:stop-task, aws:fis:inject-api-internal-error, aws:fis:inject-api-unavailable-error. Game Days: structured team exercises (announce upcoming chaos experiment, team monitors and responds). Hypothesis-driven: define expected behavior before injecting failures.'
    },
    tags: ['well-architected', 'reliability', 'chaos-engineering', 'fis', 'disaster-recovery-testing']
  },
  {
    id: 'wa-014',
    stem: 'A company undergoes a Well-Architected Review of their data analytics workload. The review identifies that all raw, processed, and archived data is stored in S3 Standard (same storage class) and data over 5 years old has never been deleted. There is no data classification or retention policy. What Well-Architected sustainability and cost recommendation addresses this?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'well-architected',
    examDomain: 'cost-optimization',
    options: [
      { id: 'a', text: 'Implement a data lifecycle policy: S3 Intelligent-Tiering for active data, lifecycle rules to Glacier for archival, and automatic deletion after retention period', correct: true, explanation: 'Well-Architected recommends matching storage class to access patterns (efficiency) and implementing data retention policies (delete data no longer needed). Intelligent-Tiering auto-optimizes active data; lifecycle rules archive cold data; deletion rules remove expired data.' },
      { id: 'b', text: 'Move all data to S3 Glacier Deep Archive immediately to minimize storage costs', correct: false, explanation: 'Moving active data to Deep Archive would cause application errors (retrieval takes 12-48 hours). Data lifecycle management should match storage class to actual access patterns, not apply the cheapest tier to all data indiscriminately.' },
      { id: 'c', text: 'Enable S3 Storage Lens to analyze data usage patterns before making storage class decisions', correct: false, explanation: 'Storage Lens analysis is a good first step but it alone does not implement the lifecycle policy. The Well-Architected recommendation is to implement the actual lifecycle policy — analysis is the preparation, not the solution.' },
      { id: 'd', text: 'Replicate all data to a second S3 bucket for improved durability before implementing lifecycle policies', correct: false, explanation: 'S3 Standard already provides 99.999999999% (11 nines) durability across multiple AZs — additional replication is not needed. Adding replication would double storage costs and exacerbate the storage management problem.' }
    ],
    explanation: {
      overall: 'Well-Architected data lifecycle management: (1) Classify data by access pattern (hot/warm/cold/archive). (2) Apply appropriate storage class per tier. (3) Implement lifecycle rules for automatic tier transitions. (4) Define retention periods and implement automatic deletion. (5) Monitor with S3 Storage Lens. This implements both Cost Optimization (right-priced storage) and Sustainability (eliminate unnecessary storage/energy use). Data governance: "If you don\'t need it, delete it" — storing unnecessary data wastes money and energy.',
      examTip: 'S3 lifecycle rule transitions: Objects must exist for minimum duration before transitioning: S3 Standard → Standard-IA: minimum 30 days. Any class → Glacier Instant: minimum 90 days from Standard, 30 days from IA. Glacier Instant → Glacier Flexible: minimum 90 days. Any → Deep Archive: minimum 180 days total. Lifecycle rules cannot transition backwards (Glacier → Standard). For deletion: set Expiration rules with specific day count or date. Incomplete multipart upload cleanup: add lifecycle rule to delete incomplete multipart uploads after 7 days.'
    },
    tags: ['well-architected', 'sustainability', 'data-lifecycle', 's3', 'retention-policy']
  },
  {
    id: 'wa-015',
    stem: 'A company\'s CTO wants to establish an ongoing Well-Architected review program for all workloads across 50 AWS accounts. They want automated scanning for common Well-Architected risk indicators (security groups with 0.0.0.0/0, public S3 buckets, no MFA on root) alongside formal architectural reviews. What combination of services implements continuous Well-Architected governance?',
    type: 'multiple',
    difficulty: 3,
    topicSlug: 'well-architected',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'AWS Security Hub with AWS Foundational Security Best Practices standard enabled across all accounts for automated security posture scoring', correct: true, explanation: 'Security Hub aggregates findings from GuardDuty, Config, Inspector, Macie, and evaluates against FSBP (Foundational Security Best Practices), CIS, and PCI standards. Provides a security score across all accounts — automated continuous monitoring for security risks.' },
      { id: 'b', text: 'AWS Config with conformance packs deployed organization-wide to detect resource misconfigurations', correct: true, explanation: 'AWS-managed conformance packs (e.g., Operational Best Practices for Well-Architected Framework) deploy pre-configured Config rules across all Organization accounts. Non-compliant resources are flagged continuously — automated detection of configuration drift.' },
      { id: 'c', text: 'AWS Well-Architected Tool with quarterly formal reviews for each critical workload, tracking improvement plan progress', correct: true, explanation: 'Formal Well-Architected reviews via the Tool capture architectural decisions, identify HRIs/MRIs, and track remediation via improvement plans. Combined with automated scanning (Security Hub, Config), this provides both continuous detection and periodic deep architectural review.' },
      { id: 'd', text: 'Amazon Inspector for automated security assessment of EC2 instances and container images', correct: false, explanation: 'Inspector is valuable for vulnerability scanning (CVEs in EC2/containers) but assesses infrastructure security vulnerabilities, not Well-Architected compliance across all pillars. It supplements but does not replace Security Hub for Well-Architected governance.' }
    ],
    explanation: {
      overall: 'Enterprise Well-Architected governance program: (1) Automated continuous scanning: Config conformance packs (infrastructure compliance) + Security Hub (security posture) + Trusted Advisor (cost/performance/fault tolerance). (2) Periodic deep reviews: Well-Architected Tool formal reviews for each workload (quarterly for critical, annually for others). (3) Trend tracking: Security Hub score trends, Config compliance percentages, Well-Architected Tool milestone comparisons. (4) Automated remediation: Config remediation actions + Lambda auto-fix for common issues.',
      examTip: 'Well-Architected governance toolchain: Config = "Is each resource configured correctly?" (compliance rules). Security Hub = "What is our overall security posture?" (aggregated findings + score). Well-Architected Tool = "Is our architecture designed correctly?" (pillar-based review). Trusted Advisor = "Are we optimizing our AWS usage?" (cost/performance/fault tolerance checks). These are complementary — no single tool covers everything. For the exam: Config + Security Hub + Well-Architected Tool = comprehensive governance.'
    },
    tags: ['well-architected', 'governance', 'security-hub', 'config', 'continuous-compliance']
  },
  {
    id: 'wa-016',
    stem: 'A company is designing a new multi-tenant SaaS platform. They need to ensure tenant data isolation, scalable tenant onboarding, and per-tenant cost tracking. The architecture team wants to align with the AWS Well-Architected SaaS Lens. Which isolation model provides the strongest tenant data isolation while maintaining a single platform?',
    type: 'single',
    difficulty: 3,
    topicSlug: 'well-architected',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Silo model: dedicated AWS accounts per tenant with AWS Organizations, separate RDS databases, and separate ECS clusters', correct: false, explanation: 'The silo model provides the strongest isolation (separate accounts, resources) but is the MOST expensive and complex to manage. For a single platform serving many tenants, managing hundreds of accounts per tenant is operationally prohibitive. Silo is appropriate for high-compliance enterprise tenants.' },
      { id: 'b', text: 'Pool model with Row-Level Security (RLS) in the database and tenant-aware application logic using JWT claims', correct: false, explanation: 'Pool model (shared everything) is the most cost-efficient and simplest to operate but provides the weakest isolation — all tenant data in shared tables with RLS. Appropriate for basic SaaS but may not satisfy enterprise compliance requirements.' },
      { id: 'c', text: 'Bridge (hybrid) model: shared compute (ECS), tenant-isolated databases (separate RDS/DynamoDB tables), and resource policies scoped to tenant context', correct: true, explanation: 'The bridge model balances isolation and efficiency: shared compute infrastructure (optimized costs) with data-layer tenant isolation (separate databases or table prefixes). Resource policies and IAM conditions enforce tenant boundaries at the data layer.' },
      { id: 'd', text: 'All tenants share a single DynamoDB table with partition key as tenant_id for maximum cost efficiency', correct: false, explanation: 'Single shared DynamoDB table (full pool) provides minimum isolation — all tenant data in one table with only application-layer separation. Any application logic error or DynamoDB bug could expose cross-tenant data. Not suitable for strong isolation requirements.' }
    ],
    explanation: {
      overall: 'SaaS Lens isolation models: Silo (most isolated, most expensive): separate AWS account/VPC per tenant. Pool (least isolated, cheapest): shared resources, tenant separation only in application layer. Bridge (middle ground): shared compute, isolated data stores. The bridge model is the most common for SaaS: ECS/EKS clusters shared across tenants, but each tenant has separate RDS instance/schema or DynamoDB table prefix. JWT claims carry tenant context; IAM conditions or row-level policies enforce data access boundaries.',
      examTip: 'SaaS tenant isolation patterns: Account-level silo = AWS Organizations with separate accounts per tenant. Resource-level silo = same account, separate VPCs/clusters per tenant. Pool with RLS = shared table with tenant_id column + RLS policy. Pool with separate tables = shared DB, separate tables per tenant (DynamoDB prefix or RDS schema). Identify tenant from JWT/context at API Gateway → propagate via Lambda → enforce at data layer. AWS IAM Policy: Condition with StringEquals on aws:RequestedRegion or custom tenant context attribute. ABAC (Attribute-Based Access Control) for tenant isolation.'
    },
    tags: ['well-architected', 'saas-lens', 'tenant-isolation', 'multi-tenant', 'data-isolation']
  },
  {
    id: 'wa-017',
    stem: 'A company is reviewing their architecture against the Well-Architected Framework Reliability pillar. Their e-commerce application uses a single-region Aurora MySQL cluster and processes orders via SQS. The team identifies that a full region failure would cause complete service outage with 4-6 hours RTO and 1 hour RPO. They want to improve to 15-minute RTO and 5-minute RPO without a full active-active architecture. Which design changes achieve this target?',
    type: 'multiple', difficulty: 3, topicSlug: 'well-architected', examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Enable Aurora Global Database with a secondary read region — promote to primary during disaster with <1 minute RPO and ~1 minute promotion time', correct: true, explanation: 'Aurora Global Database replicates changes to secondary regions with typically <1 second lag (sub-1 minute RPO). Promotion of the secondary to primary takes about 1 minute. This dramatically exceeds the 5-minute RPO target and enables 15-minute RTO when combined with DNS failover automation.' },
      { id: 'b', text: 'Configure Route 53 health checks with automated DNS failover to a pre-warmed standby stack in the secondary region', correct: true, explanation: 'Pre-warming a standby stack (EC2 Auto Scaling with minimum 1 instance, ECS service running) means no cold-start delay. Route 53 health check detects primary failure in ~10 seconds and automatically switches DNS to secondary ALB. Together with Aurora Global Database promotion, this achieves the 15-minute RTO target.' },
      { id: 'c', text: 'Increase Aurora automated backup retention to 35 days to improve RPO', correct: false, explanation: 'Automated backups improve point-in-time recovery options but do not address RPO for a region failure — restoring from backup takes hours, far exceeding the 5-minute RPO target. For cross-region RPO improvement, Aurora Global Database or cross-region replication is required.' },
      { id: 'd', text: 'Deploy SQS queues as FIFO queues in both regions with cross-region message replication via EventBridge Pipes', correct: false, explanation: 'SQS is region-scoped and does not natively replicate cross-region. An EventBridge-based message replication approach adds architectural complexity and latency. The core bottleneck in achieving the RTO/RPO targets is the database, not the queue layer.' },
    ],
    explanation: { overall: 'Well-Architected Reliability: active-passive DR with Aurora Global Database. Architecture: primary region (full stack) + secondary region (Aurora secondary cluster + pre-warmed application tier). Aurora Global Database: storage-level replication, <1s lag, <1 min promotion. Application pre-warming: Auto Scaling group with min=1 in secondary, ECS desired=1. Failover automation: (1) Route 53 health check detects failure. (2) Lambda or runbook promotes Aurora Global Database secondary. (3) Route 53 DNS updated to secondary ALB. Total: ~10s detection + ~60s Aurora promotion + ~2min DNS propagation ≈ under 15 minutes.', examTip: 'DR strategy tiers (RTO/RPO): Backup & Restore = hours/hours (cheapest). Pilot Light = 10s of minutes/minutes (core DB running, app tier scaled from zero). Warm Standby = minutes/seconds (scaled-down full stack, quick scale-up). Multi-Site Active-Active = near-zero/near-zero (most expensive). Aurora Global Database is the key enabler for sub-minute RPO across regions. Well-Architected Reliability pillar key areas: service quotas, network topology, fault isolation, change management, failure management.' },
    tags: ['well-architected', 'reliability', 'aurora-global-database', 'disaster-recovery', 'rto-rpo'],
  },
  {
    id: 'wa-018',
    stem: 'During a Well-Architected Review, an architect assesses the Performance Efficiency pillar for a video transcoding workload. The workload processes 4K video files using GPU instances (ml.g4dn.12xlarge) in an EC2 Auto Scaling group. Average GPU utilization is 22% with peak utilization of 68%. Queue depth in SQS averages 500 messages during business hours. The architect wants to improve efficiency. Which recommendations are most appropriate?',
    type: 'multiple', difficulty: 3, topicSlug: 'well-architected', examDomain: 'continuous-improvement',
    options: [
      { id: 'a', text: 'Right-size instances — evaluate g4dn.2xlarge (single GPU) vs g4dn.12xlarge (4 GPUs) per job to match GPU resources to actual per-job utilization', correct: true, explanation: '22% average GPU utilization on a 4-GPU instance suggests each job may only use 1 GPU effectively. Testing g4dn.2xlarge (1 NVIDIA T4) per job and running parallel jobs could improve overall utilization efficiency. Compute Optimizer can analyze GPU CloudWatch metrics to recommend instance right-sizing.' },
      { id: 'b', text: 'Use SQS queue depth as a CloudWatch metric for Auto Scaling target tracking to scale based on messages per instance rather than CPU', correct: true, explanation: 'For queue-based workloads, scaling on SQS ApproximateNumberOfMessages relative to desired instances (messages/instance target) is more meaningful than CPU. When queue depth rises, Auto Scaling adds instances; when queue drains, it scales in. This matches capacity to actual work backlog.' },
      { id: 'c', text: 'Migrate the transcoding workload to AWS Elemental MediaConvert, a purpose-built managed video transcoding service', correct: true, explanation: 'MediaConvert is a purpose-built, fully managed video transcoding service that eliminates infrastructure management, auto-scales to job demand, and pricing is per-minute of output (no idle instance costs). For video transcoding specifically, MediaConvert is the performance-efficient, operationally simple choice over self-managed EC2 GPU fleets.' },
      { id: 'd', text: 'Add Elastic Fabric Adapter (EFA) networking to the GPU instances to improve transcoding throughput', correct: false, explanation: 'EFA is for tightly-coupled HPC workloads requiring low-latency, high-bandwidth MPI communication between instances (e.g., distributed ML training, CFD simulation). Video transcoding jobs are independent (not distributed across instances) and do not benefit from EFA networking.' },
    ],
    explanation: { overall: 'Well-Architected Performance Efficiency pillar: (1) Use purpose-built services — MediaConvert, Rekognition, Transcribe, etc. eliminate infrastructure management. (2) Right-size compute — use Compute Optimizer (EC2, Lambda, ECS, EBS) for data-driven recommendations. (3) Scale based on meaningful metrics — queue depth, custom metrics, not just CPU. (4) Benchmark and experiment — try different instance types/sizes. (5) Monitor and tune — set performance KPIs and alert on degradation. GPU utilization is a key metric for GPU workloads; CloudWatch GPU Utilization requires NVIDIA DCGM plugin or custom metrics.', examTip: 'SQS-based Auto Scaling formula: target messages per instance = (throughput per instance × desired latency). E.g., each instance processes 10 messages/min, acceptable queue wait = 5 min → target = 50 messages/instance. Use custom CloudWatch metric (SQS ApproximateNumberOfMessages / running instances) with target tracking policy. Performance Efficiency pillars: selection (right compute type) + review (iterate with new services) + monitoring (know your KPIs) + trade-offs (consistency vs latency, etc.).' },
    tags: ['well-architected', 'performance-efficiency', 'gpu', 'sqs-autoscaling', 'right-sizing'],
  },
  {
    id: 'wa-019',
    stem: 'A company is applying the Well-Architected Security pillar to a multi-account AWS environment. They want to centralize security findings, enforce baseline security controls across all accounts, automatically remediate common misconfigurations, and provide a single compliance dashboard for auditors. Which combination of AWS services forms the most complete security governance foundation?',
    type: 'multiple', difficulty: 2, topicSlug: 'well-architected', examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'AWS Security Hub as the central aggregation point for findings from GuardDuty, Inspector, Macie, and Firewall Manager across all accounts', correct: true, explanation: 'Security Hub aggregates security findings from AWS security services (GuardDuty, Inspector v2, Macie, Firewall Manager, IAM Access Analyzer) and partner solutions in a standardized format (ASFF). It provides automated security checks against AWS Foundational Security Best Practices and CIS Benchmarks. Cross-account aggregation gives auditors a single compliance dashboard.' },
      { id: 'b', text: 'AWS Config with conformance packs (e.g., CIS AWS Benchmark) for continuous configuration compliance assessment and automated remediation via Systems Manager Automation', correct: true, explanation: 'AWS Config conformance packs bundle rules and remediation actions. Pre-built packs: CIS Level 1/2, NIST 800-53, HIPAA, PCI DSS. Automated remediation: Config rules trigger SSM Automation documents to fix non-compliant resources (e.g., disable public S3 access, enable encryption). Aggregated via Config Aggregator for multi-account view.' },
      { id: 'c', text: 'Amazon Inspector v2 for automated vulnerability assessment of EC2 instances and Lambda functions across all accounts', correct: true, explanation: 'Inspector v2 continuously scans EC2 instances (OS CVEs, network reachability) and Lambda functions (code CVEs in package dependencies) using the SSM agent. Findings include risk scores, affected packages, and remediation guidance. Inspector integrates with Security Hub for centralized finding management across accounts.' },
      { id: 'd', text: 'AWS CloudTrail Lake for all security finding storage and querying, replacing Security Hub as the central aggregation point', correct: false, explanation: 'CloudTrail Lake stores and queries CloudTrail events (API activity). It is not designed to aggregate security findings from Inspector, GuardDuty, or Macie. Security Hub is the correct aggregation layer for security findings across services. CloudTrail Lake complements Security Hub for API-level audit trails.' },
    ],
    explanation: { overall: 'Well-Architected Security pillar implementation: (1) Identity foundation — IAM Identity Center, least-privilege, SCPs. (2) Detective controls — Security Hub (central findings), GuardDuty (threat detection), Config (compliance), CloudTrail (API audit), Inspector (vulnerabilities), Macie (data classification). (3) Infrastructure protection — Security Groups, NACLs, WAF, Shield, Firewall Manager. (4) Data protection — encryption at rest (KMS) and in transit, Macie for sensitive data. (5) Incident response — Security Hub + EventBridge + Lambda for automated response. All integrated across accounts via AWS Organizations.', examTip: 'Security service roles: GuardDuty = threat detection (unusual API calls, compromised credentials, network anomalies). Inspector = vulnerability assessment (CVEs in OS + code dependencies). Macie = S3 data classification (finds PII, credentials). Security Hub = aggregates and normalizes findings + compliance checks. Config = resource configuration compliance + drift + remediation. IAM Access Analyzer = analyzes resource policies for external access. Detective = security investigation and visualization. Know which service does what for the exam.' },
    tags: ['well-architected', 'security', 'security-hub', 'config', 'multi-account-governance'],
  },
  {
    id: 'wa-020',
    stem: 'A startup has been running their application on AWS for 18 months. They are preparing for rapid growth (10× in 6 months) and want to proactively identify architectural risks and improvement opportunities before scaling. They have a small team with limited time for reviews. Which AWS program and tooling provides the most structured approach to architectural assessment with the least time investment from the team?',
    type: 'single', difficulty: 1, topicSlug: 'well-architected', examDomain: 'continuous-improvement',
    options: [
      { id: 'a', text: 'Engage an AWS Partner for a Well-Architected Review using the AWS Well-Architected Tool, generating a formal improvement plan with prioritized high-risk issues', correct: true, explanation: 'The AWS Well-Architected Tool (free, in console) provides structured questionnaires across 6 pillars. AWS Partners can conduct reviews at no cost (AWS funds the review). The tool generates a report of High Risk Issues (HRIs) and Medium Risk Issues (MRIs) with specific improvement recommendations, prioritized by impact. Partners bring expertise and can conduct the review with minimal time from the startup team.' },
      { id: 'b', text: 'Self-perform a manual architectural review using the AWS Well-Architected whitepaper checklists', correct: false, explanation: 'Manual reviews using whitepapers are time-intensive and lack the structured tooling, prioritization, and partner expertise of a formal Well-Architected Review. For a time-constrained startup, this approach is less efficient than using the Well-Architected Tool and partner program.' },
      { id: 'c', text: 'Run AWS Trusted Advisor across all accounts and resolve all flagged checks before scaling', correct: false, explanation: 'Trusted Advisor provides automated checks for cost, performance, security, fault tolerance, and service limits. It is reactive (checks current state) but does not provide the comprehensive architectural assessment, pillar-based review, and customized improvement roadmap of a Well-Architected Review. Trusted Advisor complements but does not replace a Well-Architected Review.' },
      { id: 'd', text: 'Hire an AWS Solutions Architect as a full-time employee to conduct an internal architectural review before scaling', correct: false, explanation: 'Hiring a full-time SA has a long lead time incompatible with a 6-month scaling timeline and is costly for a startup. The AWS Partner Well-Architected Review program provides expert-led architectural assessment rapidly and at no cost to the startup.' },
    ],
    explanation: { overall: 'AWS Well-Architected Framework: 6 pillars — Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability. Well-Architected Tool (free, in console): structured questionnaires → HRI/MRI identification → improvement plan. Well-Architected Partner Program: AWS-trained partners conduct reviews at no cost (funded by AWS). Output: milestone reports, risk dashboard, improvement roadmap. Lens ecosystem: additional specialized lenses (SaaS, Serverless, ML, IoT, Analytics, Games, HPC, Financial Services) for domain-specific guidance.', examTip: 'Well-Architected Review triggers: pre-production launch, post-incident review, pre-scaling events, annual review. Well-Architected Tool features: workload definitions, milestone tracking (snapshot of answers at a point in time for before/after comparison), improvement plan (prioritized HRI/MRI with linked documentation), sharing across teams. Well-Architected Reviews are NOT one-time events — they should be repeated at milestones. The tool supports multiple workloads per account.' },
    tags: ['well-architected', 'well-architected-tool', 'architectural-review', 'improvement-plan', 'partner-program'],
  },
];
