import type { Question } from './index';

export const dnsCdnQuestions: Question[] = [
  {
    id: 'dns-001',
    stem: 'A global e-commerce company needs to route users to the nearest AWS Region to minimize latency. They have deployments in us-east-1, eu-west-1, and ap-southeast-1. The solution must automatically failover if a region becomes unhealthy. Which Route 53 configuration achieves this?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'dns-cdn',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Latency routing policy with health checks on each regional endpoint', correct: true, explanation: 'Latency routing directs users to the region with lowest network latency. Combined with health checks, Route 53 automatically fails over to the next-lowest-latency healthy region when one becomes unhealthy.' },
      { id: 'b', text: 'Geolocation routing policy with a default record for unmatched locations', correct: false, explanation: 'Geolocation routing is based on user location, not network latency. It does not optimize for fastest response time and does not automatically select the nearest performing region.' },
      { id: 'c', text: 'Weighted routing policy with equal weights and health checks', correct: false, explanation: 'Weighted routing distributes traffic by percentage, not by latency. This would send equal traffic to all regions regardless of user location or performance.' },
      { id: 'd', text: 'Simple routing policy with multiple IP addresses', correct: false, explanation: 'Simple routing does not support health checks and returns all values in random order. It cannot perform failover or latency-based routing.' }
    ],
    explanation: {
      overall: 'Route 53 Latency routing policy routes traffic to the AWS Region that provides the lowest latency for the end user. When combined with health checks, if the lowest-latency endpoint becomes unhealthy, Route 53 automatically routes to the next-best healthy endpoint. This provides both performance optimization and automatic failover.',
      examTip: 'Latency routing = best performance (lowest RTT to AWS region). Geolocation = based on where user IS (country/continent). Geoproximity = based on distance with bias adjustment. For global apps prioritizing speed + HA, always choose Latency + Health Checks.'
    },
    tags: ['route53', 'latency-routing', 'health-checks', 'multi-region', 'failover']
  },
  {
    id: 'dns-002',
    stem: 'A company runs a SaaS application and wants to route 10% of production traffic to a new version for canary testing while keeping 90% on the stable version. Both versions are served by separate ALBs in the same region. The routing split must be precise. Which approach is most appropriate?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'dns-cdn',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Route 53 Weighted routing with weights of 10 and 90 on the two ALB records', correct: true, explanation: 'Weighted routing allows precise percentage-based traffic splitting between multiple resources. Setting weights of 10 and 90 routes exactly 10% to the canary and 90% to stable.' },
      { id: 'b', text: 'Route 53 Latency routing with health checks on both ALBs', correct: false, explanation: 'Latency routing selects based on network performance, not a configurable percentage split. It cannot be used for canary deployments requiring precise traffic ratios.' },
      { id: 'c', text: 'ALB weighted target groups with 10% and 90% weights', correct: false, explanation: 'While ALB weighted target groups can split traffic, they require both versions to be in the same ALB listener rule. If using separate ALBs, Route 53 weighted routing is the appropriate layer.' },
      { id: 'd', text: 'CloudFront with two origins and cache behavior weights', correct: false, explanation: 'CloudFront does not natively support weighted traffic splitting between origins. Origin groups provide failover, not weighted distribution.' }
    ],
    explanation: {
      overall: 'Route 53 Weighted routing assigns relative weights to DNS records for the same name. Traffic is distributed proportionally to the weights — setting 10 and 90 routes exactly 10%/90% of queries. This is ideal for canary deployments, A/B testing, or gradual migrations between endpoints.',
      examTip: 'Weighted routing weights are relative, not absolute percentages. Weight 10 + 90 = 10/(10+90) = 10%. Weight 0 on a record stops all traffic to that endpoint (useful for taking a resource out of rotation without deleting the record). Can combine with health checks for automatic failover within weighted distribution.'
    },
    tags: ['route53', 'weighted-routing', 'canary', 'traffic-splitting', 'deployment']
  },
  {
    id: 'dns-003',
    stem: 'A financial services company must ensure that DNS responses for their domain cannot be spoofed or tampered with in transit. They use Route 53 as their DNS provider. Regulatory compliance requires cryptographic verification of DNS data integrity. What should they implement?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'dns-cdn',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Enable DNSSEC signing on the Route 53 hosted zone and establish a chain of trust with the parent zone', correct: true, explanation: 'DNSSEC (DNS Security Extensions) cryptographically signs DNS records. Resolvers can verify signatures to detect tampering. The chain of trust from root → TLD → hosted zone ensures end-to-end validation.' },
      { id: 'b', text: 'Enable Route 53 Resolver DNS Firewall to block malicious queries', correct: false, explanation: 'DNS Firewall filters outbound DNS queries based on domain lists. It prevents DNS exfiltration and blocks access to malicious domains, but does not provide cryptographic signing of DNS responses.' },
      { id: 'c', text: 'Use private hosted zones with VPC association to prevent public DNS exposure', correct: false, explanation: 'Private hosted zones restrict DNS resolution to associated VPCs but do not cryptographically sign responses. They address availability but not data integrity verification.' },
      { id: 'd', text: 'Configure Route 53 health checks with HTTPS endpoint monitoring', correct: false, explanation: 'Health checks monitor endpoint availability and trigger failover. They do not address DNS data integrity or prevent DNS spoofing attacks.' }
    ],
    explanation: {
      overall: 'DNSSEC protects against DNS cache poisoning and spoofing by digitally signing DNS records using asymmetric cryptography. Route 53 supports DNSSEC signing for public hosted zones. After enabling, you must establish a chain of trust by adding a DS (Delegation Signer) record at the parent zone (domain registrar or TLD). Resolvers that support DNSSEC validation can then verify the authenticity of DNS responses.',
      examTip: 'DNSSEC = cryptographic signing of DNS responses (integrity + authenticity). DNS over HTTPS (DoH) = encryption in transit (confidentiality). They solve different problems. For regulatory compliance requiring DNS integrity verification, DNSSEC is the answer. Route 53 supports DNSSEC for public hosted zones but NOT private hosted zones.'
    },
    tags: ['route53', 'dnssec', 'dns-security', 'compliance', 'cryptographic-signing']
  },
  {
    id: 'dns-004',
    stem: 'A company has acquired another organization and needs to enable DNS resolution between their on-premises network (192.168.0.0/16) and AWS VPCs. On-premises DNS servers should resolve aws.internal private hosted zone records, and VPC instances should resolve corp.local on-premises records. What is the correct Route 53 configuration?',
    type: 'single',
    difficulty: 3,
    topicSlug: 'dns-cdn',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Create Route 53 Resolver Inbound Endpoints for on-premises→AWS resolution and Outbound Endpoints with forwarding rules for AWS→on-premises resolution', correct: true, explanation: 'Inbound Endpoints create ENIs in the VPC that on-premises DNS can forward queries to (resolves private hosted zones). Outbound Endpoints with forwarding rules send VPC queries for corp.local to on-premises DNS servers.' },
      { id: 'b', text: 'Associate the private hosted zone with the on-premises VPN and configure conditional forwarding on AWS', correct: false, explanation: 'Private hosted zones can only be associated with VPCs, not on-premises networks. VPN associations are not a Route 53 feature for DNS resolution.' },
      { id: 'c', text: 'Use Route 53 Resolver DNS Firewall to allow bidirectional DNS traffic between environments', correct: false, explanation: 'DNS Firewall filters queries based on domain blocklists/allowlists. It does not enable hybrid DNS resolution or create the forwarding infrastructure needed for cross-environment name resolution.' },
      { id: 'd', text: 'Create a public hosted zone for aws.internal and configure DNSSEC to secure cross-environment queries', correct: false, explanation: 'Making internal records public is a security risk. Public hosted zones are internet-resolvable; internal infrastructure DNS should remain private and use Resolver Endpoints for hybrid connectivity.' }
    ],
    explanation: {
      overall: 'Route 53 Resolver Endpoints enable hybrid DNS: (1) Inbound Endpoints — on-premises DNS servers forward queries to the endpoint IP addresses, which Route 53 resolves against private hosted zones. (2) Outbound Endpoints + Forwarding Rules — VPC instances querying corp.local get forwarded to on-premises DNS servers. Both require Direct Connect or VPN connectivity. Endpoints are highly available (minimum 2 AZs) and charged per ENI per hour.',
      examTip: 'Remember: Inbound = traffic flowing IN to Route 53 (on-prem → AWS). Outbound = traffic flowing OUT from Route 53 (AWS → on-prem). Easy memory trick: Inbound Endpoint answers questions FROM on-premises. Outbound Endpoint forwards questions TO on-premises. Both must be deployed in the VPC connected to on-premises via DX or VPN.'
    },
    tags: ['route53', 'resolver-endpoints', 'hybrid-dns', 'inbound-endpoint', 'outbound-endpoint']
  },
  {
    id: 'dns-005',
    stem: 'A media company serves static assets (images, CSS, JS) from S3 and dynamic API content from ALB. They want to use CloudFront with different cache behaviors: static assets cached for 7 days, API responses not cached, and a specific /admin/* path blocked entirely. How should they configure CloudFront?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'dns-cdn',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Create multiple cache behaviors: /static/* → S3 origin (TTL 7 days), /api/* → ALB origin (TTL 0), /admin/* → custom error response 403, and default → ALB origin', correct: true, explanation: 'CloudFront evaluates cache behaviors in order of path pattern specificity. Each behavior can have a different origin, TTL, and forwarding configuration. Setting TTL=0 for API and returning 403 for /admin/* achieves all requirements.' },
      { id: 'b', text: 'Use a single cache behavior with Lambda@Edge to route requests based on path', correct: false, explanation: 'While Lambda@Edge can route requests, using multiple cache behaviors is the native, simpler CloudFront mechanism for path-based routing to different origins and TTL configurations.' },
      { id: 'c', text: 'Create two separate CloudFront distributions — one for S3 and one for ALB — with different domain names', correct: false, explanation: 'Separate distributions require separate domains, complicating the architecture. A single distribution with multiple cache behaviors handles all path-based routing elegantly.' },
      { id: 'd', text: 'Configure CloudFront with origin groups for S3 and ALB with automatic failover between them', correct: false, explanation: 'Origin groups provide HA failover between origins, not path-based routing to different origins. This does not address the different cache TTL and blocking requirements.' }
    ],
    explanation: {
      overall: 'CloudFront cache behaviors are evaluated in order of path pattern specificity (most specific first). The default (*) behavior is always last. Each behavior specifies: origin, cache TTL (min/default/max), forwarded headers/cookies/query strings, viewer protocol policy, and allowed HTTP methods. For /admin/* blocking, use a WAF rule or return a custom error response (403) via the behavior\'s error pages configuration.',
      examTip: 'CloudFront path pattern evaluation order: most specific first, default last. To block a path, use WAF with CloudFront (cleanest) OR custom error response. TTL 0 does not disable caching entirely — it makes CloudFront always revalidate with origin (uses If-Modified-Since). To completely bypass cache, set no-store Cache-Control or use TTL=0 with forwarding the Authorization header.'
    },
    tags: ['cloudfront', 'cache-behaviors', 'multiple-origins', 'ttl', 'path-based-routing']
  },
  {
    id: 'dns-006',
    stem: 'A streaming platform needs to serve personalized video content from CloudFront. Each user should receive a unique signed URL valid for 2 hours that grants access to their specific content path. The platform has millions of users. What is the most scalable approach?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'dns-cdn',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Generate CloudFront signed URLs using a trusted key group in the application backend, with the private key stored in Secrets Manager', correct: true, explanation: 'Signed URLs are generated server-side using RSA private keys associated with a CloudFront key group. Storing the private key in Secrets Manager enables secure retrieval. Each URL is scoped to a specific path/expiration, making them ideal for individual content access.' },
      { id: 'b', text: 'Use S3 presigned URLs directly and bypass CloudFront for authenticated content', correct: false, explanation: 'S3 presigned URLs bypass CloudFront\'s CDN benefits (edge caching, lower latency, DDoS protection). For a streaming platform, CloudFront signed URLs provide both security and performance.' },
      { id: 'c', text: 'Configure CloudFront with OAC and restrict S3 access using IAM policies per user', correct: false, explanation: 'OAC restricts S3 access to CloudFront (prevents direct S3 access) but does not provide per-user content authorization. IAM policies cannot be scoped per end-user for anonymous CDN access.' },
      { id: 'd', text: 'Use CloudFront signed cookies to grant access to all content for authenticated sessions', correct: false, explanation: 'Signed cookies grant access to multiple files matching a pattern — better for subscriptions. Signed URLs are more appropriate for individual file access with per-file expiration control.' }
    ],
    explanation: {
      overall: 'CloudFront signed URLs restrict access to individual files with specific expiration times, IP restrictions, and date ranges. The application generates signed URLs using an RSA-SHA1 private key paired with a public key registered in a CloudFront key group. Signed URLs are ideal for: individual file access, per-file expiration, single-use downloads. Signed cookies are better for: access to multiple files, subscription content, avoiding URL parameter exposure.',
      examTip: 'Signed URL vs Signed Cookie: URL = single file, embed in link, expires per-file. Cookie = multiple files/patterns, set in browser, good for subscriber content. Key pairs are now managed via Key Groups (not root account). Private key in Secrets Manager → Lambda/EC2 generates signed URLs server-side. Never expose private key to clients.'
    },
    tags: ['cloudfront', 'signed-urls', 'content-restriction', 'key-groups', 'streaming']
  },
  {
    id: 'dns-007',
    stem: 'A company uses CloudFront to serve their web application. They need to add custom HTTP request headers before forwarding to the ALB origin (to identify CloudFront as the source), modify response headers for security (CSP, HSTS), and implement A/B testing by routing 50% of traffic to different origin paths. Which CloudFront features handle each requirement with minimal operational overhead?',
    type: 'multiple',
    difficulty: 3,
    topicSlug: 'dns-cdn',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'CloudFront Functions for lightweight header manipulation at the viewer request/response stage', correct: true, explanation: 'CloudFront Functions run at all edge locations with sub-millisecond execution. They are ideal for lightweight operations: header manipulation, URL rewrites, simple A/B testing via cookie inspection, and cache key normalization.' },
      { id: 'b', text: 'Response Headers Policy for adding security headers like HSTS and CSP to all responses', correct: true, explanation: 'Response Headers Policies are a native CloudFront feature that adds/modifies response headers without any code. Pre-built security policies include HSTS, X-Frame-Options, X-Content-Type-Options, and custom CSP headers.' },
      { id: 'c', text: 'Lambda@Edge at the origin request stage to route to different origin paths for A/B testing', correct: false, explanation: 'While Lambda@Edge can do A/B testing, it is more expensive and slower than CloudFront Functions for simple routing. CloudFront Functions handle simple A/B routing at viewer-request with lower latency and cost.' },
      { id: 'd', text: 'Custom origin configuration with X-Custom-Header to identify CloudFront requests', correct: true, explanation: 'CloudFront can add custom origin headers (configured in the origin settings) to all requests forwarded to the origin. The ALB can then validate this header to ensure requests come only from CloudFront, not direct internet access.' }
    ],
    explanation: {
      overall: 'CloudFront offers multiple customization layers: (1) CloudFront Functions — fast, cheap, JS-based, runs at edge for viewer requests/responses. (2) Lambda@Edge — slower, more powerful, Node.js/Python, runs at edge for viewer/origin requests/responses, needed for complex logic, external calls, large payloads. (3) Response Headers Policies — no-code security header injection. (4) Custom Origin Headers — fixed headers added to all origin requests.',
      examTip: 'CloudFront Functions vs Lambda@Edge: Functions = sub-millisecond, <1MB memory, no network calls, simple logic (URL rewrites, header manipulation, A/B routing, auth token validation). Lambda@Edge = up to 5s timeout, 128MB-10GB memory, can make network calls, complex logic. Response Headers Policy = no code needed for security headers. Always choose the simplest tool first.'
    },
    tags: ['cloudfront', 'cloudfront-functions', 'lambda-edge', 'response-headers-policy', 'customization']
  },
  {
    id: 'dns-008',
    stem: 'A company serves an S3-hosted static website through CloudFront. After migrating from OAI to OAC, they notice that some users can still access S3 content directly using the S3 website endpoint. How should they prevent direct S3 access while allowing only CloudFront to serve content?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'dns-cdn',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Update the S3 bucket policy to allow only the CloudFront OAC service principal and deny all other s3:GetObject requests', correct: true, explanation: 'OAC uses a service principal (cloudfront.amazonaws.com) with a condition on the CloudFront distribution ARN. The bucket policy should explicitly deny all other GetObject requests, preventing direct S3 access.' },
      { id: 'b', text: 'Enable S3 Block Public Access on the bucket to prevent direct access', correct: false, explanation: 'Block Public Access prevents anonymous public access but does not specifically restrict access to only CloudFront. If the bucket policy grants CloudFront access, BPA should already be enabled but alone it doesn\'t restrict to CloudFront.' },
      { id: 'c', text: 'Use an S3 VPC endpoint policy to restrict access to requests originating from the CloudFront IP range', correct: false, explanation: 'CloudFront uses distributed edge IPs that change frequently and are not suitable for IP-based bucket policy restrictions. OAC uses IAM-based authentication, not IP restriction.' },
      { id: 'd', text: 'Configure CloudFront to forward a secret header and validate it in an S3 bucket policy', correct: false, explanation: 'S3 bucket policies cannot evaluate HTTP headers. This approach does not work with S3. OAC is the correct mechanism for restricting S3 access to CloudFront using IAM signing.' }
    ],
    explanation: {
      overall: 'OAC (Origin Access Control) replaces legacy OAI and uses SigV4 signing for S3 requests. The S3 bucket policy must: (1) Allow cloudfront.amazonaws.com service principal with a condition matching the specific distribution ARN, (2) Have no other statements granting public access. If using S3 website endpoints (for redirect support), OAC is not supported — use REST API endpoints instead. Always enable S3 Block Public Access alongside OAC.',
      examTip: 'OAC vs OAI: OAC supports SigV4 (stronger), SSE-KMS encrypted buckets, all S3 regions. OAI is legacy, weaker, does not support KMS-encrypted S3. Migration: switch distribution to OAC → update bucket policy → remove OAI. S3 REST endpoint vs Website endpoint: OAC only works with REST endpoint (bucket-name.s3.amazonaws.com), not website endpoints (bucket-name.s3-website-region.amazonaws.com).'
    },
    tags: ['cloudfront', 'oac', 's3', 'bucket-policy', 'origin-access-control']
  },
  {
    id: 'dns-009',
    stem: 'A global news website uses CloudFront and needs to implement geo-restriction to comply with content licensing agreements. Specific premium video content must only be accessible from licensed territories (US, CA, UK, AU), while all other CloudFront content remains globally accessible. How should this be implemented?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'dns-cdn',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Use CloudFront geo-restriction on a separate distribution for premium content, allowing only US, CA, UK, AU; use a different distribution for unrestricted content', correct: false, explanation: 'CloudFront geo-restriction applies to the entire distribution, not individual behaviors or paths. A separate distribution would work but requires separate domains.' },
      { id: 'b', text: 'Use Lambda@Edge at viewer-request to check the CloudFront-Viewer-Country header and return 403 for non-licensed territories on the premium path', correct: true, explanation: 'CloudFront automatically adds CloudFront-Viewer-Country header. Lambda@Edge can inspect this header for specific paths (/premium/*) and return 403 for non-licensed countries, while allowing all other paths to pass through.' },
      { id: 'c', text: 'Configure Route 53 geolocation routing to direct non-licensed countries to a 403 error page', correct: false, explanation: 'Route 53 geolocation operates at the DNS level and blocks all traffic, not specific content paths. This would prevent non-licensed users from accessing any content, not just premium content.' },
      { id: 'd', text: 'Enable CloudFront geo-restriction with allowlist for US, CA, UK, AU on the main distribution', correct: false, explanation: 'Distribution-level geo-restriction blocks ALL content from restricted countries, not just premium content. This violates the requirement for globally accessible non-premium content.' }
    ],
    explanation: {
      overall: 'CloudFront distribution-level geo-restriction is all-or-nothing — it applies to all content in the distribution. For path-specific geo-restriction, Lambda@Edge at viewer-request inspects the CloudFront-Viewer-Country header (automatically set by CloudFront) and can return a 403 response for specific paths from unauthorized countries while allowing other paths through. CloudFront Functions can also do this for simple country checks.',
      examTip: 'Distribution geo-restriction = applies to ALL content (simple but inflexible). Path-specific geo-restriction = Lambda@Edge or CloudFront Functions checking CloudFront-Viewer-Country header. CloudFront-Viewer-Country is a two-letter ISO 3166-1 alpha-2 code. Remember to include the CloudFront-Viewer-Country header in the cache key (via cache policy) or origin request policy so Lambda@Edge can access it.'
    },
    tags: ['cloudfront', 'geo-restriction', 'lambda-edge', 'content-licensing', 'viewer-country']
  },
  {
    id: 'dns-010',
    stem: 'A company wants to use CloudFront in front of an ALB. The ALB serves dynamic content that should never be cached. However, they want CloudFront for DDoS protection, WAF, and global anycast IP benefits. How should they configure CloudFront to ensure all requests reach the origin?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'dns-cdn',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Set the CloudFront cache behavior TTL minimum, default, and maximum all to 0, and configure the cache policy to forward all headers including Authorization', correct: true, explanation: 'Setting all TTL values to 0 and forwarding the Authorization header prevents CloudFront from caching responses. Requests always reach the origin while still benefiting from CloudFront\'s network and WAF capabilities.' },
      { id: 'b', text: 'Disable CloudFront caching by selecting the "CachingDisabled" managed cache policy', correct: true, explanation: 'The AWS-managed "CachingDisabled" cache policy sets TTL to 0 and forwards all headers/cookies/query strings, effectively disabling caching. This is the recommended way to use CloudFront as a pure proxy.' },
      { id: 'c', text: 'Set CloudFront behavior to use "No cache" Cache-Control headers from the origin', correct: false, explanation: 'Cache-Control headers from the origin influence CloudFront caching but are not sufficient alone. CloudFront has its own TTL settings that can override origin Cache-Control if the minimum TTL is > 0.' },
      { id: 'd', text: 'Configure CloudFront with an origin group pointing to the ALB with automatic failover', correct: false, explanation: 'Origin groups provide HA failover, not cache-bypass functionality. This does not address the requirement to ensure all requests reach the origin without caching.' }
    ],
    explanation: {
      overall: 'CloudFront can act as a pure pass-through proxy while still providing WAF, Shield Advanced DDoS protection, anycast routing, and SSL termination. The AWS managed "CachingDisabled" cache policy (ID: 4135ea2d-6df8-44a3-9df3-4b5a84be39ad) sets all TTLs to 0 and forwards all headers, cookies, and query strings. This is the cleanest approach for dynamic content that should never be cached.',
      examTip: 'CloudFront as security layer (not CDN): Use CachingDisabled managed policy + WAF + Shield Advanced. Benefits even without caching: DDoS protection at edge, WAF rules, anycast routing (users connect to nearest edge, edge connects to origin over AWS backbone), SSL offload. The ALB does not need a public SSL cert if using CloudFront for SSL termination (can use HTTP between CF and ALB in private network).'
    },
    tags: ['cloudfront', 'caching-disabled', 'ddos-protection', 'waf', 'dynamic-content']
  },
  {
    id: 'dns-011',
    stem: 'A company\'s CloudFront distribution uses an S3 origin with OAC and SSE-KMS encryption. Users report intermittent 403 errors when accessing certain objects. The S3 bucket policy allows the CloudFront service principal, and the objects are accessible directly when testing with admin credentials. What is the most likely cause?',
    type: 'single',
    difficulty: 3,
    topicSlug: 'dns-cdn',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'The CloudFront OAC IAM role does not have kms:Decrypt permission on the KMS key used for SSE-KMS', correct: true, explanation: 'When S3 objects are encrypted with SSE-KMS, CloudFront OAC must have kms:Decrypt permission on the KMS key. Without it, S3 returns 403 when CloudFront tries to read KMS-encrypted objects, even if the bucket policy is correct.' },
      { id: 'b', text: 'The S3 bucket is in a different region than the CloudFront distribution origin', correct: false, explanation: 'CloudFront can serve S3 content from any region. While cross-region replication may affect availability, it does not cause 403 errors. OAC supports all S3 regions.' },
      { id: 'c', text: 'The OAC signing protocol does not match the S3 bucket\'s expected authentication method', correct: false, explanation: 'OAC uses SigV4 signing which is compatible with all S3 REST APIs. A signing protocol mismatch would cause consistent errors, not intermittent ones.' },
      { id: 'd', text: 'CloudFront is using a cached 403 response from a previous failed request', correct: false, explanation: 'CloudFront does not cache 4xx error responses by default unless configured with custom error pages and a non-zero TTL. Intermittent 403s suggest an authentication/authorization issue, not a caching issue.' }
    ],
    explanation: {
      overall: 'SSE-KMS encryption requires that the entity reading the object have both S3 GetObject permission AND KMS Decrypt permission on the key. When CloudFront OAC makes requests to S3, it uses the cloudfront.amazonaws.com service principal. The KMS key policy must explicitly allow this principal to use kms:Decrypt and kms:GenerateDataKey. This is a common misconfiguration when migrating from OAI to OAC with SSE-KMS.',
      examTip: 'OAC + SSE-KMS checklist: (1) S3 bucket policy allows cloudfront.amazonaws.com with distribution ARN condition. (2) KMS key policy allows cloudfront.amazonaws.com for kms:Decrypt and kms:GenerateDataKey. (3) S3 Block Public Access enabled. (4) OAC configured in CloudFront distribution settings. "Intermittent" 403s often mean some objects use different encryption keys or some requests go to edge locations with cached permissions.'
    },
    tags: ['cloudfront', 'oac', 'sse-kms', 'kms-permissions', '403-errors']
  },
  {
    id: 'dns-012',
    stem: 'A company uses Route 53 health checks to monitor their primary web application. They want health checks to test the actual application logic (not just TCP connectivity) by sending HTTP requests to /health endpoint and failing over only when the application returns a non-200 status code or times out. The application runs on EC2 instances behind an internal NLB. How should they configure health checks?',
    type: 'single',
    difficulty: 3,
    topicSlug: 'dns-cdn',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Create Route 53 HTTP health checks targeting the NLB public DNS name, checking /health path and expecting 200 status code', correct: false, explanation: 'Route 53 health checkers originate from public IP ranges. An internal NLB is not accessible from the internet, so Route 53 cannot directly health-check it.' },
      { id: 'b', text: 'Use a calculated health check that aggregates CloudWatch metrics from the NLB target group healthy host count', correct: true, explanation: 'For resources not directly accessible from the internet, Route 53 calculated health checks can use CloudWatch alarms. Monitor NLB HealthyHostCount CloudWatch metric, create an alarm when it drops to 0, then create a Route 53 health check based on the CloudWatch alarm state.' },
      { id: 'c', text: 'Deploy an internet-facing ALB in front of the internal NLB and health-check the ALB', correct: false, explanation: 'Adding an ALB just for health checking is architecturally unnecessary and adds cost. Using CloudWatch alarm-based health checks is the recommended approach for internal resources.' },
      { id: 'd', text: 'Use Route 53 Resolver health checks with the internal NLB endpoint', correct: false, explanation: 'There is no "Route 53 Resolver health check" feature. Route 53 Resolver is for hybrid DNS resolution, not health monitoring.' }
    ],
    explanation: {
      overall: 'Route 53 health checkers are public — they originate from Route 53\'s global health checker IPs and can only reach internet-accessible endpoints. For private resources (internal ELBs, private EC2, on-premises), use CloudWatch alarm-based health checks. The flow: (1) EC2/NLB metrics → CloudWatch → create alarm on unhealthy condition, (2) Create Route 53 health check based on CloudWatch alarm state, (3) Associate health check with DNS record for failover.',
      examTip: 'Route 53 health check types: (1) HTTP/HTTPS/TCP endpoint checks — must be internet-accessible. (2) Calculated health checks — combine multiple health check results. (3) CloudWatch alarm checks — for private resources, use CloudWatch metrics → alarm → health check. Route 53 health check IPs are published by AWS — security groups must allow these IPs if health-checking internet-facing resources directly.'
    },
    tags: ['route53', 'health-checks', 'cloudwatch-alarms', 'internal-resources', 'failover']
  },
  {
    id: 'dns-013',
    stem: 'An e-commerce company uses Route 53 with geolocation routing to direct European users to eu-west-1 and US users to us-east-1. During a regional incident in eu-west-1, European users should automatically fail over to us-east-1. Currently, if the eu-west-1 endpoint fails, European users cannot reach the site. What change fixes this?',
    type: 'single',
    difficulty: 3,
    topicSlug: 'dns-cdn',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Add health checks to the geolocation records and configure a default (global) geolocation record pointing to us-east-1 as a fallback', correct: true, explanation: 'When a geolocation record with a health check fails, Route 53 falls through to less-specific geolocation records (continent → default). A "default" geolocation record serves as a catch-all fallback, directing failed European traffic to us-east-1.' },
      { id: 'b', text: 'Add a latency routing record alongside the geolocation records to provide automatic failover', correct: false, explanation: 'You cannot mix routing policies for the same record name. A record is either geolocation, latency, weighted, etc. — not a combination. Route 53 does not support mixing routing types for the same name.' },
      { id: 'c', text: 'Use Route 53 Failover routing with a primary record for EU and secondary for US', correct: false, explanation: 'Failover routing is binary (primary/secondary) and does not support geolocation-based routing. Switching to failover routing would lose the geolocation optimization for US users.' },
      { id: 'd', text: 'Configure CloudFront in front of both regions with origin failover between eu-west-1 and us-east-1', correct: false, explanation: 'CloudFront origin failover provides HA at the CDN layer but does not fix the Route 53 geolocation routing gap. The DNS records still need health check-based fallback logic.' }
    ],
    explanation: {
      overall: 'Route 53 geolocation routing with health checks enables automatic fallback: if the most-specific matching record is unhealthy, Route 53 checks the next most-specific record (country → continent → default). By adding a "default" geolocation record pointing to us-east-1 with no health check, European traffic failing eu-west-1 falls through to the default. The fallback order: country record → continent record → default record.',
      examTip: 'Geolocation failover hierarchy: Country (most specific) → Continent → Default (least specific). Always create a default geolocation record as a catch-all for unmatched locations AND as a failover target. Without health checks, failed endpoints are not automatically bypassed. Geolocation routing does not inherently provide HA — you must explicitly add health checks and a default record for graceful degradation.'
    },
    tags: ['route53', 'geolocation-routing', 'health-checks', 'failover', 'default-record']
  },
  {
    id: 'dns-014',
    stem: 'A company is deploying a new microservices architecture on ECS. Service A needs to call Service B using a stable DNS name. Service B scales up and down frequently, and its task IPs change with each deployment. They want service discovery without managing external DNS or adding a load balancer for internal communication. What is the recommended approach?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'dns-cdn',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Use AWS Cloud Map with ECS service discovery to automatically register task IPs as DNS A records', correct: true, explanation: 'ECS integrates natively with Cloud Map for service discovery. When tasks start, they automatically register in Cloud Map private namespace with DNS A records. Tasks de-register when they stop. Service A can call Service B via serviceb.namespace.local DNS name.' },
      { id: 'b', text: 'Use an internal ALB for Service B and hardcode the ALB DNS name in Service A\'s configuration', correct: false, explanation: 'While an internal ALB provides stable DNS, it adds cost and latency. Cloud Map native ECS integration provides service discovery without extra infrastructure. ALBs are better for external-facing or load-distributed traffic.' },
      { id: 'c', text: 'Use Route 53 private hosted zones with Lambda-based registration/deregistration triggered by ECS task state change events', correct: false, explanation: 'This is a manual implementation of what Cloud Map provides natively. Building custom Lambda-based registration is unnecessary complexity when Cloud Map integrates directly with ECS.' },
      { id: 'd', text: 'Configure VPC DNS with elastic IPs assigned to each ECS Fargate task for stable addressing', correct: false, explanation: 'Fargate tasks cannot have Elastic IPs assigned. Fargate tasks have dynamic IPs that change with each deployment. Elastic IPs are for EC2 instances.' }
    ],
    explanation: {
      overall: 'AWS Cloud Map provides service discovery for microservices. ECS integrates natively: you configure service discovery on the ECS service, specify a Cloud Map namespace, and ECS automatically registers/deregisters task IPs in Cloud Map as tasks start/stop. Service A resolves serviceb.svc.cluster.local (or custom namespace) via private DNS backed by Cloud Map. For health-check aware routing, Cloud Map also supports custom health check attributes.',
      examTip: 'Cloud Map vs Route 53 for service discovery: Cloud Map is the managed service discovery solution — integrates with ECS, EC2, Lambda, K8s. It maintains both DNS records AND API-queryable service registry. Route 53 is the underlying DNS infrastructure. ECS Service Connect (newer) builds on Cloud Map and adds metrics, circuit breaking, and retries. For simple service discovery, Cloud Map; for advanced service mesh features, App Mesh or ECS Service Connect.'
    },
    tags: ['cloud-map', 'ecs', 'service-discovery', 'dns', 'microservices']
  },
  {
    id: 'dns-015',
    stem: 'A company\'s CloudFront distribution serves a React single-page application from S3. Users report that after deploying new versions, they sometimes see stale content for up to 24 hours. The distribution uses a 1-day default TTL. The company wants to ensure users immediately see new deployments without removing caching benefits for unchanged assets. What is the best strategy?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'dns-cdn',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Implement cache busting by including content hash in filenames (e.g., main.a3f2b1.js), keep long TTLs for hashed assets, and set TTL=0 for index.html only', correct: true, explanation: 'Content-hashed filenames change when content changes, so CloudFront treats them as new objects (no cache conflict). index.html is short-TTL or no-cached so it always returns the latest HTML with updated asset references. This is the standard SPA cache strategy.' },
      { id: 'b', text: 'Create a CloudFront invalidation for /* after every deployment', correct: false, explanation: 'Invalidations work but are inefficient — they invalidate all cached content including unchanged assets, wasting cache capacity. Each invalidation path beyond 1000/month incurs cost. Cache busting via filename hashing is more efficient.' },
      { id: 'c', text: 'Set CloudFront default TTL to 0 to disable caching for all objects', correct: false, explanation: 'Disabling all caching eliminates the CDN performance benefits. Unchanged static assets (images, fonts, vendor libraries) benefit greatly from long-term caching and should not be invalidated unnecessarily.' },
      { id: 'd', text: 'Use CloudFront versioning with distribution versioning enabled to maintain separate cached copies per deployment', correct: false, explanation: 'There is no "CloudFront distribution versioning" feature for this purpose. Distribution versioning refers to saving configuration versions, not content versioning.' }
    ],
    explanation: {
      overall: 'The optimal SPA caching strategy: (1) Content-hash filenames for JS/CSS/images (e.g., app.abc123.js) — set max-age=31536000 (1 year), CDN and browser cache forever since filename changes on content update. (2) index.html — set Cache-Control: no-cache or very short TTL (60s) so users always get the latest HTML that references current hashed assets. Vite/webpack/Create React App all support content hashing natively. This approach maximizes caching while ensuring immediate updates.',
      examTip: 'Two types of CloudFront cache control: (1) Cache invalidation — push invalidations from deployment pipeline for files that cannot be renamed (like index.html). (2) Cache busting via versioned URLs — content hash in filename, set long TTLs, new content = new URL. Best practice: combine both — long TTL + hash for assets, short TTL + invalidation on deploy for index.html. First 1000 invalidation paths per month are free.'
    },
    tags: ['cloudfront', 'cache-busting', 'spa', 'cache-strategy', 'content-hash']
  },
  {
    id: 'dns-016',
    stem: 'A financial services company processes sensitive cardholder data through a CloudFront distribution. Certain query string parameters in form submissions contain credit card numbers. While TLS protects data in transit to CloudFront, the company is concerned that CloudFront edge logs and origin-bound requests could expose raw card numbers in plaintext. Which CloudFront feature allows encryption of specific sensitive fields at the edge before forwarding to the origin?',
    type: 'single', difficulty: 3, topicSlug: 'dns-cdn', examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'CloudFront HTTPS-only viewer policy to ensure end-to-end encryption', correct: false, explanation: 'HTTPS-only ensures transport security but data is decrypted at CloudFront edge PoPs and re-encrypted to origin. CloudFront infrastructure and logs can still access plaintext field values.' },
      { id: 'b', text: 'CloudFront Field-Level Encryption using asymmetric public key encryption on specified POST fields', correct: true, explanation: 'Field-Level Encryption (FLE) encrypts specific POST body fields at the CloudFront edge using a customer-provided RSA public key (up to 2048-bit). Only the application component holding the private key can decrypt the field. CloudFront access logs, WAF, and intermediate services never see the plaintext value. This satisfies PCI DSS requirements for cardholder data protection.' },
      { id: 'c', text: 'AWS WAF with a rule that redacts sensitive fields from request logs', correct: false, explanation: 'WAF log redaction removes field values from WAF logs but the actual request with plaintext values still flows through CloudFront to the origin. WAF cannot encrypt fields end-to-end.' },
      { id: 'd', text: 'Signed URLs with short expiration to limit exposure time of sensitive requests', correct: false, explanation: 'Signed URLs restrict access to specific content by time and IP, but have no bearing on encrypting POST body fields containing sensitive data. They address authorization, not field-level encryption.' },
    ],
    explanation: { overall: 'CloudFront Field-Level Encryption (FLE): Configured on a CloudFront distribution, FLE specifies which POST fields to encrypt and which RSA public key to use. At the edge: CloudFront encrypts the specified fields using the public key. The encrypted value replaces the plaintext in the request forwarded to origin. Only the application with the matching private key can decrypt. Use cases: credit card numbers, SSNs, passwords, HIPAA PHI. Configuration: create a public key → create an encryption profile (maps fields to key) → associate encryption profile with cache behavior.', examTip: 'Field-Level Encryption protects specific POST fields end-to-end from CloudFront edge to application. Max 10 fields per request, max 16 KB encrypted data. Requires RSA-2048 key pair — public key in CloudFront, private key in application. Different from HTTPS (transport security) — FLE provides data-at-rest encryption within the AWS network and logs. PCI DSS exam question with CloudFront → think FLE for cardholder data.' },
    tags: ['cloudfront', 'field-level-encryption', 'pci-dss', 'data-protection', 'rsa'],
  },
  {
    id: 'dns-017',
    stem: 'A company has a hybrid architecture with workloads in a VPC and on-premises. DNS resolution for on-premises hostnames fails from EC2 instances because the corporate DNS servers are on-premises. Route 53 private hosted zones work for cloud resources but queries for on-premises FQDNs like db.corp.internal never resolve. Direct Connect is already in place. What is the AWS-managed solution to enable bidirectional DNS resolution between VPC and on-premises?',
    type: 'single', difficulty: 2, topicSlug: 'dns-cdn', examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Deploy custom BIND DNS servers on EC2 as forwarders between VPC and on-premises DNS', correct: false, explanation: 'EC2-based BIND forwarders can work but require operational management (patching, HA, scaling). They are a legacy pattern that AWS replaced with the managed Route 53 Resolver Endpoints solution.' },
      { id: 'b', text: 'Route 53 Resolver Inbound Endpoints to accept DNS queries from on-premises, and Outbound Endpoints with forwarding rules to send VPC queries for corporate domains to on-premises DNS servers', correct: true, explanation: 'Route 53 Resolver Inbound Endpoints create ENIs in the VPC with fixed IP addresses — on-premises DNS servers forward *.amazonaws.com queries to these IPs to resolve AWS resources. Outbound Endpoints with forwarding rules send queries for on-premises domains (e.g., *.corp.internal) to on-premises DNS servers. This is the fully managed, HA solution for hybrid DNS.' },
      { id: 'c', text: 'Extend the Route 53 private hosted zone to the on-premises network by associating it with the Direct Connect virtual interface', correct: false, explanation: 'Route 53 private hosted zones are VPC-scoped constructs. They cannot be directly associated with Direct Connect connections or on-premises networks. On-premises resolvers have no native mechanism to query Route 53 private zones.' },
      { id: 'd', text: 'Create a public hosted zone in Route 53 for corp.internal and migrate all on-premises DNS records to AWS', correct: false, explanation: 'Using a public hosted zone for internal corporate hostnames exposes internal DNS records publicly and violates security requirements. The correct solution keeps internal DNS private using Resolver Endpoints over Direct Connect.' },
    ],
    explanation: { overall: 'Route 53 Resolver hybrid DNS architecture: Inbound Endpoints — ENIs in VPC subnets, each with a static IP; on-premises DNS servers forward queries for *.aws-private-domain.com to these IPs; Route 53 Resolver answers from private hosted zones. Outbound Endpoints — ENIs in VPC; Route 53 Resolver uses forwarding rules to send queries for *.corp.internal to on-premises DNS IP addresses (reachable via Direct Connect or VPN). Traffic flows over Direct Connect/VPN, so no public internet exposure.', examTip: 'Resolver Inbound = on-premises → AWS direction (on-premises asks Route 53 to resolve AWS private zones). Resolver Outbound = AWS → on-premises direction (EC2 instances ask Route 53, which forwards to on-premises DNS for corporate domains). Both use ENIs in VPC subnets. DNS Firewall (separate feature) adds domain filtering/blocking on Outbound Resolver for security. Always deploy Resolver Endpoints in at least 2 AZs for high availability.' },
    tags: ['route53-resolver', 'hybrid-dns', 'inbound-endpoint', 'outbound-endpoint', 'direct-connect'],
  },
  {
    id: 'dns-018',
    stem: 'A company runs a multi-region active-passive application. The primary region is us-east-1 and the DR region is eu-west-1. Route 53 health checks monitor the primary ALB endpoint. During a primary region failure, Route 53 should automatically failover DNS to the EU region within 30 seconds of the failure being detected. Currently, failover takes 3–4 minutes. Which Route 53 configuration change would reduce failover time closest to 30 seconds?',
    type: 'single', difficulty: 3, topicSlug: 'dns-cdn', examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Reduce the Route 53 health check interval from 30 seconds to 10 seconds and the failure threshold from 3 to 1', correct: false, explanation: 'Reducing interval to 10s and threshold to 1 means failure detected after 10 seconds. However, DNS TTL still controls how long resolvers cache the old record. If TTL is 300s, clients continue hitting the failed region for up to 5 minutes after failover. This alone does not achieve 30s.' },
      { id: 'b', text: 'Reduce health check interval to 10 seconds, failure threshold to 1, and set DNS record TTL to 60 seconds or lower', correct: false, explanation: 'With 10s health check + TTL 60s, end-to-end failover is ~70 seconds (10s detection + up to 60s cached TTL). This is better but still above 30 seconds.' },
      { id: 'c', text: 'Enable Route 53 fast failover with 10-second health check intervals, failure threshold of 1, and reduce the DNS record TTL to 10–20 seconds', correct: true, explanation: 'Fast failover configuration: health check interval 10s + threshold 1 = failure detected in ~10s. TTL 10-20s means resolvers refresh quickly. End-to-end: ~10s health check detection + ~10-20s DNS propagation = ~20-30s total failover time. This is the minimum achievable with Route 53 health checks.' },
      { id: 'd', text: 'Replace Route 53 failover routing with AWS Global Accelerator, which provides sub-10-second failover using anycast IPs', correct: false, explanation: 'Global Accelerator does achieve faster failover (~30s) using health checks and anycast routing. However, the question asks specifically about optimizing Route 53 configuration, and Global Accelerator is a separate service that replaces Route 53 for endpoint routing (not just a configuration change).' },
    ],
    explanation: { overall: 'Route 53 failover timing components: (1) Health check detection time = interval × failure threshold (minimum: 10s × 1 = 10s with fast health checks). (2) Route 53 propagation after health check failure = ~10-30s for Route 53 to update DNS responses. (3) DNS TTL — how long resolvers/clients cache the old record (set this low for critical failover records). Total failover time = detection + Route 53 propagation + TTL expiry. Minimum achievable with Route 53: ~30-60s with 10s intervals, threshold 1, and low TTLs. For sub-30s: use Global Accelerator (anycast, health-check-based routing without DNS TTL issues).', examTip: 'Route 53 health check types: HTTP/HTTPS (checks endpoint), TCP (checks port), CloudWatch alarm (checks metric state), Calculated (logical AND/OR of child checks), Route 53 Endpoint (checks from Route 53 infrastructure). Fast health check: interval 10s (standard: 30s), threshold configurable. Low TTL penalty: more Route 53 queries = higher DNS query costs. Trade-off: lower TTL = faster failover but higher query costs.' },
    tags: ['route53', 'failover', 'health-checks', 'ttl', 'rto'],
  },
  {
    id: 'dns-019',
    stem: 'A SaaS company serves customers from multiple geographic regions using CloudFront. They want to use Route 53 latency-based routing to direct users to the nearest CloudFront edge, but also want to serve different application versions (v1 for existing customers, v2 for new customers) based on a custom HTTP header sent by the client application. CloudFront currently ignores this header for caching. What changes are needed to implement version-based routing at CloudFront without modifying origin servers?',
    type: 'multiple', difficulty: 3, topicSlug: 'dns-cdn', examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Add the custom header to the CloudFront cache policy as a cache key component so CloudFront serves different cached content per header value', correct: true, explanation: 'Adding the custom header to the cache policy includes it in the CloudFront cache key. Requests with x-app-version: v1 and x-app-version: v2 will be cached and served separately, giving each customer segment their appropriate cached response.' },
      { id: 'b', text: 'Create two CloudFront distributions (one per version) and use Route 53 weighted routing to split traffic between them', correct: false, explanation: 'Weighted routing distributes traffic randomly by percentage — it does not route based on a header value. A v1 customer might be sent to the v2 distribution 50% of the time depending on weight configuration.' },
      { id: 'c', text: 'Use a CloudFront Function or Lambda@Edge (origin request) to inspect the header and route to different origins or modify the origin request path to the correct version', correct: true, explanation: 'A CloudFront Function (at viewer request stage, lightweight) or Lambda@Edge (at origin request stage, more powerful) can inspect the x-app-version header and either: (1) rewrite the origin path to /v1/* or /v2/*, or (2) route to different origin groups. This provides true version-based routing logic at the edge.' },
      { id: 'd', text: 'Enable CloudFront origin shield to consolidate cache for both versions', correct: false, explanation: 'Origin Shield adds a centralized caching layer to reduce origin load but does not provide routing logic based on headers. It is a cache optimization feature, not a request routing feature.' },
    ],
    explanation: { overall: 'CloudFront header-based routing requires two changes: (1) Cache Policy — add the header as a cache key component so CloudFront caches and serves distinct content per header value. Without this, all users get the same cached content regardless of header. (2) Edge logic — use CloudFront Functions (viewer request/response, <1ms, no network calls, free tier) or Lambda@Edge (all four stages, Node.js/Python, higher cost) to implement routing logic. CloudFront Functions are sufficient for simple header inspection and URL rewrites; Lambda@Edge for complex logic requiring external API calls.', examTip: 'CloudFront cache policy components: (1) Cache keys — host, path, headers (allowlisted), query strings (allowlisted), cookies (allowlisted). Add only what varies the response. (2) TTL settings — min/default/max. Origin request policy = what to forward to origin (can include more headers than cache key). These are separate: include in cache key = affects caching; include in origin request = affects what origin receives. CloudFront Functions limits: 10ms max, 2MB memory, no network calls, no file system. Lambda@Edge: 30s max (origin), 5s (viewer), 128MB-10GB memory.' },
    tags: ['cloudfront', 'cache-policy', 'lambda-edge', 'cloudfront-functions', 'header-routing'],
  },
  {
    id: 'dns-020',
    stem: 'A company uses Route 53 Resolver DNS Firewall to block access to malicious domains from their VPC workloads. They want to block all domains in a known malware category while explicitly allowing a specific subdomain of a blocked domain that is used by a legitimate vendor. The allow list rule and block list rule both match a given query. How does Route 53 DNS Firewall determine which rule to apply?',
    type: 'single', difficulty: 3, topicSlug: 'dns-cdn', examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'The most recently created rule takes precedence over older rules', correct: false, explanation: 'DNS Firewall rule evaluation is based on numeric priority, not creation order. Rules are evaluated in priority order from lowest number to highest number.' },
      { id: 'b', text: 'Block rules always take precedence over allow rules regardless of priority order', correct: false, explanation: 'DNS Firewall does not have a default block-wins or allow-wins approach. Priority number determines evaluation order — the first matching rule action (allow, block, or alert) is applied.' },
      { id: 'c', text: 'Rules are evaluated in ascending priority number order; the first matching rule action is applied, so setting the allow rule with a lower priority number than the block rule ensures the allow takes effect', correct: true, explanation: 'Route 53 DNS Firewall evaluates rules in ascending priority order (lower number = higher priority). Set the ALLOW rule for the specific subdomain to priority 100, and the BLOCK rule for the broader domain to priority 200. The allow rule matches first and DNS Firewall returns the query result. The block rule is never evaluated for that subdomain.' },
      { id: 'd', text: 'More specific domain matches (subdomain) always take precedence over less specific matches (parent domain) regardless of rule priority', correct: false, explanation: 'DNS Firewall does not automatically prefer more specific domain patterns. Specificity is not a tiebreaker — only numeric priority determines evaluation order. You must explicitly configure priority to ensure the desired behavior.' },
    ],
    explanation: { overall: 'Route 53 DNS Firewall: attach to VPCs; rules evaluate DNS queries against domain lists (custom lists or AWS managed lists: malware, botnets, cryptomining, etc.). Rule actions: ALLOW (permit query), BLOCK (return NODATA, NXDOMAIN, or custom response), ALERT (log only, no blocking). Rule priority: integer 1–65535, evaluated ascending (1 = first evaluated). First matching rule wins. To allow a subdomain within a blocked domain: ALLOW rule at lower priority number (e.g., 100) with domain list containing the specific subdomain, BLOCK rule at higher priority number (e.g., 200) with the broader domain list.', examTip: 'DNS Firewall vs Network Firewall vs Security Groups: DNS Firewall = domain-based allow/deny for DNS queries from VPC; integrates with Route 53 Resolver. Network Firewall = L3-L7 stateful/stateless packet filtering for all traffic (not DNS-specific). Security Groups = stateful instance-level firewall. For "block DNS queries to malicious domains" → DNS Firewall. Fail-open vs fail-close: if DNS Firewall is unavailable, fail-open (allow all) or fail-close (block all) — configurable per VPC.' },
    tags: ['route53-resolver', 'dns-firewall', 'domain-filtering', 'rule-priority', 'security'],
  },
];
