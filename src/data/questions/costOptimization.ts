import type { Question } from './index';

export const costOptimizationQuestions: Question[] = [
  {
    id: 'cost-001',
    stem: 'A company runs 200 EC2 instances 24/7 for production workloads with stable, predictable demand. Their current all On-Demand cost is $50,000/month. The CTO wants to reduce compute costs by at least 40% without changing the architecture. What is the most effective purchasing strategy?',
    type: 'single',
    difficulty: 1,
    topicSlug: 'cost-optimization',
    examDomain: 'cost-optimization',
    options: [
      { id: 'a', text: 'Purchase 1-year Compute Savings Plans with partial upfront payment for all 200 instances', correct: true, explanation: 'Compute Savings Plans offer up to 66% savings vs On-Demand for any EC2 instance family, size, OS, tenancy, or region. 1-year partial upfront provides significant savings (typically 40-50%) with flexibility to change instance types without losing savings plan benefits.' },
      { id: 'b', text: 'Convert all instances to Reserved Instances (Standard, 3-year, all upfront)', correct: false, explanation: 'While 3-year all-upfront Standard RIs provide up to 72% savings, they lock the commitment to specific instance families and regions for 3 years. Compute Savings Plans provide comparable savings with more flexibility to change instance types as needs evolve.' },
      { id: 'c', text: 'Convert 50% of instances to Spot Instances to reduce the average cost', correct: false, explanation: 'Spot Instances are appropriate for fault-tolerant workloads but not for stable production applications requiring continuous availability. A 24/7 production workload should not use Spot due to interruption risk.' },
      { id: 'd', text: 'Enable AWS Auto Scaling to scale down instances during weekends', correct: false, explanation: 'The question specifies predictable 24/7 demand — the instances are needed continuously. Auto Scaling helps with variable demand, not constant demand. Purchasing commitments (Savings Plans/RIs) are the appropriate cost reduction strategy for 24/7 stable workloads.' }
    ],
    explanation: {
      overall: 'For steady-state 24/7 workloads, commitment-based pricing (Savings Plans or Reserved Instances) provides the greatest cost reduction. Compute Savings Plans: up to 66% off On-Demand, apply automatically to any EC2 usage (any family, region, OS), also apply to Fargate and Lambda. EC2 Instance Savings Plans: up to 72% off, apply to specific instance family in a region (more savings, less flexibility). Standard RIs: up to 72% off, convertible RIs up to 66% off with flexibility to change attributes.',
      examTip: 'Savings Plans vs Reserved Instances: Savings Plans = flexibility (any instance family, region, OS, Fargate, Lambda) + high savings. RIs = higher max savings (Standard RI) but locked to specific instance family/region. Savings Plans apply before RIs. If you can predict your workload in compute hours ($/hr commitment), Savings Plans are preferred. If you need specific instance reservations (Dedicated Hosts, capacity reservation), use RIs. Recommendation: use AWS Cost Explorer → Savings Plans recommendations before purchasing.'
    },
    tags: ['savings-plans', 'reserved-instances', 'cost-optimization', 'ec2-pricing', 'commitment-pricing']
  },
  {
    id: 'cost-002',
    stem: 'A company has EC2 instances running development and test workloads that are only used Monday-Friday, 8 AM - 6 PM. The rest of the time (evenings, weekends) the instances sit idle. What is the most cost-effective solution to reduce costs for these environments?',
    type: 'single',
    difficulty: 1,
    topicSlug: 'cost-optimization',
    examDomain: 'cost-optimization',
    options: [
      { id: 'a', text: 'Use AWS Instance Scheduler to automatically start/stop EC2 instances based on business hours schedule', correct: true, explanation: 'Instance Scheduler uses Lambda and EventBridge to automatically start instances at 8 AM and stop them at 6 PM Monday-Friday. 50 hours/week active vs 168 hours = ~70% reduction in EC2 compute costs for these environments.' },
      { id: 'b', text: 'Purchase Savings Plans for the dev/test instances to reduce their hourly costs', correct: false, explanation: 'Savings Plans commit to a consistent $/hr compute spend. If instances run only 30% of the time, a Savings Plan commitment would be wasted during idle hours — you commit to paying even when instances are stopped.' },
      { id: 'c', text: 'Convert all dev/test instances to Spot Instances with interruption handling', correct: false, explanation: 'Spot Instances save money when running but still run 24/7 unless explicitly stopped. The greatest savings come from not running instances at all during off-hours, which Spot does not provide automatically.' },
      { id: 'd', text: 'Migrate dev/test to Lambda functions to eliminate idle compute costs', correct: false, explanation: 'Development and test environments typically require persistent running environments (IDEs, databases, shared services) that cannot be trivially converted to Lambda functions. Instance Scheduler is the practical solution.' }
    ],
    explanation: {
      overall: 'AWS Instance Scheduler is a free AWS solution (CloudFormation template + Lambda + DynamoDB) that automatically starts and stops EC2 and RDS instances on a defined schedule. Cost savings calculation: Dev/test running 10 hours/day × 5 days = 50 hours/week. Total hours/week = 168. Savings: (168-50)/168 = 70% reduction in running hours. RDS instances can also be scheduled to reduce database costs during off-hours.',
      examTip: 'Instance Scheduler vs Auto Scaling: Instance Scheduler = scheduled start/stop for cost savings (dev/test). Auto Scaling = dynamic scaling based on demand metrics (production). Key difference: Auto Scaling adjusts instance COUNT based on demand. Scheduler stops/starts individual instances on a time schedule. For dev/test environments: Instance Scheduler is the AWS Well-Architected cost optimization recommendation. Alternative: SSM Automation runbooks triggered by EventBridge cron rules.'
    },
    tags: ['instance-scheduler', 'dev-test', 'cost-optimization', 'start-stop', 'scheduling']
  },
  {
    id: 'cost-003',
    stem: 'A startup is building a new application on AWS. They want to architect for cost from day one. The application has unpredictable traffic that ranges from near-zero at night to high peaks during business hours. Which combination of services minimizes cost while maintaining availability?',
    type: 'multiple',
    difficulty: 2,
    topicSlug: 'cost-optimization',
    examDomain: 'cost-optimization',
    options: [
      { id: 'a', text: 'AWS Lambda for application compute (pay-per-invocation, scales to zero when idle)', correct: true, explanation: 'Lambda charges only for actual compute time (per millisecond) and scales to zero when there is no traffic. For unpredictable traffic with near-zero periods, Lambda can be significantly cheaper than idle EC2 instances.' },
      { id: 'b', text: 'Amazon Aurora Serverless v2 for the database layer (auto-scales ACUs based on demand)', correct: true, explanation: 'Aurora Serverless v2 scales database capacity in fine-grained increments (0.5 ACU) within seconds, scaling down during idle periods. For unpredictable workloads, it avoids overprovisioning a fixed database cluster size.' },
      { id: 'c', text: 'Amazon S3 for static assets and Amazon CloudFront for global content delivery', correct: true, explanation: 'S3 + CloudFront for static assets eliminates compute costs for asset serving. CloudFront caches content at edge, reducing S3 request costs and origin server load. Pay only for storage, requests, and data transfer — no idle compute.' },
      { id: 'd', text: 'EC2 t3.micro instances in an Auto Scaling group with a minimum of 2 for availability', correct: false, explanation: 'A minimum of 2 always-on EC2 instances incur continuous costs even during zero-traffic periods. For near-zero traffic at night, this is wasteful compared to serverless options that scale to zero.' }
    ],
    explanation: {
      overall: 'Serverless-first architecture for variable workloads: Lambda (compute) + Aurora Serverless v2 or DynamoDB (database) + S3/CloudFront (static assets) + API Gateway (HTTP layer). This "pay-for-use" model minimizes costs during idle periods. As traffic grows and becomes more predictable, evaluate whether EC2 with Savings Plans becomes more cost-effective. The break-even point where EC2+Savings Plans beats Lambda depends on request rates and compute duration.',
      examTip: 'Serverless cost model: Lambda = $0.0000166667 per GB-second + $0.20 per 1M requests (free tier: 1M requests/month). Break-even: Lambda becomes more expensive than EC2 when running continuously at high load. Rule of thumb: <60% utilization → consider Lambda/serverless; >70% consistent utilization → EC2+Savings Plans is often cheaper. Aurora Serverless v2 minimum: 0.5 ACU ≈ 1 GB RAM, scales to 128 ACU. Can pause (scale to 0) after inactivity period to eliminate compute costs when truly idle.'
    },
    tags: ['serverless', 'cost-optimization', 'lambda', 'aurora-serverless', 'scale-to-zero']
  },
  {
    id: 'cost-004',
    stem: 'A company stores 500 TB of data in Amazon S3 Standard. Analysis shows that 70% of objects have not been accessed in over 90 days, 20% are accessed occasionally (monthly), and only 10% are accessed frequently. The company wants to minimize storage costs without manual intervention. What is the best solution?',
    type: 'single',
    difficulty: 1,
    topicSlug: 'cost-optimization',
    examDomain: 'cost-optimization',
    options: [
      { id: 'a', text: 'Enable S3 Intelligent-Tiering on the entire bucket to automatically move objects between access tiers', correct: true, explanation: 'S3 Intelligent-Tiering monitors access patterns and automatically moves objects between Frequent Access (same price as Standard), Infrequent Access (40% cheaper), and Archive Instant Access (68% cheaper) tiers. No retrieval fees for Frequent and Infrequent Access tiers. Perfect for unpredictable access patterns.' },
      { id: 'b', text: 'Create S3 lifecycle policies to move objects to S3 Standard-IA after 30 days and Glacier after 90 days', correct: false, explanation: 'Lifecycle policies are time-based (days since creation/last modified), not access-based. Objects might still be frequently accessed but moved to cheaper tiers due to age, causing higher retrieval costs. Intelligent-Tiering makes decisions based on actual access patterns.' },
      { id: 'c', text: 'Manually review access logs and move objects to appropriate storage classes quarterly', correct: false, explanation: 'Manual review is operationally expensive and not scalable for 500 TB. Intelligent-Tiering automates this continuously without any human intervention.' },
      { id: 'd', text: 'Enable S3 Standard-IA for all objects immediately to reduce storage costs by 40%', correct: false, explanation: 'Standard-IA has minimum storage duration (30 days) and per-GB retrieval fees. Frequently accessed objects (10%) would incur retrieval costs that could exceed the savings vs Standard. Intelligent-Tiering is better for mixed access patterns.' }
    ],
    explanation: {
      overall: 'S3 Intelligent-Tiering automatically optimizes costs for objects with unpredictable access patterns. Tiers: Frequent Access (Standard pricing, automatically used for active objects), Infrequent Access (40% savings, activated after 30 days without access), Archive Instant Access (68% savings, after 90 days), Archive Access (95% savings, async retrieval, must opt-in), Deep Archive Access (99% savings, 12h retrieval, must opt-in). Cost: $0.0025/1,000 objects/month monitoring fee. Minimum 128 KB object size recommendation (smaller objects may cost more with monitoring fee).',
      examTip: 'S3 storage class selection guide: Standard = frequent access, no retrieval fees. Standard-IA = infrequent access, retrieval fee, 30-day minimum. One Zone-IA = same as IA but single AZ (less HA), cheaper. Glacier Instant Retrieval = millisecond access, cheapest for infrequent. Glacier Flexible Retrieval = hours retrieval. Glacier Deep Archive = cheapest, 12h retrieval. Intelligent-Tiering = unknown/unpredictable access patterns, auto-optimization. Key: always consider retrieval fees when access patterns are unknown.'
    },
    tags: ['s3', 'intelligent-tiering', 'storage-cost', 'lifecycle', 'access-patterns']
  },
  {
    id: 'cost-005',
    stem: 'A company is paying $200,000/month for AWS services. Their Finance team has no visibility into which teams or projects are driving costs. The CTO wants to implement cost allocation, set budgets with alerts, and receive actionable recommendations. Which combination of AWS cost management tools addresses all requirements?',
    type: 'multiple',
    difficulty: 2,
    topicSlug: 'cost-optimization',
    examDomain: 'cost-optimization',
    options: [
      { id: 'a', text: 'AWS Cost Allocation Tags to attribute costs to teams/projects in the Cost Explorer reports', correct: true, explanation: 'Cost Allocation Tags (both AWS-generated and user-defined) enable cost attribution by team, project, environment, etc. After activating in Billing console, tagged resources appear in Cost Explorer filtered by tag, enabling per-team cost reporting.' },
      { id: 'b', text: 'AWS Budgets with cost and usage thresholds to send SNS/email alerts when spending approaches or exceeds limits', correct: true, explanation: 'AWS Budgets allows setting cost, usage, Savings Plans, and RI budgets with configurable alert thresholds (e.g., 80%, 100% of budget). Alerts sent via email or SNS. Supports actual and forecasted spend alerts.' },
      { id: 'c', text: 'AWS Cost Explorer Recommendations for Reserved Instance and Savings Plan purchase suggestions', correct: true, explanation: 'Cost Explorer analyzes historical usage and recommends RI purchases (EC2, RDS, ElastiCache, OpenSearch, Redshift) and Savings Plan commitments with estimated savings. Rightsizing recommendations identify over-provisioned instances.' },
      { id: 'd', text: 'Amazon CloudWatch billing alarms to alert when total AWS bill exceeds a fixed dollar amount', correct: false, explanation: 'CloudWatch billing alarms monitor total estimated charges, not per-service or per-team costs. They are less flexible than AWS Budgets, which supports filtered budgets by service, linked account, tag, etc.' }
    ],
    explanation: {
      overall: 'AWS cost management toolchain: (1) Cost Allocation Tags → attribute costs to business dimensions. (2) Cost Explorer → analyze historical costs, identify trends, forecast. (3) AWS Budgets → proactive alerts and automated actions (e.g., apply IAM policy to restrict spending when budget exceeded). (4) Trusted Advisor → identify waste (idle resources, underutilized). (5) Compute Optimizer → rightsizing recommendations. (6) AWS Cost Anomaly Detection → ML-based anomaly alerts for unexpected spending spikes.',
      examTip: 'AWS Budgets vs CloudWatch Billing Alarms: Budgets = flexible (filter by service, region, tag, linked account), forecasted AND actual spend alerts, supports RI/Savings Plan budgets, budget actions (apply SCP to limit spending). CloudWatch Billing = total account spend only, no filtering, no forecasted alerts. Always use Budgets for production cost management. Cost Anomaly Detection: ML-based, no threshold to configure, automatically detects unusual spending patterns — good supplement to static budget alerts.'
    },
    tags: ['cost-allocation-tags', 'aws-budgets', 'cost-explorer', 'cost-management', 'finops']
  },
  {
    id: 'cost-006',
    stem: 'A company uses Amazon RDS MySQL with a db.r5.4xlarge instance (64 GB RAM). CloudWatch metrics show average CPU at 8%, average RAM usage at 12 GB (19%), and storage at 200 GB. The database handles predictable OLTP workloads with occasional read replicas for reporting. What is the most cost-effective optimization without impacting performance?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'cost-optimization',
    examDomain: 'cost-optimization',
    options: [
      { id: 'a', text: 'Downsize to db.r5.xlarge (32 GB RAM) and monitor performance after the change', correct: true, explanation: 'With only 19% RAM utilization (12 GB used of 64 GB), there is significant headroom for downsizing. db.r5.xlarge has 32 GB RAM — even after downsizing, 12 GB usage leaves 62% headroom. This typically reduces RDS costs by 50% for the instance.' },
      { id: 'b', text: 'Enable RDS storage auto-scaling to reduce the provisioned 200 GB', correct: false, explanation: 'RDS storage auto-scaling only INCREASES storage automatically — it cannot reduce provisioned storage. Once storage is provisioned, it cannot be decreased (only upgraded). The correct optimization is instance downsizing.' },
      { id: 'c', text: 'Switch from Multi-AZ to Single-AZ deployment to eliminate standby instance costs', correct: false, explanation: 'Removing Multi-AZ eliminates HA and increases RTO in case of failure. For a production OLTP database, removing Multi-AZ is a risk that violates the reliability pillar. Rightsizing while maintaining Multi-AZ is the correct approach.' },
      { id: 'd', text: 'Migrate to RDS gp2 storage instead of io1 to reduce storage costs', correct: false, explanation: 'The question does not specify the storage type. If using io1 with low IOPS utilization, switching to gp3 (not gp2) would reduce costs. However, the primary optimization opportunity is the significantly over-provisioned instance size.' }
    ],
    explanation: {
      overall: 'RDS rightsizing is a primary cost optimization for over-provisioned databases. Signs of over-provisioning: CPU < 30%, RAM utilization < 30% (using CloudWatch DatabaseConnections, FreeableMemory metrics). Approach: (1) Analyze CloudWatch metrics over 2-4 weeks for peak usage. (2) Identify appropriate instance size with 20-30% headroom above peak. (3) Create a read replica of the new size to test. (4) Perform a snapshot and restore at new size, or modify the instance (RDS allows instance type modification with a few minutes of downtime).',
      examTip: 'RDS cost levers: Instance class (largest cost component — CPU+RAM). Multi-AZ (2x instance cost). Storage type: gp3 (general purpose, configure IOPS and throughput independently) vs io1 (high performance IOPS). Storage amount (provisioned GB). Automated backups (free up to DB size). Reserved DB Instances: same as EC2 RIs, 1-year or 3-year commitment, up to 69% savings vs On-Demand. For dev/test: db.t3 burstable instances are cheaper than r5 memory-optimized.'
    },
    tags: ['rds', 'rightsizing', 'cost-optimization', 'cloudwatch', 'instance-sizing']
  },
  {
    id: 'cost-007',
    stem: 'A company has a data processing pipeline that runs large Spark jobs on EMR whenever new data arrives in S3. Jobs run 4-8 hours and are triggered 3-4 times per week. The current architecture keeps the EMR cluster running 24/7 in case of unexpected data. What change reduces costs most significantly?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'cost-optimization',
    examDomain: 'cost-optimization',
    options: [
      { id: 'a', text: 'Use transient EMR clusters launched by S3 event → Lambda → Step Functions, terminated after job completion', correct: true, explanation: 'Transient clusters spin up only when needed (triggered by S3 new data events), run the Spark job, and terminate upon completion. Instead of paying for 24/7 cluster uptime, you pay only for 4-8 hours per job × 3-4 jobs/week = 12-32 hours/week vs 168 hours/week. ~80% reduction.' },
      { id: 'b', text: 'Use EMR managed scaling to scale down to 1 node when idle', correct: false, explanation: 'EMR managed scaling adjusts cluster size based on YARN metrics during job execution. It cannot scale to 0 nodes — the cluster still runs (and incurs costs) even when idle between jobs.' },
      { id: 'c', text: 'Move the Spark jobs to AWS Glue ETL with Glue Flex execution for 34% cost reduction', correct: false, explanation: 'Glue Flex reduces cost by 34% by using spare capacity. However, moving complex EMR Spark jobs to Glue requires rewriting/testing. Transient EMR clusters directly address the 24/7 idle cost (80%+ savings) without requiring application changes.' },
      { id: 'd', text: 'Purchase Reserved Instances for the EMR cluster primary node', correct: false, explanation: 'Reserved Instances provide up to 72% savings but the cluster still runs 24/7. The fundamental issue is idle time (80%+ of the week). Transient clusters eliminate idle time entirely — a much greater savings than RI discounts on always-on clusters.' }
    ],
    explanation: {
      overall: 'Transient EMR clusters are a key cost optimization pattern: (1) S3 PutObject event → EventBridge rule → Lambda/Step Functions. (2) Launch EMR cluster with required configuration. (3) Submit Spark step to run when cluster is ready. (4) Cluster auto-terminates after all steps complete (KeepJobFlowAliveWhenNoSteps = false). (5) Results written to S3. Use Spot Instances for task nodes to further reduce cost. Combine with S3 for input/output (EMRFS) to avoid data loss on termination.',
      examTip: 'EMR cost optimization: Transient vs long-running clusters = biggest decision (transient saves on idle time). Within cluster: Spot Task nodes (stateless, save 70-90%), On-Demand core/primary. EMR pricing = underlying EC2 + EMR service charge ($0.048-0.27/hr per EC2 instance on top of EC2 price). EMR Serverless = fully managed (no cluster management), scale-to-zero between jobs, no idle charges — similar cost model to transient clusters without the operational overhead of cluster lifecycle management.'
    },
    tags: ['emr', 'transient-cluster', 'cost-optimization', 'event-driven', 'spark']
  },
  {
    id: 'cost-008',
    stem: 'A company spends $30,000/month on AWS data transfer costs. Analysis shows the majority comes from EC2 instances in us-east-1 transferring data to EC2 instances in eu-west-1 for analytics. The data is replicated from us-east-1 for EU analysts. What architectural change reduces data transfer costs most effectively?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'cost-optimization',
    examDomain: 'cost-optimization',
    options: [
      { id: 'a', text: 'Move the analytics workload to us-east-1 so EU analysts connect to the same region as the data', correct: true, explanation: 'Cross-region data transfer costs $0.02/GB. Moving analytics to us-east-1 eliminates inter-region transfer costs. EU analysts connect via the internet to us-east-1 (inbound data transfer is free). This eliminates the most expensive cost component.' },
      { id: 'b', text: 'Use Amazon S3 Cross-Region Replication to replicate data and use S3 endpoints for transfer', correct: false, explanation: 'S3 CRR still incurs cross-region data transfer charges. Replicating data from us-east-1 to eu-west-1 pays the same $0.02/GB transfer cost. This does not reduce the fundamental inter-region transfer cost.' },
      { id: 'c', text: 'Use AWS Direct Connect to reduce data transfer costs between regions', correct: false, explanation: 'Direct Connect reduces costs for on-premises to AWS data transfer but does not reduce inter-region AWS-to-AWS data transfer costs. Inter-region traffic between AWS regions incurs the same cost regardless of Direct Connect.' },
      { id: 'd', text: 'Compress data before transferring between regions to reduce the volume', correct: false, explanation: 'Compression reduces data volume and thus transfer costs proportionally, but does not eliminate the per-GB charge. If analytics requires all the data, compression provides only a partial solution compared to eliminating the cross-region transfer entirely.' }
    ],
    explanation: {
      overall: 'AWS data transfer pricing: Inbound to AWS = free. Same region = free (same AZ). Same region, cross-AZ = $0.01/GB each direction. Cross-region = $0.02/GB (varies by region). Internet egress = $0.09/GB. Optimization hierarchy: (1) Keep data and compute in same AZ (free). (2) Use VPC endpoints to avoid internet egress. (3) Minimize cross-region replication. (4) Use CloudFront to cache data at edge (cheaper egress via CloudFront). (5) Compress data for cross-region transfers.',
      examTip: 'Data transfer cost hierarchy (lowest to highest): Same-AZ → Cross-AZ ($0.01/GB) → Cross-region ($0.02/GB) → Internet egress ($0.09/GB). S3 to internet via CloudFront is cheaper than direct S3 egress. S3 → EC2 in same region = free. Direct Connect egress rates are lower than internet rates. PrivateLink data processing charges apply. For the exam: always identify the data transfer pattern and consider whether moving compute closer to data eliminates transfer costs.'
    },
    tags: ['data-transfer', 'cost-optimization', 'cross-region', 'networking-costs', 'egress']
  },
  {
    id: 'cost-009',
    stem: 'A company has Amazon CloudFront distributions serving 10 TB of data per month globally. They currently use the default price class (all edge locations). 95% of their users are in North America and Europe. What change reduces CloudFront costs without significantly impacting user experience?',
    type: 'single',
    difficulty: 1,
    topicSlug: 'cost-optimization',
    examDomain: 'cost-optimization',
    options: [
      { id: 'a', text: 'Change CloudFront price class to Price Class 100 (North America and Europe edge locations only)', correct: true, explanation: 'Price Class 100 uses only North American and European edge locations, which have the lowest data transfer rates. Since 95% of users are in these regions, they still get low-latency delivery. The 5% of users outside these regions get served from the nearest Price Class 100 edge location with slightly higher latency.' },
      { id: 'b', text: 'Enable CloudFront origin shield to reduce origin data transfer costs', correct: false, explanation: 'Origin Shield adds an extra caching layer to reduce origin requests and can reduce origin data transfer costs. However, it adds $0.01/10K requests overhead. The main savings opportunity here is the edge location pricing, not origin transfer.' },
      { id: 'c', text: 'Switch from CloudFront to S3 Transfer Acceleration for global content delivery', correct: false, explanation: 'S3 Transfer Acceleration is for uploads (S3 inbound), not for global content delivery/downloads. It cannot replace CloudFront\'s CDN function of caching content at edge locations for fast downloads.' },
      { id: 'd', text: 'Enable CloudFront compression for all objects to reduce the data transferred', correct: false, explanation: 'Compression reduces data transfer volume (and thus cost) but requires objects to be compressible (not already compressed images/videos). While useful, price class reduction for a geographically concentrated audience is a more direct cost saving.' }
    ],
    explanation: {
      overall: 'CloudFront pricing is based on data transferred out and HTTP requests, with rates varying by edge location geography. Price classes: Price Class 100 (lowest price — US, Canada, Europe, Israel), Price Class 200 (+ South America, Middle East, Africa, Japan, Singapore), Price Class All (all locations — highest cost). For audiences concentrated in North America and Europe, Price Class 100 provides identical performance for 95% of users at lower cost than serving through all global edge locations.',
      examTip: 'CloudFront cost optimization: (1) Price Class — use Price Class 100 if audience is primarily US/EU. (2) Increase TTL — longer cache TTL = fewer origin requests = less origin data transfer. (3) Compress objects — reduce bytes transferred. (4) Use Origin Shield — centralize origin caching to reduce origin hits. (5) Use S3 as origin (free S3→CloudFront transfer within same region). (6) Reserved capacity pricing (commit to monthly usage for discounts). Data transfer FROM CloudFront is cheaper than FROM EC2/ALB directly.'
    },
    tags: ['cloudfront', 'price-class', 'cdn-cost', 'cost-optimization', 'edge-locations']
  },
  {
    id: 'cost-010',
    stem: 'A company uses AWS Organizations with 20 accounts. They purchase Reserved Instances in the management account. However, the RI discounts are not being applied to usage in member accounts. What must be configured to share RI discounts across the organization?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'cost-optimization',
    examDomain: 'cost-optimization',
    options: [
      { id: 'a', text: 'Enable RI sharing in AWS Organizations Billing & Cost Management settings (turned on by default for new organizations)', correct: true, explanation: 'Reserved Instance sharing (consolidated billing) is managed in the management account\'s Billing settings. When enabled, unused RIs in any account in the organization are automatically applied to matching On-Demand usage in other accounts. This is on by default for organizations created after 2019.' },
      { id: 'b', text: 'Purchase RIs in each member account individually to apply discounts in that account', correct: false, explanation: 'This approach works but eliminates the benefit of portfolio optimization — individual accounts may over-purchase while others under-utilize. Centralized RI/Savings Plans management is more efficient with sharing enabled.' },
      { id: 'c', text: 'Create IAM policies in member accounts to allow the management account to apply RI discounts', correct: false, explanation: 'RI sharing is managed at the Billing & Cost Management level, not through IAM policies. IAM policies control service access, not billing discount sharing between accounts.' },
      { id: 'd', text: 'Use AWS RAM (Resource Access Manager) to share the Reserved Instance capacity', correct: false, explanation: 'AWS RAM shares AWS resource types (VPC subnets, Route 53 Resolver rules, etc.) but does not manage Reserved Instance discount sharing. RI sharing is a billing feature managed in Billing & Cost Management settings.' }
    ],
    explanation: {
      overall: 'AWS Organizations Consolidated Billing enables: (1) Single bill for all accounts. (2) Volume pricing benefits (aggregate usage for tiered pricing). (3) RI and Savings Plan sharing across accounts. When RI sharing is enabled, the Billing system applies RI discounts to matching usage across all organization accounts automatically, maximizing RI utilization. Individual accounts can turn off sharing for their account if they do not want to receive or donate RI discounts.',
      examTip: 'Consolidated Billing benefits: Combined usage tier pricing (e.g., S3 first 50 TB/month at one rate — aggregate across all accounts). RI/SP sharing: unused RIs/SPs in Account A automatically apply to On-Demand usage in Account B. Savings Plan hourly commitment applies to usage across all org accounts (most-discounted usage first). Best practice: purchase Savings Plans and RIs in a central payer account or a dedicated "FinOps" member account, share across org. Turn off RI sharing for accounts that should be billed at full On-Demand rates (chargebacks).'
    },
    tags: ['organizations', 'reserved-instances', 'consolidated-billing', 'ri-sharing', 'finops']
  },
  {
    id: 'cost-011',
    stem: 'A company runs Lambda functions that process images uploaded to S3. Each invocation takes 800ms on average with 1 GB memory. They have 500,000 invocations per day. Lambda costs are $400/month. A developer proposes reducing memory to 512 MB to cut costs in half. What is the likely outcome?',
    type: 'single',
    difficulty: 3,
    topicSlug: 'cost-optimization',
    examDomain: 'cost-optimization',
    options: [
      { id: 'a', text: 'Reducing memory may increase execution duration proportionally, resulting in the same or higher cost with degraded performance', correct: true, explanation: 'Lambda CPU allocation is proportional to memory. Halving memory (1024 MB → 512 MB) halves the CPU allocation, likely doubling execution time (800ms → 1600ms). Lambda charges: memory × duration × invocations. Half memory × double time = same cost, but with worse performance.' },
      { id: 'b', text: 'Reducing memory to 512 MB will reduce costs by 50% since Lambda charges per GB-second', correct: false, explanation: 'This assumes execution time remains constant, which is unlikely for CPU-intensive image processing. Lambda CPU is proportional to memory — less memory means less CPU, which means longer execution time, potentially offsetting the memory savings.' },
      { id: 'c', text: 'Use Lambda Power Tuning tool to empirically find the optimal memory/cost configuration', correct: false, explanation: 'While AWS Lambda Power Tuning is an excellent tool for finding the optimal memory setting, the question asks about the LIKELY OUTCOME of the developer\'s specific proposal, not the correct general approach.' },
      { id: 'd', text: 'Increase memory to 2 GB to double CPU and reduce execution time, potentially lowering total cost', correct: false, explanation: 'Increasing memory increases CPU (shorter duration) and might reduce cost if duration decreases by more than the memory increase. However, for image processing already at 1 GB, doubling may not proportionally halve the execution time due to I/O bound operations.' }
    ],
    explanation: {
      overall: 'Lambda cost = (memory GB × duration seconds × invocations × $0.0000166667). Memory and CPU are directly proportional. For CPU-bound workloads (like image processing), halving memory typically doubles or more than doubles execution time — resulting in the same or higher cost with worse performance. The correct approach: use AWS Lambda Power Tuning (open-source Step Functions state machine) to test different memory configurations, measure actual duration, and calculate cost at each setting to find the optimal memory-cost tradeoff.',
      examTip: 'Lambda optimization: compute-intensive (image processing, compression, encryption) = MORE memory → more CPU → faster execution → may be cheaper overall. I/O bound (waiting for DynamoDB, S3, external APIs) = increasing memory above 512 MB has diminishing returns. Lambda Power Tuning: automates testing multiple memory sizes and finds the optimal setting. Also consider: Lambda Snap Start (Java), Lambda layers for dependency sharing, reducing deployment package size. Cold start: more memory = faster cold start (more CPU for initialization).'
    },
    tags: ['lambda', 'cost-optimization', 'memory-configuration', 'power-tuning', 'cpu-allocation']
  },
  {
    id: 'cost-012',
    stem: 'A company has 2 PB of archival data that must be retained for 7 years for compliance. The data is accessed less than once per year on average, and when accessed, retrieval within 48 hours is acceptable. The company wants to minimize storage costs. What storage class minimizes cost?',
    type: 'single',
    difficulty: 1,
    topicSlug: 'cost-optimization',
    examDomain: 'cost-optimization',
    options: [
      { id: 'a', text: 'Amazon S3 Glacier Deep Archive with Bulk retrieval (12-48 hours)', correct: true, explanation: 'Glacier Deep Archive is the cheapest AWS storage at $0.00099/GB-month (~$1/TB-month). Bulk retrieval (free but slowest, up to 48 hours) meets the 48-hour retrieval requirement. For 2 PB held 7 years, Deep Archive saves vs Glacier Flexible Retrieval.' },
      { id: 'b', text: 'Amazon S3 Glacier Flexible Retrieval (formerly Glacier) with Standard retrieval (3-5 hours)', correct: false, explanation: 'Glacier Flexible Retrieval costs ~$0.004/GB-month — 4x more expensive than Deep Archive. If 48-hour retrieval is acceptable, Deep Archive is the cheapest option for compliance archival.' },
      { id: 'c', text: 'Amazon S3 Glacier Instant Retrieval for millisecond access to archived data', correct: false, explanation: 'Glacier Instant Retrieval costs ~$0.023/GB-month — more expensive than both Flexible Retrieval and Deep Archive. The millisecond access feature is unnecessary if 48-hour retrieval is acceptable.' },
      { id: 'd', text: 'Amazon S3 Standard-IA with Intelligent-Tiering enabled for automatic cost optimization', correct: false, explanation: 'Standard-IA costs $0.0125/GB-month — significantly more expensive than Glacier Deep Archive ($0.00099/GB). For data accessed less than once per year with 48-hour acceptable retrieval, Deep Archive is dramatically cheaper.' }
    ],
    explanation: {
      overall: 'S3 storage cost comparison per GB-month (US East): Standard = $0.023, Standard-IA = $0.0125, One Zone-IA = $0.01, Glacier Instant = $0.023, Glacier Flexible = $0.0036, Glacier Deep Archive = $0.00099. For 2 PB held 7 years: Deep Archive = 2,000,000 GB × $0.00099 × 84 months = $166,320 total vs Standard-IA = $2,100,000 total. Deep Archive savings: 92% vs Standard-IA. Note: minimum storage duration 180 days and $0.10/1,000 objects retrieval request fee for Deep Archive.',
      examTip: 'S3 retrieval times: Glacier Instant = milliseconds. Glacier Flexible = Expedited (1-5 min, high cost), Standard (3-5 hours), Bulk (5-12 hours, free). Deep Archive = Standard (12 hours), Bulk (48 hours, free). For the exam: cheapest long-term archival = Deep Archive. 48-hour or longer acceptable retrieval = use Bulk retrieval (free). Compliance retention: use S3 Object Lock in Compliance mode to prevent deletion. Glacier Vault Lock for compliance with worm policies on legacy Glacier vaults.'
    },
    tags: ['glacier-deep-archive', 'archival', 'cost-optimization', 'compliance', 'storage-class']
  },
  {
    id: 'cost-013',
    stem: 'A company wants to implement a chargeback model in AWS Organizations where each business unit is billed for their actual AWS consumption. They have 15 member accounts, one per business unit. How should they implement cost attribution and reporting?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'cost-optimization',
    examDomain: 'cost-optimization',
    options: [
      { id: 'a', text: 'Enable AWS Cost and Usage Report (CUR) with resource-level detail, use Athena to query CUR data filtered by linked account ID for per-account cost reporting', correct: true, explanation: 'CUR provides the most granular billing data (hourly/daily, resource-level). Export to S3, query with Athena. Filter by linked_account_id to get per-account costs. This enables accurate chargeback reports showing exactly what each business unit consumed.' },
      { id: 'b', text: 'Use AWS Cost Explorer with account-level filtering to view per-account costs monthly', correct: false, explanation: 'Cost Explorer provides per-account views and is good for analysis and visualization. However, for automated chargeback reporting and data export/integration with finance systems, CUR with Athena provides more flexibility and granularity.' },
      { id: 'c', text: 'Implement separate AWS Organizations for each business unit with separate billing', correct: false, explanation: 'Separate organizations lose the volume pricing and RI sharing benefits of consolidated billing. Using separate accounts within a single organization (as described) is the correct architecture for account-level cost isolation.' },
      { id: 'd', text: 'Use AWS Service Catalog to track which business units provision which resources', correct: false, explanation: 'Service Catalog provides self-service provisioning of approved resource templates. It does not track costs or generate billing reports. Cost attribution requires billing tools (CUR, Cost Explorer) and tagging.' }
    ],
    explanation: {
      overall: 'AWS Cost and Usage Report (CUR) is the most comprehensive billing data source. Configuration: S3 bucket destination, Parquet format (for Athena efficiency), resource-level detail (shows individual resource charges). Query with Athena: CREATE TABLE using AWS Glue Data Catalog, query by line_item_usage_account_id for per-account costs, line_item_resource_id for resource-level attribution, resource_tags for tag-based chargeback. Can integrate CUR data with QuickSight for executive dashboards or push to internal finance systems via Lambda.',
      examTip: 'Cost reporting tools: CUR = most granular (every line item, every resource, hourly), export to S3, requires Athena/BI tool to analyze. Cost Explorer = managed UI + API, pre-aggregated, 12-month history, 12-month forecast, recommended for standard analysis. Budgets = proactive alerting. For chargeback/showback: CUR + Athena + QuickSight is the recommended AWS solution for automated, scalable cost attribution. Tag enforcement: use AWS Config rule required-tags to ensure resources have cost allocation tags.'
    },
    tags: ['cur', 'cost-allocation', 'chargeback', 'organizations', 'athena']
  },
  {
    id: 'cost-014',
    stem: 'A company uses Amazon ECS on Fargate for containerized microservices. They notice Fargate costs are high because developers provision 4 vCPU / 16 GB for all tasks, even simple services that need much less. The company wants to automatically identify over-provisioned Fargate tasks and recommend appropriate sizing. Which service provides this?',
    type: 'single',
    difficulty: 1,
    topicSlug: 'cost-optimization',
    examDomain: 'cost-optimization',
    options: [
      { id: 'a', text: 'AWS Compute Optimizer with ECS on Fargate recommendations based on CloudWatch Container Insights metrics', correct: true, explanation: 'Compute Optimizer supports ECS on Fargate recommendations. It analyzes Container Insights metrics (CPU and memory utilization) and recommends appropriate vCPU and memory configurations for each service, identifying over-provisioned tasks with estimated savings.' },
      { id: 'b', text: 'AWS Trusted Advisor with ECS task sizing recommendations', correct: false, explanation: 'Trusted Advisor does not provide ECS Fargate-specific rightsizing recommendations. It covers EC2, EBS, RDS, and other services but Fargate task sizing optimization is specifically within Compute Optimizer\'s scope.' },
      { id: 'c', text: 'Amazon CloudWatch Container Insights with custom dashboards to track task utilization', correct: false, explanation: 'Container Insights collects and displays metrics but does not provide recommendations or automated cost savings analysis. Compute Optimizer analyzes Container Insights data and generates actionable rightsizing recommendations.' },
      { id: 'd', text: 'AWS Cost Explorer with Fargate usage type filtering to identify high-cost services', correct: false, explanation: 'Cost Explorer can identify which ECS services are most expensive but does not analyze utilization or recommend specific vCPU/memory configurations for rightsizing.' }
    ],
    explanation: {
      overall: 'AWS Compute Optimizer supports Fargate task rightsizing as of 2023. It requires CloudWatch Container Insights to be enabled (to collect CPU/memory utilization metrics). Compute Optimizer analyzes 14 days of metrics and recommends: new CPU/memory configuration, estimated performance risk level, and estimated monthly savings. For a task configured at 4 vCPU / 16 GB using only 0.5 vCPU / 2 GB, Compute Optimizer would recommend 1 vCPU / 4 GB — saving ~75% of compute costs.',
      examTip: 'Compute Optimizer supported resources: EC2 instances, EC2 Auto Scaling groups, EBS volumes, Lambda functions, ECS services on Fargate. Requirements for Fargate: CloudWatch Container Insights must be enabled on the ECS cluster. Compute Optimizer enhanced recommendations (3-month lookback): available with Compute Optimizer paid tier. For Lambda: recommends optimal memory settings based on actual invocation durations. Remember: Compute Optimizer requires opt-in at the account or organization level.'
    },
    tags: ['compute-optimizer', 'fargate', 'ecs', 'rightsizing', 'container-insights']
  },
  {
    id: 'cost-015',
    stem: 'A company receives a $50,000 unexpected AWS bill for one month. Investigation reveals an S3 bucket was made public and was being used by external parties for large-scale data downloads. They want to implement controls to prevent both the security incident and unexpected cost spikes. What preventive controls should they implement? (Select TWO)',
    type: 'multiple',
    difficulty: 2,
    topicSlug: 'cost-optimization',
    examDomain: 'cost-optimization',
    options: [
      { id: 'a', text: 'Enable S3 Block Public Access at the organization level via Service Control Policy to prevent any bucket from becoming public', correct: true, explanation: 'An SCP requiring S3 Block Public Access (or denying s3:PutBucketAcl public grants) prevents any member account from making buckets public organization-wide. This addresses the root cause of the security incident.' },
      { id: 'b', text: 'Configure AWS Budgets with a cost anomaly detection alert and automatic action to apply an SCP that restricts new resource creation when budget is exceeded', correct: true, explanation: 'AWS Cost Anomaly Detection uses ML to detect unusual spending patterns (like sudden S3 data transfer spikes) and sends immediate alerts. Budget Actions can automatically apply IAM policies or SCPs to throttle spending when anomalies are detected.' },
      { id: 'c', text: 'Enable CloudTrail to log all S3 API calls for post-incident forensics', correct: false, explanation: 'CloudTrail logging is valuable for forensics after an incident but does not prevent the incident or unexpected costs. Preventive controls (BPA, anomaly detection) are more valuable than detective controls for this question.' },
      { id: 'd', text: 'Implement S3 requester-pays to charge external requesters for data transfer costs', correct: false, explanation: 'Requester-pays requires requesters to authenticate (have valid AWS credentials) and charges them for data transfer. It helps in controlled sharing scenarios but does not prevent unauthorized public access or the associated security risk.' }
    ],
    explanation: {
      overall: 'Defense-in-depth for S3 cost and security: (1) Preventive: SCP with Block Public Access org-wide, deny public ACL grants. (2) Detective: S3 Server Access Logging, CloudTrail data events, AWS Config s3-bucket-public-read-prohibited rule. (3) Responsive: Cost Anomaly Detection + Budget Actions to automatically restrict IAM actions when anomalies detected. (4) Monitoring: S3 Storage Lens + CloudWatch metrics for BucketSizeBytes and NumberOfObjects trends.',
      examTip: 'Cost Anomaly Detection vs Budgets: Anomaly Detection = ML-based, no threshold needed, detects relative spikes. Budgets = absolute threshold (alert at $X). Both are complementary. Budget Actions: when budget threshold breached → automatically apply IAM policy (to the affected account), target EC2/RDS services, or notify via SNS. S3 security prevention hierarchy: Block Public Access (account/bucket level) → Bucket policy conditions → SCP (organization level, cannot be overridden by member accounts).'
    },
    tags: ['cost-anomaly-detection', 's3-block-public-access', 'scp', 'budget-actions', 'cost-governance']
  }
];
