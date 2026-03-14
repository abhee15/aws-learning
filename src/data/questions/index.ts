import type { Question } from '../../types/question';

// Question files will be populated by background agents
// This index re-exports all questions

const iamQuestions: Question[] = [
  {
    id: 'iam-001',
    stem: 'A company uses AWS Organizations with multiple accounts. The security team needs to prevent all accounts from disabling CloudTrail, even if an administrator in those accounts has full IAM permissions. Which solution achieves this with the least operational overhead?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'iam',
    examDomain: 'organizational-complexity',
    options: [
      { id: 'a', text: 'Create an IAM policy in each account that denies cloudtrail:StopLogging and attach it to all IAM users', correct: false, explanation: 'This requires managing policies in every account separately and can be bypassed by account root users.' },
      { id: 'b', text: 'Create a Service Control Policy (SCP) that denies cloudtrail:StopLogging and attach it to the root of the Organization', correct: true, explanation: 'SCPs apply to all principals in all accounts under the OU/root, including account administrators. They cannot be overridden by any IAM policy.' },
      { id: 'c', text: 'Use AWS Config rules with auto-remediation to re-enable CloudTrail when disabled', correct: false, explanation: 'Config remediation is reactive — there is a window of time when CloudTrail is disabled. SCPs are preventive.' },
      { id: 'd', text: 'Enable AWS CloudTrail Organization-level trail with immutable log file validation', correct: false, explanation: 'An Organization trail consolidates logs but does not prevent individual account administrators from stopping their trails.' },
    ],
    explanation: {
      overall: 'SCPs are preventive guardrails that restrict what actions can be performed within an AWS Organization. When attached to the root OU, they apply to every account and every principal (except the management/master account). Even an account root user cannot bypass an SCP. This is the standard pattern for enforcing Organization-wide security baselines.',
      examTip: 'SCPs do not grant permissions — they only limit the maximum permissions available. An SCP deny overrides any IAM allow. Attach SCPs to the root OU or specific OUs to apply uniformly.',
    },
    tags: ['scp', 'organizations', 'cloudtrail', 'governance'],
  },
  {
    id: 'iam-002',
    stem: 'An application running on EC2 in Account A needs to write objects to an S3 bucket in Account B. The EC2 instance has an IAM role with s3:PutObject permission. The S3 bucket in Account B has no bucket policy. What is the outcome, and how should this be fixed?',
    type: 'single',
    difficulty: 3,
    topicSlug: 'iam',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Access is allowed because the EC2 role has s3:PutObject permission', correct: false, explanation: 'Cross-account S3 access requires both the identity policy AND the resource policy (bucket policy) to allow the access.' },
      { id: 'b', text: 'Access is denied. Add a bucket policy in Account B allowing the EC2 role from Account A to PutObject', correct: true, explanation: 'For cross-account access to S3, the bucket policy in Account B must explicitly allow the principal from Account A. The EC2 role identity policy alone is insufficient.' },
      { id: 'c', text: 'Access is denied. Create a VPC Endpoint for S3 in Account A to enable cross-account access', correct: false, explanation: 'VPC Endpoints provide private connectivity to S3 but do not solve cross-account authorization.' },
      { id: 'd', text: 'Access is denied. The EC2 role must use AssumeRole to assume a role in Account B that has bucket access', correct: false, explanation: 'While cross-account role assumption is a valid pattern, a direct bucket policy allowing Account A\'s role is simpler and equally valid.' },
    ],
    explanation: {
      overall: 'Cross-account S3 access requires the resource policy (bucket policy) in the destination account to explicitly allow the requesting principal from the source account. Without a bucket policy, S3 defaults to denying cross-account access even if the identity policy grants the permission. Within the same account, S3 access only requires an identity policy — the bucket policy is optional.',
      examTip: 'Same-account S3 access: identity policy alone works. Cross-account S3 access: bucket policy MUST explicitly allow the cross-account principal. This is a key distinction tested on SA Pro.',
    },
    tags: ['s3', 'cross-account', 'bucket-policy', 'iam'],
  },
  {
    id: 'iam-003',
    stem: 'A large enterprise wants to allow developers to create IAM roles for their applications, but prevent them from creating roles with more permissions than the developers themselves have. Which IAM feature achieves this?',
    type: 'single',
    difficulty: 3,
    topicSlug: 'iam',
    examDomain: 'organizational-complexity',
    options: [
      { id: 'a', text: 'Service Control Policies (SCPs) that restrict IAM role creation', correct: false, explanation: 'SCPs can restrict which actions are allowed but do not provide the per-developer permission boundary scoping needed here.' },
      { id: 'b', text: 'IAM Permission Boundaries attached to the developer role itself', correct: false, explanation: 'Permission boundaries limit the developer\'s own permissions but alone do not prevent them from creating roles with higher permissions.' },
      { id: 'c', text: 'Require developers to attach a Permission Boundary when creating new IAM roles, enforced via IAM condition keys', correct: true, explanation: 'Using iam:PermissionsBoundary condition in the developer\'s IAM policy requires that any role they create must have the specified permission boundary attached. This prevents privilege escalation.' },
      { id: 'd', text: 'Enable IAM Access Analyzer to detect and deny roles with excessive permissions', correct: false, explanation: 'IAM Access Analyzer is detective, not preventive — it cannot prevent role creation.' },
    ],
    explanation: {
      overall: 'This is the "delegated administration with permission boundaries" pattern. The developer\'s IAM policy includes a condition: "StringEquals": {"iam:PermissionsBoundary": "arn:aws:iam::ACCOUNT:policy/BoundaryPolicy"} on iam:CreateRole. This forces developers to always attach the permission boundary, which limits the maximum permissions the created role can ever have — preventing privilege escalation.',
      examTip: 'Permission boundaries + IAM conditions = delegated administration without privilege escalation. This is a key SA Pro exam pattern for enabling developer self-service while maintaining security guardrails.',
    },
    tags: ['permission-boundary', 'privilege-escalation', 'delegated-admin'],
  },
  {
    id: 'iam-004',
    stem: 'A company has a SaaS application serving thousands of customers. Each customer\'s data is tagged with their customer ID. Instead of creating IAM policies per customer, they want a scalable approach. Which IAM feature enables this?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'iam',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'IAM Groups with per-customer policies', correct: false, explanation: 'Creating a group and policy per customer does not scale to thousands of customers.' },
      { id: 'b', text: 'Attribute-Based Access Control (ABAC) using resource tags and principal tags as conditions', correct: true, explanation: 'ABAC allows policies like "Allow if aws:ResourceTag/CustomerId == aws:PrincipalTag/CustomerId". When a user is tagged with their customer ID, they can only access resources with matching tags.' },
      { id: 'c', text: 'Resource-based policies on each resource granting specific customer principals', correct: false, explanation: 'Adding a resource policy per customer per resource does not scale and requires manual management.' },
      { id: 'd', text: 'AWS Cognito Identity Pools with per-customer IAM roles', correct: false, explanation: 'While Cognito can issue temporary credentials, creating per-customer roles does not scale to thousands of customers.' },
    ],
    explanation: {
      overall: 'ABAC (Attribute-Based Access Control) uses tags as the access control mechanism instead of explicit principal ARNs. A single policy statement can govern access for all customers: Allow s3:GetObject when aws:ResourceTag/CustomerID equals aws:PrincipalTag/CustomerID. As new customers are added, no policy changes are needed — only the customer tag on their resources and principal is needed.',
      examTip: 'ABAC scales linearly with tagging. RBAC (Role-Based) scales exponentially with the number of roles. For multi-tenant SaaS on AWS, ABAC with customer tags is the modern, scalable approach.',
    },
    tags: ['abac', 'tagging', 'multi-tenant', 'scalable-access'],
  },
  {
    id: 'iam-005',
    stem: 'A Lambda function in Account A needs to call an API in Account B. The Lambda function has an execution role. The developer has configured the Lambda to call AssumeRole for a role in Account B. The role in Account B has a trust policy allowing the Lambda execution role from Account A. However, calls are failing with "not authorized to assume". What is missing?',
    type: 'single',
    difficulty: 3,
    topicSlug: 'iam',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'The Lambda execution role in Account A needs sts:AssumeRole permission for the role in Account B', correct: true, explanation: 'Cross-account role assumption requires: (1) identity policy in Account A allowing sts:AssumeRole for the target role ARN, AND (2) trust policy in Account B allowing the Account A principal. Both are required.' },
      { id: 'b', text: 'The Lambda function needs a resource-based policy allowing Account B to invoke it', correct: false, explanation: 'Lambda resource-based policies control who can invoke the function, not what the function can call.' },
      { id: 'c', text: 'Account B needs to enable cross-account access in its root account settings', correct: false, explanation: 'No such setting exists. Cross-account access is controlled by IAM trust policies and identity policies.' },
      { id: 'd', text: 'A VPC peering connection must be established between the two accounts\' VPCs', correct: false, explanation: 'VPC peering is for network connectivity, not IAM authorization.' },
    ],
    explanation: {
      overall: 'Cross-account role assumption is a two-part authorization: (1) The caller\'s identity policy must include sts:AssumeRole permission for the target role ARN, and (2) The target role\'s trust policy must allow the caller\'s principal. Both conditions must be true. Missing either results in an access denied error.',
      examTip: 'Remember: for cross-account AssumeRole, you need BOTH an identity policy allowing sts:AssumeRole in Account A AND a trust policy in Account B. The trust policy alone is not sufficient.',
    },
    tags: ['cross-account', 'sts', 'assume-role', 'trust-policy'],
  },
];

const vpcQuestions: Question[] = [
  {
    id: 'vpc-001',
    stem: 'A company has 50 VPCs that need full mesh connectivity. Each VPC must be able to communicate with every other VPC. Which solution minimizes the number of peering connections and supports transitive routing?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'vpc',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Create VPC peering connections between all VPCs in a full mesh topology', correct: false, explanation: 'Full mesh peering for 50 VPCs requires 50*(50-1)/2 = 1,225 peering connections and does not support transitive routing.' },
      { id: 'b', text: 'Use AWS Transit Gateway as a hub with all VPCs attached as spokes', correct: true, explanation: 'Transit Gateway provides transitive routing between all attached VPCs. Only 50 TGW attachments are needed instead of 1,225 peering connections. Route propagation handles routing automatically.' },
      { id: 'c', text: 'Use a centralized VPC with VPC peering to each of the 50 VPCs and configure route tables for transitive routing', correct: false, explanation: 'VPC peering does not support transitive routing — traffic cannot flow A→Hub→B via standard VPC peering.' },
      { id: 'd', text: 'Deploy VPN tunnels between all VPCs using customer gateways', correct: false, explanation: 'VPN tunnels require managed customer gateways and have bandwidth limitations. Transit Gateway is the purpose-built solution.' },
    ],
    explanation: {
      overall: 'Transit Gateway is the AWS-native hub-and-spoke networking service. All VPCs attach to a single TGW, and route propagation via TGW route tables enables transitive routing between any two VPCs. For N VPCs: TGW requires N attachments vs N*(N-1)/2 peering connections. TGW also supports Direct Connect and VPN attachments.',
      examTip: 'VPC Peering: non-transitive, point-to-point, no additional cost per GB (same region). TGW: transitive, hub-and-spoke, additional $0.05/GB processed. Choose TGW when you have >10 VPCs or need transitive routing.',
    },
    tags: ['transit-gateway', 'vpc-peering', 'transitive-routing'],
  },
  {
    id: 'vpc-002',
    stem: 'A company processes sensitive financial data in a private subnet. The application needs to access S3 without traversing the internet. The solution must prevent the S3 bucket from being accessed from the internet while allowing VPC access. Which combination achieves this?',
    type: 'multiple',
    difficulty: 3,
    topicSlug: 'vpc',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Create a VPC Gateway Endpoint for S3', correct: true, explanation: 'A Gateway Endpoint routes S3 traffic through AWS\'s private network via route table entries, avoiding the internet.' },
      { id: 'b', text: 'Add a bucket policy restricting access to the VPC endpoint using aws:sourceVpce condition', correct: true, explanation: 'The bucket policy with aws:sourceVpce restricts access so that the bucket can only be accessed from within your VPC via the endpoint.' },
      { id: 'c', text: 'Create a NAT Gateway to route S3 traffic from the private subnet', correct: false, explanation: 'NAT Gateway routes traffic to the internet — this does not keep S3 traffic private and adds cost.' },
      { id: 'd', text: 'Enable S3 Block Public Access on the bucket', correct: false, explanation: 'Block Public Access prevents public ACLs/policies but does not restrict access to VPC-only.' },
    ],
    explanation: {
      overall: 'VPC Gateway Endpoints for S3 add route table entries that direct S3-bound traffic through AWS\'s private network instead of the internet. Combining with a bucket policy that includes the aws:sourceVpce condition key ensures the bucket can only be accessed via the specific endpoint — blocking all internet access while allowing VPC access.',
      examTip: 'aws:sourceVpce restricts access to a specific VPC endpoint. aws:sourceVpc restricts to a VPC. Use these in bucket policies to create private-only S3 buckets accessible only from within your VPC.',
    },
    tags: ['s3', 'vpc-endpoint', 'gateway-endpoint', 'private-access'],
  },
  {
    id: 'vpc-003',
    stem: 'A company has AWS Direct Connect to its on-premises data center. The Direct Connect connection is the primary path. They need a cost-effective failover solution that provides encrypted connectivity. Which configuration provides this?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'vpc',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Add a second Direct Connect connection for redundancy', correct: false, explanation: 'A second Direct Connect provides redundancy but is expensive and does not add encryption (Direct Connect is not encrypted by default).' },
      { id: 'b', text: 'Configure a Site-to-Site VPN as a backup to the Direct Connect connection, attached to the same Virtual Private Gateway', correct: true, explanation: 'VPN over the internet provides cost-effective encrypted failover. BGP routing automatically fails over from DX to VPN when DX goes down. Both attach to the same VGW.' },
      { id: 'c', text: 'Configure Direct Connect with MACsec for encryption and redundancy', correct: false, explanation: 'MACsec encrypts Direct Connect but does not provide failover capability — it\'s still a single path.' },
      { id: 'd', text: 'Use CloudFront to provide resilient global connectivity to on-premises', correct: false, explanation: 'CloudFront is a CDN for content delivery, not hybrid connectivity for general data center traffic.' },
    ],
    explanation: {
      overall: 'The standard architecture for Direct Connect resilience is to use a Site-to-Site VPN as a backup. Both the DX connection and VPN terminate at the same Virtual Private Gateway (or Transit Gateway). BGP route metrics (MED/AS-Path prepending) ensure DX is preferred when available, and automatic BGP failover activates the VPN when DX fails. The VPN provides encryption that DX lacks by default.',
      examTip: 'Direct Connect + VPN backup is the most common HA pattern. Direct Connect alone is not encrypted — add IPsec VPN over DX or use MACsec if encryption is needed on DX itself.',
    },
    tags: ['direct-connect', 'vpn', 'failover', 'hybrid'],
  },
];

const computeQuestions: Question[] = [
  {
    id: 'compute-001',
    stem: 'A financial services company runs a high-performance trading application that requires the lowest possible network latency between EC2 instances. The application must complete tasks without interruption. Which EC2 placement configuration is optimal?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'compute',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Spread Placement Group across multiple AZs', correct: false, explanation: 'Spread placement groups maximize fault tolerance but do not minimize latency — instances are on different physical hardware.' },
      { id: 'b', text: 'Cluster Placement Group with On-Demand instances in a single AZ', correct: true, explanation: 'Cluster placement groups place instances in the same rack in a single AZ, achieving 10 Gbps enhanced networking and the lowest possible latency. On-Demand ensures no interruptions.' },
      { id: 'c', text: 'Partition Placement Group with Reserved Instances across 3 AZs', correct: false, explanation: 'Partition groups are for distributed systems (HDFS/Cassandra). They do not minimize inter-instance latency.' },
      { id: 'd', text: 'Cluster Placement Group with Spot Instances', correct: false, explanation: 'Spot instances can be interrupted with 2-minute notice — unacceptable for a trading application that cannot tolerate interruption.' },
    ],
    explanation: {
      overall: 'Cluster Placement Groups pack instances into the same physical rack within a single AZ, enabling 10 Gbps enhanced networking between instances (vs 5 Gbps standard). This minimizes network latency. On-Demand instances avoid interruption risk. Tradeoff: single rack means single point of failure — but for HFT systems, latency often takes priority over fault tolerance within the cluster.',
      examTip: 'Cluster PG = max throughput, min latency, max risk. Spread PG = max HA, max 7/AZ. Partition PG = HDFS/Cassandra failure domain isolation.',
    },
    tags: ['placement-groups', 'cluster', 'hpc', 'latency'],
  },
];

const databaseQuestions: Question[] = [
  {
    id: 'db-001',
    stem: 'A company needs a globally distributed database that can accept writes in multiple AWS regions simultaneously with minimal replication lag. The application can handle eventual consistency. Which AWS database service meets this requirement?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'databases',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Amazon Aurora Global Database', correct: false, explanation: 'Aurora Global Database has one primary write region and up to 5 read-only secondary regions. Writes can only go to the primary region.' },
      { id: 'b', text: 'Amazon DynamoDB Global Tables', correct: true, explanation: 'DynamoDB Global Tables is a multi-active (multi-master) replication solution. All replica tables can accept writes. Conflicts are resolved with last-writer-wins. Replication lag is typically under 1 second.' },
      { id: 'c', text: 'Amazon RDS Multi-AZ with cross-region read replicas', correct: false, explanation: 'RDS read replicas in other regions are read-only — they cannot accept writes.' },
      { id: 'd', text: 'Amazon Aurora Multi-Master', correct: false, explanation: 'Aurora Multi-Master allows multiple write nodes within a single region, not across regions.' },
    ],
    explanation: {
      overall: 'DynamoDB Global Tables provides multi-active (multi-master) replication across AWS regions. Every replica table can accept reads and writes. Conflict resolution uses last-writer-wins based on timestamps. Replication is asynchronous with sub-second lag. This is the only AWS-managed database service that natively supports multi-region writes.',
      examTip: 'DynamoDB Global Tables = multi-region, multi-active (writes in any region). Aurora Global DB = multi-region, single writer (reads in other regions). This distinction is frequently tested.',
    },
    tags: ['dynamodb', 'global-tables', 'multi-region', 'multi-active'],
  },
  {
    id: 'db-002',
    stem: 'A serverless application uses Lambda to process requests. The Lambda function connects to an Amazon RDS PostgreSQL database. Under peak load, connections are being exhausted and requests are failing. The application scales to 2000 concurrent Lambda invocations. Which solution resolves this?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'databases',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Increase the RDS instance size to handle more connections', correct: false, explanation: 'Larger instances allow more connections, but 2000 concurrent connections would still overwhelm a database server.' },
      { id: 'b', text: 'Use Amazon RDS Proxy to pool and multiplex connections from Lambda to RDS', correct: true, explanation: 'RDS Proxy maintains a pool of database connections and multiplexes thousands of Lambda connections to a smaller pool of database connections. Reduces connection overhead and handles failover transparently.' },
      { id: 'c', text: 'Configure Lambda reserved concurrency to limit to 100 concurrent invocations', correct: false, explanation: 'Limiting concurrency solves the connection problem but throttles the application during peak load, degrading user experience.' },
      { id: 'd', text: 'Switch to DynamoDB to eliminate connection limits', correct: false, explanation: 'DynamoDB does not have connection limits but requires significant application refactoring and may not be suitable if relational features are required.' },
    ],
    explanation: {
      overall: 'RDS Proxy is specifically designed for serverless applications that create many short-lived database connections. It pools connections from thousands of Lambda invocations into a smaller, persistent connection pool to RDS. This dramatically reduces database load. RDS Proxy also provides faster failover and stores credentials in Secrets Manager.',
      examTip: 'Lambda + RDS = connection exhaustion risk. Solution = RDS Proxy. RDS Proxy requires Secrets Manager for credentials. Supports MySQL and PostgreSQL.',
    },
    tags: ['rds-proxy', 'lambda', 'connection-pooling', 'serverless'],
  },
];

const s3Questions: Question[] = [
  {
    id: 's3-001',
    stem: 'A healthcare company must store patient records in S3 for 10 years and ensure no record can be deleted or overwritten during that period, including by the AWS account root user, to meet HIPAA compliance. Which S3 feature and mode should they use?',
    type: 'single',
    difficulty: 2,
    topicSlug: 's3',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Enable S3 Object Lock in Governance mode with a 10-year retention period', correct: false, explanation: 'Governance mode allows users with s3:BypassGovernanceRetention permission to delete objects. It does not meet strict regulatory requirements.' },
      { id: 'b', text: 'Enable S3 Object Lock in Compliance mode with a 10-year retention period', correct: true, explanation: 'Compliance mode enforces WORM — no user, including root, can delete or overwrite locked objects before the retention period expires. This meets HIPAA and SEC 17a-4 requirements.' },
      { id: 'c', text: 'Use S3 MFA Delete on versioned objects', correct: false, explanation: 'MFA Delete adds an extra authentication step but does not enforce a time-based retention period or prevent modification.' },
      { id: 'd', text: 'Implement an S3 bucket policy that denies all delete actions', correct: false, explanation: 'Bucket policies can be modified by account administrators. They do not provide immutable WORM compliance.' },
    ],
    explanation: {
      overall: 'S3 Object Lock Compliance mode provides WORM (Write Once, Read Many) protection that cannot be overridden by any user or even AWS support. Once set, the retention period cannot be shortened. This is required for regulatory compliance (SEC Rule 17a-4, FINRA, HIPAA). The bucket must have versioning enabled to use Object Lock.',
      examTip: 'Compliance mode = absolute WORM, even root cannot delete. Governance mode = overridable with s3:BypassGovernanceRetention. For regulatory compliance (SEC, FINRA, HIPAA), always Compliance mode.',
    },
    tags: ['object-lock', 'worm', 'compliance', 'hipaa'],
  },
];

const serverlessQuestions: Question[] = [
  {
    id: 'sv-001',
    stem: 'A financial application uses Lambda functions behind API Gateway. During market open (9:30 AM ET), the first requests experience high latency due to cold starts, causing poor user experience. Which solution eliminates cold starts for this predictable peak?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'serverless',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Configure Lambda Reserved Concurrency to 500 before market open', correct: false, explanation: 'Reserved Concurrency guarantees capacity allocation but does not pre-warm execution environments — cold starts still occur.' },
      { id: 'b', text: 'Use Lambda Provisioned Concurrency, activated via Application Auto Scaling schedule', correct: true, explanation: 'Provisioned Concurrency pre-initializes execution environments, eliminating cold starts. Scheduled Auto Scaling can scale up provisioned concurrency before 9:30 AM and scale back down after the peak.' },
      { id: 'c', text: 'Switch to container-based Lambda with a larger memory allocation', correct: false, explanation: 'Container-based Lambda images have longer cold start times, not shorter. Memory increase alone does not eliminate cold starts.' },
      { id: 'd', text: 'Enable X-Ray tracing to identify and optimize the cold start initialization code', correct: false, explanation: 'X-Ray can diagnose cold start duration but does not eliminate them.' },
    ],
    explanation: {
      overall: 'Lambda Provisioned Concurrency keeps execution environments initialized and warm — ready to handle requests instantly. Combined with Application Auto Scaling scheduled actions, you can pre-warm before predictable peaks (market open) and scale down after. This is the standard pattern for latency-sensitive APIs with predictable traffic patterns.',
      examTip: 'Reserved Concurrency = reservation (no cold start elimination). Provisioned Concurrency = pre-warmed (cold start elimination, additional cost). Use scheduled scaling for predictable peaks.',
    },
    tags: ['lambda', 'cold-start', 'provisioned-concurrency', 'api-gateway'],
  },
];

const securityQuestions: Question[] = [
  {
    id: 'sec-001',
    stem: 'A company wants to centrally manage WAF rules across 200 AWS accounts in an Organization. Rules must be enforced — individual account teams cannot remove or modify them. Which service and configuration achieves this?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'security',
    examDomain: 'organizational-complexity',
    options: [
      { id: 'a', text: 'Deploy WAF rules in each account using CloudFormation StackSets', correct: false, explanation: 'StackSets can deploy WAF rules but account teams can still modify or delete deployed resources unless additional controls are added.' },
      { id: 'b', text: 'Use AWS Firewall Manager to create Organization-level WAF policies', correct: true, explanation: 'Firewall Manager enforces WAF policies across all accounts in an Organization. It automatically applies rules to new accounts and resources, and account teams cannot remove the managed rule groups.' },
      { id: 'c', text: 'Create an SCP that restricts modifications to WAF WebACLs', correct: false, explanation: 'An SCP can restrict WAF modifications but cannot create or enforce WAF rules itself. Firewall Manager handles both enforcement and distribution.' },
      { id: 'd', text: 'Use AWS Security Hub to detect accounts without WAF rules and send alerts', correct: false, explanation: 'Security Hub is detective (alerts after the fact), not preventive (cannot enforce rules proactively).' },
    ],
    explanation: {
      overall: 'AWS Firewall Manager is designed for centralized security management across AWS Organizations. It enforces WAF WebACL policies, AWS Shield Advanced subscriptions, Security Group policies, and Network Firewall policies across all accounts. Policies are automatically applied to new accounts/resources, and account-level changes to managed rules are remediated automatically.',
      examTip: 'Firewall Manager = central security policy enforcement across Organizations. Requires AWS Organizations with All Features enabled and Security Hub enabled in the delegated admin account.',
    },
    tags: ['waf', 'firewall-manager', 'organizations', 'centralized-security'],
  },
];

const messagingQuestions: Question[] = [
  {
    id: 'msg-001',
    stem: 'An application uses SQS to buffer messages before processing by Lambda. During testing, messages are being processed multiple times, causing duplicate records in the database. What is the most likely cause and solution?',
    type: 'single',
    difficulty: 3,
    topicSlug: 'messaging',
    examDomain: 'continuous-improvement',
    options: [
      { id: 'a', text: 'The SQS visibility timeout is shorter than the Lambda function execution time', correct: true, explanation: 'If the visibility timeout expires before Lambda finishes processing, SQS makes the message visible again for reprocessing, causing duplicates. The visibility timeout must be >= Lambda timeout.' },
      { id: 'b', text: 'The SQS queue is not configured as FIFO', correct: false, explanation: 'FIFO queues provide exactly-once processing within the deduplication window but are not the primary cause here. Visibility timeout is the direct cause.' },
      { id: 'c', text: 'Lambda is deployed with insufficient reserved concurrency', correct: false, explanation: 'Insufficient concurrency causes throttling/delays but not duplicate processing.' },
      { id: 'd', text: 'The message retention period is too short', correct: false, explanation: 'Message retention period affects how long messages stay in the queue before expiry, not duplicate processing.' },
    ],
    explanation: {
      overall: 'SQS visibility timeout defines how long a message is hidden from other consumers after being picked up. If Lambda processing takes longer than the visibility timeout, SQS re-enqueues the message. Best practice: set SQS visibility timeout to at least 6x the Lambda function timeout, and implement idempotent processing in the function.',
      examTip: 'SQS visibility timeout >= Lambda function timeout (ideally 6x). Always implement idempotent consumers for SQS — at-least-once delivery means you WILL occasionally get duplicates.',
    },
    tags: ['sqs', 'lambda', 'visibility-timeout', 'idempotency'],
  },
];

const disasterRecoveryQuestions: Question[] = [
  {
    id: 'dr-001',
    stem: 'A company\'s RTO requirement is 5 minutes and RPO is 1 minute for a business-critical application. The application uses EC2 instances and RDS. Which DR strategy meets these requirements at the lowest cost?',
    type: 'single',
    difficulty: 3,
    topicSlug: 'disaster-recovery',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Backup & Restore: daily AMIs and RDS automated snapshots with cross-region copy', correct: false, explanation: 'Backup & Restore RTO is measured in hours (AMI restore + RDS restore), and RPO equals time since last snapshot — not meeting 5-min RTO or 1-min RPO.' },
      { id: 'b', text: 'Pilot Light: RDS replica running in DR region, EC2 AMIs ready for launch', correct: false, explanation: 'Pilot Light RTO is typically 10-60 minutes for compute scale-up, exceeding the 5-minute requirement.' },
      { id: 'c', text: 'Warm Standby: scaled-down EC2 Auto Scaling group and RDS read replica in DR region, with Route 53 health check failover', correct: true, explanation: 'Warm Standby maintains a running, scaled-down version in DR. Failover involves scaling up ASG (Auto Scaling takes minutes) and promoting RDS replica (~1 min). Route 53 health checks detect failure and update DNS within 1-2 minutes. Total RTO ~5 min.' },
      { id: 'd', text: 'Active-Active: full production stack in two regions with Route 53 latency routing', correct: false, explanation: 'Active-Active meets the requirements but runs full production in two regions, doubling infrastructure cost. Warm Standby meets the SLA at lower cost.' },
    ],
    explanation: {
      overall: 'Warm Standby is the cost-optimized choice for 5-min RTO / 1-min RPO. A minimal but functional stack runs continuously in the DR region: a small EC2 Auto Scaling group (can scale in minutes) and an RDS read replica (RPO < 1 min async replication, ~1 min to promote). Route 53 health checks with failover routing handle DNS cutover within 60-90 seconds.',
      examTip: 'Match DR pattern to RTO/RPO: hours=Backup/Restore, 10-60min=Pilot Light, 1-10min=Warm Standby, <1min=Active-Active. Always identify the lowest-cost option that meets the SLA.',
    },
    tags: ['dr', 'rto', 'rpo', 'warm-standby', 'route53'],
  },
];

const wellArchitectedQuestions: Question[] = [
  {
    id: 'wa-001',
    stem: 'A company is running a large-scale web application on EC2 with over-provisioned instances. They want to optimize costs without conducting a manual performance analysis. Which AWS service provides automated recommendations?',
    type: 'single',
    difficulty: 1,
    topicSlug: 'well-architected',
    examDomain: 'cost-optimization',
    options: [
      { id: 'a', text: 'AWS Trusted Advisor with Business Support Plan', correct: false, explanation: 'Trusted Advisor identifies over-utilized or idle resources but does not provide specific right-sizing recommendations with ML analysis.' },
      { id: 'b', text: 'AWS Compute Optimizer', correct: true, explanation: 'Compute Optimizer uses machine learning to analyze 14 days of CloudWatch metrics and recommends optimal EC2 instance types, with projected cost savings and performance impact.' },
      { id: 'c', text: 'AWS Cost Explorer rightsizing recommendations', correct: false, explanation: 'Cost Explorer does include rightsizing recommendations (powered by Compute Optimizer), but the primary tool is Compute Optimizer directly.' },
      { id: 'd', text: 'AWS Well-Architected Tool performance review', correct: false, explanation: 'The Well-Architected Tool provides guidance questions but does not analyze your actual workload metrics.' },
    ],
    explanation: {
      overall: 'AWS Compute Optimizer is the primary tool for automated right-sizing recommendations. It analyzes EC2, Lambda, ECS on Fargate, and EBS volumes using ML on CloudWatch metrics. It provides specific recommendations (e.g., switch from m5.2xlarge to m5.large) with estimated savings. Free service.',
      examTip: 'Compute Optimizer = ML right-sizing for EC2/Lambda/ECS/EBS. Trusted Advisor = broad checks but not ML-based. For right-sizing recommendations specifically, Compute Optimizer is the correct answer.',
    },
    tags: ['compute-optimizer', 'right-sizing', 'cost-optimization'],
  },
];

export const allQuestions: Question[] = [
  ...iamQuestions,
  ...vpcQuestions,
  ...computeQuestions,
  ...databaseQuestions,
  ...s3Questions,
  ...serverlessQuestions,
  ...securityQuestions,
  ...messagingQuestions,
  ...disasterRecoveryQuestions,
  ...wellArchitectedQuestions,
];
