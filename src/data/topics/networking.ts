import type { Topic } from '../../types/topic';

export const networkingTopic: Topic = {
  id: 'networking',
  slug: 'networking',
  title: 'Hybrid Networking: Direct Connect & VPN',
  shortTitle: 'Hybrid Net',
  icon: 'Server',
  color: 'slate',
  examDomains: ['new-solutions', 'organizational-complexity'],
  estimatedStudyHours: 6,
  summaryBullets: [
    'Direct Connect: dedicated private connection — consistent latency, no internet traversal, 1/10/100 Gbps',
    'Transit Gateway replaces complex VPC peering meshes — hub-and-spoke, transitive routing, multi-account',
    'Site-to-Site VPN: IPsec over internet, backup for DX. Client VPN: OpenVPN for remote workers',
    'Direct Connect Gateway: connect one DX to multiple VPCs across regions — single physical connection',
    'Network Firewall in dedicated subnet for centralized inspection before Traffic reaches workload VPCs',
  ],
  relatedTopics: ['vpc', 'security', 'iam'],
  solutionArchitectures: [
    {
      id: 'net-arch-hub-spoke',
      title: 'Hub-and-Spoke Network with Transit Gateway',
      description: 'Centralized network topology where a Transit Gateway acts as the hub connecting all VPCs (spokes) and on-premises networks. Replaces a mesh of VPC peering connections that becomes unmanageable at scale.',
      useCase: 'Organizations with 5+ VPCs across multiple accounts and/or on-premises connectivity. Any architecture requiring transitive routing between VPCs.',
      components: [
        { name: 'Transit Gateway', role: 'Central hub — routes traffic between all attached VPCs and VPN/Direct Connect attachments. Supports up to 5,000 attachments' },
        { name: 'Inspection VPC', role: 'Dedicated VPC with AWS Network Firewall or third-party firewall. All inter-VPC and egress traffic routed through for deep packet inspection' },
        { name: 'Egress VPC', role: 'Centralized NAT Gateway and internet egress. All workload VPCs route internet traffic here rather than maintaining per-VPC NAT' },
        { name: 'Shared Services VPC', role: 'Hosts shared infrastructure: Active Directory, code artifact repositories, monitoring. Accessible to all spoke VPCs' },
        { name: 'Workload VPCs', role: 'Individual application VPCs per team/environment. No internet gateway — all traffic through Transit Gateway' },
        { name: 'Direct Connect / VPN', role: 'On-premises connectivity attached to Transit Gateway. Single connection reaches all VPCs via TGW routing' },
      ],
      dataFlow: [
        'Workload VPC route table: 0.0.0.0/0 → Transit Gateway attachment (no local NAT)',
        'Transit Gateway route table: evaluates destination → routes to Inspection VPC for security scanning',
        'Network Firewall in Inspection VPC: inspects and allows/blocks traffic based on domain/signature rules',
        'Allowed traffic: Inspection VPC → Transit Gateway → Egress VPC → NAT Gateway → Internet',
        'Inter-VPC: Spoke A → TGW → Inspection VPC → TGW → Spoke B (all east-west traffic inspected)',
        'On-premises → Direct Connect → TGW → any spoke VPC (transitive routing enabled by TGW)',
      ],
      keyDecisions: [
        'TGW route tables: create separate route tables for isolation (dev cannot reach prod) vs shared services (all can reach)',
        'Appliance Mode on TGW attachment to Inspection VPC — ensures symmetric routing through same firewall instance for stateful inspection',
        'Centralized egress (one NAT GW) vs distributed (per-VPC NAT) — centralized is cheaper but single point of egress',
        'RAM (Resource Access Manager) to share TGW across accounts in the Organization without VPC peering',
      ],
      tradeoffs: [
        { pro: 'Transitive routing — any VPC can reach any other VPC through the hub without direct peering', con: 'TGW costs per attachment hour + per GB processed — can be significant at scale' },
        { pro: 'Centralized security inspection via single Network Firewall deployment', con: 'Single TGW is a potential bottleneck — though AWS limits are very high (50 Gbps per AZ)' },
      ],
      examAngle: 'TGW is the answer when VPC peering mesh becomes unmanageable OR when you need transitive routing. VPC peering is non-transitive — A-B and B-C does not allow A-C. TGW enables A-C via the hub. Transit Gateway Connect (GRE) for SD-WAN appliance integration.',
    },
    {
      id: 'net-arch-hybrid',
      title: 'Resilient Hybrid Connectivity (Direct Connect + VPN Backup)',
      description: 'Production-grade hybrid architecture combining AWS Direct Connect for primary high-bandwidth connectivity with Site-to-Site VPN as an automatic failover path. Achieves high availability without a second DX circuit.',
      useCase: 'Enterprise workloads requiring consistent low-latency connectivity to AWS with business continuity requirements. Typical for financial services, healthcare, and manufacturing with on-premises systems.',
      components: [
        { name: 'Direct Connect (Primary)', role: '1-10 Gbps dedicated private circuit from on-premises to AWS Direct Connect location. Private VIF for VPC access, Transit VIF for TGW' },
        { name: 'Direct Connect Gateway', role: 'Connects the DX circuit to multiple VPCs across multiple regions via a single physical connection. Up to 10 VGWs or 3 TGW attachments' },
        { name: 'Site-to-Site VPN (Backup)', role: 'IPsec VPN over internet — active standby. BGP routing with higher cost/lower preference than DX route. Auto-activates on DX failure' },
        { name: 'Virtual Private Gateway', role: 'AWS side of VPN and DX connection. Terminates the VPN tunnels and DX Private VIF at the VPC level' },
        { name: 'BGP Routing', role: 'Both DX and VPN use BGP. DX advertised with higher preference (lower BGP weight/MED). VPN route activates automatically when DX BGP session drops' },
      ],
      dataFlow: [
        'Normal: On-premises router → Direct Connect → Direct Connect Gateway → VGW/TGW → VPC (private, dedicated, consistent)',
        'DX failure detected: BGP session drops → on-premises router withdraws DX route → VPN route becomes active',
        'Failover: On-premises → Internet → Site-to-Site VPN (IPsec) → VGW → VPC (degraded latency, lower bandwidth)',
        'DX restored: BGP reconverges → DX route preferred again → traffic shifts back to DX automatically',
      ],
      keyDecisions: [
        'Private VIF (single VPC) vs Transit VIF (Transit Gateway for multiple VPCs) — choose Transit VIF for multi-VPC architectures',
        'Hosted Connection vs Dedicated Connection — Hosted (through DX partner, 50Mbps-10Gbps) vs Dedicated (direct from AWS, 1/10/100 Gbps)',
        'Active/Active VPN tunnels (both tunnels active, ECMP) vs Active/Standby — ECMP doubles throughput but requires BGP ECMP config on-premises',
        'MACsec encryption on DX for Layer 2 encryption — required for compliance workloads that need encryption in transit on the dedicated link',
      ],
      tradeoffs: [
        { pro: 'Automatic failover with BGP — no manual intervention needed during DX outage', con: 'VPN backup limited to ~1.25 Gbps per tunnel vs DX 1-100 Gbps — may not sustain full workload during failover' },
        { pro: 'Single DX connection reaches multiple VPCs via DX Gateway — cost-efficient', con: 'DX provisioning takes days-to-weeks — not suitable for immediate connectivity needs' },
      ],
      examAngle: 'Exam favorite: DX + VPN for HA. DX alone = single point of failure. Two DX circuits = higher cost, better for guaranteed throughput. DX + VPN = cost-effective HA. Direct Connect Gateway allows one DX to reach VPCs in multiple regions — important for multi-region architectures.',
    },
  ],
  subtopics: [
    {
      id: 'net-dx',
      title: 'AWS Direct Connect',
      sections: [
        {
          id: 'net-dx-fundamentals',
          title: 'Direct Connect Fundamentals',
          content: '**AWS Direct Connect (DX)**: A dedicated private network connection from on-premises to AWS. Bypasses the public internet — consistent latency, higher bandwidth, lower data transfer costs for high-volume workloads.\n\n**Connection types**:\n- **Dedicated Connection**: 1 Gbps, 10 Gbps, or 100 Gbps. Physical port at a DX location reserved exclusively for you. Ordered directly from AWS.\n- **Hosted Connection**: Sub-1 Gbps to 10 Gbps via an AWS Direct Connect Partner. Shared infrastructure at the DX location. Faster provisioning.\n\n**Virtual Interfaces (VIFs)**: Logical partitions of a DX connection:\n- **Private VIF**: Connects to a single VPC via Virtual Private Gateway. Private IP routing.\n- **Public VIF**: Access to all AWS public services (S3, DynamoDB endpoints, etc.) using public IPs — traffic stays on AWS network, does not traverse internet.\n- **Transit VIF**: Connects to a Transit Gateway — enables access to multiple VPCs and on-premises networks through a single DX connection.\n\n**Direct Connect Gateway (DXGW)**: A global resource that connects a DX connection to multiple VGWs or TGW attachments across different AWS Regions. One physical DX → DXGW → VPCs in us-east-1, eu-west-1, ap-southeast-1. Cannot connect VPCs in the same DXGW to each other (DXGW is not a router between VPCs).\n\n**Resiliency models**:\n- Development: Single connection at single location (no redundancy)\n- High Resiliency: Two connections at two DX locations (location failure protected)\n- Maximum Resiliency: Two connections at two DX locations + redundant routers on-premises (all single points eliminated)',
          keyPoints: [
            { text: 'DX is NOT encrypted by default — add IPsec VPN over DX or use MACsec for Layer 2 encryption', gotcha: true },
            { text: 'Direct Connect Gateway is global — connects one DX to VPCs in multiple AWS regions via a single physical circuit', examTip: true },
            { text: 'Transit VIF → Transit Gateway is required to reach multiple VPCs. Private VIF → VGW only reaches one VPC', examTip: true },
            { text: 'Provisioning a dedicated DX connection takes days to weeks — plan ahead for new connections', examTip: true },
            { text: 'DX + Site-to-Site VPN backup: use BGP with DX preferred route (lower metric). VPN activates automatically on DX failure', examTip: true },
          ],
          bestPractices: [
            { pillar: 'reliability', text: 'Always provision at least two DX connections at two separate DX locations for production — single connection or single location is a single point of failure', detail: 'Use the AWS Direct Connect Resiliency Recommendation tool to validate your HA design' },
            { pillar: 'security', text: 'Enable MACsec (IEEE 802.1AE) encryption on dedicated DX connections for compliance workloads — provides Layer 2 encryption without tunneling overhead' },
            { pillar: 'cost-optimization', text: 'Use Direct Connect Gateway to share one physical connection across multiple VPCs and regions — avoids paying for multiple DX circuits for multi-region architectures' },
            { pillar: 'operational-excellence', text: 'Monitor DX BGP session state, packet loss, and bit error rate via CloudWatch — set alarms on ConnectionState metric to detect failures before they impact workloads' },
          ],
          useCases: [
            {
              scenario: 'A company runs a latency-sensitive trading application that transfers 5 TB/day between their data center and AWS. They currently use Site-to-Site VPN but experience variable latency (20-80ms) causing reconciliation issues.',
              wrongChoices: ['Add more VPN tunnels for bandwidth — VPN is internet-based and latency variance persists', 'Use S3 Transfer Acceleration — this is for S3 only, not general private connectivity'],
              correctChoice: 'Provision a 10 Gbps AWS Direct Connect Dedicated Connection with a Private VIF. BGP routing ensures consistent sub-10ms latency on the dedicated circuit.',
              reasoning: 'Direct Connect provides dedicated private bandwidth with consistent, predictable latency — critical for latency-sensitive financial applications. The 5 TB/day at lower DX data transfer rates also reduces cost vs internet egress pricing.',
            },
          ],
          comparisons: [
            {
              headers: ['Feature', 'Site-to-Site VPN', 'Direct Connect'],
              rows: [
                ['Path', 'Public internet (IPsec)', 'Dedicated private circuit'],
                ['Latency', 'Variable (internet)', 'Consistent, low'],
                ['Bandwidth', 'Up to 1.25 Gbps/tunnel', '1/10/100 Gbps'],
                ['Encryption', 'IPsec (default)', 'Not encrypted (add MACsec/VPN)'],
                ['Setup time', 'Minutes', 'Days to weeks'],
                ['Cost', 'Per hour + data transfer', 'Port hour + data transfer (lower GB rate)'],
                ['Failover', 'Active/Active or Active/Standby', 'Add VPN backup for HA'],
                ['Use case', 'Dev/test, VPN backup, quick setup', 'Production, high bandwidth, consistent latency'],
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'net-tgw',
      title: 'Transit Gateway & VPC Connectivity',
      sections: [
        {
          id: 'net-tgw-deep',
          title: 'Transit Gateway Architecture',
          content: '**AWS Transit Gateway (TGW)**: Regional virtual router connecting VPCs, VPN connections, Direct Connect (via Transit VIF), and other TGWs (peering). Replaces complex VPC peering meshes — enables transitive routing.\n\n**Key capabilities**:\n- Attach up to 5,000 VPCs and on-premises connections\n- Route tables: control which attachments can route to each other (network segmentation)\n- Equal-cost multi-path (ECMP) routing across VPN tunnels for increased bandwidth\n- Multicast support (media streaming)\n- Inter-region TGW peering (connect TGWs in different regions)\n\n**TGW Route Tables**: Core isolation mechanism. Each attachment associated with one route table and can propagate routes to route tables. Examples:\n- Separate route tables for Prod and Dev — Prod VPCs cannot route to Dev VPCs\n- Centralized egress route table — all spokes route 0.0.0.0/0 to Egress VPC\n- Inspection route table — all inter-VPC traffic routed through Inspection VPC\n\n**VPC Peering vs Transit Gateway**:\n- VPC Peering: non-transitive (A↔B, B↔C ≠ A↔C), no bandwidth limit, no additional cost per GB, no single hop\n- Transit Gateway: transitive, bandwidth limit per AZ, cost per attachment + per GB, centralized management\n\n**Appliance Mode**: For stateful network appliances (firewalls, IDS) in a centralized Inspection VPC. Ensures traffic from the same flow always goes through the same appliance instance — prevents asymmetric routing that breaks stateful inspection.\n\n**Transit Gateway Connect**: GRE-based attachment for SD-WAN and network appliances. Supports BGP and up to 5 Gbps per Connect peer (vs 1.25 Gbps for VPN).',
          keyPoints: [
            { text: 'VPC Peering is non-transitive — A-B and B-C peering does NOT allow A-C traffic. TGW enables transitive routing.', examTip: true },
            { text: 'TGW Appliance Mode: required for stateful inspection — ensures symmetric routing through the same firewall instance for a given flow', examTip: true },
            { text: 'Share TGW across accounts using AWS RAM (Resource Access Manager) — VPCs in other accounts attach to the shared TGW', examTip: true },
            { text: 'TGW peering across regions for global network — peered TGWs exchange routes and forward traffic over AWS backbone', examTip: true },
            { text: 'TGW costs per attachment hour + per GB — for small traffic volumes, VPC peering may be more cost-effective', gotcha: true },
          ],
          bestPractices: [
            { pillar: 'operational-excellence', text: 'Use separate TGW route tables per environment tier (prod/dev/shared-services) — enforce network segmentation without security group complexity' },
            { pillar: 'security', text: 'Route all inter-VPC traffic through an Inspection VPC with AWS Network Firewall — centralized east-west traffic visibility and filtering' },
            { pillar: 'reliability', text: 'Enable TGW ECMP across multiple Site-to-Site VPN tunnels for increased bandwidth and redundancy on the VPN backup path' },
            { pillar: 'cost-optimization', text: 'Centralize NAT Gateways in an Egress VPC attached to TGW — eliminates per-VPC NAT GW costs for workloads with outbound-only internet access' },
          ],
          useCases: [
            {
              scenario: 'A company has 20 VPCs across 5 AWS accounts. They currently use VPC peering — managing 190 peering connections (n*(n-1)/2). Security team wants centralized traffic inspection. Developers complain about complex route table management.',
              wrongChoices: ['Continue VPC peering — add a firewall in each VPC', 'Use PrivateLink for all inter-VPC communication'],
              correctChoice: 'Deploy Transit Gateway shared via RAM across all accounts. Create route tables for prod/dev isolation. Route inter-VPC traffic through an Inspection VPC with Network Firewall using TGW Appliance Mode.',
              reasoning: 'TGW replaces an unmanageable peering mesh with centralized hub-and-spoke. Route tables enforce segmentation. Appliance Mode + Network Firewall provides centralized inspection. RAM sharing eliminates need to create TGW in each account.',
            },
          ],
        },
        {
          id: 'net-vpn',
          title: 'Site-to-Site VPN & Client VPN',
          content: '**Site-to-Site VPN**: IPsec VPN between on-premises network and AWS. Each VPN connection has two tunnels (active/standby or active/active with ECMP) for redundancy. Terminated at VGW (single VPC) or TGW (multiple VPCs).\n\n**VPN key specs**:\n- 1.25 Gbps per tunnel (2.5 Gbps with both tunnels active via ECMP)\n- Static routing or dynamic routing (BGP)\n- IKEv1 or IKEv2 support\n- Pre-shared key or certificate authentication\n- Accelerated VPN: routes through AWS Global Accelerator edge locations — improved performance for geographically distant sites\n\n**AWS Client VPN**: Managed OpenVPN service for remote worker access to AWS and on-premises resources. Elastic — scales to thousands of concurrent connections. Mutual TLS certificate authentication or Active Directory authentication.\n\n**Client VPN key characteristics**:\n- Client CIDR block (assigned to connected devices) must not overlap with VPC CIDR\n- Split tunneling: route only specific CIDRs through VPN, rest goes direct to internet (reduces bandwidth)\n- Authorization rules: control which users (based on AD group) can access which subnets\n- Route traffic to on-premises via Client VPN → VPC → Transit Gateway → VPN/DX to on-premises\n\n**VPN CloudHub**: Connect multiple branch offices to a single VGW. Branches can communicate with each other through AWS (hub). Low-cost option for connecting multiple sites — but each branch still traverses the internet.',
          keyPoints: [
            { text: 'Each Site-to-Site VPN connection has TWO tunnels — AWS requires you configure both for HA. Only one is active unless ECMP enabled', examTip: true },
            { text: 'Accelerated VPN routes through Global Accelerator edge — better performance than standard VPN for distant sites', examTip: true },
            { text: 'VPN CloudHub: multiple branches → single VGW → branches can communicate via AWS. Cost-effective multi-site mesh', examTip: true },
            { text: 'Client VPN split tunneling: only specified routes go through VPN, direct internet for rest — saves bandwidth and improves user experience', examTip: true },
          ],
          bestPractices: [
            { pillar: 'reliability', text: 'Always configure both VPN tunnels — single tunnel loss during AWS maintenance window causes outage. Use BGP for automatic failover between tunnels' },
            { pillar: 'performance', text: 'Use Accelerated Site-to-Site VPN for connections from remote regions or high-latency locations — routes traffic to nearest AWS edge, not public internet routing' },
            { pillar: 'security', text: 'Use certificate-based authentication for Client VPN in conjunction with MFA via SAML federation — pre-shared keys are less secure for user authentication' },
            { pillar: 'cost-optimization', text: 'Enable split tunneling on Client VPN — only AWS-bound traffic uses the VPN connection, reducing per-hour capacity costs and improving client performance' },
          ],
        },
      ],
    },
    {
      id: 'net-privatelink',
      title: 'PrivateLink & Endpoint Services',
      sections: [
        {
          id: 'net-endpoints',
          title: 'VPC Endpoints & PrivateLink',
          content: '**VPC Endpoints**: Private connectivity to AWS services and third-party services without internet, NAT, VPN, or Direct Connect.\n\n**Gateway Endpoints**: Free. Only for S3 and DynamoDB. Added as route table entries — target is a prefix list. Traffic stays on AWS network but goes through the gateway endpoint. No ENI in your subnet.\n\n**Interface Endpoints (PrivateLink)**: An ENI with a private IP in your subnet. Creates private DNS that resolves the service endpoint to your private IP. Supports 180+ AWS services (CloudWatch, SNS, SQS, API Gateway, etc.) and third-party services (SaaS). Charged per AZ per hour + per GB.\n\n**Endpoint Services**: You can create your own PrivateLink service (backed by NLB). Other accounts connect to your service privately without VPC peering. Common for SaaS providers or shared internal services.\n\n**Private DNS for Interface Endpoints**: When enabled (default for most services), `s3.amazonaws.com` resolves to the endpoint IP within the VPC. Requests to the service automatically use the private path. Requires `enableDnsHostnames` and `enableDnsSupport` on the VPC.\n\n**PrivateLink vs VPC Peering vs TGW**:\n- PrivateLink: expose a SPECIFIC SERVICE to consumers without full network access. No route table changes. Non-transitive.\n- VPC Peering: full network access between two VPCs (security group control). Overlapping CIDRs not supported.\n- TGW: hub-and-spoke for many VPCs. Transitive. Requires route table management.',
          keyPoints: [
            { text: 'Gateway Endpoints (S3/DynamoDB) are FREE and work via route table entries — use these before Interface Endpoints to save cost', examTip: true },
            { text: 'Interface Endpoints create an ENI in your subnet — charged per AZ-hour + per GB. Deploy in each AZ for HA', examTip: true },
            { text: 'PrivateLink Endpoint Services: expose your NLB-backed service to other VPCs without peering — consumers cannot access your entire VPC network', examTip: true },
            { text: 'Private DNS on Interface Endpoint resolves the service DNS name to private IPs — ensures traffic uses private path automatically', examTip: true },
            { text: 'VPC endpoints do not support cross-region access — create endpoints in each region where the service is needed', gotcha: true },
          ],
          bestPractices: [
            { pillar: 'security', text: 'Use S3 bucket policies with VPC endpoint conditions (`aws:SourceVpc`, `aws:SourceVpce`) to ensure S3 access only from within your VPC — prevents data exfiltration via public internet' },
            { pillar: 'cost-optimization', text: 'Use Gateway Endpoints for S3 and DynamoDB instead of NAT Gateway — Gateway Endpoints are free, NAT GW charges per GB for S3/DynamoDB traffic' },
            { pillar: 'security', text: 'Add Interface Endpoints for CloudWatch, STS, SSM in private subnets — allows Lambda/EC2 in private subnets to call these services without NAT GW (data perimeter pattern)' },
            { pillar: 'reliability', text: 'Deploy Interface Endpoints in all AZs used by your workload — single-AZ endpoint is a reliability risk if that AZ degrades' },
          ],
        },
      ],
    },
  ],
};
