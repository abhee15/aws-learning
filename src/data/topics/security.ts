import type { Topic } from '../../types/topic';

export const securityTopic: Topic = {
  id: 'security',
  slug: 'security',
  title: 'Security: KMS, WAF, Shield & GuardDuty',
  shortTitle: 'Security',
  icon: 'Lock',
  color: 'red',
  examDomains: ['new-solutions', 'continuous-improvement'],
  estimatedStudyHours: 7,
  summaryBullets: [
    'KMS key policy is the primary access control — IAM alone is not sufficient for KMS',
    'SCPs: allow-list vs deny-list strategy. SCPs deny but never grant permissions',
    'WAF: WebACL rules evaluated in priority order. Rate-based rules for DDoS at Layer 7',
    'GuardDuty, Macie, Inspector, Detective — each has a distinct purpose; know which detects what',
    'Secrets Manager auto-rotation vs Parameter Store — cost vs capability tradeoff',
  ],
  relatedTopics: ['iam', 'networking', 'serverless'],
  subtopics: [
    {
      id: 'sec-kms',
      title: 'KMS & Encryption',
      sections: [
        {
          id: 'sec-kms-keys',
          title: 'KMS Key Types & Management',
          content: '**AWS Managed Keys**: Created by AWS services (e.g., `aws/s3`, `aws/rds`). No cost. Cannot manage rotation, cannot control key policy directly (only via service). Cannot be used by other accounts. Rotated automatically every year.\n\n**Customer Managed Keys (CMK)**: Created by customer. $1/month/key. Full control over key policy, rotation, deletion. Can be shared cross-account via key policy. Can add aliases. Rotation: automatic (every year if enabled) or on-demand (manual). When rotated, old key material retained to decrypt old ciphertext.\n\n**AWS Owned Keys**: Free, not visible in your account. Used internally by some services. No control.\n\n**Multi-Region Keys**: Replicate key material to multiple regions. Same key ID prefix (`mrk-`). Encrypt in one region, decrypt in another without re-encryption. Use for: DynamoDB Global Tables encryption, Aurora Global Database, active-active DR scenarios. NOT the same as cross-region key sharing.\n\n**KMS Key Policy**: JSON resource policy on the key. **Required** — IAM alone is not sufficient. Default key policy allows root account (which allows IAM policies to further delegate). Explicitly deny can prevent even account root from using the key.\n\n**Key Deletion**: Schedule deletion (7-30 day waiting period). During waiting period, key cannot be used for encryption but can be cancelled. This prevents accidental deletion of keys protecting data. Consider disabling instead of deleting if unsure.',
          keyPoints: [
            { text: 'KMS key policy is the primary access control mechanism. IAM permission alone does NOT grant access to a KMS key without key policy', gotcha: true },
            { text: 'Multi-Region Keys: same key material in multiple regions — encrypt in us-east-1, decrypt in eu-west-1 without re-encryption', examTip: true },
            { text: 'Automatic key rotation retains old key material — old ciphertexts still decrypt. New data encrypted with new material', examTip: true },
            { text: 'Minimum 7-day deletion waiting period — gives time to detect and cancel accidental key deletion', examTip: true },
          ],
          bestPractices: [
            { pillar: 'security', text: 'Use separate KMS keys per classification level (PII, financial, general) and per environment (prod vs dev) to limit blast radius of key compromise and simplify compliance auditing' },
            { pillar: 'security', text: 'Never use AWS managed keys for data you may need to share cross-account or revoke — only customer managed keys support cross-account key policies and granular revocation' },
            { pillar: 'operational-excellence', text: 'Enable KMS key deletion alerts via CloudTrail + EventBridge — detect pending key deletions immediately to prevent accidental data loss' },
            { pillar: 'cost-optimization', text: 'Use AWS managed keys for non-sensitive data where compliance does not require customer control — saves $1/month/key at scale across hundreds of services' },
          ],
          useCases: [
            {
              scenario: 'A multi-region application encrypts sensitive PII data in us-east-1 using KMS. The DR region (eu-west-1) needs to decrypt this data during a regional failover without re-encrypting all stored data.',
              wrongChoices: ['Copy the KMS key to eu-west-1 — KMS keys cannot be exported or copied', 'Re-encrypt all data with a eu-west-1 key before failover — operationally infeasible for large datasets'],
              correctChoice: 'Create a KMS Multi-Region Key (mrk-) with a replica in eu-west-1. Both regions share the same key material and key ID prefix — eu-west-1 can decrypt ciphertext created in us-east-1.',
              reasoning: 'Multi-Region Keys replicate key material across regions while maintaining key policy control. This is the only way to decrypt KMS-encrypted data in a different region without re-encryption.',
            },
          ],
        },
        {
          id: 'sec-kms-envelope',
          title: 'Envelope Encryption & Data Keys',
          content: '**Envelope Encryption**: KMS generates a Data Encryption Key (DEK). DEK encrypts your data. KMS key (KEK) encrypts the DEK. Only the encrypted DEK is stored with the data. To decrypt: call KMS.Decrypt with encrypted DEK → get plaintext DEK → decrypt data locally.\n\n**Why envelope encryption?**: KMS API has 4KB limit on plaintext data. Large datasets must be encrypted locally with DEK. Also reduces KMS API calls — encrypt once, decrypt DEK only when needed.\n\n**GenerateDataKey**: Returns both plaintext DEK and encrypted DEK. Use plaintext DEK to encrypt, discard immediately, store encrypted DEK.\n\n**GenerateDataKeyWithoutPlaintext**: Returns only encrypted DEK. Useful for generating keys for storage without immediate use.\n\n**KMS API calls**: All KMS cryptographic operations logged in CloudTrail. Throttling: 5,500-30,000 requests/s depending on region and key type (symmetric vs asymmetric).\n\n**Asymmetric KMS keys**: RSA and ECC key pairs. Public key downloadable (no charge). Private key never leaves KMS. Use for digital signing (non-repudiation), or encrypt data outside AWS (public key), decrypt in AWS (private key in KMS).',
          keyPoints: [
            { text: 'Envelope encryption: data encrypted by DEK, DEK encrypted by KMS key. KMS never sees your actual data for large payloads', examTip: true },
            { text: 'GenerateDataKey returns plaintext + encrypted DEK. Use plaintext immediately then discard — never store plaintext DEK', examTip: true },
            { text: 'Asymmetric KMS: public key can be downloaded for external use. Ideal for clients outside AWS that need to encrypt data for your service', examTip: true },
          ],
        },
        {
          id: 'sec-secrets',
          title: 'Secrets Manager vs Parameter Store',
          content: '**AWS Secrets Manager**: Purpose-built for secrets (credentials, API keys, OAuth tokens). Automatic rotation via Lambda (managed or custom). Native rotation for RDS, Aurora, Redshift, DocumentDB. Cross-account access via resource policy. $0.40/secret/month + $0.05/10K API calls. Secrets encrypted by KMS. Supports versioning (AWSCURRENT, AWSPENDING, AWSPREVIOUS).\n\n**Systems Manager Parameter Store**: Hierarchical key-value store. Standard tier: free, 4KB limit. Advanced tier: $0.05/10K API calls, 8KB limit, parameter policies (TTL expiry). SecureString type encrypted via KMS. No automatic rotation — must build rotation yourself. Can store non-secret config alongside secrets. IAM + resource policy access control.\n\n**When to use Secrets Manager**: Database credentials (especially with auto-rotation), credentials shared across accounts, need automatic rotation without custom code.\n\n**When to use Parameter Store**: Application configuration (non-secrets), hierarchy of configs per environment, cost-sensitive (many parameters), config + secrets co-located, no rotation needed.',
          keyPoints: [
            { text: 'Secrets Manager auto-rotates RDS/Aurora credentials without downtime using staged rotation (AWSPENDING → AWSCURRENT)', examTip: true },
            { text: 'Parameter Store is free for standard tier — use for non-sensitive config. Secrets Manager charges per secret', examTip: true },
            { text: 'Both integrate with Lambda, ECS, EKS, and CloudFormation via dynamic references', examTip: true },
            { text: 'Parameter Store advanced tier adds parameter policies: auto-expire secrets after TTL (poor-man\'s rotation)', examTip: true },
          ],
          comparisons: [
            {
              headers: ['Feature', 'Secrets Manager', 'Parameter Store'],
              rows: [
                ['Cost', '$0.40/secret/month', 'Free (standard)'],
                ['Auto-rotation', 'Yes (native for RDS/Aurora/etc)', 'No (build yourself)'],
                ['Max size', '64KB', '4KB (standard), 8KB (advanced)'],
                ['Cross-account', 'Yes (resource policy)', 'Limited'],
                ['Versioning', 'Yes (current/pending/previous)', 'Yes (version numbers)'],
                ['Use case', 'DB credentials, OAuth tokens', 'App config, env vars, mixed config'],
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'sec-network',
      title: 'Network Security',
      sections: [
        {
          id: 'sec-waf',
          title: 'WAF, Shield & Firewall Manager',
          content: '**AWS WAF**: Layer 7 (HTTP/HTTPS) firewall. Protects ALB, API Gateway (REST), CloudFront, AppSync, Cognito. WebACL with rules evaluated in priority order (lowest number first). Actions: Allow, Block, Count, CAPTCHA.\n\n**WAF Rule types**:\n- **AWS Managed Rule Groups**: Pre-built rules for OWASP Top 10, known bad IPs, bot control\n- **Rate-based rules**: Block IPs exceeding request threshold (per 5-minute window)\n- **IP Set rules**: Allow/block specific IP ranges\n- **Geo match**: Block or allow based on country\n- **String match/Regex**: Inspect URI, query string, body, headers\n- **Size constraint**: Block oversized requests\n\n**WAF Logging**: Full request logs to S3, CloudWatch Logs, or Kinesis Firehose. Use for forensics, rule tuning.\n\n**AWS Shield Standard**: Automatically included for all AWS customers. Protects against common Layer 3/4 DDoS (SYN floods, UDP reflection). No cost.\n\n**AWS Shield Advanced**: $3,000/month per organization. Enhanced Layer 3/4/7 DDoS protection. DDoS Response Team (DRT) 24/7 access. Cost protection (credits for DDoS-induced scaling costs). Real-time attack visibility. Protects: EC2, ELB, CloudFront, Route 53, Global Accelerator. Health-based detection reduces false positives.\n\n**Firewall Manager**: Centrally manage WAF rules, Shield Advanced, Security Groups, and Network Firewall policies across AWS Organization accounts. Requires AWS Organizations + Security Hub enablement. Enforces consistent security posture.',
          keyPoints: [
            { text: 'WAF protects at Layer 7 (HTTP). Shield protects at Layer 3/4. Both together for comprehensive DDoS protection', examTip: true },
            { text: 'Shield Advanced: $3K/month but includes DRT access + cost protection credits for DDoS scaling events', examTip: true },
            { text: 'WAF rules evaluated in priority order — lower number = evaluated first. First matching rule wins', examTip: true },
            { text: 'Firewall Manager requires AWS Organizations to centrally deploy WAF WebACLs across all member accounts', examTip: true },
          ],
        },
        {
          id: 'sec-network-fw',
          title: 'AWS Network Firewall & Security Groups',
          content: '**AWS Network Firewall**: Stateful, managed network firewall for VPCs. Deployed in dedicated subnet per AZ (Firewall Endpoint). Route tables direct traffic through firewall endpoint. Supports: stateless rules (5-tuple), stateful rules (Suricata IDS/IPS signatures), TLS inspection (decrypt, inspect, re-encrypt). Use for: deep packet inspection, domain-based filtering (block *.malicious.com), intrusion detection.\n\n**Security Groups vs NACLs**:\n- Security Groups: stateful, instance-level, allow rules only (implicit deny). Evaluates all rules before deciding.\n- NACLs: stateless (must allow both inbound AND outbound), subnet-level, numbered rules evaluated in order, support explicit deny. Allow rules AND deny rules.\n\n**Security Groups: reference by ID**: Cross-account SG reference allowed in VPC peering. Can reference SG in same region/account. Cannot reference SG from different region.\n\n**VPC Flow Logs**: Capture IP traffic metadata (not payload). Per ENI, per subnet, or per VPC. Published to CloudWatch Logs or S3. Use for: traffic analysis, security forensics, identifying rejected connections. Does NOT capture: DNS traffic (Route 53 resolver), DHCP, instance metadata (169.254.x.x), time sync (Amazon Time Sync Service).',
          keyPoints: [
            { text: 'Network Firewall requires dedicated subnet + route table changes to route traffic through firewall endpoints', examTip: true },
            { text: 'NACLs are stateless: must explicitly allow return traffic. Security Groups are stateful: return traffic automatically allowed', gotcha: true },
            { text: 'NACLs support explicit DENY — use to block specific IPs. Security Groups cannot explicitly deny; only allow', examTip: true },
            { text: 'VPC Flow Logs capture metadata only (5-tuple + action + bytes). No payload inspection — use Network Firewall for DPI', examTip: true },
          ],
        },
      ],
    },
    {
      id: 'sec-detective',
      title: 'Security Detection & Response',
      sections: [
        {
          id: 'sec-detection-services',
          title: 'GuardDuty, Macie, Inspector & Detective',
          content: '**Amazon GuardDuty**: Threat detection using ML on CloudTrail, VPC Flow Logs, DNS logs, S3 data events, EKS audit logs, RDS login activity, Lambda network activity. Detects: compromised instances (crypto mining, C2 callbacks), credential theft (unusual API calls from TOR), S3 data exfiltration, account compromise. No agent required. Multi-account via AWS Organizations (delegate to security account). Findings exportable to EventBridge → Security Hub → downstream SIEM.\n\n**Amazon Macie**: Data security/privacy. Uses ML to discover and classify sensitive data in S3 (PII, credentials, financial data). Generates findings for unencrypted buckets, publicly accessible buckets, sensitive data exposure. Integrates with Security Hub.\n\n**Amazon Inspector**: Automated vulnerability assessment. Finds OS vulnerabilities (CVEs) and network exposure. Supports EC2 (via SSM agent), Lambda functions, container images in ECR. Continually scans (not just scheduled). Prioritizes findings by risk score combining vulnerability severity + network exposure.\n\n**Amazon Detective**: Investigate security findings. Aggregates data from GuardDuty, CloudTrail, VPC Flow Logs. Builds behavioral graphs. Helps answer "how did this happen?" — not detection but investigation. Visualizes activity timelines, resource relationships.\n\n**Security Hub**: Central dashboard aggregating findings from GuardDuty, Macie, Inspector, IAM Access Analyzer, Firewall Manager. Runs automated compliance checks (CIS AWS Foundations, PCI DSS, NIST 800-53). Normalize findings to ASFF (Amazon Security Finding Format).\n\n**CloudTrail**: API call audit log. Every API call recorded (user, time, source IP, parameters). Management events (control plane) on by default. Data events (S3 GetObject, Lambda invocations) optional (extra cost). Insights: detect unusual API call rates. Log file integrity validation: SHA-256 digest chain — detect tampering.',
          keyPoints: [
            { text: 'GuardDuty = threat detection (active attacks). Inspector = vulnerability assessment (CVEs). Macie = sensitive data in S3. Detective = investigation', examTip: true },
            { text: 'GuardDuty needs no agents — works from logs (CloudTrail, Flow Logs, DNS). Inspector needs SSM agent for EC2', examTip: true },
            { text: 'Security Hub aggregates findings from ALL security services into single pane. Required for multi-account security posture', examTip: true },
            { text: 'CloudTrail data events (S3 object access) are NOT enabled by default — must explicitly enable for forensic logging', gotcha: true },
          ],
          bestPractices: [
            { pillar: 'security', text: 'Enable GuardDuty in ALL regions and ALL accounts via AWS Organizations delegated admin — threats are not limited to your primary region', detail: 'Use GuardDuty multi-account enrollment to centralize findings in a dedicated security account' },
            { pillar: 'security', text: 'Create EventBridge rules on GuardDuty HIGH severity findings to auto-trigger response Lambda functions — isolate compromised instances, revoke credentials, notify security team' },
            { pillar: 'operational-excellence', text: 'Configure a multi-account CloudTrail Organization trail from the management account — single trail covering all accounts, stored in a dedicated log archive account with S3 Object Lock' },
            { pillar: 'security', text: 'Enable Macie on all S3 buckets containing customer data — GDPR/CCPA compliance requires knowing where PII lives. Automate remediation of public bucket findings via EventBridge' },
            { pillar: 'reliability', text: 'Store GuardDuty, CloudTrail, and Config findings in a separate, immutable log archive account with an SCP preventing log deletion — ensures forensic integrity even if primary accounts are compromised' },
          ],
          useCases: [
            {
              scenario: 'Security team discovers that an IAM access key was accidentally committed to a public GitHub repository 3 hours ago. They need to determine what API calls were made with that key during that window.',
              wrongChoices: ['Use GuardDuty — it detects threats going forward, not retroactive log analysis', 'Use Amazon Inspector — it scans for CVEs, not API call history'],
              correctChoice: 'Query CloudTrail Lake or Athena-over-S3 for all API calls matching the compromised access key ID (AKIA...) in the 3-hour window. Use Amazon Detective to visualize the activity graph and identify affected resources.',
              reasoning: 'CloudTrail records all API calls with the caller identity. Detective builds a behavioral graph from CloudTrail and GuardDuty data, making it easier to trace the blast radius of credential compromise.',
            },
            {
              scenario: 'A startup has 15 AWS accounts across 3 OUs. The security team wants centralized visibility into misconfigurations (public S3 buckets, over-permissive security groups) and compliance against CIS AWS Foundations benchmark.',
              wrongChoices: ['Deploy GuardDuty in each account and review individually', 'Use AWS Config rules in each account separately'],
              correctChoice: 'Enable Security Hub with delegated admin from the management account, enable CIS AWS Foundations standard, and aggregate findings from all accounts into the security account.',
              reasoning: 'Security Hub provides centralized CSPM (Cloud Security Posture Management), runs compliance checks against CIS/PCI/NIST standards, and aggregates findings from GuardDuty, Macie, Inspector across all accounts in the Organization.',
            },
          ],
          comparisons: [
            {
              headers: ['Service', 'Purpose', 'Data Sources', 'Action Needed?'],
              rows: [
                ['GuardDuty', 'Threat detection', 'CloudTrail, Flow Logs, DNS, S3', 'Alert → remediate'],
                ['Macie', 'Sensitive data discovery', 'S3 objects', 'Alert → protect'],
                ['Inspector', 'Vulnerability scanning', 'EC2 OS, ECR, Lambda', 'Patch → remediate'],
                ['Detective', 'Investigation', 'GuardDuty, CloudTrail, Flow Logs', 'Analyze → understand'],
                ['Security Hub', 'Aggregation + compliance', 'All above services', 'Dashboard + CSPM'],
                ['CloudTrail', 'API audit logging', 'All AWS API calls', 'Forensics + compliance'],
              ],
            },
          ],
        },
        {
          id: 'sec-iam-advanced',
          title: 'Advanced IAM: SCPs, Permission Boundaries & ABAC',
          content: '**Service Control Policies (SCPs)**: Applied at AWS Organizations OU or account level. Define MAXIMUM permissions — they can only restrict, never grant. Even account root is constrained by SCPs. Two strategies:\n- **Deny list (default)**: Allow all, then add explicit deny statements for restricted actions\n- **Allow list**: Start with empty SCP (denies all), explicitly allow only needed services/actions. Safer but more management overhead.\n\n**SCP Evaluation**: Effective permissions = IAM permissions ∩ SCP permissions. SCP does not replace IAM — both must allow.\n\n**Permission Boundaries**: Maximum permissions for a principal (user or role). Used to delegate IAM permissions safely — admin creates user with boundary, user can only create policies within boundary. Does NOT grant permissions by itself.\n\n**ABAC (Attribute-Based Access Control)**: IAM policies using conditions on resource tags and principal tags. Tag the resource with `Project=Alpha`, tag the user with `Project=Alpha`, policy allows access when tags match. Scales without policy changes as teams grow.\n\n**IAM Access Analyzer**: Identifies resources shared externally (S3 buckets, KMS keys, IAM roles, Lambda functions, SQS queues, Secrets Manager secrets). Uses formal reasoning (Zelkova) to analyze policies. Also validates and generates policies. Zone of trust: AWS account or organization.',
          keyPoints: [
            { text: 'SCPs restrict even the root account. An SCP denying an action blocks it regardless of any IAM policy', examTip: true },
            { text: 'Permission boundary defines maximum allowed permissions — does NOT grant anything by itself', gotcha: true },
            { text: 'ABAC scales access control with tags — no need to update policies when new projects/teams are added', examTip: true },
            { text: 'IAM Access Analyzer uses formal reasoning (not heuristics) to prove whether external access is possible', examTip: true },
          ],
        },
      ],
    },
  ],
};
