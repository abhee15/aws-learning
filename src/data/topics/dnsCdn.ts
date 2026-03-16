import type { Topic } from '../../types/topic';

export const dnsCdnTopic: Topic = {
  id: 'dns-cdn',
  slug: 'dns-cdn',
  title: 'Route 53, CloudFront & Global Accelerator',
  shortTitle: 'DNS & CDN',
  icon: 'Globe',
  color: 'cyan',
  examDomains: ['new-solutions', 'cost-optimization'],
  estimatedStudyHours: 6,
  summaryBullets: [
    'Route 53 routing policies: Simple, Weighted, Latency, Geolocation, Geoproximity, Failover, Multivalue',
    'CloudFront: CDN for static + dynamic content. Origins: S3, ALB, EC2, custom HTTP. OAC for private S3',
    'CloudFront Functions (viewer events, JS only) vs Lambda@Edge (all events, Node/Python, longer timeout)',
    'Global Accelerator: anycast IPs, AWS backbone routing, not CDN — for TCP/UDP non-HTTP workloads',
    'Route 53 health checks can trigger failover: primary endpoint → secondary endpoint automatically',
  ],
  relatedTopics: ['compute', 'security', 'networking'],
  subtopics: [
    {
      id: 'dns-route53',
      title: 'Route 53 Routing Policies',
      sections: [
        {
          id: 'dns-routing-policies',
          title: 'Route 53 Routing Policies',
          content: '**Route 53**: Authoritative DNS service. Supports domain registration, health checks, and traffic routing.\n\n**Routing Policies**:\n\n**Simple**: Single resource. No health check association. Use for single endpoint with no failover requirement. Can return multiple values (client picks randomly — poor man\'s load balancing).\n\n**Weighted**: Distribute traffic by percentage (weights 0-255). Use for: A/B testing (10% to new version), gradual migrations, blue/green at DNS level. Weight 0 = no traffic sent. All weights 0 = Route 53 returns all records equally.\n\n**Latency-Based**: Routes to the region with lowest latency FROM the client. AWS uses latency data between clients and AWS regions. Use for multi-region applications to send users to nearest region.\n\n**Failover**: Primary and secondary records. Route 53 health checks primary — on failure, routes to secondary. Active-passive DR pattern. Works with any resource type.\n\n**Geolocation**: Route based on client\'s geographic location (continent, country, US state). Specific over general — country match takes priority over continent. Default record required for unmatched locations. Use for: content localization, data residency compliance (EU traffic → EU region), language-based routing.\n\n**Geoproximity (Traffic Flow only)**: Route based on geographic distance from resources. Bias value expands (+) or shrinks (-) the routing area. Requires Route 53 Traffic Flow. Use for: fine-tuning traffic distribution between regions beyond pure distance.\n\n**Multivalue Answer**: Returns multiple healthy records (up to 8). Health checks associate with each record — only healthy endpoints returned. Client-side random selection. NOT a load balancer replacement — use for high availability of simple HTTP services.\n\n**Route 53 Health Checks**: Monitor endpoints (HTTP/HTTPS/TCP), other CloudWatch alarms (calculated health checks), or other health checks. Integration with Route 53 failover routing. Private endpoint health checks: use CloudWatch alarm as proxy (health check cannot reach private IPs directly).',
          keyPoints: [
            { text: 'Geolocation routes by WHERE the client IS. Latency routes by which endpoint is FASTEST for the client. Different policies for different goals', examTip: true },
            { text: 'Geoproximity requires Traffic Flow feature. Geolocation works with standard records', examTip: true },
            { text: 'Failover policy health check: if primary health check fails, Route 53 switches to secondary. Good for active-passive DR', examTip: true },
            { text: 'Route 53 health checks cannot directly check private IPs — use CloudWatch alarm + calculated health check as a proxy', gotcha: true },
            { text: 'Weighted routing with weight=0: no traffic sent to that record. All weights=0: Route 53 returns all records equally', gotcha: true },
          ],
          bestPractices: [
            { pillar: 'reliability', text: 'Use Failover routing with Route 53 health checks for active-passive DR — health check threshold and interval determine failover speed (10s interval × 3 threshold = 30s)' },
            { pillar: 'performance', text: 'Use Latency-based routing for multi-region deployments — continuously routes users to the lowest-latency region based on AWS-measured latency data' },
            { pillar: 'security', text: 'Use Geolocation routing to comply with data residency requirements — route EU users only to EU regions for GDPR compliance' },
          ],
          comparisons: [
            {
              headers: ['Policy', 'Route Based On', 'Use Case'],
              rows: [
                ['Simple', 'Nothing (fixed)', 'Single endpoint, no failover'],
                ['Weighted', 'Configured percentage', 'A/B testing, gradual migration'],
                ['Latency', 'Lowest latency to AWS region', 'Multi-region, performance'],
                ['Failover', 'Health check result', 'Active-passive DR'],
                ['Geolocation', 'Client geographic location', 'Data residency, localization'],
                ['Geoproximity', 'Distance + bias', 'Fine-tune regional traffic split'],
                ['Multivalue', 'Health check (return all healthy)', 'Simple HA, multiple healthy endpoints'],
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'dns-cloudfront',
      title: 'CloudFront CDN',
      sections: [
        {
          id: 'dns-cloudfront-core',
          title: 'CloudFront Architecture & Configuration',
          content: '**Amazon CloudFront**: Global CDN with 400+ edge locations. Caches content close to users for low latency. Supports static AND dynamic content acceleration.\n\n**Origins**: Where CloudFront fetches content:\n- S3 bucket (static website, object storage)\n- ALB, EC2 (dynamic application)\n- Custom HTTP origin (on-premises, third-party)\n- Multiple origins with origin groups (primary + failover)\n\n**Origin Access Control (OAC)**: Restricts S3 bucket to only allow CloudFront access. Bucket policy with CloudFront service principal. Replaces legacy Origin Access Identity (OAI). Makes S3 bucket private while still serving content through CloudFront.\n\n**Cache Behavior**: Rules mapping URL patterns to origin + cache settings:\n- Path pattern: `*.jpg` → S3 origin, `/api/*` → ALB origin\n- TTL: minimum, maximum, default TTL\n- Allowed HTTP methods\n- Cache based on: headers, query strings, cookies\n- Compress objects automatically\n\n**TTL and Cache Invalidation**: Objects cached until TTL expires. Force invalidation with CloudFront Invalidation (`/images/*` invalidation). Invalidation costs $0.005 per path. Alternative: versioned URLs (add version in filename/query string) — preferred for high-volume changes.\n\n**Price Classes**: Select which edge locations to use:\n- Price Class All: all edge locations (lowest latency, highest cost)\n- Price Class 200: most edge locations (excludes most expensive)\n- Price Class 100: North America and Europe only (cheapest)\n\n**Geo Restriction**: Whitelist or blacklist countries at the CloudFront distribution level.\n\n**HTTPS**: CloudFront terminates TLS. Certificate via ACM (must be in us-east-1 for CloudFront). Enforce HTTPS with Viewer Protocol Policy: Redirect HTTP to HTTPS or HTTPS Only.\n\n**WAF integration**: Attach WAF WebACL to CloudFront — rules evaluated at the edge before traffic reaches origin.',
          keyPoints: [
            { text: 'OAC replaces OAI for S3 private access. Configure S3 bucket policy to allow CloudFront service principal + your distribution ARN', examTip: true },
            { text: 'ACM certificate for CloudFront must be created in us-east-1 — CloudFront is a global service that reads certificates from us-east-1 only', gotcha: true },
            { text: 'Use versioned URLs instead of invalidations for frequent updates — cheaper (no per-path cost) and more predictable cache behavior', examTip: true },
            { text: 'CloudFront can cache both static AND dynamic content. Cache dynamic content with Vary headers or short TTLs for personalized content', examTip: true },
          ],
          bestPractices: [
            { pillar: 'security', text: 'Enable OAC on S3 origins and disable public access on the bucket — ensures all S3 content served only through CloudFront, preventing direct S3 URL access and bypassing WAF' },
            { pillar: 'performance', text: 'Use origin groups with primary and failover S3 origins for CloudFront — automatically fails over to secondary origin if primary returns 4xx/5xx errors' },
            { pillar: 'cost-optimization', text: 'Select appropriate Price Class — Price Class 100 (NA+EU only) can reduce costs 30-40% if users are concentrated in these regions' },
          ],
        },
        {
          id: 'dns-edge-compute',
          title: 'CloudFront Functions vs Lambda@Edge',
          content: '**CloudFront Functions**: JavaScript-only. Runs at ALL edge locations. Latency: sub-millisecond. Triggers: Viewer Request and Viewer Response only. Use cases: URL rewrites, HTTP header manipulation, simple auth token validation, A/B testing redirects. Free tier: 2M invocations/month. Very cheap. No VPC access, no network calls allowed.\n\n**Lambda@Edge**: Node.js or Python. Runs at REGIONAL edge caches (fewer locations than all PoPs). Latency: single-digit milliseconds. Triggers: Viewer Request, Viewer Response, Origin Request, Origin Response. Use cases: complex auth (JWT validation, OAuth token exchange), dynamic content based on device type, image resizing at edge. No environment variables, no VPC access, limited IAM (cannot call most AWS services). Must be deployed in us-east-1.\n\n**When to use each**:\n- Simple header add/remove → CloudFront Functions (faster, cheaper)\n- URL rewriting for A/B testing → CloudFront Functions\n- JWT validation → CloudFront Functions (simple) or Lambda@Edge (complex, needs external call)\n- Server-side rendering at edge → Lambda@Edge\n- Origin Request modification (change origin based on viewer) → Lambda@Edge (Origin Request trigger)\n- Image optimization at edge → Lambda@Edge\n\n**Global Accelerator**: Not a CDN. Uses AWS anycast IPs (two static IPs per accelerator). Traffic enters AWS backbone at nearest PoP. Routes over AWS global network (not public internet) to optimal endpoint. Benefits: deterministic routing, reduced jitter, faster failover (30s vs DNS TTL minutes), works for TCP/UDP not just HTTP.',
          keyPoints: [
            { text: 'CloudFront Functions: viewer events only, sub-ms, JavaScript, runs at all PoPs, very cheap. Lambda@Edge: all 4 events, Python/Node, runs at regional edge, more powerful', examTip: true },
            { text: 'Lambda@Edge: no environment variables, must deploy to us-east-1, cannot access VPC resources', gotcha: true },
            { text: 'Global Accelerator ≠ CloudFront. GA provides static anycast IPs + backbone routing for non-HTTP (gaming, IoT, VoIP). CloudFront is HTTP/HTTPS CDN with caching', examTip: true },
            { text: 'Global Accelerator failover: 30 seconds to detect and reroute. Route 53 DNS failover: 60-90s. GA is faster for active-passive failover without DNS TTL delays', examTip: true },
          ],
          comparisons: [
            {
              headers: ['Feature', 'CloudFront Functions', 'Lambda@Edge', 'Global Accelerator'],
              rows: [
                ['Triggers', 'Viewer req/res only', 'All 4 (incl. origin)', 'N/A (routing only)'],
                ['Language', 'JavaScript only', 'Node.js, Python', 'N/A'],
                ['Latency', 'Sub-millisecond', 'Single-digit ms', 'Varies (backbone benefit)'],
                ['Location', 'All 400+ PoPs', 'Regional edge caches', 'All 400+ PoPs (anycast)'],
                ['Network access', 'None', 'Limited (no VPC)', 'N/A'],
                ['Use case', 'Header/URL manipulation', 'Auth, SSR, image resize', 'TCP/UDP, static IPs, fast failover'],
              ],
            },
          ],
        },
      ],
    },
  ],
};
