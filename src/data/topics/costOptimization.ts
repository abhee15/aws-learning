import type { Topic } from '../../types/topic';

export const costOptimizationTopic: Topic = {
  id: 'cost-optimization',
  slug: 'cost-optimization',
  title: 'Cost Optimization Strategies',
  shortTitle: 'Cost Opt',
  icon: 'DollarSign',
  color: 'lime',
  examDomains: ['cost-optimization', 'continuous-improvement'],
  estimatedStudyHours: 4,
  summaryBullets: [
    'EC2: Savings Plans (1 or 3yr, up to 72% off) and Reserved Instances for predictable workloads. Spot for fault-tolerant batch',
    'Right-sizing: AWS Compute Optimizer analyzes CloudWatch metrics and recommends optimal instance types',
    'S3 Intelligent-Tiering automatically moves objects to cheaper storage tiers based on access patterns',
    'Cost visibility: AWS Cost Explorer, AWS Budgets, Cost Allocation Tags, AWS Cost Anomaly Detection',
    'Data transfer: minimize cross-AZ, cross-region, and egress costs. Use VPC Endpoints to avoid NAT Gateway charges',
  ],
  relatedTopics: ['compute', 's3', 'databases'],
  subtopics: [
    {
      id: 'cost-compute',
      title: 'Compute Cost Optimization',
      sections: [
        {
          id: 'cost-ec2-pricing',
          title: 'EC2 Pricing Models & Selection',
          content: '**EC2 Pricing Models** — selecting the right model for each workload is the single largest lever for compute cost reduction:\n\n**On-Demand**: No commitment, pay per second (Linux) or per hour. Highest price. Use for: unpredictable workloads, testing, short-term spiky traffic.\n\n**Reserved Instances (RI)**: 1-year or 3-year commitment. Up to 72% discount vs On-Demand.\n- Standard RI: fixed instance family, OS, tenancy, region. Largest discount. Can sell on RI Marketplace.\n- Convertible RI: can change instance family, OS, tenancy during term. Smaller discount (~54%). Cannot sell on Marketplace.\n- Regional vs Zonal RI: Regional applies flexibility across instance sizes in same family in any AZ. Zonal reserves capacity in a specific AZ.\n- Scheduled RI: capacity reserved for recurring time windows (e.g., batch job every Friday 6-10pm). Being retired — use Savings Plans instead.\n\n**Savings Plans**: More flexible commitment than RIs. 1 or 3-year term. Two types:\n- Compute Savings Plans: apply to EC2 (any family, size, region, OS), Fargate, and Lambda. Up to 66% off.\n- EC2 Instance Savings Plans: specific instance family + region. Up to 72% off (same as Standard RI). More flexible than RI within the family.\n\n**Key difference**: Savings Plans apply automatically across eligible compute usage — no need to manage RI assignments. RI unused hours are wasted; Savings Plans automatically apply to cheapest eligible usage.\n\n**Spot Instances**: Use spare EC2 capacity at up to 90% discount. Can be interrupted with 2-minute warning. Use for: batch jobs, data processing, ML training, stateless web tier (with Auto Scaling Groups). Strategies:\n- Spot Instance Pools: specify multiple instance types + AZs to reduce interruption risk\n- Spot Fleet / EC2 Fleet: automatically diversify across pools to maintain target capacity\n- Spot interruption handling: use Spot interruption notices (via EventBridge) to gracefully drain tasks before termination\n\n**Dedicated Hosts**: Physical server dedicated to you. Use for: software licenses bound to physical CPU (Oracle, Windows Server per-core licensing). Most expensive model — only use when licensing requires it.\n\n**Rightsizing**: Match instance size to actual workload requirements.\n- AWS Compute Optimizer: analyzes 14 days of CloudWatch metrics (CPU, network, disk) → recommends optimal instance type. Considers burstable instances (T-series) for spiky low-average CPU.\n- Graviton (ARM-based): 20-40% better price/performance than x86 equivalents. Available for EC2, RDS, Lambda, ElastiCache, OpenSearch. Use for: any workload with compiled binaries or runtime support.\n\n**Lambda cost optimization**:\n- Right-size memory: CPU allocated proportional to memory. Optimize with Lambda Power Tuning (open source).\n- Arm64 (Graviton2): 20% cheaper and 19% better performance vs x86 Lambda.\n- Provisioned Concurrency: only enable for latency-sensitive APIs — it costs money even when idle.',
          keyPoints: [
            { text: 'Compute Savings Plans: most flexible commitment — automatically applies to EC2, Fargate, Lambda across any region/family/OS. Lower discount than EC2 Instance Savings Plans but no management overhead', examTip: true },
            { text: 'Spot Instances: up to 90% discount. Use Instance Fleets with multiple pools (diverse instance types + AZs) to minimize interruption probability', examTip: true },
            { text: 'Graviton instances: 20-40% better price/performance. Low-risk migration — same APIs, most languages/runtimes supported natively', examTip: true },
            { text: 'Convertible RIs cannot be sold on the RI Marketplace (Standard RIs can). Convertible offers flexibility but lower discount than Standard', gotcha: true },
          ],
          bestPractices: [
            { pillar: 'cost-optimization', text: 'Cover baseline steady-state compute with Savings Plans (simpler to manage than RIs). Layer Spot Instances for scale-out capacity in Auto Scaling Groups. On-Demand only for truly unpredictable capacity.' },
            { pillar: 'cost-optimization', text: 'Run AWS Compute Optimizer monthly — identify over-provisioned instances and migrate to rightsized or Graviton equivalents. Each instance family step down = 20-30% cost reduction.' },
            { pillar: 'operational-excellence', text: 'Set up Spot interruption handling in all Auto Scaling Groups — use lifecycle hooks + EventBridge to drain connections gracefully before Spot reclamation.' },
          ],
          comparisons: [
            {
              headers: ['Pricing Model', 'Discount vs On-Demand', 'Commitment', 'Interruptible', 'Best For'],
              rows: [
                ['On-Demand', '0%', 'None', 'No', 'Unpredictable, short-term'],
                ['Compute Savings Plans', 'Up to 66%', '1 or 3 year spend', 'No', 'Mixed EC2/Fargate/Lambda'],
                ['EC2 Instance Savings Plans', 'Up to 72%', '1 or 3 year spend', 'No', 'Steady EC2, specific family'],
                ['Standard Reserved', 'Up to 72%', '1 or 3 year instance', 'No', 'Stable, single instance type'],
                ['Convertible Reserved', 'Up to 54%', '1 or 3 year', 'No', 'Stable but may need flexibility'],
                ['Spot', 'Up to 90%', 'None', 'Yes (2 min warning)', 'Batch, stateless, fault-tolerant'],
                ['Dedicated Host', 'N/A (premium)', '1 or 3 year', 'No', 'BYOL software licensing'],
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'cost-storage',
      title: 'Storage Cost Optimization',
      sections: [
        {
          id: 'cost-s3-optimization',
          title: 'S3 & Storage Tiering',
          content: '**S3 Storage Cost Optimization**:\n\n**S3 Intelligent-Tiering**: Automatically moves objects between access tiers based on access patterns. No retrieval fee (unlike Glacier). Small monthly monitoring fee per object. Tiers:\n- Frequent Access: same cost as S3 Standard\n- Infrequent Access: 40% lower cost (after 30 days without access)\n- Archive Instant Access: 68% lower cost (after 90 days)\n- Archive Access: 95% lower cost (optional, async retrieval)\n- Deep Archive: 95% lower cost (optional, async retrieval)\n\nUse Intelligent-Tiering when access patterns are unknown or variable — eliminates guesswork about lifecycle policy thresholds.\n\n**S3 Lifecycle Policies**: Explicit transition rules based on age.\n- Transition Standard → Standard-IA after 30 days\n- Transition to Glacier Instant Retrieval after 90 days\n- Transition to Glacier Flexible/Deep Archive after 180 days\n- Expire objects after retention period\n- Abort incomplete multipart uploads (common source of unexpected cost — set 7-day expiration)\n\n**S3 Storage Lens**: Organization-wide S3 analytics. Identifies buckets with anomalous costs, large incomplete multipart uploads, non-standard storage classes, replication costs. Use for: cost attribution and identifying optimization opportunities across hundreds of buckets.\n\n**EBS Cost Optimization**:\n- Migrate gp2 → gp3: 20% cheaper, independent IOPS/throughput provisioning\n- Snapshot Archive: move old snapshots to archive tier (75% cheaper). 24-72 hour retrieval.\n- Delete unattached volumes: EBS volumes continue to accrue charges even when not attached to any instance. Use AWS Config rule `ec2-volume-inuse-check` to identify.\n- Delete old snapshots: automated with DLM retention policies\n\n**EFS Cost Optimization**:\n- Enable EFS Lifecycle Policy: move files not accessed in 7-90 days to EFS-IA (85% cheaper)\n- EFS One Zone: 47% cheaper than multi-AZ Standard for non-critical file systems\n\n**Storage type selection**:\n- Frequently accessed objects: S3 Standard\n- Infrequent access, millisecond retrieval: S3 Standard-IA or Glacier Instant Retrieval\n- Archive, minutes retrieval: S3 Glacier Flexible Retrieval\n- Archive, long-term compliance: S3 Glacier Deep Archive ($0.00099/GB/month)\n- Unknown access patterns: S3 Intelligent-Tiering',
          keyPoints: [
            { text: 'S3 Intelligent-Tiering: no retrieval fees for Frequent/Infrequent/Archive Instant tiers. Use when access patterns are unknown. Monitoring fee: $0.0025 per 1,000 objects/month', examTip: true },
            { text: 'Abort incomplete multipart uploads: often overlooked cost. Set lifecycle rule to abort after 7 days — can save significant cost on buckets with many failed uploads', examTip: true },
            { text: 'EBS gp2→gp3 migration: zero downtime, 20% cheaper, enables independent IOPS/throughput vs size coupling in gp2', examTip: true },
            { text: 'Unattached EBS volumes: continue to be charged even without an instance. Regularly audit with AWS Config or Cost Explorer', gotcha: true },
          ],
          bestPractices: [
            { pillar: 'cost-optimization', text: 'Apply S3 Intelligent-Tiering to all S3 buckets with objects > 128KB and unknown/variable access patterns — self-managing cost optimization without lifecycle policy maintenance' },
            { pillar: 'cost-optimization', text: 'Audit EBS volumes monthly with AWS Config ec2-volume-inuse-check rule — unattached volumes and oversized gp2 volumes are common hidden cost sources' },
            { pillar: 'operational-excellence', text: 'Use S3 Storage Lens with advanced metrics to identify cost optimization opportunities across the organization — prioritize largest buckets and buckets with non-optimal storage classes' },
          ],
        },
      ],
    },
    {
      id: 'cost-network',
      title: 'Network & Data Transfer Costs',
      sections: [
        {
          id: 'cost-data-transfer',
          title: 'Minimizing Data Transfer Costs',
          content: '**Data Transfer Pricing Model** (free and paid):\n- **Free**: Data INTO AWS (ingress). Within same AZ using private IP. CloudFront to internet (lower than EC2 egress). Between S3 and CloudFront. Between S3/DynamoDB and resources in same region via VPC Gateway Endpoints.\n- **Paid**: Data OUT of AWS to internet (egress). Cross-region data transfer. Cross-AZ data transfer (within same region, between AZs).\n\n**Cross-AZ transfer costs**: $0.01/GB each direction. Often overlooked. Sources of hidden cross-AZ cost:\n- ALB in one AZ serving targets in another AZ (ALB automatically load balances across AZs)\n- Multi-AZ RDS: replica in different AZ replicates synchronously — write amplification\n- ElastiCache cluster nodes across AZs\n- Mitigation: use AZ-aware load balancing (prefer same-AZ targets). Use local zone replicas where possible.\n\n**VPC Endpoints to eliminate NAT Gateway costs**:\n- NAT Gateway: $0.045/hour + $0.045/GB processed. High-traffic services like S3, DynamoDB, SQS, SNS accessed through NAT Gateway generate significant cost.\n- S3 Gateway Endpoint: FREE. Redirect all S3 traffic from NAT Gateway through endpoint — direct route within AWS network. No per-GB cost.\n- Interface Endpoints (PrivateLink): hourly cost + $0.01/GB. Cheaper than NAT Gateway + internet egress for services like KMS, STS, ECR, CloudWatch.\n\n**CloudFront for egress reduction**:\n- CloudFront data transfer to internet: ~50-60% cheaper than EC2/S3 direct egress\n- CloudFront edge caching: serves repeated requests from cache — reduces origin traffic and origin data transfer\n- S3 → CloudFront transfer: FREE within AWS. Only pay for CloudFront → user egress.\n\n**Data transfer optimization architecture**:\n1. Use S3 Gateway Endpoint for all S3 access from VPC (free, eliminates NAT Gateway cost for S3)\n2. Use CloudFront for all user-facing content (lower egress, caching reduces origin load)\n3. Use same-AZ for read replicas and caches (reduce cross-AZ replication traffic)\n4. Use Direct Connect for large consistent data flows to on-premises (lower cost than internet egress at scale)\n5. Use VPC Peering instead of Transit Gateway for simple VPC-to-VPC connections (TGW charges per GB + per attachment hour)',
          keyPoints: [
            { text: 'S3 Gateway Endpoint is FREE — always use it for EC2→S3 access in a VPC. Eliminates NAT Gateway charges for S3 traffic, which can be the largest NAT Gateway cost driver', examTip: true },
            { text: 'Cross-AZ data transfer: $0.01/GB in each direction. ALB, RDS Multi-AZ, and ElastiCache clusters spanning AZs all generate cross-AZ charges', examTip: true },
            { text: 'CloudFront egress cost ≈ 50% of direct EC2/S3 egress to internet. Use CloudFront for all user-facing static/dynamic content', examTip: true },
            { text: 'VPC Peering vs Transit Gateway cost: Peering is free for setup (pay data transfer only). TGW charges $0.05/GB + $0.07/attachment/hour — use Peering for simple hub-spoke when < 5 VPCs', gotcha: true },
          ],
          bestPractices: [
            { pillar: 'cost-optimization', text: 'Audit NAT Gateway data processing costs monthly — replace S3/DynamoDB traffic with Gateway Endpoints (free). Replace ECR/KMS/SSM traffic with Interface Endpoints (cheaper than NAT+internet).' },
            { pillar: 'cost-optimization', text: 'Enable CloudFront for all public-facing S3/EC2 content — reduces internet egress costs 40-60% and improves global latency. S3→CloudFront transfer is free within AWS.' },
            { pillar: 'reliability', text: 'Architect for same-AZ locality in the data path: App server → Cache → Database in the same AZ. Cross-AZ traffic = latency + cost. Use az-id-aware placement in launch templates.' },
          ],
        },
      ],
    },
    {
      id: 'cost-visibility',
      title: 'Cost Visibility & Governance',
      sections: [
        {
          id: 'cost-tools',
          title: 'AWS Cost Management Tools',
          content: '**AWS Cost Explorer**: Visualize, understand, and analyze AWS costs and usage. Time period: up to 12 months historical, 12 months forecast. Filter/group by: service, linked account, region, tag, instance type. Granularity: monthly, daily, hourly (for EC2). RI/Savings Plans utilization reports. Rightsizing recommendations.\n\n**AWS Budgets**: Proactive cost control. Four budget types:\n- Cost budget: alert when spend exceeds $X\n- Usage budget: alert on service usage (EC2 hours, S3 GB)\n- RI Utilization: alert when RI utilization drops below threshold (under-utilized commitments)\n- RI Coverage: alert when EC2 On-Demand spend exceeds target (not enough RI coverage)\n- Savings Plans coverage/utilization budgets\nActions: automatically apply SCPs or IAM policies when budget threshold is breached (stop runaway spend).\n\n**Cost Allocation Tags**: Tag resources (Cost Center, Team, Project, Environment). Activate tags in billing console. Tags appear in Cost Explorer, cost reports, and detailed billing. Required for: chargeback, showback, team-level visibility.\n\n**AWS Cost Anomaly Detection**: ML-based anomaly detection on cost data. Monitors services independently. Alerts on spend that deviates from expected pattern. Configured monitors: AWS services, linked accounts, cost categories. Alert via SNS when anomaly detected. Catches: forgotten running resources, accidental large deployments, unusual API usage.\n\n**AWS Pricing Calculator**: Estimate costs for planned architectures before building. Compare service options. Export estimate to share with stakeholders.\n\n**Trusted Advisor**: Automated best practice checks across cost, performance, security, fault tolerance, service limits. Cost checks: idle EC2 instances, underutilized EBS, unused Elastic IPs, RI purchase recommendations. Free tier: 6 checks. Business/Enterprise: all checks + programmatic access.\n\n**AWS Organizations & Cost Management**:\n- Consolidated billing: aggregate usage across all accounts → volume discounts apply at org level. RI/Savings Plans automatically shared across accounts.\n- Cost Categories: group accounts/services/tags into logical categories for reporting (by team, by product, by environment)\n- Service Control Policies (SCPs): prevent expensive resource types or regions (e.g., deny GPU instances in dev accounts)',
          keyPoints: [
            { text: 'Cost Allocation Tags must be activated in the Billing console before they appear in Cost Explorer — resources tagged before activation are not retroactively attributed', gotcha: true },
            { text: 'Consolidated billing: volume discounts apply across all member accounts. RI and Savings Plans from any account apply to eligible usage across the organization', examTip: true },
            { text: 'Budgets Actions: automatically apply SCP or IAM policy when budget threshold is breached — stop overspending without human intervention', examTip: true },
            { text: 'Cost Anomaly Detection: ML-based, monitors each service separately. More effective than static budget alerts for catching unexpected cost spikes from specific services', examTip: true },
          ],
          bestPractices: [
            { pillar: 'cost-optimization', text: 'Enforce cost allocation tags via AWS Config tag compliance rules — ensure 100% of resources have Team and CostCenter tags for accurate chargeback reporting' },
            { pillar: 'cost-optimization', text: 'Set up Cost Anomaly Detection monitors for each major service — ML-based alerts catch unexpected spikes faster than static budget thresholds for variable workloads' },
            { pillar: 'operational-excellence', text: 'Use Budget Actions to automatically apply SCPs restricting expensive instance types in dev/test accounts when monthly budget is exceeded — prevents cost overruns without manual intervention' },
          ],
          comparisons: [
            {
              headers: ['Tool', 'Purpose', 'Reactive/Proactive', 'Key Feature'],
              rows: [
                ['Cost Explorer', 'Analyze past spend', 'Reactive (analyze)', 'Rightsizing, RI recommendations, forecast'],
                ['AWS Budgets', 'Alert on spend targets', 'Proactive (alert/action)', 'Budget Actions to apply SCP/IAM automatically'],
                ['Cost Anomaly Detection', 'Detect unexpected spikes', 'Proactive (ML alert)', 'ML-based, per-service monitoring'],
                ['Trusted Advisor', 'Best practice checks', 'Both', 'Idle resources, RI recommendations'],
                ['Compute Optimizer', 'Rightsizing recommendations', 'Reactive (recommend)', 'ML analysis of CloudWatch metrics for EC2/Lambda/RDS'],
                ['Cost Allocation Tags', 'Cost attribution', 'Ongoing governance', 'Chargeback to teams/projects'],
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'cost-database',
      title: 'Database & Serverless Cost Optimization',
      sections: [
        {
          id: 'cost-db-serverless',
          title: 'Database and Serverless Cost Strategies',
          content: '**RDS Cost Optimization**:\n- Reserved Instances: 1 or 3-year commitment for RDS instances — up to 69% discount. Apply per instance class + engine.\n- Multi-AZ cost: standby replica doubles instance cost (two instances running). Only use Multi-AZ for production databases requiring HA.\n- Aurora Serverless v2: scales to zero when idle (dev/test). For production: scales smoothly between minimum and maximum ACUs. Avoid over-provisioning minimum ACUs.\n- Read Replicas on Graviton: Graviton-based RDS instances offer 20-35% better price/performance.\n- Stop/Start RDS: stop dev/test instances during off-hours. RDS can be stopped for up to 7 days (automatically restarts after 7 days to apply patches).\n\n**DynamoDB Cost Optimization**:\n- On-Demand vs Provisioned: Provisioned with Auto Scaling is 2.5x-5x cheaper than On-Demand for predictable traffic. On-Demand adds 2.5x premium for flexibility.\n- Reserved Capacity: purchase 100+ RCU/WCU for 1 or 3 years — 76% discount on provisioned throughput cost.\n- DynamoDB Standard-IA: 60% cheaper for data not accessed frequently. Minimum 128KB per item for IA to be cost-effective.\n- TTL (Time to Live): automatically delete expired items at no cost — reduces storage charges for time-series or session data.\n\n**Lambda Cost Optimization**:\n- ARM64 (Graviton2): 20% cheaper per GB-second + 19% faster = 34% cost reduction for CPU-bound functions.\n- Memory rightsizing: CPU scales with memory. Lambda Power Tuning (AWS open-source) finds optimal memory/cost balance.\n- Avoid long idle functions: Lambda is billed per invocation + duration. Idle Lambda = free. Only provision concurrency costs money.\n- SQS batch processing: process 10 SQS messages per Lambda invocation (batch size=10) — 10x reduction in invocation count.\n\n**Fargate Cost Optimization**:\n- Fargate Spot: up to 70% discount for interruption-tolerant batch tasks. Not suitable for web services (interruption = dropped connections).\n- Right-size CPU/memory: Fargate charges per vCPU-hour and GB-hour. Over-provisioned task definitions waste money. Analyze CPU/memory utilization in CloudWatch Container Insights.\n- ARM64 Fargate: Graviton-based Fargate tasks — 20% cheaper than x86.',
          keyPoints: [
            { text: 'Aurora Serverless v2 scales to near-zero but not zero for running clusters. Use Aurora Serverless v1 (legacy) or stop/start for true zero-cost idle periods', gotcha: true },
            { text: 'DynamoDB On-Demand vs Provisioned: On-Demand is 2.5x more expensive per RCU/WCU than Provisioned. Use Provisioned with Auto Scaling for all predictable workloads', examTip: true },
            { text: 'Lambda ARM64 (Graviton): 20% cheaper + 19% faster = best cost/performance for new Lambda functions. Requires x86-compatible runtime (Python, Node, Java, Go — all supported)', examTip: true },
            { text: 'DynamoDB TTL: deletes expired items at no cost (eventually, within 48 hours). Never pay for manual delete operations on time-bounded data', examTip: true },
          ],
          bestPractices: [
            { pillar: 'cost-optimization', text: 'Switch Lambda functions to ARM64 (Graviton2) architecture — 20% cost reduction with no code changes for Python, Node.js, Java, and Go runtimes. Largest immediate cost reduction with zero risk.' },
            { pillar: 'cost-optimization', text: 'Use DynamoDB Provisioned capacity with Auto Scaling + Reserved Capacity for production tables — combined 76% discount vs On-Demand. Reserve after traffic patterns stabilize (first 2-4 weeks On-Demand).' },
            { pillar: 'cost-optimization', text: 'Stop non-production RDS instances on a schedule using AWS Instance Scheduler (Ops Center automation) — running dev/test databases 8 hours/day vs 24 saves 67% of instance costs.' },
          ],
        },
      ],
    },
  ],
};
