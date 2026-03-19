import type { Topic } from '../../types/topic';

export const globalInfrastructureTopic: Topic = {
  id: 'global-infrastructure',
  slug: 'global-infrastructure',
  title: 'AWS Global Infrastructure',
  shortTitle: 'Global Infra',
  icon: 'Globe',
  color: 'blue',
  examDomains: ['new-solutions', 'organizational-complexity'],
  estimatedStudyHours: 3,
  summaryBullets: [
    'AWS spans 33+ Regions with 105+ Availability Zones globally',
    'Each Region has 2-6 AZs, each AZ is 1-3 physical data centers',
    'AZs connected by high-bandwidth, low-latency private fiber',
    'Edge Locations (400+) power CloudFront CDN and Route 53',
    'Local Zones extend AWS closer to end users for ultra-low latency',
    'Wavelength Zones embed AWS compute in 5G telecom networks',
    'Outposts bring native AWS services on-premises',
  ],
  relatedTopics: ['vpc', 'dns-cdn', 'disaster-recovery'],
  subtopics: [
    {
      id: 'regions',
      title: 'Regions & Availability Zones',
      sections: [
        {
          id: 'regions-overview',
          title: 'AWS Regions',
          content: `An AWS Region is a geographic area containing multiple isolated and physically separate Availability Zones (AZs). Each Region is completely independent, isolated from other Regions for fault tolerance and stability.

**Key Region Facts:**
- Each Region has a code (e.g., us-east-1, eu-west-2, ap-southeast-1)
- Data does not leave a Region unless explicitly configured
- Not all services are available in all Regions
- Pricing varies by Region
- Choose Region based on: latency, data residency, service availability, cost

**Region Selection Criteria for the Exam:**
1. **Compliance/Data Sovereignty** – data must stay in country → choose local region
2. **Latency** – users in Australia → choose ap-southeast-2
3. **Service Availability** – newer services launch in us-east-1 first
4. **Pricing** – us-east-1 is often cheapest`,
          keyPoints: [
            { text: 'us-east-1 (N. Virginia) is the primary region — new services launch here first', examTip: true },
            { text: 'Data NEVER leaves a Region unless YOU configure it to (S3 replication, etc.)', examTip: true },
            { text: 'Regions are completely isolated — no data sharing between regions by default', examTip: true },
            { text: 'Some global services are not region-specific: IAM, Route 53, CloudFront, WAF', examTip: true },
          ],
          useCases: [
            {
              scenario: 'A startup is launching a consumer app. Their engineering team is in San Francisco. Initial users are mostly in the US, but they plan to expand to Europe in 6 months. Which region should they deploy to initially?',
              wrongChoices: ['eu-west-1 (Ireland) — centrally located between US and Europe for future expansion', 'ap-southeast-1 (Singapore) — globally central for future Asia expansion'],
              correctChoice: 'us-east-1 (N. Virginia) — closest to the team for low-latency development, most complete service catalog, lowest pricing for most services, and easiest region to operate from as a starting point',
              reasoning: 'us-east-1 is the primary AWS region: all new services launch here first, it has the broadest service availability, and pricing is often lowest. For a startup with US-centric initial users, us-east-1 is the correct first region. European expansion is handled via a second region deployment later — you don\'t pre-optimize for unconfirmed future requirements.',
            },
          ],
          comparisons: [
            {
              headers: ['Factor', 'Region Choice Impact'],
              rows: [
                ['Compliance', 'Must choose region in required country/jurisdiction'],
                ['Latency', 'Choose region geographically closest to users'],
                ['Service Availability', 'Verify service is available in target region'],
                ['Pricing', 'Costs vary; us-east-1 typically lowest for most services'],
              ]
            }
          ]
        },
        {
          id: 'azs',
          title: 'Availability Zones',
          content: `Availability Zones are one or more discrete data centers within a Region. Each AZ has redundant power, networking, and connectivity. AZs in a Region are interconnected with high-bandwidth, ultra-low-latency networking.

**AZ Characteristics:**
- Each AZ is identified by a letter suffix (us-east-1a, us-east-1b, us-east-1c)
- AZs are physically separated by meaningful distance but close enough for low-latency sync replication
- Connected by private AWS fiber — NOT public internet
- The AZ letter (1a, 1b) is RANDOMLY assigned per AWS account — your us-east-1a ≠ another account's us-east-1a
- Multi-AZ = High Availability; Multi-Region = Disaster Recovery`,
          keyPoints: [
            { text: 'AZ letter mappings are random per account — use AZ IDs (use1-az1) for cross-account coordination', examTip: true },
            { text: 'Minimum of 2 AZs per region (most have 3+)', examTip: true },
            { text: 'Multi-AZ protects against AZ failure (hardware, power, networking)', examTip: true },
            { text: 'Synchronous replication between AZs is feasible (<1ms latency)', examTip: true },
            { text: 'Deploy resources across ≥2 AZs for production workloads', examTip: true },
          ],
          mnemonics: [
            {
              id: 'az-mnemonic',
              phrase: 'AZs = Independent Islands Connected by Bridges',
              expansion: ['Islands = isolated fault domains', 'Bridges = private high-speed fiber', 'Storm hits one island = others unaffected'],
              category: 'visual',
              visualCueType: 'visual',
            }
          ]
        },
      ]
    },
    {
      id: 'edge-infrastructure',
      title: 'Edge Infrastructure',
      sections: [
        {
          id: 'edge-locations',
          title: 'Edge Locations & PoPs',
          content: `Edge Locations are AWS endpoints for caching and DNS resolution, located close to end users. They form the backbone of CloudFront (CDN) and Route 53 (DNS).

**Types of Edge Infrastructure:**
- **Edge Locations** (400+): CloudFront cache nodes, Route 53 DNS resolvers
- **Regional Edge Caches**: Larger CloudFront caches sitting between origin and Edge Locations
- **Local Zones**: AWS infrastructure in metro areas for <10ms latency
- **Wavelength Zones**: AWS compute in 5G carrier networks for <1ms latency
- **AWS Outposts**: AWS rack delivered to your data center
- **AWS Snow Family**: Physical devices for edge computing and data transfer`,
          keyPoints: [
            { text: '400+ Edge Locations vs 33 Regions — edge locations outnumber regions 10:1', examTip: true },
            { text: 'CloudFront uses both Edge Locations AND Regional Edge Caches', examTip: true },
            { text: 'Local Zones: good for media rendering, gaming, ML inference needing <10ms', examTip: true },
            { text: 'Wavelength Zones: 5G mobile applications, real-time game streaming, AR/VR', examTip: true },
            { text: 'Outposts: hybrid cloud, data residency, latency requirements for on-prem', examTip: true },
          ],
          useCases: [
            {
              scenario: 'A mobile game company has players in Los Angeles experiencing 80ms latency to their us-east-1 game servers. Game state updates require <20ms for a good experience. Moving the entire backend to us-west-2 would require a major redeployment. What is the fastest path to reduce latency for LA players?',
              wrongChoices: ['Migrate all backend services to us-west-2 — major redeployment risk and cost', 'Use CloudFront — it caches static content but cannot cache dynamic game state updates'],
              correctChoice: 'Enable an AWS Local Zone in Los Angeles (us-west-2-lax-1). Deploy game server instances there. LA players connect to the Local Zone, reducing latency from 80ms to <5ms while the main region continues serving other players',
              reasoning: 'Local Zones extend AWS infrastructure to metropolitan areas. The Los Angeles Local Zone is physically located in LA, providing single-digit millisecond latency to LA players. Only the latency-sensitive game servers need to run in the Local Zone — the rest of the backend (databases, analytics) can remain in us-east-1 or us-west-2.',
            },
          ],
          comparisons: [
            {
              headers: ['Service', 'Location Type', 'Latency', 'Use Case'],
              rows: [
                ['CloudFront', 'Edge Location', '<10ms', 'Static/dynamic content delivery'],
                ['Local Zones', 'Metro Area', '<10ms', 'Rendering, gaming, real-time apps'],
                ['Wavelength', '5G Network', '<1ms', 'Mobile AR/VR, IoT, gaming'],
                ['Outposts', 'Your DC', 'On-prem', 'Data residency, hybrid cloud'],
              ]
            }
          ]
        },
      ]
    },
    {
      id: 'global-services',
      title: 'Global vs Regional Services',
      sections: [
        {
          id: 'global-regional',
          title: 'Service Scope',
          content: `Understanding whether a service is global or regional is critical for architecture design and for the exam.

**Global Services (not tied to a region):**
- **IAM**: Users, Groups, Roles, Policies — global
- **Route 53**: DNS service — global
- **CloudFront**: CDN — global (uses edge locations)
- **WAF**: Web Application Firewall — global when used with CloudFront
- **AWS Organizations**: Account management — global
- **AWS Shield**: DDoS protection — global (Standard) / global + advanced config

**Regional Services (most services):**
- EC2, RDS, S3 (buckets are regional), Lambda, etc.
- Resources created in one region STAY in that region`,
          keyPoints: [
            { text: 'IAM is GLOBAL — a user/role/policy applies across all regions', examTip: true },
            { text: 'S3 bucket names are globally unique but buckets are REGIONAL', examTip: true, gotcha: true },
            { text: 'Route 53 is global — hosted zones work across all regions', examTip: true },
            { text: 'When building multi-region: replicate data + use Route 53 for failover', examTip: true },
          ],
          mnemonics: [
            {
              id: 'global-services-mnemonic',
              phrase: 'I Route CloudFront WAF Org Shield Globally',
              expansion: ['I = IAM', 'Route = Route 53', 'CloudFront = CloudFront', 'WAF = AWS WAF (with CloudFront)', 'Org = AWS Organizations', 'Shield = AWS Shield'],
              category: 'acronym',
              visualCueType: 'acronym',
            }
          ]
        }
      ]
    }
  ]
};
