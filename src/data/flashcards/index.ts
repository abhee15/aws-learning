export interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
}

export interface FlashcardDeck {
  id: string;
  name: string;
  topicSlug: string;
  cards: Flashcard[];
}

export const allDecks: FlashcardDeck[] = [
  {
    id: 'iam-deck',
    name: 'IAM & Organizations',
    topicSlug: 'iam',
    cards: [
      { id: 'fc-iam-001', front: 'What is the evaluation order for IAM policy decisions?', back: 'Explicit Deny → SCP → Resource Policy → Permission Boundary → Identity Policy → Session Policy. Any explicit deny at any layer = DENY. Default is implicit deny.', hint: 'DENY first, then each layer must allow' },
      { id: 'fc-iam-002', front: 'What is the "confused deputy" problem in AWS?', back: 'When a cross-account service is tricked into using its elevated permissions on behalf of an unauthorized party. Mitigated with the aws:SourceArn and aws:SourceAccount condition keys in resource-based policies.', hint: 'Use condition keys to restrict who can trigger the deputy' },
      { id: 'fc-iam-003', front: 'What is a Permission Boundary?', back: 'An IAM managed policy attached to an IAM identity that sets the maximum permissions it can ever have. The effective permissions = intersection of identity policy AND permission boundary. Cannot grant more permissions than the boundary allows.', hint: 'Ceiling, not floor — limits but does not grant' },
      { id: 'fc-iam-004', front: 'SCP vs IAM Policy — key difference?', back: 'SCPs (Service Control Policies) restrict what an entire AWS account can do within an Organization — they apply to all principals including the root user. IAM policies grant permissions to specific principals. SCPs do not grant permissions — they only limit the maximum permissions available.', hint: 'SCP = guardrails. IAM = grants.' },
      { id: 'fc-iam-005', front: 'When does an S3 bucket policy allow cross-account access without IAM policies?', back: 'When the S3 bucket policy explicitly allows the cross-account principal, the external account\'s users can access the bucket without needing IAM identity policies. Resource-based policies that grant cross-account access are evaluated independently.', hint: 'Resource policies can bypass identity policy requirement' },
      { id: 'fc-iam-006', front: 'What is ABAC in AWS IAM?', back: 'Attribute-Based Access Control — use tags on resources and principals as conditions in policies. Instead of managing long IAM policies per team/resource, attach tags and write policies like: Allow if aws:ResourceTag/Project == aws:PrincipalTag/Project. Scales with large organizations.' },
      { id: 'fc-iam-007', front: 'AssumeRole vs AssumeRoleWithSAML vs AssumeRoleWithWebIdentity?', back: 'AssumeRole: within AWS, cross-account. AssumeRoleWithSAML: enterprise SAML 2.0 IdP (AD FS, Okta). AssumeRoleWithWebIdentity: OIDC IdP (Cognito, Google, GitHub). All return temporary credentials via STS.', hint: 'STS is the common thread — three different identity sources' },
    ],
  },
  {
    id: 'vpc-deck',
    name: 'VPC & Networking',
    topicSlug: 'vpc',
    cards: [
      { id: 'fc-vpc-001', front: 'Transit Gateway vs VPC Peering — when to use each?', back: 'VPC Peering: simple point-to-point, low latency, no additional cost per GB in same region. Transit Gateway: hub-and-spoke, supports transitive routing, centralized routing control, supports thousands of VPCs, supports multicast. Use TGW when you have >10 VPCs or need transitive routing.', hint: 'Peering = bilateral. TGW = transitive hub.' },
      { id: 'fc-vpc-002', front: 'VPC Gateway Endpoint vs Interface Endpoint?', back: 'Gateway Endpoint: free, route-table based, only for S3 and DynamoDB, available within VPC. Interface Endpoint (PrivateLink): ENI in subnet, has its own IP/DNS, costs ~$0.01/hr + data, supports 100+ AWS services and custom services. Gateway for S3/DDB unless cross-VPC sharing needed.', hint: 'Gateway = route table magic. Interface = ENI with private IP.' },
      { id: 'fc-vpc-003', front: 'What is the BGP community value for Direct Connect and what does it control?', back: 'BGP communities on Direct Connect control route propagation scope: 7224:9100 (local AWS region), 7224:9200 (all regions in continent), 7224:9300 (global). Used to control which routes get advertised from on-premises to AWS.' },
      { id: 'fc-vpc-004', front: 'Security Groups vs NACLs — stateful vs stateless?', back: 'Security Groups = stateful (return traffic automatically allowed), apply to ENI level, only ALLOW rules. NACLs = stateless (must explicitly allow inbound AND outbound), apply at subnet level, ALLOW and DENY rules, processed in number order (lowest first wins).', hint: 'SG stateful, NACL stateless — subnet vs ENI' },
      { id: 'fc-vpc-005', front: 'What is a Shared VPC and why use it?', back: 'Using AWS Resource Access Manager (RAM) to share VPC subnets from an owner account to participant accounts in the same Organization. Participants launch resources into the shared subnets but cannot see each other\'s resources. Reduces VPC sprawl, centralizes networking, cuts Direct Connect costs.', hint: 'RAM + Organizations = one VPC many accounts' },
      { id: 'fc-vpc-006', front: 'How does Egress-Only Internet Gateway differ from NAT Gateway?', back: 'Egress-Only IGW is for IPv6 — allows outbound IPv6 traffic from private subnets but blocks inbound initiated connections. NAT Gateway is for IPv4 — same concept but also performs network address translation. IPv6 addresses are public by design so Egress-Only IGW provides the privacy layer.' },
    ],
  },
  {
    id: 'compute-deck',
    name: 'Compute & EC2',
    topicSlug: 'compute',
    cards: [
      { id: 'fc-comp-001', front: 'EC2 Placement Groups — Cluster vs Spread vs Partition?', back: 'Cluster: all instances in same AZ, same rack — lowest latency, highest throughput (10Gbps+), risk = single point of failure. Spread: max 7 instances per AZ, different racks — highest availability. Partition: groups of instances per partition/rack, used for HDFS/Cassandra/HBase — isolates failure domain per partition.', hint: 'Cluster=speed, Spread=availability, Partition=big data' },
      { id: 'fc-comp-002', front: 'What is a Warm Pool in EC2 Auto Scaling?', back: 'A pool of pre-initialized EC2 instances that sit in a stopped or running state, ready to be activated quickly. Reduces launch latency — instances are already bootstrapped. Instances transition from warm pool → In Service state. Ideal for apps with long initialization times.' },
      { id: 'fc-comp-003', front: 'Dedicated Hosts vs Dedicated Instances?', back: 'Dedicated Host: physical server dedicated to you, you control instance placement, required for BYOL (Windows Server, SQL Server, RHEL per-socket/per-core licensing). Dedicated Instance: instances isolated on hardware but AWS controls placement, no BYOL support. Dedicated Hosts are more expensive but provide socket/core visibility.', hint: 'Hosts for licensing. Instances for isolation only.' },
      { id: 'fc-comp-004', front: 'EC2 Auto Scaling lifecycle hooks — what are they for?', back: 'Lifecycle hooks pause instance launch (Pending:Wait) or termination (Terminating:Wait) so custom actions can run — e.g., install agents, drain connections, backup data, register with service discovery. Instance waits up to heartbeat timeout (default 1hr). Send CONTINUE or ABANDON to proceed.', hint: 'Pause during launch/terminate for custom scripts' },
    ],
  },
  {
    id: 'databases-deck',
    name: 'Databases',
    topicSlug: 'databases',
    cards: [
      { id: 'fc-db-001', front: 'RDS Multi-AZ vs Multi-Region Read Replicas?', back: 'Multi-AZ: synchronous replication, automatic failover, for HA/DR within region, standby not readable. Read Replicas: asynchronous, readable, can be cross-region, manual promotion for failover, lag possible. Use Multi-AZ for HA, Read Replicas for read scaling or cross-region DR.', hint: 'Multi-AZ = sync HA. Read Replica = async, readable.' },
      { id: 'fc-db-002', front: 'Aurora Global Database — RPO and RTO?', back: 'Typical RPO < 1 second (replication lag). RTO < 1 minute for managed failover. Writes go to primary region, async replication to up to 5 secondary regions with <1 second lag. Secondary clusters are read-only until promoted during failover.', hint: '<1s RPO, <1min RTO — best for active-passive global' },
      { id: 'fc-db-003', front: 'DynamoDB DAX vs ElastiCache for DynamoDB?', back: 'DAX: purpose-built in-memory cache for DynamoDB, API-compatible (no code change), microsecond reads, strongly consistent reads bypass DAX. ElastiCache: general-purpose cache, requires application code change, more flexible eviction strategies, can cache any data not just DynamoDB. Use DAX for simple DynamoDB acceleration, ElastiCache for complex caching logic.', hint: 'DAX=drop-in DynamoDB cache. ElastiCache=general purpose.' },
      { id: 'fc-db-004', front: 'RDS Proxy — why use it with Lambda?', back: 'Lambda can have thousands of concurrent invocations, each opening a database connection. RDS has connection limits (memory-based). RDS Proxy pools and reuses connections, acting as a connection broker. Reduces database load, handles failover transparently. Requires Secrets Manager for credentials.', hint: 'Lambda * scale = connection exhaustion → Proxy solves it' },
    ],
  },
  {
    id: 's3-deck',
    name: 'S3 & Storage',
    topicSlug: 's3',
    cards: [
      { id: 'fc-s3-001', front: 'S3 Object Lock — Governance vs Compliance mode?', back: 'Governance mode: users with s3:BypassGovernanceRetention permission can delete/modify locked objects. Compliance mode: NO ONE — not even root — can delete or modify the object before retention period expires. Use Compliance for regulatory requirements (FINRA, SEC 17a-4, HIPAA).', hint: 'Compliance = absolute. Governance = overridable with permission.' },
      { id: 'fc-s3-002', front: 'S3 CRR vs SRR — key use cases?', back: 'CRR (Cross-Region Replication): DR across regions, compliance residency requirements, latency reduction for global users. SRR (Same-Region Replication): log aggregation into central account, test/prod sync in same region. Both require bucket versioning enabled. Both are async.', hint: 'CRR=disaster recovery. SRR=log aggregation.' },
      { id: 'fc-s3-003', front: 'What is S3 Replication Time Control (RTC)?', back: 'Guarantees 99.99% of objects replicated within 15 minutes, with SLA. Includes S3 Replication metrics for monitoring. Additional cost over standard replication. Required for compliance scenarios with time-bounded replication requirements.', hint: '15-minute SLA for replication — compliance use case' },
    ],
  },
  {
    id: 'serverless-deck',
    name: 'Serverless',
    topicSlug: 'serverless',
    cards: [
      { id: 'fc-sv-001', front: 'Lambda Reserved vs Provisioned Concurrency?', back: 'Reserved Concurrency: caps the function at N concurrent executions, guarantees N is available (not shared with account pool). Does NOT eliminate cold starts. Provisioned Concurrency: pre-initializes execution environments — eliminates cold starts. More expensive. Use Provisioned for latency-sensitive APIs, Reserved for throttle protection.', hint: 'Reserved=cap. Provisioned=warm=no cold start.' },
      { id: 'fc-sv-002', front: 'Step Functions Standard vs Express Workflows?', back: 'Standard: max 1 year duration, exactly-once execution, audit history in console, priced per state transition. Express: max 5 minutes, at-least-once execution, no visual history (use CloudWatch), priced per execution duration. Use Express for high-volume, short-lived event processing. Standard for long-running business workflows.', hint: 'Express = high-volume short. Standard = long-running once.' },
      { id: 'fc-sv-003', front: 'Lambda@Edge vs CloudFront Functions — when to use each?', back: 'CloudFront Functions: sub-ms execution, JavaScript only, viewer request/response events only, cheapest. Lambda@Edge: up to 5s (origin) or 1s (viewer) timeout, Node.js/Python, all 4 CloudFront events, can access network/filesystem. Use CF Functions for simple header manipulation/redirects. Lambda@Edge for A/B testing, auth, complex logic.', hint: 'CF Functions=ultra-fast simple. Lambda@Edge=complex logic.' },
    ],
  },
  {
    id: 'security-deck',
    name: 'Security',
    topicSlug: 'security',
    cards: [
      { id: 'fc-sec-001', front: 'AWS Shield Advanced — what does it add over Standard?', back: 'Shield Standard: free, automatic L3/L4 DDoS protection. Shield Advanced: $3000/month, L7 protection with WAF, DDoS cost protection (credit for scaling costs during attacks), 24/7 DRT (DDoS Response Team) access, advanced attack diagnostics, protects EC2/ELB/CloudFront/Route 53/Global Accelerator.', hint: '$3000/mo + WAF + DRT + cost protection' },
      { id: 'fc-sec-002', front: 'KMS Key Policy vs IAM Policy — which takes precedence?', back: 'Both must allow for access. KMS key policy is a resource-based policy that must explicitly allow the principal (or "kms:Allow" the account root). If key policy allows the account root, IAM policies can then grant KMS access. Key policy without IAM = possible. IAM without key policy = NOT possible.', hint: 'Key policy must grant first, then IAM can refine' },
      { id: 'fc-sec-003', front: 'GuardDuty vs Macie vs Inspector — what does each detect?', back: 'GuardDuty: threat intelligence, anomaly detection — compromised instances, cryptomining, unauthorized access, data exfiltration patterns. Macie: S3 data classification, PII detection, sensitive data exposure. Inspector: EC2/container vulnerability scanning, CVEs, network reachability, software exposure.', hint: 'GuardDuty=threats. Macie=PII/S3. Inspector=vulnerabilities.' },
    ],
  },
  {
    id: 'dr-deck',
    name: 'Disaster Recovery',
    topicSlug: 'disaster-recovery',
    cards: [
      { id: 'fc-dr-001', front: 'Four DR patterns ranked by cost and RTO/RPO?', back: '1. Backup & Restore: cheapest, hours RTO/RPO. 2. Pilot Light: core services running (DB replication), mins-hours RTO. 3. Warm Standby: scaled-down but functional, mins RTO. 4. Active-Active (Multi-Site): most expensive, near-zero RTO/RPO. Cost vs recovery speed tradeoff.', hint: 'More expensive = faster recovery. Match to business SLA.' },
      { id: 'fc-dr-002', front: 'What is Elastic Disaster Recovery (DRS)?', back: 'Formerly CloudEndure. Continuously replicates servers (physical, virtual, cloud) to a staging area in AWS at low cost. On failover, launches recovered instances in minutes. Supports Windows/Linux. Replaces Backup & Restore for on-premises to AWS DR. Sub-second RPO, sub-hour RTO typical.', hint: 'Continuous block-level replication for lift-and-shift DR' },
    ],
  },
  {
    id: 'wellarch-deck',
    name: 'Well-Architected',
    topicSlug: 'well-architected',
    cards: [
      { id: 'fc-wa-001', front: 'What are the 6 pillars of the Well-Architected Framework?', back: '1. Operational Excellence — runbooks, IaC, small changes\n2. Security — defense in depth, least privilege, encryption\n3. Reliability — auto-recovery, tested backups, chaos engineering\n4. Performance Efficiency — right-sizing, serverless, global distribution\n5. Cost Optimization — right-sizing, Reserved/Spot, waste elimination\n6. Sustainability — minimize carbon, maximize utilization', hint: 'Operational-Security-Reliability-Performance-Cost-Sustainability' },
      { id: 'fc-wa-002', front: 'AWS Compute Optimizer vs Trusted Advisor vs Service Quotas?', back: 'Compute Optimizer: ML-based recommendations for EC2/Lambda/ECS/EBS right-sizing. Trusted Advisor: best practices checks across cost, security, performance, fault tolerance, service limits. Service Quotas: view and request increases for AWS service limits. Overlap in limits: Trusted Advisor alerts, Service Quotas manages them.', hint: 'Optimizer=right-size. TA=holistic checks. SQ=manage limits.' },
    ],
  },
  {
    id: 'migration-deck',
    name: 'Migration',
    topicSlug: 'migration',
    cards: [
      { id: 'fc-mig-001', front: '7 Rs of Cloud Migration?', back: 'Retire, Retain, Rehost (lift & shift), Relocate (lift & shift to VMware Cloud on AWS), Repurchase (move to SaaS), Replatform (lift & optimize), Refactor/Re-architect (redesign for cloud native). Rehost = fastest. Refactor = most value. Match strategy to application ROI.', hint: '7Rs — memorize from cheapest/fastest to most transformative' },
      { id: 'fc-mig-002', front: 'AWS DMS full load + CDC — what does CDC mean?', back: 'CDC = Change Data Capture. After initial full-load migration, DMS continuously replicates ongoing changes (INSERTs, UPDATEs, DELETEs) from the source. Enables minimal-downtime migrations. Source must support change capture (binary log for MySQL, redo log for Oracle). Use SCT (Schema Conversion Tool) first for heterogeneous migrations.', hint: 'Full load = snapshot. CDC = ongoing changes. Together = near-zero downtime.' },
    ],
  },
];
