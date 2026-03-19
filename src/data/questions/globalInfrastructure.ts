import type { Question } from './index';

export const globalInfrastructureQuestions: Question[] = [
  {
    id: 'gi-001',
    stem: 'A global gaming company needs to reduce latency for players across North America, Europe, and Asia Pacific. Player sessions must persist (sticky sessions), game state must replicate globally, and the solution must route players to the nearest server with sub-50ms latency. Which AWS service is purpose-built for global low-latency gaming?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'global-infrastructure',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'AWS Global Accelerator with endpoint groups in each region and client affinity enabled', correct: true, explanation: 'Global Accelerator uses AWS\'s global network with anycast routing to direct players to the nearest AWS edge location, then routes over the AWS backbone to the optimal endpoint. Client affinity maintains sticky sessions. Supports TCP/UDP for real-time gaming protocols.' },
      { id: 'b', text: 'Amazon CloudFront with multiple origins in each region for global content delivery', correct: false, explanation: 'CloudFront is optimized for HTTP content delivery (web, video, static assets) and uses HTTP-only protocols. Gaming requires TCP/UDP protocols for real-time bidirectional communication that CloudFront does not support as connection endpoints.' },
      { id: 'c', text: 'Route 53 with latency routing to direct players to the nearest region', correct: false, explanation: 'Route 53 latency routing makes DNS-level routing decisions. DNS changes take time to propagate and DNS TTL affects session stickiness. Global Accelerator provides anycast routing with faster failover (30 seconds vs DNS TTL) and true session affinity.' },
      { id: 'd', text: 'Amazon GameLift FleetIQ with Spot Instances in multiple regions for cost-effective game hosting', correct: false, explanation: 'GameLift FleetIQ manages game server placement on EC2 Spot Instances. It handles server lifecycle, not network routing. The question asks about network routing to reduce latency — Global Accelerator addresses this.' }
    ],
    explanation: {
      overall: 'AWS Global Accelerator provides: (1) Anycast IPs — two static IPs route to nearest AWS edge, (2) AWS global network routing — traffic travels over AWS backbone (not internet) from edge to endpoints, (3) Intelligent routing — automatically routes to healthiest, lowest-latency endpoint, (4) Client affinity — 5-tuple hash or None for sticky sessions, (5) TCP/UDP support — suitable for gaming, VoIP, IoT. 60% better performance than internet routing for latency-sensitive applications.',
      examTip: 'Global Accelerator vs CloudFront: Global Accelerator = TCP/UDP, non-HTTP, static anycast IPs, network-layer acceleration, gaming/VoIP/IoT. CloudFront = HTTP/HTTPS only, content caching, CDN for web/video. Both use AWS edge network. Key Global Accelerator features: 2 static anycast IPs (simplify firewall rules), instant failover (30s vs DNS TTL), health checks per endpoint, traffic dial (send % of traffic to each endpoint group). For gaming: Global Accelerator routes UDP game traffic; CloudFront serves game assets/downloads.'
    },
    tags: ['global-accelerator', 'gaming', 'low-latency', 'anycast', 'global-routing']
  },
  {
    id: 'gi-002',
    stem: 'A multinational company wants to establish separate AWS environments for different countries due to data sovereignty requirements — data generated in Germany must stay in Germany, data from Japan must stay in Japan. They have a central IT team managing all environments. What AWS feature supports this data residency requirement?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'global-infrastructure',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Deploy separate AWS accounts per country in an AWS Organization, using Service Control Policies to deny any action outside the designated AWS region(s)', correct: true, explanation: 'SCPs can deny all API actions outside specific regions (e.g., deny everything except eu-central-1 for Germany). Separate accounts per country ensure data isolation. Organization-level management provides central governance while enforcing regional data residency.' },
      { id: 'b', text: 'Use AWS GovCloud regions for all countries requiring data sovereignty', correct: false, explanation: 'GovCloud (us-gov-west-1, us-gov-east-1) is specifically for US government workloads and compliance with US government regulations. It is not available for German or Japanese data sovereignty requirements.' },
      { id: 'c', text: 'Configure IAM policies in each account to prevent data transfer outside the country', correct: false, explanation: 'IAM policies can restrict API access but are account-specific and can be modified by account administrators. SCPs in Organizations provide organization-level enforcement that cannot be overridden by member account administrators.' },
      { id: 'd', text: 'Enable AWS CloudTrail across all accounts and monitor for cross-region data transfers', correct: false, explanation: 'CloudTrail provides detection (audit logs) but not prevention. Data could still move across regions; CloudTrail would only log it after the fact. SCPs provide preventive controls.' }
    ],
    explanation: {
      overall: 'Data residency with AWS Organizations SCPs: Deny SCP pattern: {"Effect": "Deny", "Action": "*", "Resource": "*", "Condition": {"StringNotEquals": {"aws:RequestedRegion": "eu-central-1"}}}. Apply to the German country account OU. This prevents any API call that would create resources outside eu-central-1. Exceptions: global services (IAM, Route 53, CloudFront, STS) must be allowed explicitly since they do not operate in a specific region.',
      examTip: 'SCP for region restriction: use aws:RequestedRegion condition key to restrict which regions can be used. Global services exception: IAM, STS, Route 53, CloudFront, S3 bucket policies — these use us-east-1 or global endpoints. Add explicit allows for global services in your deny policy: Condition StringNotEquals {"aws:RequestedRegion": ["eu-central-1"]} with NotAction for global services. AWS Local Zones: bring AWS infrastructure closer to specific city for ultra-low latency (e.g., AWS Wavelength for 5G edge). Outposts: run AWS services on-premises in your own data center.'
    },
    tags: ['data-residency', 'scp', 'data-sovereignty', 'organizations', 'region-restriction']
  },
  {
    id: 'gi-003',
    stem: 'A company wants to run AWS compute and storage services directly in their own on-premises data center to support applications that require very low latency access to on-premises systems and data. They need the same AWS APIs and tools they use in the cloud. Which service provides this?',
    type: 'single',
    difficulty: 1,
    topicSlug: 'global-infrastructure',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'AWS Outposts to deploy AWS-managed infrastructure on-premises with the same AWS services and APIs', correct: true, explanation: 'AWS Outposts is a fully managed solution delivering AWS infrastructure (EC2, EBS, S3, RDS, ECS, EKS) directly to any on-premises location. AWS installs, operates, and manages the Outpost. Applications use the same AWS APIs and console/CLI as cloud services.' },
      { id: 'b', text: 'AWS Storage Gateway to provide on-premises storage backed by AWS cloud storage', correct: false, explanation: 'Storage Gateway extends cloud storage to on-premises via NFS/SMB/iSCSI interfaces. It stores data in S3/Glacier but does not run general-purpose AWS compute (EC2) or other services on-premises.' },
      { id: 'c', text: 'AWS Local Zones to bring AWS services to metropolitan areas near on-premises data centers', correct: false, explanation: 'Local Zones are AWS-operated infrastructure in metropolitan areas (not in customer data centers). They reduce latency for city-scale users but are not deployed in customer data centers and do not support the same use cases as Outposts.' },
      { id: 'd', text: 'AWS Direct Connect to achieve sub-millisecond connectivity between on-premises and AWS', correct: false, explanation: 'Direct Connect provides high-bandwidth, low-latency connectivity (typically 1-10ms one-way) between on-premises and AWS, but compute and storage still run in AWS regions. It does not run AWS services on-premises.' }
    ],
    explanation: {
      overall: 'AWS Outposts brings AWS services to on-premises: EC2 (compute), EBS (block storage), S3 (object storage, Outposts-specific), RDS, ECS, EKS, EMR. Use cases: low-latency local processing, data residency requirements, local data processing before cloud aggregation, factory automation, healthcare imaging. Requires connectivity to parent AWS Region (for control plane, AWS service APIs, software updates). Available in 1U/2U server rack options and full 42U rack configurations.',
      examTip: 'Outposts vs Local Zones vs Wavelength: Outposts = AWS-managed rack in YOUR data center, you choose location. Local Zones = AWS-operated in metropolitan areas (not your DC), opt-in extension of parent region. Wavelength = AWS compute at 5G carrier edge locations (Verizon, Vodafone, etc.) for ultra-low latency mobile applications. All three: subset of AWS services, connected to parent AWS region, same APIs. Outposts use case: "must run in my facility," Local Zones: "must be near city X," Wavelength: "must be at 5G network edge."'
    },
    tags: ['outposts', 'on-premises', 'hybrid-cloud', 'local-processing', 'aws-infrastructure']
  },
  {
    id: 'gi-004',
    stem: 'A company needs to deploy their application in a region where AWS has limited service availability. They need EC2, S3, and RDS but the selected region does not have all needed services. They also need ultra-low latency for users in a specific city in that region. What should they consider?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'global-infrastructure',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Check AWS Local Zones for the target city, which provide EC2, EBS, EFS, RDS, and ElastiCache at sub-10ms latency to the metropolitan area', correct: true, explanation: 'AWS Local Zones extend AWS Regions to metropolitan areas. They run a subset of AWS services (EC2, EBS, EFS, RDS, ElastiCache, FSx, ECS, EKS) at <10ms latency to the city\'s users. Connected to the parent region for services not available in the Local Zone.' },
      { id: 'b', text: 'Use CloudFront to cache application responses closer to users in the target city', correct: false, explanation: 'CloudFront caches content at edge locations but does not run EC2 compute or database services. Users still connect to origin servers (in the AWS region) for dynamic content and database queries — CloudFront cannot replace compute in a specific location.' },
      { id: 'c', text: 'Deploy AWS Wavelength in the target city\'s 5G network for ultra-low latency', correct: false, explanation: 'Wavelength is for applications requiring single-digit millisecond latency to 5G mobile devices. It is tied to specific 5G carrier networks and is not a general-purpose solution for serving users in a metropolitan area from a specific city.' },
      { id: 'd', text: 'Use AWS Outposts deployed in a colocation facility in the target city for local compute', correct: false, explanation: 'Outposts can be deployed in colocation facilities and would work, but require procurement and installation of Outposts hardware. Local Zones are a managed AWS service requiring no hardware procurement — simpler and more directly addressing city-scale latency.' }
    ],
    explanation: {
      overall: 'AWS Local Zones: Currently available in 30+ cities globally. Services available: EC2, EBS, EFS, RDS (MySQL, PostgreSQL, SQL Server), ElastiCache, FSx for Windows, ECS, EKS, ALB, CloudFront, VPC. Connect Local Zone to parent region VPC by extending the VPC\'s CIDR to the Local Zone subnet. Users in the city connect to Local Zone resources at <10ms; resources that need full AWS services (SageMaker, etc.) access the parent region. Use case: content creation/rendering, live event production, real-time gaming, ML inference at the edge.',
      examTip: 'Latency hierarchy: Wavelength (5G edge) < Local Zones (city) < AWS Regions. Wavelength: 1-10ms to mobile 5G devices. Local Zones: <10ms to metropolitan area users. AWS Region: typically 20-100ms depending on internet routing. For general city-scale low-latency compute: Local Zones. For 5G-specific use cases (AR/VR, autonomous vehicles via 5G): Wavelength. Local Zone pricing: same services, typically 10-20% higher than parent region pricing due to smaller scale. Not all services available in Local Zones.'
    },
    tags: ['local-zones', 'wavelength', 'metropolitan', 'low-latency', 'edge-compute']
  },
  {
    id: 'gi-005',
    stem: 'A company operates in 15 AWS regions globally. Each region has separate VPCs and resources. They need to provide developers with a consistent, automated environment setup (VPC, subnets, security groups, IAM roles, logging) in each region when they onboard new teams. What is the most scalable way to consistently configure new regions?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'global-infrastructure',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'AWS CloudFormation StackSets to deploy the baseline infrastructure template across all accounts and regions from the management account', correct: true, explanation: 'StackSets deploy CloudFormation templates to multiple accounts and regions simultaneously. A single StackSet operation can create the standard VPC, subnets, security groups, IAM roles, and logging across all 15 regions and multiple accounts in one operation.' },
      { id: 'b', text: 'Manually configure each region by following a runbook to ensure consistency', correct: false, explanation: 'Manual configuration across 15 regions is error-prone, slow, and hard to verify. Drift occurs over time as one-off changes are made. CloudFormation StackSets provides consistent, auditable, version-controlled deployment at scale.' },
      { id: 'c', text: 'Use AWS Service Catalog to provide a catalog of approved regional configurations that teams can deploy', correct: false, explanation: 'Service Catalog enables self-service provisioning of approved templates within a single region/account. It does not automatically deploy to multiple regions. StackSets is the cross-region, cross-account deployment mechanism.' },
      { id: 'd', text: 'Use AWS Config with conformance packs to detect and auto-remediate configuration drift in each region', correct: false, explanation: 'Config conformance packs detect drift after the fact (reactive). For initial setup and consistent deployment, StackSets proactively deploys the baseline configuration. Config complements StackSets by detecting drift from the deployed baseline.' }
    ],
    explanation: {
      overall: 'CloudFormation StackSets for multi-region/multi-account deployment: (1) Create StackSet in management account with CloudFormation template. (2) Specify target accounts (all accounts in OU or specific accounts). (3) Specify target regions (all 15 regions). (4) StackSets deploys stack instances in each account/region combination. (5) Updates via StackSet propagate to all instances automatically. Delegated administration: designate a member account as StackSets admin to reduce dependency on management account access.',
      examTip: 'StackSets deployment models: Self-managed permissions (create IAM roles manually in each account). Service-managed permissions (integrates with Organizations, auto-provisions IAM roles). Service-managed is recommended for Organizations. StackSets failure tolerance: configure max concurrent accounts and failure tolerance (continue deploying to other accounts even if some fail). Automatic deployment: new accounts added to a target OU automatically receive StackSet deployments. Use for: Landing Zone baseline, security controls, account vending machine templates.'
    },
    tags: ['cloudformation-stacksets', 'multi-region', 'multi-account', 'infrastructure-baseline', 'organizations']
  },
  {
    id: 'gi-006',
    stem: 'A company is deploying a global application and needs to connect multiple VPCs across 6 AWS regions and their on-premises data center. They want a hub-and-spoke topology where all VPCs can communicate with each other and with on-premises without creating hundreds of VPC peering connections. What is the recommended architecture?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'global-infrastructure',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'AWS Transit Gateway with inter-region peering across all 6 regions and Direct Connect Gateway for on-premises connectivity', correct: true, explanation: 'Transit Gateway is a regional hub that all VPCs in a region connect to (spoke model). TGW inter-region peering connects regional TGWs over the AWS global network. Direct Connect Gateway connects on-premises to all regional TGWs through a single DX connection. Scales to thousands of VPCs.' },
      { id: 'b', text: 'VPC peering between every pair of VPCs across all 6 regions for direct connectivity', correct: false, explanation: 'With N VPCs, full mesh requires N*(N-1)/2 peering connections. For 10 VPCs per region × 6 regions = 60 VPCs, full mesh needs 1,770 peering connections. VPC peering does not support transitive routing or on-premises connectivity — not scalable.' },
      { id: 'c', text: 'AWS Direct Connect Gateway connected directly to all VPCs in all regions for on-premises connectivity', correct: false, explanation: 'DX Gateway connects to VPCs via Virtual Private Gateways but each VGW attachment is a separate VPC. For inter-VPC communication, DX Gateway cannot route between VPCs. TGW is needed for VPC-to-VPC routing.' },
      { id: 'd', text: 'AWS Global Accelerator connecting all VPC endpoints across regions for low-latency routing', correct: false, explanation: 'Global Accelerator routes external internet traffic to regional endpoints — it does not provide VPC-to-VPC connectivity or on-premises integration. TGW with peering provides the private network connectivity needed.' }
    ],
    explanation: {
      overall: 'Global hub-and-spoke with TGW: (1) Deploy Transit Gateway in each of the 6 regions. (2) Attach all regional VPCs to their regional TGW. (3) Create TGW inter-region peering between regional TGWs (connects AWS global network, encrypted). (4) Direct Connect Gateway attaches to one or more regional TGWs for on-premises connectivity. (5) Route tables in each TGW control traffic flow between VPCs and to/from on-premises. Maximum: 5,000 VPC attachments per TGW, 50 TGW peering connections per TGW.',
      examTip: 'TGW vs VPC Peering: TGW = hub (transitive routing, simplify management, $0.05/hour + $0.02/GB). VPC Peering = direct (no additional per-hour cost, $0.01/GB same region). For < 5 VPCs: peering may be simpler/cheaper. For > 5 VPCs or transitive routing needed: TGW. TGW inter-region peering: encrypted, over AWS backbone. DX Gateway: connects one DX circuit to VPCs in multiple regions (avoids separate DX per region). TGW + DXGW: preferred architecture for multi-region hub-and-spoke with on-premises connectivity.'
    },
    tags: ['transit-gateway', 'inter-region-peering', 'direct-connect-gateway', 'hub-and-spoke', 'network-topology']
  },
  {
    id: 'gi-007',
    stem: 'A company has an AWS account in us-east-1 and needs to serve customers in Australia with <20ms latency for a web application. Australian users currently experience 200ms+ latency to us-east-1. The application has static and dynamic content. What architecture achieves the latency requirement for Australian users?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'global-infrastructure',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Deploy the application to ap-southeast-2 (Sydney) with CloudFront in front serving Australian users from the Sydney edge', correct: true, explanation: 'Deploying to the Sydney region puts compute and data near Australian users (Sydney intra-city latency: 2-5ms). CloudFront with Sydney region as origin serves static content from nearby edge PoPs. Dynamic content served from Sydney region at local latency.' },
      { id: 'b', text: 'Use CloudFront with us-east-1 as origin and Global Accelerator for routing optimization', correct: false, explanation: 'CloudFront caches static assets at Sydney edge PoPs (solving static content latency), but dynamic content still requires a round-trip to us-east-1 (180-200ms Sydney→Virginia latency). This cannot achieve <20ms for dynamic content from us-east-1.' },
      { id: 'c', text: 'Enable Route 53 Latency routing to direct Australian users to us-east-1 when latency is lowest', correct: false, explanation: 'Route 53 latency routing selects the lowest-latency AWS region for DNS resolution. If there is only one region (us-east-1), latency routing is irrelevant — all traffic goes to us-east-1 regardless. Sydney→Virginia latency is fundamentally limited by speed of light (~170ms).' },
      { id: 'd', text: 'Use AWS Local Zones in Australia for sub-20ms latency without deploying a full region', correct: false, explanation: 'While AWS has Local Zones (e.g., Perth), Local Zones only host a subset of services. A full application deployment typically requires the full AWS region service catalog. Deploying to ap-southeast-2 provides full service availability and meets the latency requirement.' }
    ],
    explanation: {
      overall: 'Physics determines latency: speed of light in fiber ≈ 200 km/ms. Sydney→Virginia (us-east-1): ~16,000 km / 200 = ~80ms one-way (×2 = 160ms RTT minimum, actual 180-220ms with routing overhead). <20ms latency REQUIRES deploying to an AWS region or Local Zone near Australia. ap-southeast-2 (Sydney): 2-5ms to Sydney users. ap-southeast-1 (Singapore): 50-100ms to Australian users. For truly global applications: multi-region deployment with Route 53 latency routing.',
      examTip: 'Rule of thumb: 1ms latency ≈ 150 km distance (in fiber). Intercontinental distances always exceed 100ms RTT. Solutions for global latency: Regional deployments (ap-southeast-2 for Australia), CloudFront for static content caching, Route 53 latency routing to direct users to nearest region. For dynamic content: no CDN solution helps — compute must be geographically close. CloudFront latency savings: only for cacheable content. Dynamic API calls always require round-trip to origin.'
    },
    tags: ['global-deployment', 'latency', 'aws-regions', 'ap-southeast-2', 'cloudfront']
  },
  {
    id: 'gi-008',
    stem: 'A company is building a highly available architecture using two AWS Availability Zones. They want to ensure that their Auto Scaling group maintains at least 2 running instances at all times during an AZ failure. If one AZ fails, the ASG should automatically launch replacement instances in the remaining AZ. What configuration achieves this?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'global-infrastructure',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Set ASG minimum capacity to 4, desired to 4, spanning 2 AZs — an AZ failure still leaves 2 instances running in the healthy AZ', correct: false, explanation: 'With minimum 4 across 2 AZs, ASG typically places 2 in each AZ. If one AZ fails: 2 instances remain in healthy AZ. ASG then tries to rebalance to 4 total, launching 2 more in the healthy AZ. This works but wastes capacity during normal operation (4 instead of potentially 2).' },
      { id: 'b', text: 'Set ASG minimum to 2, desired to 2 spanning 2 AZs with AZ Rebalancing enabled — if one AZ fails, ASG maintains minimum by launching in the healthy AZ', correct: true, explanation: 'With minimum 2 and desired 2 across 2 AZs, ASG places 1 instance per AZ. If AZ fails: 1 instance remains, ASG launches 1 more in healthy AZ to maintain minimum of 2. Auto Scaling automatically keeps minimum capacity.' },
      { id: 'c', text: 'Set ASG minimum to 1, desired to 2 — minimum ensures at least 1 instance always runs after an AZ failure', correct: false, explanation: 'With minimum 1, ASG will not launch additional instances to replace the AZ failure — it only needs 1 running to meet minimum. After AZ failure: 1 instance remains, ASG satisfied (minimum = 1). The requirement is at least 2 running after failure.' },
      { id: 'd', text: 'Use two separate ASGs, one per AZ, each with minimum 1 — guarantees at least 1 instance per AZ always running', correct: false, explanation: 'Separate ASGs per AZ do not share a minimum count and cannot compensate for each other. If one AZ fails, that ASG\'s instance terminates but it cannot launch in the other AZ (wrong ASG scope). A single cross-AZ ASG is the correct architecture.' }
    ],
    explanation: {
      overall: 'Auto Scaling AZ failure behavior: ASG distributes instances evenly across AZs by default. When an AZ becomes impaired: (1) Instances in that AZ may terminate. (2) ASG detects instance unhealthy (via ELB health check). (3) ASG terminates unhealthy instance. (4) ASG is below desired capacity → launches in remaining healthy AZ(s). (5) ASG maintains minimum capacity across available AZs. For "at least 2 after AZ failure": set minimum ≥ 2. With minimum 2 and 2 AZs: AZ failure → 1 running → ASG launches 1 more in healthy AZ → 2 running.',
      examTip: 'ASG capacity planning for AZ failure resilience: if N = desired instances per AZ for normal operation, then set minimum = N × (number of AZs). This ensures that if one AZ fails, minimum is still met by remaining AZs. Example: want 2 instances/AZ across 2 AZs → minimum = 4, desired = 4. Auto Scaling Availability Zone rebalancing: if one AZ becomes available again after being impaired, ASG rebalances instances. Suspend RebalanceAcrossAZs if you want to prevent rebalancing during planned AZ maintenance.'
    },
    tags: ['auto-scaling', 'availability-zones', 'ha', 'minimum-capacity', 'az-failure']
  },
  {
    id: 'gi-009',
    stem: 'A company needs to connect their on-premises data center to AWS with 10 Gbps bandwidth and consistent sub-10ms latency for latency-sensitive financial workloads. Internet-based VPN is insufficient due to inconsistent latency. What connectivity option provides the required dedicated connectivity?',
    type: 'single',
    difficulty: 1,
    topicSlug: 'global-infrastructure',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'AWS Direct Connect with a dedicated 10 Gbps connection to the AWS Direct Connect location', correct: true, explanation: 'Direct Connect provides dedicated physical connections (1 Gbps or 10 Gbps) with consistent sub-10ms latency. Traffic does not traverse the public internet — uses a private dedicated line from your data center to an AWS DX location, then into AWS.' },
      { id: 'b', text: 'AWS Site-to-Site VPN with high-performance encryption for financial workloads', correct: false, explanation: 'Site-to-Site VPN runs over the internet (IPsec encrypted tunnels). Internet routing causes variable latency (25-100ms+) and throughput limitations (~1.25 Gbps per tunnel maximum). Not suitable for latency-sensitive financial workloads requiring <10ms.' },
      { id: 'c', text: 'AWS Transit Gateway with an accelerated Site-to-Site VPN using Global Accelerator', correct: false, explanation: 'Accelerated VPN uses Global Accelerator to route VPN traffic over AWS backbone (improves latency vs standard VPN) but still uses internet for the last-mile connection. Does not match dedicated DX latency and bandwidth for financial workloads.' },
      { id: 'd', text: 'AWS PrivateLink to establish private connectivity between on-premises and AWS services', correct: false, explanation: 'PrivateLink creates private endpoints for AWS services within VPCs. It requires existing network connectivity (VPN or DX) to the VPC — it is not a standalone connectivity solution between on-premises and AWS.' }
    ],
    explanation: {
      overall: 'AWS Direct Connect: dedicated physical connection from your premises to an AWS DX location. Port speeds: 1 Gbps, 10 Gbps, 100 Gbps (dedicated). Hosted connections: sub-1 Gbps through AWS partners (50 Mbps to 10 Gbps). Latency: consistent 1-10ms depending on DX location proximity. Not encrypted by default — add MACsec or VPN over DX for encryption. For HA: order two DX connections from different providers to different DX locations. For 10 Gbps across multiple connections: DX LAG (Link Aggregation Group).',
      examTip: 'DX vs VPN: DX = dedicated physical, low latency, high bandwidth, not encrypted by default, weeks to provision. VPN = internet-based, encrypted, variable latency, minutes to provision, lower cost. Use DX for: >1 Gbps bandwidth, latency-sensitive (trading, real-time analytics), large data transfer (avoid internet egress costs). Use VPN for: backup connectivity, smaller bandwidth, quick setup. DX + VPN: use VPN as failover for DX (BGP routing prefers DX when available). DX bandwidth: 1/10/100 Gbps dedicated; hosted: 50 Mbps–10 Gbps.'
    },
    tags: ['direct-connect', 'hybrid-connectivity', 'dedicated-connection', 'low-latency', 'financial']
  },
  {
    id: 'gi-010',
    stem: 'A company plans to run an application on a large EC2 instance fleet that requires precise timing synchronization between instances for distributed transaction processing. Clock skew between instances must be <1 millisecond. What does AWS provide for time synchronization?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'global-infrastructure',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Amazon Time Sync Service using NTP, providing sub-millisecond time accuracy for EC2 instances', correct: true, explanation: 'AWS operates a fleet of atomic clocks and GPS receivers globally. The Amazon Time Sync Service is available from all EC2 instances via 169.254.169.123 (NTP) and provides sub-millisecond accuracy. Chrony or ntpd can be configured to use this endpoint.' },
      { id: 'b', text: 'Configure public NTP servers (pool.ntp.org) for time synchronization across all instances', correct: false, explanation: 'Public NTP servers introduce variable internet latency (potentially hundreds of milliseconds). For sub-millisecond accuracy, the local Amazon Time Sync Service (link-local, no internet) provides dramatically better precision and consistency.' },
      { id: 'c', text: 'Use AWS Systems Manager to synchronize time across all managed EC2 instances', correct: false, explanation: 'SSM manages configuration and compliance but does not provide time synchronization services. Time sync is managed at the OS level using NTP, not via SSM.' },
      { id: 'd', text: 'Configure Amazon ElastiCache as a time coordination service between distributed instances', correct: false, explanation: 'ElastiCache is a caching service (Redis/Memcached). It cannot provide hardware-level time synchronization. Time accuracy for distributed systems requires proper NTP configuration.' }
    ],
    explanation: {
      overall: 'Amazon Time Sync Service: highly accurate time reference using a fleet of atomic clocks and GPS receivers. Access: 169.254.169.123 (IPv4) or fd00:ec2::123 (IPv6) — link-local, no internet routing needed. For Amazon Linux 2/2023: Chrony is pre-configured to use Amazon Time Sync. For other Linux: install chrony and add "server 169.254.169.123 prefer iburst" to chrony.conf. For Windows: configure Windows Time Service (W32tm) to use 169.254.169.123.',
      examTip: 'Amazon Time Sync Service benefits: no internet dependency (link-local), sub-millisecond precision, free, available in all regions including Outposts. Important for: distributed databases (DynamoDB DAX, Aurora), financial transaction ordering, Kinesis stream processing, SageMaker distributed training. AWS also offers Amazon Time Sync Service with PTP (Precision Time Protocol) for nanosecond-level accuracy for specialized applications (available on c5n instances).'
    },
    tags: ['time-sync', 'ntp', 'clock-synchronization', 'distributed-systems', 'precision']
  },
  {
    id: 'gi-011',
    stem: 'A company is multi-homed to AWS with two Direct Connect connections from different ISPs to different DX locations for redundancy. They want traffic to prefer the primary DX connection and automatically failover to the secondary if the primary fails. How is this BGP-based failover configured?',
    type: 'single',
    difficulty: 3,
    topicSlug: 'global-infrastructure',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Use BGP AS_PATH prepending on the secondary DX connection to make routes less preferred, causing traffic to prefer the primary DX', correct: true, explanation: 'BGP path selection prefers shorter AS_PATH (fewer AS hops). By prepending the AS number multiple times on secondary DX routes (making AS_PATH longer), BGP prefers the primary\'s shorter AS_PATH. When primary fails, BGP withdraws those routes and secondary routes (longer AS_PATH) are used.' },
      { id: 'b', text: 'Configure Route 53 health checks on the DX connections to failover DNS records between primary and secondary', correct: false, explanation: 'Route 53 health checks monitor internet-accessible endpoints, not Direct Connect BGP sessions. DX failover is handled at the BGP routing layer, not DNS. BGP automatically withdraws routes when the DX session drops.' },
      { id: 'c', text: 'Use AWS Transit Gateway with equal-cost multipath routing across both DX connections', correct: false, explanation: 'ECMP distributes traffic across both connections simultaneously (load balancing), not active-passive failover. The question requires a primary preference (active-passive), not load balancing.' },
      { id: 'd', text: 'Configure BGP MED (Multi-Exit Discriminator) attributes to prefer the primary DX connection', correct: false, explanation: 'MED influences how a single autonomous system routes traffic to an external AS. For AWS DX (multiple connections to same ASN), AS_PATH prepending is the correct BGP attribute for influencing path preference from the AWS side. MED works for influencing outbound traffic routing from on-premises.' }
    ],
    explanation: {
      overall: 'DX failover with BGP: (1) Primary DX: advertise routes with normal AS_PATH (e.g., AS65001). (2) Secondary DX: prepend AS_PATH on outbound announcements (e.g., AS65001 AS65001 AS65001 — making it appear 3 hops longer). (3) AWS BGP prefers primary (shorter AS_PATH). (4) If primary DX fails: BGP session drops, primary routes withdrawn. AWS falls back to secondary routes. Failover time: BGP convergence 30 seconds to a few minutes. For faster failover: use BFD (Bidirectional Forwarding Detection) which detects link failure in <1 second.',
      examTip: 'BGP path selection order (remember: We Love Oranges AS Oranges Mean Pure Refreshment): Weight → Local Preference → Locally originated → AS_PATH length → Origin → MED → eBGP over iBGP → IGP metric → Router ID. For DX primary/secondary: AS_PATH prepending is the most commonly used tool. BFD over DX: detects failure in 300ms (vs BGP keepalive timer of 30-90 seconds). Enable BFD for faster detection. For active-passive DX with TGW: each DX connects to separate VIF on same TGW, use route policies in TGW to prefer one VIF.'
    },
    tags: ['direct-connect', 'bgp', 'as-path-prepending', 'failover', 'multi-homed']
  },
  {
    id: 'gi-012',
    stem: 'A company wants to understand the AWS global infrastructure to make informed decisions about region selection. They are evaluating us-east-1 vs eu-west-1 for a new workload. Which factors should primarily inform their region selection decision?',
    type: 'multiple',
    difficulty: 1,
    topicSlug: 'global-infrastructure',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Data residency and regulatory compliance requirements (GDPR requires EU data to stay in EU)', correct: true, explanation: 'Legal and compliance requirements are mandatory constraints. If data must stay in the EU due to GDPR, choosing us-east-1 is not an option regardless of other factors. Compliance always overrides other considerations.' },
      { id: 'b', text: 'Proximity to users (latency) — choose the region geographically closest to the majority of end users', correct: true, explanation: 'User proximity directly impacts application performance. If users are primarily in Europe, eu-west-1 provides 50-100ms lower latency than us-east-1. For latency-sensitive applications, regional proximity is a key selection factor.' },
      { id: 'c', text: 'Pricing differences between regions — same services cost differently in different AWS regions', correct: true, explanation: 'AWS regional pricing varies — us-east-1 is typically one of the cheapest regions. eu-west-1 is slightly more expensive. For cost-sensitive workloads without regulatory or latency requirements, pricing differences can be a relevant factor.' },
      { id: 'd', text: 'The age of the region — older regions have more stable infrastructure and fewer outages', correct: false, explanation: 'AWS continuously invests in all regions regardless of age. There is no correlation between region age and stability. Newer regions benefit from latest hardware and design. This is a misconception — do not use region age as a selection criterion.' }
    ],
    explanation: {
      overall: 'AWS Region selection framework: (1) Compliance/Data residency — legal requirement, non-negotiable constraint. (2) Latency — proximity to users, test with CloudPing or actual measurements. (3) Service availability — not all services in all regions (check AWS Region Services list). (4) Disaster recovery — pair with another region (us-east-1 ↔ us-west-2; eu-west-1 ↔ eu-central-1). (5) Pricing — varies by region (us-east-1 typically cheapest). (6) Support — AWS Support teams cover all regions equivalently.',
      examTip: 'Region selection priority: Compliance (must) > Latency (performance) > Service availability (function) > Cost (economics) > DR pairing (resilience). AWS Region pairs for DR: us-east-1/us-west-2, eu-west-1/eu-central-1, ap-southeast-1/ap-northeast-1. Service availability: check aws.amazon.com/about-aws/global-infrastructure/regional-product-services/ before selecting a region. Some newer/specialized services launch first in us-east-1 before other regions.'
    },
    tags: ['region-selection', 'data-residency', 'latency', 'gdpr', 'global-infrastructure']
  },
  {
    id: 'gi-013',
    stem: 'A company experiences a partial AWS outage affecting one Availability Zone in their primary region. EC2 instances in the affected AZ cannot be reached. Auto Scaling is attempting to launch new instances in healthy AZs. The ALB reports some endpoints as unhealthy. What should the operations team do first?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'global-infrastructure',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Check the AWS Service Health Dashboard and Personal Health Dashboard to understand the incident scope and AWS\'s resolution timeline', correct: true, explanation: 'During an outage, first understand the scope (AWS Service Health Dashboard) and whether your specific resources are affected (Personal Health Dashboard). This informs the response — if AWS is resolving the issue, wait vs if it\'s prolonged, consider failover actions.' },
      { id: 'b', text: 'Immediately initiate disaster recovery failover to another region to restore service', correct: false, explanation: 'AZ-level outages are typically short-duration (minutes to hours) and the multi-AZ architecture should handle it automatically. Initiating cross-region DR failover prematurely adds risk and complexity. First assess the situation via the Health Dashboard.' },
      { id: 'c', text: 'Manually terminate all instances in the affected AZ and redistribute to healthy AZs', correct: false, explanation: 'Auto Scaling already handles this automatically when instances become unhealthy — manual termination is unnecessary and creates risk if the AZ recovers (terminated instances are gone). Let Auto Scaling manage the distribution.' },
      { id: 'd', text: 'Disable the affected AZ in all Auto Scaling groups to prevent Auto Scaling from attempting to launch there', correct: false, explanation: 'Auto Scaling automatically marks the AZ as impaired and stops launching there when instances consistently fail to launch. Manually disabling AZs is typically not necessary and can cause issues when the AZ recovers.' }
    ],
    explanation: {
      overall: 'AZ failure response: (1) Observe: check Personal Health Dashboard and Service Health Dashboard. (2) Assess: Are Auto Scaling groups compensating? Is ALB routing around unhealthy instances? (3) If multi-AZ is working correctly: Auto Scaling launches in healthy AZs, ALB routes to healthy targets, service continues with reduced capacity. (4) Monitor until AWS resolves. (5) Post-incident: review Auto Scaling activity, ALB metrics, CloudWatch alarms. AZ failures typically resolve in minutes to hours — full cross-region DR is rarely warranted.',
      examTip: 'AWS Service Health Dashboard (status.aws.amazon.com) = public, shows regional service health. AWS Personal Health Dashboard (PHD) = account-specific, shows which of YOUR resources are affected. PHD EventBridge events: trigger automated response (notify team, start runbooks) when PHD shows resources affected. Good practice: set up EventBridge rule → SNS notification when PHD events affect your account. During incidents: Trust the PHD over external reports; it shows actual impact on your resources.'
    },
    tags: ['availability-zones', 'incident-response', 'personal-health-dashboard', 'az-failure', 'auto-scaling']
  },
  {
    id: 'gi-014',
    stem: 'A company wants to build a multi-region active-active architecture where users in North America are served by us-east-1 and users in Asia Pacific are served by ap-southeast-1. Data must be synchronized between regions in near real time. Application uses DynamoDB and S3. What enables the data synchronization layer?',
    type: 'multiple',
    difficulty: 3,
    topicSlug: 'global-infrastructure',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'DynamoDB Global Tables providing active-active multi-region replication with sub-second latency and automatic conflict resolution', correct: true, explanation: 'DynamoDB Global Tables creates replica tables in each specified region with automatic bidirectional replication (sub-second RPO). Conflict resolution uses "last writer wins" based on timestamps. Both regions can handle reads and writes simultaneously.' },
      { id: 'b', text: 'S3 Cross-Region Replication (CRR) to replicate S3 objects between us-east-1 and ap-southeast-1 buckets', correct: true, explanation: 'S3 CRR replicates objects from source to destination bucket in another region within minutes of creation. For active-active: enable bidirectional CRR (CRR in both directions) so objects written to either region replicate to the other.' },
      { id: 'c', text: 'Route 53 active-active latency routing to direct users to the nearest region automatically', correct: true, explanation: 'Route 53 latency routing directs users to the lowest-latency region (US users → us-east-1, AP users → ap-southeast-1). Health checks ensure failover to the other region if one becomes unhealthy — completing the active-active architecture at the DNS layer.' },
      { id: 'd', text: 'Amazon Aurora Global Database with active-active writes to primary clusters in each region', correct: false, explanation: 'Aurora Global Database has ONE primary cluster (writer) and up to 5 secondary read-only clusters. It is active-passive for writes (only primary can write). For active-active DATABASE writes, DynamoDB Global Tables is the correct AWS solution.' }
    ],
    explanation: {
      overall: 'Active-active multi-region architecture: (1) Route 53 latency routing: DNS directs users to nearest region. (2) Application: deployed in both regions independently. (3) DynamoDB Global Tables: active-active write replication between regions, sub-second RPO. (4) S3 bidirectional CRR: objects replicated between regional buckets. (5) CloudFront: serves static assets from edge nearest to each user. Conflict resolution for DynamoDB: use conditional writes (optimistic locking) to prevent concurrent write conflicts from different regions.',
      examTip: 'Active-active vs active-passive: Active-active = both regions serve traffic simultaneously, data writes to both, conflicts possible. Active-passive = one region handles all traffic, secondary region is warm standby. DynamoDB Global Tables = only native AWS active-active database replication. S3 bidirectional CRR = both buckets are writable, CRR replicates each direction (two separate CRR rules). For active-active, conflict resolution strategy is critical — "last writer wins" for DynamoDB. Aurora Global = active-passive for writes (one writer region).'
    },
    tags: ['active-active', 'multi-region', 'dynamodb-global-tables', 's3-crr', 'route53']
  },
  {
    id: 'gi-015',
    stem: 'A company recently expanded to AWS and wants to understand their overall infrastructure footprint across all accounts and regions. They need a single dashboard showing: all running EC2 instances, RDS databases, S3 buckets, and Lambda functions across their 20 accounts and 8 regions. What provides this cross-account, cross-region inventory visibility?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'global-infrastructure',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'AWS Config Aggregator collecting resource configuration data from all accounts and regions into a central aggregation account', correct: true, explanation: 'Config Aggregator pulls resource configuration data from all member accounts and regions into an aggregation account. You can query the aggregated data using AWS Config Aggregated views or SQL-based Advanced Queries to get EC2, RDS, S3, Lambda inventory across all accounts and regions.' },
      { id: 'b', text: 'AWS Systems Manager Inventory collecting software and instance data from all EC2 instances', correct: false, explanation: 'SSM Inventory collects data from SSM-managed instances (requires SSM Agent and IAM role) — EC2, on-premises servers. It does not cover RDS, S3, Lambda, or unmanaged resources. Config Aggregator covers all resource types.' },
      { id: 'c', text: 'Amazon CloudWatch cross-account observability to aggregate metrics from all accounts', correct: false, explanation: 'CloudWatch cross-account observability aggregates metrics and logs from linked accounts for monitoring and alerting. It does not provide resource inventory (list of all EC2/RDS/S3/Lambda resources) — Config Aggregator is the resource inventory solution.' },
      { id: 'd', text: 'AWS Organizations service control policies to enumerate resources across all accounts', correct: false, explanation: 'SCPs are access control policies — they restrict or allow actions. They cannot enumerate or inventory resources across accounts. Config Aggregator is the cross-account resource discovery solution.' }
    ],
    explanation: {
      overall: 'AWS Config Aggregator: (1) Create aggregator in the management account or a dedicated compliance account. (2) Add source accounts (all accounts in the Organization, or specific accounts). (3) Add source regions (all regions or specific regions). (4) Config Aggregator pulls resource configuration data. (5) Use Advanced Queries (SQL): SELECT resourceType, COUNT(*) WHERE resourceType IN (\'AWS::EC2::Instance\', \'AWS::RDS::DBInstance\') GROUP BY resourceType. Displays inventory across all accounts and regions in a unified view.',
      examTip: 'Config Aggregator vs Systems Manager Inventory: Config = all AWS resource types, configuration-focused, org-level aggregation. SSM = managed instance focus (EC2 + on-prem with SSM Agent), software inventory (installed packages, processes). Config Advanced Queries: SELECT resourceType, resourceId, configuration, configurationItemStatus WHERE resourceType=\'AWS::Lambda::Function\'. Config aggregator data: near real-time (Config records changes). For comprehensive multi-account governance: Config Aggregator + Security Hub aggregation + CloudWatch cross-account observability.'
    },
    tags: ['config-aggregator', 'multi-account', 'cross-region', 'resource-inventory', 'organizations']
  },
  {
    id: 'gi-016',
    stem: 'A company is building a new SaaS platform and needs to decide which AWS regions to deploy to. Their customer base is primarily in Germany and France, with expansion planned to Southeast Asia within 18 months. The data must comply with GDPR and cannot leave the EU. A secondary non-EU deployment will serve Southeast Asian customers. Which criteria should drive region selection for each deployment?',
    type: 'multiple', difficulty: 2, topicSlug: 'global-infrastructure', examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'For EU deployment: choose eu-central-1 (Frankfurt) or eu-west-3 (Paris) to keep data within EU jurisdiction for GDPR compliance, enforced by SCPs restricting resource creation to EU regions', correct: true, explanation: 'GDPR requires personal data of EU residents to remain within the EU or in countries with adequate protection. eu-central-1 (Germany) and eu-west-3 (France) are in EU member states. SCPs with aws:RequestedRegion conditions ensure workloads cannot inadvertently deploy to non-EU regions, providing technical GDPR enforcement in addition to contractual controls.' },
      { id: 'b', text: 'For Southeast Asia: choose ap-southeast-1 (Singapore) or ap-southeast-2 (Sydney) based on latency to primary users, service availability (not all services launch simultaneously in all regions), and regional pricing differences', correct: true, explanation: 'For Southeast Asian users: ap-southeast-1 (Singapore) is centrally located for ASEAN countries. ap-southeast-2 (Sydney) serves Australia/NZ. Latency from e.g., Jakarta: ~5ms to Singapore vs ~40ms to Sydney. Additionally, newer AWS services are often not immediately available in all regions — verify service availability in the target region for all required services before committing.' },
      { id: 'c', text: 'Deploy in us-east-1 (N. Virginia) for all customers since it has the most services and is the most mature AWS region', correct: false, explanation: 'us-east-1 is not in the EU — GDPR would prohibit storing EU personal data there without additional legal mechanisms (Standard Contractual Clauses, etc.). For EU customers with strict GDPR requirements, an EU region is required. Deploying globally in us-east-1 violates the stated data residency requirements.' },
      { id: 'd', text: 'Choose regions with the lowest per-hour EC2 pricing to minimize infrastructure costs', correct: false, explanation: 'While pricing varies by region (typically 10-25% variance), it should not be the primary selection criterion. Data residency compliance (GDPR), user latency, service availability, and support for required compliance certifications (ISO 27001, SOC 2, PCI DSS) are more important selection criteria than minor pricing differences.' },
    ],
    explanation: { overall: 'AWS Region selection criteria: (1) Data residency/sovereignty — regulatory requirements dictating data location (GDPR, LGPD, China MLPS, etc.). (2) Latency — minimize round-trip time to end users (use CloudPing.info or AWS network latency data). (3) Service availability — verify all required services are available in the target region (AWS Regional Services page). (4) Compliance certifications — verify the region has required compliance attestations (HIPAA, PCI DSS, ISO 27001). (5) Pricing — secondary consideration; varies 10-25% across regions. (6) Support for required features — not all features launch simultaneously in all regions.', examTip: 'EU data protection: GDPR covers all 27 EU member states + EEA. AWS EU regions: eu-west-1 (Ireland), eu-west-2 (London), eu-west-3 (Paris), eu-central-1 (Frankfurt), eu-central-2 (Zurich), eu-north-1 (Stockholm), eu-south-1 (Milan), eu-south-2 (Spain). Post-Brexit, eu-west-2 (London) is UK GDPR, separate from EU GDPR. For strict EU data residency, use continental EU regions (not London). SCP enforcement: deny aws:RequestedRegion NOT IN [eu-central-1, eu-west-3] for EU workloads.' },
    tags: ['region-selection', 'gdpr', 'data-residency', 'scp', 'compliance'],
  },
  {
    id: 'gi-017',
    stem: 'A global retail company uses AWS CloudFormation StackSets to deploy a standard security baseline (CloudTrail, Config, GuardDuty, Security Hub) across 150 AWS accounts in an AWS Organization. When a new account is added via AWS Organizations, the security baseline must be deployed automatically within 15 minutes. Engineers should not need to manually trigger StackSet deployments for new accounts. Which StackSets configuration enables this?',
    type: 'single', difficulty: 2, topicSlug: 'global-infrastructure', examDomain: 'organizational-complexity',
    options: [
      { id: 'a', text: 'Enable automatic deployment in the StackSet with deployment targets set to the Organization root or specific OUs — new accounts in those OUs automatically receive the stack', correct: true, explanation: 'CloudFormation StackSets with service-managed permissions and automatic deployment enabled: when a new account joins an OU targeted by the StackSet, CloudFormation automatically deploys the stack to the new account within minutes. No manual intervention required. The StackSet uses the Organizations-native deployment mechanism, not IAM role-based trust.' },
      { id: 'b', text: 'Create an EventBridge rule triggered by Organizations CreateAccountResult event → Lambda → StackSet CreateStackInstances API call', correct: false, explanation: 'EventBridge + Lambda can trigger StackSet deployment for new accounts, but this is a custom workaround. CloudFormation StackSets with service-managed permissions and automatic deployment enabled provides this functionality natively, without custom Lambda code or EventBridge rules to maintain.' },
      { id: 'c', text: 'Use AWS Control Tower Account Vending Machine to deploy security baselines to all new accounts', correct: false, explanation: 'Control Tower Account Factory (not "Account Vending Machine") automates account creation and applies guardrails. However, the question asks about StackSets specifically and the automatic deployment feature. Control Tower uses StackSets internally but is a higher-level abstraction. If the company is already using StackSets without Control Tower, enabling automatic deployment is the direct answer.' },
      { id: 'd', text: 'Schedule a Lambda function to run every 15 minutes to detect new accounts and deploy StackSet instances', correct: false, explanation: 'A polling Lambda checking every 15 minutes could potentially meet the 15-minute SLA at worst case, but is an inefficient, operationally complex anti-pattern. The native StackSets automatic deployment feature handles this event-driven and is the correct, low-maintenance solution.' },
    ],
    explanation: { overall: 'CloudFormation StackSets automatic deployment (service-managed permissions): (1) StackSet configured with SERVICE_MANAGED permissions model (uses Organizations). (2) Automatic deployment enabled with deployment targets (root OU or specific OUs). (3) When a new account is added to a targeted OU: CloudFormation automatically deploys the stack; typically within minutes. (4) Stack retention policy: RETAIN (leave stacks when account removed from OU) or DELETE (clean up stacks). (5) No trust relationship IAM roles needed — Organizations handles authorization. Supports concurrent deployments (failure tolerance, max concurrent accounts configurable).', examTip: 'StackSets deployment models: (1) Self-managed permissions — manually create AWSCloudFormationStackSetAdministrationRole and AWSCloudFormationStackSetExecutionRole in each account. No automatic deployment for new accounts. (2) Service-managed permissions — uses AWS Organizations, automatic deployment available, no manual role creation. Use service-managed for Organizations deployments. Concurrency settings: MaxConcurrentPercentage (parallel deployment), FailureTolerancePercentage (allowed failures before stopping). Region order: specify deployment order for stacks with regional dependencies.' },
    tags: ['cloudformation-stacksets', 'automatic-deployment', 'organizations', 'security-baseline', 'multi-account'],
  },
  {
    id: 'gi-018',
    stem: 'A company with a hub-and-spoke AWS network architecture uses AWS Transit Gateway to connect 50 VPCs across 4 AWS regions. They want to implement centralized internet egress through a shared services VPC in each region to control and inspect outbound internet traffic. Inter-region traffic should use the AWS global network backbone and not the public internet. Which Transit Gateway features enable this architecture?',
    type: 'multiple', difficulty: 3, topicSlug: 'global-infrastructure', examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Transit Gateway inter-region peering to connect TGW instances across regions over the AWS backbone, enabling cross-region routing without the public internet', correct: true, explanation: 'TGW inter-region peering connects two Transit Gateways in different regions. Traffic traverses the AWS global network (not the public internet), providing lower latency and higher security than internet-based routing. Each region\'s TGW peers with others to form the global hub-and-spoke network.' },
      { id: 'b', text: 'Transit Gateway route tables with a default route (0.0.0.0/0) pointing to the shared services VPC attachment to centralize egress for all spoke VPCs', correct: true, explanation: 'Centralized egress architecture: (1) Spoke VPCs have a route table with default route via TGW. (2) TGW route table: default route points to shared services VPC attachment (where NAT Gateway/firewall resides). (3) Shared services VPC: NAT Gateway → internet gateway. All spoke VPC internet traffic flows through the central egress point for inspection and control.' },
      { id: 'c', text: 'VPC peering between all 50 VPCs in each region for direct VPC-to-VPC communication without TGW overhead', correct: false, explanation: 'Full-mesh VPC peering across 50 VPCs would require 1,225 peering connections per region (n×(n-1)/2). VPC peering also does not allow transitive routing — you cannot route through a VPC to reach a third VPC. Transit Gateway is specifically designed to replace the full-mesh peering problem.' },
      { id: 'd', text: 'Transit Gateway appliance mode to ensure symmetric traffic flow for stateful inspection in the shared services VPC', correct: true, explanation: 'Appliance mode ensures that TGW uses the same ENI for both directions of a traffic flow (source and return traffic) when a VPC attachment has multiple AZs. Without appliance mode, asymmetric routing can cause stateful firewalls/appliances to drop return traffic because they see only one direction. Required for centralized inspection appliances (Palo Alto, Check Point, AWS Network Firewall).' },
    ],
    explanation: { overall: 'Centralized egress with TGW architecture: (1) Each spoke VPC attaches to regional TGW. (2) Shared services VPC ("egress VPC") attaches to TGW. (3) TGW route table for spoke VPCs: 0.0.0.0/0 → egress VPC attachment. (4) Egress VPC contains: NAT Gateway (for address translation) + optional inspection (AWS Network Firewall or 3rd-party). (5) Blackhole routes in TGW prevent spoke-to-spoke direct communication (spoke VPCs cannot reach each other, only egress). (6) For cross-region: inter-region TGW peering with static routes. Traffic: Spoke VPC → TGW → Egress VPC → NAT GW → Internet.', examTip: 'TGW key features: attachment types (VPC, VPN, Direct Connect Gateway, TGW Peering, Connect). Route tables: each TGW has one or more route tables; associations determine which route table an attachment uses for routing; propagations allow attachments to automatically add routes. Appliance mode: enable on a VPC attachment when stateful appliances require symmetric flow (same ENI for both directions). TGW vs VPC Peering: TGW = transitive routing, centralized, any-to-any; VPC Peering = non-transitive, bilateral, lower cost for few VPCs.' },
    tags: ['transit-gateway', 'inter-region-peering', 'centralized-egress', 'appliance-mode', 'hub-and-spoke'],
  },
  {
    id: 'gi-019',
    stem: 'A company is designing a multi-region active-active architecture for a real-time bidding platform processing 500,000 auctions per second. Each auction must complete within 100ms. Users are globally distributed. The solution must handle regional failures transparently without client reconnection. Which combination of AWS global infrastructure services provides the lowest latency, highest availability architecture?',
    type: 'single', difficulty: 3, topicSlug: 'global-infrastructure', examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Route 53 latency-based routing to direct users to nearest region with health checks for regional failover', correct: false, explanation: 'Route 53 DNS routing introduces DNS propagation delays (30-300 seconds depending on TTL) during regional failover. DNS-based routing requires clients to resolve a new IP after failure, causing brief disruptions. For 100ms auction completion SLAs, DNS failover latency is too slow for transparent regional failover.' },
      { id: 'b', text: 'AWS Global Accelerator with endpoint groups in each active region — anycast IP routing automatically shifts traffic to the healthiest region within seconds, with no DNS TTL impact', correct: true, explanation: 'Global Accelerator: (1) Static anycast IP addresses — clients connect to the same IP regardless of region. (2) Traffic routed via AWS global network to nearest healthy endpoint. (3) Health checks at the endpoint level — if an endpoint fails, traffic shifts to the next endpoint within seconds (no DNS TTL). (4) No client reconnection needed — the same anycast IP works from any region. (5) Low latency: traffic enters AWS global network at the closest edge location.' },
      { id: 'c', text: 'CloudFront with multiple origin groups (primary and failover) and Lambda@Edge for request routing logic', correct: false, explanation: 'CloudFront is optimized for cacheable content delivery and web applications. For dynamic API requests (real-time auction processing with 100ms SLA), CloudFront caching provides no benefit and Lambda@Edge adds latency. CloudFront is not the primary tool for dynamic API global routing.' },
      { id: 'd', text: 'Multiple Application Load Balancers in each region with client-side routing logic to select the nearest ALB based on measured latency', correct: false, explanation: 'Client-side routing requires clients to implement latency measurement and endpoint selection logic. This adds client complexity, and client failover during regional outages requires application-layer retry logic. During a regional failure, clients experience errors while reconnecting. This does not provide the transparent automatic failover required.' },
    ],
    explanation: { overall: 'Global Accelerator architecture for active-active: (1) Two static anycast IPs announced from all AWS edge locations globally. (2) Clients connect to the nearest edge location via anycast routing. (3) Traffic forwarded from edge to nearest healthy AWS region via AWS backbone. (4) Endpoint groups: one per active region, each with traffic dial (percentage of traffic) and health check thresholds. (5) Failover: if endpoint health check fails → Global Accelerator shifts traffic to next healthy endpoint in seconds, transparently (same IP). (6) Custom routing: can also use custom routing accelerators for UDP gaming traffic.', examTip: 'Global Accelerator vs CloudFront: Global Accelerator = global TCP/UDP traffic acceleration to non-HTTP workloads (gaming, IoT, VoIP, WebSocket), consistent static IPs, non-cacheable dynamic APIs. CloudFront = HTTP/HTTPS content delivery, caching, edge compute. Global Accelerator vs Route 53: GA = IP-level anycast (no DNS TTL), sub-second health check failover. Route 53 = DNS-based routing, TTL-dependent failover. Exam trigger: "static IP across regions", "transparent failover", "gaming", "real-time API", "UDP" → Global Accelerator.' },
    tags: ['global-accelerator', 'anycast', 'active-active', 'multi-region', 'low-latency'],
  },
  {
    id: 'gi-020',
    stem: 'A financial company needs to run latency-sensitive trading algorithms on AWS infrastructure physically located within the same data center as the NYSE (New York Stock Exchange) co-location facility. Round-trip latency to NYSE must be under 1 millisecond. Standard AWS regions cannot achieve this because they are not co-located with NYSE. Which AWS infrastructure option addresses this requirement?',
    type: 'single', difficulty: 3, topicSlug: 'global-infrastructure', examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'AWS Wavelength in the New York metropolitan area for sub-millisecond 5G edge compute', correct: false, explanation: 'AWS Wavelength embeds AWS compute and storage within telecommunications provider 5G networks (Verizon, KDDI, etc.) to reduce latency for mobile applications. It is not designed for co-location within financial exchange data centers and does not provide NYSE proximity.' },
      { id: 'b', text: 'AWS Outposts rack deployment within the NYSE co-location facility to run EC2 instances with sub-millisecond network hops to exchange matching engines', correct: true, explanation: 'AWS Outposts delivers AWS infrastructure (servers, storage, networking) to any customer-specified facility, including NYSE co-location data centers. An Outpost rack in the same cage or cage-adjacent location as NYSE infrastructure provides physical proximity for sub-millisecond trading latency, while maintaining AWS APIs, IAM, and connectivity back to the AWS region for management.' },
      { id: 'c', text: 'AWS Local Zone in New York (us-east-1-nyc-1) for ultra-low-latency compute near the city', correct: false, explanation: 'AWS Local Zones (e.g., New York metro area) provide single-digit millisecond latency to cities but are located in AWS-selected data centers, not within NYSE co-location facilities. The 1ms round-trip requirement to NYSE matching engines requires physical co-location, which Local Zones do not provide.' },
      { id: 'd', text: 'Dedicated Hosts in the us-east-1 region with EC2 placement groups for network proximity', correct: false, explanation: 'Dedicated Hosts provide physical server isolation within an AWS region\'s data centers. AWS data centers for us-east-1 are in Northern Virginia, not co-located with NYSE in New Jersey/New York. Placement groups reduce intra-cluster latency but do not address geographical distance to exchange infrastructure.' },
    ],
    explanation: { overall: 'AWS Outposts: AWS-managed infrastructure rack(s) delivered and installed at customer or co-location facilities. Runs AWS-native compute (EC2, ECS, EKS, RDS, EMR) with identical APIs to cloud. Connected back to parent AWS region via Direct Connect or internet (for management plane). Use cases: (1) Data residency — keep data on-premises. (2) Low-latency local processing — manufacturing, healthcare, trading. (3) Local data processing — edge compute that feeds back to AWS. (4) Regulatory requirements — data cannot leave specific premises. Outposts sizes: 1U/2U servers (small) and 42U full rack configurations. Power/space/connectivity provided by the customer facility.', examTip: 'AWS infrastructure options by latency/location: Region (10s of ms between users and region) → Local Zone (single-digit ms to metro area, for gaming, media, real-time) → Wavelength (ms to 5G mobile users) → Outposts (at customer facility, <1ms to on-premises systems). Exam differentiator: "on-premises latency requirements" + "AWS APIs on-premises" → Outposts. "city latency" + "metro area" → Local Zones. "5G/mobile edge" → Wavelength. "gaming anycast global" → Global Accelerator. "exchange co-location" → Outposts.' },
    tags: ['outposts', 'co-location', 'ultra-low-latency', 'financial-services', 'edge-infrastructure'],
  },
];
