import type { Topic } from '../../types/topic';

export const computeTopic: Topic = {
  id: 'compute',
  slug: 'compute',
  title: 'EC2, Auto Scaling & Load Balancing',
  shortTitle: 'Compute',
  icon: 'Cpu',
  color: 'orange',
  examDomains: ['new-solutions', 'cost-optimization', 'continuous-improvement'],
  estimatedStudyHours: 8,
  summaryBullets: [
    'ALB for HTTP/HTTPS with host/path routing; NLB for TCP/UDP ultra-low latency and static IPs',
    'ASG scaling policies: Target Tracking (preferred), Step Scaling, Scheduled, Predictive',
    'Spot Instances: up to 90% discount but interruptible with 2-minute warning — design for fault tolerance',
    'Placement Groups: Cluster (low latency, HPC), Spread (max isolation), Partition (Hadoop/Kafka)',
    'Launch Templates supersede Launch Configurations — required for mixed instance types and Spot pools',
  ],
  relatedTopics: ['networking', 'security', 'containers'],
  solutionArchitectures: [
    {
      id: 'compute-arch-spot-mixed',
      title: 'Cost-Optimized Auto Scaling with Mixed Instance Types',
      description: 'ASG uses a mix of On-Demand and Spot instances across multiple instance families and sizes. Dramatically reduces compute costs (60-80%) while maintaining availability through diversification across Spot pools.',
      useCase: 'Stateless web application tiers, batch processing, any workload that can handle occasional instance termination with graceful shutdown',
      components: [
        { name: 'Launch Template', role: 'Defines base AMI, security groups, IAM role. Specifies instance type overrides for multiple families (m5, m5a, m5n, m4) at same compute capacity' },
        { name: 'ASG Mixed Instances Policy', role: 'Allocates percentage between On-Demand (base capacity) and Spot (scale capacity). Spot allocation strategy: capacity-optimized or price-capacity-optimized' },
        { name: 'Spot Instance Interruption Handler', role: 'Lambda triggered by EC2 Spot interruption notice (2-minute warning via EventBridge). Deregisters instance from target group, drains connections, checkpoints work' },
        { name: 'ALB Target Group', role: 'Distributes traffic across healthy On-Demand and Spot instances. Connection draining on deregistration gives in-flight requests time to complete' },
        { name: 'SQS Queue (batch)', role: 'For batch workloads: workers pull jobs from SQS. On interruption, job visibility timeout resets and another instance picks it up — natural fault tolerance' },
      ],
      dataFlow: [
        'ASG maintains base capacity as On-Demand (e.g., 20%), scales out with Spot (80%)',
        'capacity-optimized Spot strategy selects pools with most available capacity — minimizes interruption rate',
        'EC2 sends Spot interruption notice 2 minutes before reclaim → EventBridge rule → Lambda handler',
        'Lambda: deregister from ALB target group → wait for connection draining (30s) → instance self-terminates or ASG replaces',
        'ASG detects capacity below desired → launches replacement in next best Spot pool or falls back to On-Demand',
      ],
      keyDecisions: [
        'Use capacity-optimized-prioritized Spot allocation to balance interruption risk against cost savings',
        'Set On-Demand base capacity to minimum needed to serve traffic if all Spot is reclaimed simultaneously',
        'Use multiple instance families with similar vCPU/memory (m5, m5a, r5, r5a) — more pool diversity = lower interruption rate',
        'Application must handle SIGTERM gracefully — containerizing with ECS/Fargate on Spot simplifies interruption handling',
      ],
      tradeoffs: [
        { pro: '60-90% compute cost reduction vs all On-Demand. AWS handles Spot pool selection and diversification', con: 'Spot instances can be interrupted with 2-minute notice — stateful workloads require careful design' },
        { pro: 'capacity-optimized strategy reduces interruption frequency vs purely price-based strategies', con: 'Not all instance types available as Spot in all AZs — must diversify across instance families' },
      ],
      examAngle: 'When an exam question asks to "reduce EC2 costs significantly" for a stateless, fault-tolerant workload → Spot Instances with multiple instance families (mixed instances policy). Key design elements: 2-minute interruption notice handling, On-Demand base for minimum capacity, Spot for burst.',
    },
    {
      id: 'compute-arch-blue-green',
      title: 'Blue/Green Deployment with ALB Weighted Target Groups',
      description: 'Zero-downtime deployments using ALB weighted routing between Blue (current) and Green (new) Auto Scaling Groups. Traffic gradually shifts from old to new, with instant rollback capability.',
      useCase: 'Production deployments requiring zero downtime, gradual traffic shifting, and fast rollback. Works for EC2-based applications, ECS services, and Lambda function versions.',
      components: [
        { name: 'ALB Listener', role: 'Single HTTPS listener with weighted forward action distributing traffic between Blue and Green target groups' },
        { name: 'Blue ASG + Target Group', role: 'Current production environment. Receives 100% traffic initially. Scaled down and terminated after successful green validation' },
        { name: 'Green ASG + Target Group', role: 'New version environment. Pre-warmed to full capacity before receiving traffic. Weight gradually increased from 0% to 100%' },
        { name: 'Health Checks', role: 'ALB health checks validate green instances are serving traffic correctly before increasing weight. Custom health checks via Lambda or CloudWatch Synthetic Canaries' },
        { name: 'CodeDeploy', role: 'Orchestrates the deployment: provisions green ASG, runs validation hooks, shifts traffic weights, terminates blue on success' },
      ],
      dataFlow: [
        'Deploy: provision Green ASG with new AMI → wait for all instances to pass ALB health checks',
        'Canary: shift 10% of traffic to Green → monitor error rate and latency for 5 minutes',
        'Linear: if healthy, shift 10% more every 5 minutes until 100% on Green (or use all-at-once)',
        'Validate: run smoke tests against Green → confirm functionality at 100% traffic',
        'Cleanup: deregister Blue instances from target group → terminate Blue ASG',
        'Rollback: if error rate spikes, immediately set Green weight=0, Blue weight=100 — no restart needed',
      ],
      keyDecisions: [
        'Pre-warm green ASG to full desired capacity before shifting any traffic — avoids cold start latency under load',
        'Enable ALB slow start for new green instances — gradually ramps up requests to avoid overwhelming cold instances',
        'Set termination timeout on blue ASG to allow in-flight requests to complete before killing instances',
        'Use CodeDeploy lifecycle hooks for pre-traffic validation (integration tests) and post-traffic validation (synthetic canaries)',
      ],
      tradeoffs: [
        { pro: 'Zero-downtime deployment with instant rollback — just shift ALB weights back to 100% blue', con: 'Runs two full environments simultaneously during deployment — doubles compute cost temporarily' },
        { pro: 'Gradual traffic shifting reduces blast radius of bad deployments (canary → linear → full)', con: 'More complex than in-place rolling updates — requires infrastructure automation (CodeDeploy, Terraform)' },
      ],
      examAngle: 'Blue/Green = two separate environments, traffic shifted at load balancer. In-place rolling = same instances updated gradually. Canary = small percentage to new version first. Blue/Green has the fastest rollback (DNS/LB switch) vs in-place (re-deploy old version to all instances).',
    },
  ],
  subtopics: [
    {
      id: 'compute-ec2',
      title: 'EC2 Instance Types & Purchase Models',
      sections: [
        {
          id: 'compute-instance-types',
          title: 'Instance Families & Purchase Options',
          content: '**EC2 Instance Families** (know when to use each):\n- **General Purpose (M, T)**: Balanced CPU/memory. M-series for production workloads, T-series for burstable development (CPU credits).\n- **Compute Optimized (C)**: High CPU-to-memory ratio. Batch processing, scientific modeling, video encoding, gaming servers.\n- **Memory Optimized (R, X, U)**: High memory. In-memory caches, real-time big data analytics, SAP HANA. R=memory optimized, X=extreme memory (up to 24TB), U=bare metal high memory.\n- **Storage Optimized (I, D, H)**: High sequential I/O, high storage. I-series (NVMe SSD, low-latency IOPS for databases), D-series (dense HDD storage, data warehousing), H-series (high disk throughput, MapReduce).\n- **Accelerated Computing (P, G, Inf, Trn)**: GPUs or custom chips. P-series (ML training), G-series (graphics/inference), Inf (AWS Inferentia for inference), Trn (AWS Trainium for training).\n\n**Purchase Options**:\n- **On-Demand**: Pay per second. No commitment. Highest cost. Use for unpredictable workloads.\n- **Reserved Instances (RI)**: 1 or 3 year commitment. Up to 72% discount. Standard RI (fixed instance type), Convertible RI (can change instance type family/OS, lower discount ~54%). Scope: regional (apply to any AZ, size flexible within family) or zonal (specific AZ, capacity reservation).\n- **Savings Plans**: Flexible RI alternative. Compute Savings Plans (apply across EC2, Fargate, Lambda — most flexible, ~66% discount), EC2 Instance Savings Plans (specific family, higher discount ~72%). Commit to $/hour spend, not specific instances.\n- **Spot Instances**: Up to 90% discount. AWS can reclaim with 2-minute notice when capacity needed. Use for fault-tolerant, stateless, batch workloads. NOT suitable for databases, stateful apps without interruption handling.\n- **Dedicated Host**: Physical server dedicated to you. Compliance (BYOL licensing), regulatory requirements. Most expensive. Can use RIs on Dedicated Hosts.\n- **Dedicated Instance**: Instance runs on dedicated hardware but you don\'t control placement. Simpler than Dedicated Host.',
          keyPoints: [
            { text: 'Standard RI: fixed instance type, higher discount. Convertible RI: flexible type/OS, lower discount (~54%) — use Convertible when unsure of future instance needs', examTip: true },
            { text: 'Compute Savings Plans apply to EC2 + Fargate + Lambda — most flexible commitment. EC2 Instance Savings Plan applies to specific instance family, higher discount', examTip: true },
            { text: 'Spot interruption: 2-minute warning via EC2 metadata and EventBridge. After 2 min, instance is stopped or terminated based on interruption behavior setting', examTip: true },
            { text: 'Dedicated Host = physical server for you (BYOL software licensing). Dedicated Instance = hardware dedicated to you but you don\'t control physical server placement', examTip: true },
            { text: 'T-series instances use CPU credits — sustained high CPU will exhaust credits and throttle. Use T3 Unlimited for no throttle (extra charge for burst)', gotcha: true },
          ],
          bestPractices: [
            { pillar: 'cost-optimization', text: 'Use Compute Savings Plans for maximum flexibility — covers EC2, Fargate, and Lambda without committing to specific instance types, regions, or OS' },
            { pillar: 'cost-optimization', text: 'Analyze Cost Explorer Savings Plans recommendations quarterly — as workload grows, new commitment tiers become cost-effective' },
            { pillar: 'performance', text: 'Right-size instances using Compute Optimizer recommendations before purchasing RIs or Savings Plans — commit to the right size, not current over-provisioned size' },
            { pillar: 'sustainability', text: 'Choose Graviton (ARM) instance types (M7g, C7g, R7g) for 20-40% better price/performance than comparable x86 — also lower energy consumption per workload unit' },
          ],
          comparisons: [
            {
              headers: ['Purchase Model', 'Discount vs On-Demand', 'Flexibility', 'Best For'],
              rows: [
                ['On-Demand', 'None', 'Maximum', 'Unpredictable, short-term'],
                ['Reserved (Standard)', 'Up to 72%', 'Fixed type/region', 'Steady-state, known workloads'],
                ['Reserved (Convertible)', 'Up to 54%', 'Can change family/OS', 'Steady-state, uncertain future needs'],
                ['Compute Savings Plans', 'Up to 66%', 'EC2/Fargate/Lambda, any region', 'Mixed EC2+Fargate+Lambda workloads'],
                ['EC2 Savings Plans', 'Up to 72%', 'Specific family, any AZ/size/OS', 'EC2-heavy, family known'],
                ['Spot', 'Up to 90%', 'Maximum (if interruptible)', 'Batch, stateless, fault-tolerant'],
                ['Dedicated Host', 'RI pricing applicable', 'Physical server control', 'BYOL licensing, compliance'],
              ],
            },
          ],
        },
        {
          id: 'compute-placement',
          title: 'Placement Groups & Advanced EC2',
          content: '**Placement Groups**: Control how EC2 instances are placed on underlying hardware.\n\n**Cluster Placement Group**: All instances in a single AZ, close together on same rack or adjacent racks. Achieves 10 Gbps network throughput between instances (vs 5 Gbps standard). Lowest latency inter-instance network. Used for: HPC, tightly coupled applications (MPI), distributed cache that needs fast node-to-node. Risk: all instances on correlated hardware — AZ failure or rack failure takes down cluster.\n\n**Spread Placement Group**: Instances placed on distinct underlying hardware (different racks). Maximum 7 instances per AZ per group. Used for: small number of critical instances that must not share hardware (primary + standby pairs for databases, Kafka brokers). Reduces correlated hardware failure risk.\n\n**Partition Placement Group**: Divides instances into logical partitions (up to 7 per AZ). Each partition uses distinct hardware racks. Partitions are isolated from each other\'s hardware failures. Used for: distributed systems where rack-level failure isolation matters at scale — Hadoop HDFS, Cassandra, Kafka. Instances within a partition may share hardware.\n\n**EC2 Instance Metadata Service (IMDS)**:\n- IMDSv1: HTTP GET without authentication (insecure, susceptible to SSRF attacks)\n- IMDSv2: Session-oriented — requires PUT request to get token, then use token for metadata requests. Protects against SSRF. Require IMDSv2 via `aws ec2 modify-instance-metadata-options`\n- Metadata URL: `http://169.254.169.254/latest/meta-data/`\n- User Data URL: `http://169.254.169.254/latest/user-data/`\n\n**EC2 Hibernate**: Saves RAM contents to EBS root volume. Instance state preserved across stop/start. Boot time significantly faster (no OS boot). Requirements: EBS root volume must be encrypted, instance RAM must be less than 150 GB.',
          keyPoints: [
            { text: 'Cluster PG: low latency, high network throughput — but correlated failure risk. All instances in one AZ', examTip: true },
            { text: 'Spread PG: max 7 per AZ, distinct hardware per instance — for small critical instance sets that need hardware isolation', examTip: true },
            { text: 'Partition PG: partition-level hardware isolation for large distributed systems (Kafka, Cassandra, HDFS)', examTip: true },
            { text: 'Require IMDSv2 on all instances — IMDSv1 is vulnerable to SSRF credential theft attacks via EC2 metadata endpoint', gotcha: true },
            { text: 'EC2 Hibernate: RAM to EBS. Faster restart. EBS must be encrypted. Max 60 days hibernate duration', examTip: true },
          ],
        },
      ],
    },
    {
      id: 'compute-asg',
      title: 'Auto Scaling Groups',
      sections: [
        {
          id: 'compute-asg-policies',
          title: 'ASG Scaling Policies & Configuration',
          content: '**Auto Scaling Group (ASG)**: Maintains desired number of EC2 instances. Replaces unhealthy instances. Scales out (add) or in (remove) based on policies.\n\n**Scaling Policy Types**:\n- **Target Tracking**: Simplest. Define a target metric value (e.g., keep CPU at 50%). ASG automatically creates CloudWatch alarms and adjusts capacity. Scales out fast, scales in slowly (prevents thrashing).\n- **Step Scaling**: Define steps — at CPU 60-70% add 1 instance, at 70-80% add 2, etc. More control than target tracking. Triggered by CloudWatch alarm.\n- **Simple Scaling**: Like step but adds/removes fixed count. Cooldown period after each action. Less sophisticated than step.\n- **Scheduled Scaling**: Scale to defined capacity at specific times. Useful for predictable patterns (scale up every morning, scale down at night). Can combine with other policies.\n- **Predictive Scaling**: ML-based. Analyzes historical patterns, forecasts load, scales preemptively. Best for cyclical patterns. Works alongside reactive policies.\n\n**Launch Templates vs Launch Configurations**:\n- Launch Templates: versioned, support mixed instance types, T2 Unlimited, Dedicated Hosts, multiple network interfaces. Required for EC2 Fleet and mixed instances.\n- Launch Configurations: deprecated feature, no versioning, limited features. Migrate to Launch Templates.\n\n**Lifecycle Hooks**: Pause instances at launch or termination to perform custom actions:\n- Launch hook: instance reaches `Pending:Wait` → run configuration scripts, install software → complete hook → instance goes `InService`\n- Termination hook: `Terminating:Wait` → drain connections, push logs → complete hook → instance terminated\n- Default timeout: 1 hour (configurable). Heartbeat to extend.\n\n**Warm Pools**: Pre-initialize a pool of EC2 instances in stopped or running state. When ASG needs to scale out, instances launch from the warm pool instead of cold — dramatically reduces scale-out latency.',
          keyPoints: [
            { text: 'Target Tracking is the recommended default — simplest to configure and works well for most web workloads (CPU, request count per target, or custom metric)', examTip: true },
            { text: 'Predictive Scaling + Target Tracking together: Predictive pre-scales for forecasted load, Target Tracking handles unexpected spikes', examTip: true },
            { text: 'Lifecycle hooks: always use for graceful shutdown (drain connections, flush logs) — default termination does not wait for in-flight requests', examTip: true },
            { text: 'Cooldown period: prevents ASG from launching/terminating instances before previous scaling action takes effect. Default 300s', gotcha: true },
            { text: 'Instance Refresh: rolling replacement of instances in an ASG (e.g., after AMI update). Respects min healthy percentage to avoid outage', examTip: true },
          ],
          bestPractices: [
            { pillar: 'reliability', text: 'Spread ASG across 3+ AZs and use ALB for even distribution — single-AZ ASG is a reliability anti-pattern' },
            { pillar: 'reliability', text: 'Configure lifecycle terminate hooks to gracefully drain ALB connections (set connection draining timeout = hook timeout + buffer) before instance termination' },
            { pillar: 'performance', text: 'Use Warm Pools for latency-sensitive scale-out — pre-initialized instances avoid the minutes-long bootstrapping delay of cold starts' },
            { pillar: 'cost-optimization', text: 'Use Predictive Scaling to scale out before traffic peaks — avoids over-provisioning buffer capacity and ensures capacity is available when needed without reactive lag' },
          ],
          useCases: [
            {
              scenario: 'An e-commerce site experiences a daily 9AM traffic surge that the current ASG handles with Target Tracking. The 5-minute warm-up lag after the surge starts causes elevated error rates every morning.',
              wrongChoices: ['Increase ASG minimum capacity permanently — wastes cost overnight', 'Use Step Scaling — still reactive, still has launch lag'],
              correctChoice: 'Enable Predictive Scaling alongside Target Tracking. Predictive Scaling analyzes the historical 9AM pattern and pre-scales capacity 30 minutes before the surge. Target Tracking handles any additional unexpected load.',
              reasoning: 'Predictive Scaling uses ML to forecast cyclical traffic patterns and scales proactively. The combination with Target Tracking ensures both predictable and unpredictable spikes are handled without manual scheduling.',
            },
          ],
        },
      ],
    },
    {
      id: 'compute-elb',
      title: 'Elastic Load Balancing',
      sections: [
        {
          id: 'compute-alb-nlb',
          title: 'ALB vs NLB vs CLB',
          content: '**Application Load Balancer (ALB)**: Layer 7 (HTTP/HTTPS/gRPC). Content-based routing — route by host, path, query string, HTTP headers, source IP. Supports WebSocket. Fixed response actions (redirect, fixed-string). Lambda targets. Cognito authentication integration. WAF integration. Sticky sessions via cookie.\n\n**ALB Routing Rules** (evaluated in priority order):\n- Host-based: `api.example.com` → API target group, `app.example.com` → App target group\n- Path-based: `/api/*` → API TG, `/static/*` → S3 via Lambda\n- Header/Query-based: `X-Version: v2` → Canary TG\n- Weighted target groups: 90% → Blue TG, 10% → Green TG (canary releases)\n\n**Network Load Balancer (NLB)**: Layer 4 (TCP/UDP/TLS). Ultra-low latency (microseconds). Handles millions of requests per second. Preserves client source IP. Static IP per AZ (Elastic IPs assignable). No security groups on NLB itself. Target: EC2, Lambda, ALB (for ALB behind NLB pattern).\n\n**NLB use cases**: TCP traffic where ALB cannot be used, ultra-low latency gaming/trading, static IP requirement (firewall whitelist), UDP (DNS, real-time streaming), PrivateLink endpoint services (NLB required).\n\n**Gateway Load Balancer (GWLB)**: Layer 3. Distributes traffic to a fleet of virtual appliances (firewalls, IDS, DPI). Uses GENEVE encapsulation. Transparent to source/destination. Deployed in Appliance VPC — traffic routed through it via Gateway Load Balancer Endpoint.\n\n**Cross-Zone Load Balancing**: Distributes requests evenly across all registered instances in all AZs (not just the AZ the request landed in). ALB: enabled by default (no charge). NLB/GWLB: disabled by default — charges apply per AZ per GB when enabled.',
          keyPoints: [
            { text: 'ALB: Layer 7 routing (host/path/header). NLB: Layer 4, ultra-low latency, static IPs. Use NLB when you need static IP or TCP/UDP', examTip: true },
            { text: 'NLB is required for PrivateLink Endpoint Services — ALB cannot be used as the backing for PrivateLink', examTip: true },
            { text: 'ALB cannot preserve client source IP by default — use `X-Forwarded-For` header or enable client IP preservation in target group', gotcha: true },
            { text: 'NLB preserves client source IP natively — no proxy protocol needed for EC2 targets', examTip: true },
            { text: 'Cross-zone load balancing: ALB always on (free). NLB off by default — enabling it costs per GB but improves traffic distribution across uneven AZ instance counts', examTip: true },
          ],
          bestPractices: [
            { pillar: 'reliability', text: 'Configure ALB idle timeout to be greater than application connection keep-alive timeout — prevents premature connection drops mid-request' },
            { pillar: 'security', text: 'Attach WAF WebACL to ALB for production APIs — rate limiting, OWASP protection, and geo-blocking at the load balancer layer before traffic hits Lambda or EC2' },
            { pillar: 'performance', text: 'Enable ALB slow start mode for new instances — gradually ramps up traffic to avoid cold instance overload during scale-out' },
            { pillar: 'cost-optimization', text: 'Use ALB weighted target groups for canary deployments instead of DNS-weighted routing — faster failback (seconds vs DNS TTL minutes) and no client DNS caching issues' },
          ],
          comparisons: [
            {
              headers: ['Feature', 'ALB', 'NLB', 'GWLB'],
              rows: [
                ['OSI Layer', '7 (HTTP/HTTPS)', '4 (TCP/UDP/TLS)', '3 (IP)'],
                ['Routing', 'Host/path/header/query', 'Port/protocol', 'All traffic to appliances'],
                ['Latency', 'Milliseconds', 'Microseconds', 'Transparent'],
                ['Static IP', 'No (DNS only)', 'Yes (Elastic IP)', 'Yes'],
                ['Source IP Preservation', 'Via X-Forwarded-For', 'Yes (native)', 'Transparent (GENEVE)'],
                ['WAF Integration', 'Yes', 'No', 'No'],
                ['PrivateLink backing', 'No', 'Yes', 'Yes'],
                ['Use case', 'Web apps, microservices', 'Gaming, trading, IoT', 'Network appliance fleet'],
              ],
            },
          ],
        },
      ],
    },
  ],
};
