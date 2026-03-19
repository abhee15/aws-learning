import type { Topic } from '../../types/topic';

export const vpcTopic: Topic = {
  id: 'vpc',
  slug: 'vpc',
  title: 'VPC & Networking',
  shortTitle: 'VPC',
  icon: 'Network',
  color: 'purple',
  examDomains: ['new-solutions', 'organizational-complexity'],
  estimatedStudyHours: 10,
  summaryBullets: [
    'VPC is your private, isolated network within AWS — you control the IP range, subnets, routes',
    'Public subnets have a route to IGW; private subnets use NAT Gateway for outbound only',
    'Security Groups = stateful firewall at instance level; NACLs = stateless at subnet level',
    'VPC Peering connects two VPCs (non-transitive); Transit Gateway enables hub-and-spoke',
    'VPC Endpoints keep traffic on AWS network — Gateway (S3/DDB) and Interface (most services)',
    'PrivateLink exposes services privately without VPC peering or internet exposure',
    'Flow Logs capture IP traffic metadata — stored in CloudWatch Logs or S3',
  ],
  relatedTopics: ['networking', 'security', 'compute'],
  subtopics: [
    {
      id: 'vpc-basics',
      title: 'VPC Fundamentals',
      sections: [
        {
          id: 'vpc-components',
          title: 'VPC Core Components',
          content: `A Virtual Private Cloud (VPC) is a logically isolated section of the AWS Cloud where you launch resources in a virtual network you define.

**Core VPC Components:**

**CIDR Block:**
- IPv4 CIDR (required): /16 to /28 (65536 to 16 IPs)
- IPv6 CIDR (optional): /56 auto-assigned by AWS, subnets get /64
- Cannot change primary CIDR after creation — but can ADD secondary CIDRs

**Subnets:**
- Subdivision of VPC CIDR within one AZ
- Public Subnet: has route to Internet Gateway (0.0.0.0/0 → IGW)
- Private Subnet: no direct internet route (use NAT for outbound)
- AWS reserves 5 IPs per subnet: .0 (network), .1 (VPC router), .2 (DNS), .3 (future), .255 (broadcast)

**Route Tables:**
- Each subnet associated with one route table
- Local route (VPC CIDR → local) always present and cannot be removed
- Main route table is default for subnets without explicit association

**Internet Gateway (IGW):**
- Horizontally scaled, redundant, HA component
- Enables internet access for public subnets
- One per VPC only
- Also performs NAT for public IPv4 instances (1-to-1)`,
          keyPoints: [
            { text: 'AWS reserves 5 IPs per subnet — subtract 5 when calculating usable IPs', examTip: true },
            { text: 'VPC CIDR cannot be changed after creation — plan carefully (use /16 for flexibility)', examTip: true },
            { text: 'IGW is region-resilient — no AZ failure can bring it down', examTip: true },
            { text: 'A subnet is PUBLIC only if: (1) has route to IGW AND (2) instance has public IP', gotcha: true },
            { text: 'Secondary CIDR blocks CAN be added to existing VPC (IPv4 and IPv6)', examTip: true },
          ]
        },
        {
          id: 'nat-gateway',
          title: 'NAT Gateway & Egress',
          content: `NAT Gateway enables instances in private subnets to initiate outbound internet connections while preventing inbound connections from the internet.

**NAT Gateway:**
- Managed by AWS — no patching, no management
- Must be in a PUBLIC subnet
- Has an Elastic IP assigned
- Scales automatically up to 45 Gbps
- AZ-scoped — deploy one per AZ for HA
- Costs: hourly + per GB processed

**NAT Gateway vs NAT Instance:**
- NAT Instance: EC2 instance, must disable source/dest check, you manage it, can be used as bastion
- NAT Gateway: Managed, scalable, HA per AZ, cannot be used as bastion

**Egress-Only Internet Gateway:**
- For IPv6 only
- Allows outbound IPv6 traffic, blocks inbound
- Equivalent of NAT for IPv6

**Architecture Pattern:**
- Private subnet route table: 0.0.0.0/0 → NAT Gateway
- NAT Gateway in public subnet: 0.0.0.0/0 → IGW
- For HA: one NAT Gateway per AZ, each AZ's private subnets route to their own NAT GW`,
          keyPoints: [
            { text: 'NAT Gateway is AZ-specific — you need one per AZ for high availability', examTip: true },
            { text: 'NAT Gateway must be in a PUBLIC subnet (needs IGW route)', examTip: true, gotcha: true },
            { text: 'NAT Instance requires disabling source/destination check', examTip: true },
            { text: 'Egress-Only IGW = NAT for IPv6 (IPv6 addresses are public by default)', examTip: true },
            { text: 'If question asks for managed, scalable NAT → NAT Gateway always wins over NAT Instance', examTip: true },
          ],
          comparisons: [
            {
              headers: ['Feature', 'NAT Gateway', 'NAT Instance'],
              rows: [
                ['Management', 'Fully managed (AWS)', 'Self-managed (EC2)'],
                ['Availability', 'Highly available per AZ', 'Manual HA setup needed'],
                ['Bandwidth', 'Up to 45 Gbps, scales auto', 'Limited by instance type'],
                ['Bastion Host', 'Cannot use as bastion', 'Can use as bastion'],
                ['Cost', 'Hourly + data', 'EC2 instance + data'],
                ['Security Groups', 'Cannot attach SGs', 'Can attach SGs'],
              ]
            }
          ],
          useCases: [
            {
              scenario: 'Private EC2 instances in three AZs need internet access for software updates. During an AZ failure, instances in the surviving AZs are generating unexpected data transfer charges and some update requests are failing.',
              wrongChoices: ['Place a single NAT Gateway in the middle AZ to cover all three AZs and reduce cost', 'Use a NAT Instance with an Elastic IP in one AZ to share across subnets'],
              correctChoice: 'Deploy one NAT Gateway per AZ and configure each AZ\'s private subnet route table to use only the NAT Gateway in the same AZ',
              reasoning: 'Cross-AZ NAT traffic incurs data transfer charges ($0.01/GB each way). During an AZ failure, a NAT Gateway in the failed AZ becomes unavailable, breaking internet access for all other AZs routing through it. One NAT Gateway per AZ eliminates both cross-AZ charges and the single-point-of-failure.',
            },
          ],
        },
        {
          id: 'security-groups-nacls',
          title: 'Security Groups vs NACLs',
          content: `Security Groups and NACLs are two layers of security in VPC. Understanding their differences is heavily tested.

**Security Groups (SGs):**
- Operate at the INSTANCE/ENI level
- STATEFUL — if you allow inbound port 80, response traffic is automatically allowed outbound
- ALLOW rules only — no DENY rules (you can't explicitly block an IP with SG)
- Rules evaluated as a whole (all rules, no ordering)
- Multiple SGs can be attached to one instance
- Can reference other SGs (not IP ranges) — powerful for microservices

**NACLs (Network Access Control Lists):**
- Operate at the SUBNET level
- STATELESS — must define BOTH inbound AND outbound rules
- Support both ALLOW and DENY rules
- Rules evaluated in ORDER (lowest number first) — first match wins
- Default NACL: allow all inbound and outbound
- Custom NACL: deny all by default

**When to Use Each:**
- SG: default security mechanism for all resources
- NACL: additional subnet-level security, blocking specific IPs (e.g., blocking a bad actor's IP)`,
          keyPoints: [
            { text: 'Security Groups = STATEFUL (track connections); NACLs = STATELESS (evaluate each packet)', examTip: true },
            { text: 'NACLs have numbered rules — lower number = higher priority — 100 evaluated before 200', examTip: true },
            { text: 'SGs have only ALLOW rules — cannot explicitly DENY; NACLs have both ALLOW and DENY', examTip: true },
            { text: 'For blocking a specific IP → use NACL (SGs cannot deny)', examTip: true },
            { text: 'Default NACL allows all; Custom NACL denies all by default', gotcha: true },
            { text: 'Remember ephemeral ports for NACL: need outbound 1024-65535 for stateless return traffic', examTip: true, gotcha: true },
          ],
          comparisons: [
            {
              headers: ['Feature', 'Security Group', 'NACL'],
              rows: [
                ['Level', 'Instance/ENI', 'Subnet'],
                ['State', 'Stateful', 'Stateless'],
                ['Rules', 'Allow only', 'Allow + Deny'],
                ['Evaluation', 'All rules together', 'Ordered (lowest # first)'],
                ['Default', 'Deny all inbound', 'Allow all (default NACL)'],
                ['Applies to', 'Associated instances', 'All subnet instances'],
              ]
            }
          ],
          mnemonics: [
            {
              id: 'sg-nacl-mnemonic',
              phrase: 'SG = Stateful Guard; NACL = Network Access Control List (ordered)',
              expansion: ['SG is like a smart bouncer who remembers who came in (stateful)', 'NACL is like a checklist — checks every person entering AND leaving (stateless)', 'NACL rules are numbered — lower number checked first'],
              category: 'story',
              visualCueType: 'story',
            }
          ]
        }
      ]
    },
    {
      id: 'vpc-connectivity',
      title: 'VPC Connectivity Patterns',
      sections: [
        {
          id: 'vpc-peering',
          title: 'VPC Peering',
          content: `VPC Peering creates a private network connection between two VPCs. Traffic stays on AWS network.

**VPC Peering Key Facts:**
- Works within a Region or across Regions (inter-region peering)
- Works across AWS accounts
- NOT transitive — A↔B, B↔C does NOT mean A can reach C
- CIDRs must NOT overlap
- Route table updates required on both sides
- Uses private IP addressing

**Limitations:**
- No transitive routing
- No edge-to-edge routing (VPN, Direct Connect, IGW, NAT cannot be shared)
- Max 125 peering connections per VPC
- No bandwidth limits or bottleneck

**When Peering vs Transit Gateway:**
- Peering: small number of VPCs, low cost, specific connectivity
- Transit Gateway: many VPCs (>3), hub-and-spoke architecture, shared services`,
          keyPoints: [
            { text: 'VPC Peering is NOT transitive — most common exam trap', examTip: true, gotcha: true },
            { text: 'CIDRs must not overlap — plan addressing carefully', examTip: true },
            { text: 'Inter-region peering: traffic encrypted automatically', examTip: true },
            { text: 'Must update route tables on BOTH sides for traffic to flow', gotcha: true },
          ]
        },
        {
          id: 'transit-gateway',
          title: 'Transit Gateway',
          content: `Transit Gateway acts as a cloud router — a hub that connects multiple VPCs and on-premises networks.

**TGW Architecture:**
- Hub-and-spoke model — all VPCs attach to TGW
- TGW is regional (multi-account via Resource Access Manager)
- Can peer TGWs across regions
- Route tables on TGW control traffic between attachments
- Supports: VPC attachments, VPN attachments, Direct Connect Gateway attachments, TGW peering

**Key Features:**
- **Multicast**: TGW supports IP multicast (unique in AWS)
- **Appliance Mode**: for stateful inspection with network appliances
- **ECMP (Equal-Cost Multi-Path)**: aggregate multiple VPN tunnels for higher bandwidth
- **Inter-Region Peering**: connect TGWs across regions

**TGW vs VPC Peering:**
- TGW is centralized → easier management, single route table management
- Peering is cheaper for point-to-point, no hourly charge per attachment
- TGW supports transitive routing (VPC A → TGW → VPC B → TGW → VPC C)`,
          keyPoints: [
            { text: 'Transit Gateway DOES support transitive routing — this is its main advantage over VPC Peering', examTip: true },
            { text: 'TGW has per-attachment hourly cost + data processing cost', examTip: true },
            { text: 'Use AWS RAM (Resource Access Manager) to share TGW across accounts', examTip: true },
            { text: 'ECMP on TGW: each VPN tunnel = 1.25 Gbps, multiple tunnels = aggregate bandwidth', examTip: true },
            { text: 'TGW Appliance Mode: ensures traffic from same flow goes to same appliance (for stateful inspection)', examTip: true, gotcha: true },
          ]
        },
        {
          id: 'vpc-endpoints',
          title: 'VPC Endpoints & PrivateLink',
          content: `VPC Endpoints allow private connectivity to AWS services without using NAT, IGW, or public internet.

**Gateway Endpoints (FREE):**
- For **S3** and **DynamoDB** only
- Added as a route in route table: S3 prefix list → vpce-xxxxx
- Applies to specific region
- Policy attached to control access

**Interface Endpoints (PrivateLink):**
- For most other AWS services (100+ services)
- Creates an ENI (Elastic Network Interface) in your subnet
- Has a private IP from your VPC CIDR
- DNS resolves to private IP when in the VPC
- Costs: hourly per AZ + data processing
- Supports Security Groups

**PrivateLink for Custom Services:**
- You can expose your own service via PrivateLink (NLB → PrivateLink → Consumer VPC)
- Consumer uses Interface Endpoint to access your service
- Your VPC and consumer's VPC don't need peering or overlapping CIDR concerns
- Used by SaaS providers and shared services patterns

**When to Use:**
- S3/DynamoDB from private subnet → Gateway Endpoint (free, no latency overhead)
- Any other AWS service from private subnet → Interface Endpoint
- Expose internal service to other VPCs/accounts without VPC peering → PrivateLink`,
          keyPoints: [
            { text: 'Gateway Endpoints are FREE and only for S3 and DynamoDB', examTip: true },
            { text: 'Interface Endpoints use PrivateLink and cost money (hourly + data)', examTip: true },
            { text: 'PrivateLink allows service sharing without VPC peering — CIDRs CAN overlap', examTip: true },
            { text: 'Gateway Endpoint: update route table; Interface Endpoint: DNS resolution + ENI', examTip: true },
            { text: 'For cross-account S3 access from private subnet: Gateway Endpoint preferred (cheaper)', examTip: true },
          ],
          comparisons: [
            {
              headers: ['Feature', 'Gateway Endpoint', 'Interface Endpoint'],
              rows: [
                ['Services', 'S3 and DynamoDB only', '100+ AWS services'],
                ['Cost', 'Free', 'Hourly + data processing'],
                ['Implementation', 'Route table entry', 'ENI in subnet'],
                ['DNS', 'Not needed', 'Private DNS resolution'],
                ['Security Groups', 'Cannot attach', 'Can attach SGs'],
                ['On-premises access', 'No (VPC only)', 'Yes (via DX/VPN)'],
              ]
            }
          ],
          useCases: [
            {
              scenario: 'Lambda functions in a private VPC call DynamoDB and S3 frequently. CloudWatch shows high NAT Gateway data processing charges — $800/month just for Lambda-to-S3 and Lambda-to-DynamoDB traffic.',
              wrongChoices: ['Move Lambda functions to a public subnet to avoid NAT Gateway entirely', 'Switch Lambda to run outside the VPC — loses VPC security benefits'],
              correctChoice: 'Create a Gateway Endpoint for S3 and another for DynamoDB in the VPC. Update route tables for the private subnets to route S3/DynamoDB traffic through the endpoints',
              reasoning: 'Gateway Endpoints are free and route S3/DynamoDB traffic directly through the AWS network, bypassing the NAT Gateway. Eliminating NAT charges for high-volume S3/DynamoDB traffic typically saves hundreds to thousands of dollars per month.',
            },
            {
              scenario: 'A SaaS company wants to expose a private internal API (running behind an NLB) to 50 enterprise customers, each in their own VPC with potentially overlapping CIDR ranges. VPC peering would require complex CIDR coordination.',
              wrongChoices: ['Set up 50 VPC peering connections and manage overlapping CIDR with custom routing', 'Make the API public with IP allowlisting — increases attack surface'],
              correctChoice: 'Expose the NLB via AWS PrivateLink. Each customer creates an Interface VPC Endpoint in their VPC pointing to your PrivateLink service — CIDRs do not need to be unique',
              reasoning: 'PrivateLink does not require VPC peering or non-overlapping CIDRs. Each customer endpoint uses a private IP from their own VPC CIDR. Traffic stays on the AWS network, and customers never need routing changes or CIDR coordination.',
            },
          ],
        }
      ]
    },
    {
      id: 'vpc-flow-dns',
      title: 'Flow Logs & DNS',
      sections: [
        {
          id: 'flow-logs',
          title: 'VPC Flow Logs',
          content: `VPC Flow Logs capture metadata about IP traffic flowing through your VPC. Important for security analysis and troubleshooting.

**Flow Log Levels:**
- VPC level (captures all interfaces)
- Subnet level
- Network Interface (ENI) level

**Destinations:**
- CloudWatch Logs (real-time analysis, alarms)
- S3 (cheaper, Athena queries, long-term retention)
- Kinesis Data Firehose (streaming to SIEM tools)

**Flow Log Record Fields:**
Version, Account, Interface ID, Source/Dest IP, Source/Dest Port, Protocol, Packets, Bytes, **Start/End Time**, **Action (ACCEPT/REJECT)**, Log Status

**What Flow Logs DON'T Capture:**
- DNS requests to/from Route 53 resolver (use Route 53 Resolver DNS query logging)
- DHCP traffic
- Instance metadata (169.254.169.254) traffic
- Windows license activation
- Traffic to/from 169.254.169.254 (metadata)

**Troubleshooting with Flow Logs:**
- REJECT → Security Group or NACL blocking
- ACCEPT but no response → Possible SG stateful issue or application issue`,
          keyPoints: [
            { text: 'Flow Logs capture ACCEPT and REJECT — great for security forensics', examTip: true },
            { text: 'Flow Logs do NOT capture DNS queries — use Route 53 Resolver logging for that', examTip: true, gotcha: true },
            { text: 'Flow Logs have a delay — not real-time (minutes)', examTip: true },
            { text: 'Send to S3 for cost-effective long-term retention + Athena queries', examTip: true },
            { text: 'REJECT in flow logs = either SG (inbound rule missing) or NACL blocking', examTip: true },
          ]
        }
      ]
    }
  ]
};
