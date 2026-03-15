import type { Topic } from '../../types/topic';

export const disasterRecoveryTopic: Topic = {
  id: 'disaster-recovery',
  slug: 'disaster-recovery',
  title: 'Disaster Recovery Patterns',
  shortTitle: 'DR',
  icon: 'RefreshCw',
  color: 'rose',
  examDomains: ['new-solutions', 'continuous-improvement'],
  estimatedStudyHours: 5,
  summaryBullets: [
    'RTO: time to recover. RPO: acceptable data loss window. Lower = more expensive architecture',
    '4 patterns in increasing cost/complexity: Backup & Restore → Pilot Light → Warm Standby → Active-Active',
    'Aurora Global DB: <1s RPO, ~1min RTO. DynamoDB Global Tables: <1s RPO, 0 RTO (already active)',
    'Route 53 health checks + failover routing: automatic DNS failover when primary region health check fails',
    'Chaos Engineering (AWS FIS): inject failures to validate DR runbooks before a real disaster',
  ],
  relatedTopics: ['databases', 'networking', 'compute'],
  solutionArchitectures: [
    {
      id: 'dr-arch-active-active',
      title: 'Multi-Region Active-Active with Route 53',
      description: 'Both regions serve traffic simultaneously. Route 53 latency-based routing sends users to nearest region. If a region fails, Route 53 health checks automatically redirect all traffic to the surviving region within seconds.',
      useCase: 'Applications requiring near-zero RTO/RPO and global performance for users in multiple continents. Financial systems, global SaaS platforms, high-traffic consumer apps.',
      components: [
        { name: 'Route 53 Latency Routing', role: 'Routes users to nearest healthy region. Health checks on ALB endpoints — 30s default interval, 3 failure threshold = 90s failover trigger' },
        { name: 'ALB (each region)', role: 'Regional load balancer. Route 53 health check target. If ALB returns 5xx or times out, Route 53 marks region unhealthy and routes away' },
        { name: 'Application Tier (each region)', role: 'Identical application deployed in both regions. Stateless — reads/writes to regional database replica' },
        { name: 'Aurora Global Database', role: 'Primary region: read-write. Secondary region: read-only (forward writes to primary). <1s replication lag. Secondary promoted in ~1 minute if primary fails' },
        { name: 'DynamoDB Global Tables', role: 'Both regions active for reads AND writes. Last-writer-wins conflict resolution. Sub-second replication. Zero-RTO data access during regional failure' },
        { name: 'S3 Cross-Region Replication', role: 'Replicate S3 objects asynchronously to DR region. Replication Time Control (RTC) guarantees 99.99% in 15 minutes' },
      ],
      dataFlow: [
        'Normal: Route 53 latency routing → US users → us-east-1 ALB → app → Aurora primary (read/write)',
        'Normal: Route 53 → EU users → eu-west-1 ALB → app → Aurora secondary (reads) + write forwarded to us-east-1',
        'Failure: us-east-1 ALB health check fails → Route 53 marks unhealthy after 3 failures (90s)',
        'Failover: Route 53 routes ALL traffic to eu-west-1. DBA promotes Aurora eu-west-1 secondary to primary (~1min)',
        'Recovery: eu-west-1 Aurora now accepts writes. DynamoDB Global Tables already serving reads/writes — zero impact',
        'Restore: us-east-1 comes back online → Route 53 resumes latency routing → Aurora replication re-establishes',
      ],
      keyDecisions: [
        'Route 53 health check interval: 10s fast health check + threshold 2 = 20s failover. Standard 30s + threshold 3 = 90s. Balance speed vs false positive risk',
        'Aurora Global Database: reads in secondary region reduce cross-region read latency but writes still go to primary. Not true active-active for writes',
        'DynamoDB Global Tables for session state and hot data: true active-active writes. Aurora Global DB for transactional relational data',
        'Data sovereignty: if EU regulations require EU data to stay in EU, use separate DynamoDB tables per region (not Global Tables which replicates globally)',
      ],
      tradeoffs: [
        { pro: 'Near-zero RTO (~90s DNS failover) + RPO (<1s for Aurora Global DB). Best user experience globally', con: 'Highest cost: two full production environments, Aurora Global DB premium, data transfer costs between regions' },
        { pro: 'Tests DR path constantly — production traffic validates the standby region is functional', con: 'Application must handle eventual consistency from Aurora secondary read replicas and DynamoDB Global Tables' },
      ],
      examAngle: 'Active-Active ≠ zero-RTO unless data layer is also active-active. Aurora Global DB has ~1min RTO (manual promotion required). DynamoDB Global Tables has true zero-RTO. Route 53 health check failover time depends on check interval × failure threshold.',
    },
  ],
  subtopics: [
    {
      id: 'dr-strategies',
      title: 'DR Strategies & Tradeoffs',
      sections: [
        {
          id: 'dr-patterns',
          title: 'The 4 DR Patterns: Choosing the Right One',
          content: '**Recovery Time Objective (RTO)**: Maximum acceptable time for the application to be unavailable after a disaster.\n**Recovery Point Objective (RPO)**: Maximum acceptable amount of data loss measured in time (how old can the most recent backup be).\n\n**Pattern 1 — Backup & Restore (Hours RTO/RPO)**:\nLowest cost, highest RTO/RPO. Back up data to S3/Glacier. In a disaster, restore from backup to a new environment. No pre-deployed resources in DR region. Steps: restore AMIs, launch EC2, restore DB from snapshot, update DNS. Suitable for: non-critical workloads, dev/test environments, data archives.\nCost: Storage only (S3/Glacier). Zero ongoing compute cost.\n\n**Pattern 2 — Pilot Light (30min-1hr RTO, Minutes RPO)**:\nCore data layer kept running in DR region (RDS replica, Aurora Global DB secondary). Application tier is turned off (AMIs ready but not running). In disaster: boot application instances, promote DB replica, update DNS. Suitable for: business-important apps that can tolerate 30-60 minute recovery.\nCost: DR DB instance running, minimal compute (no app servers).\n\n**Pattern 3 — Warm Standby (Minutes RTO, Seconds RPO)**:\nFull scaled-down version of production running in DR region. Minimum viable fleet (1 instance instead of 10). DB is replicated and current. In disaster: scale up DR environment to full capacity, promote DB, update DNS (or Route 53 already routing some traffic). Suitable for: business-critical apps needing fast recovery.\nCost: ~20-40% of production cost (reduced instance count in DR).\n\n**Pattern 4 — Active-Active / Multi-Site (Near-zero RTO/RPO)**:\nFull production in two or more regions, serving live traffic. Route 53 latency routing and health checks. No "recovery" — traffic automatically routes around failure. Suitable for: mission-critical, revenue-generating, globally distributed apps.\nCost: 2× production cost.',
          keyPoints: [
            { text: 'Lower RTO/RPO requires more pre-deployed infrastructure in the DR region = higher ongoing cost', examTip: true },
            { text: 'Pilot Light: data layer always on, compute layer off. Warm Standby: everything on but at reduced scale', examTip: true },
            { text: 'Aurora Global DB fits Pilot Light (secondary region replica, manual promotion) or Active-Active (with read traffic in both)', examTip: true },
            { text: 'RTO clock starts when the disaster is DECLARED, not when it occurs — detection time adds to actual downtime', gotcha: true },
          ],
          bestPractices: [
            { pillar: 'reliability', text: 'Define RTO and RPO based on business impact analysis (cost per hour of downtime × recovery cost) — over-engineering DR is as wasteful as under-engineering it' },
            { pillar: 'operational-excellence', text: 'Run annual or semi-annual DR drills — actually fail over to the DR region, validate functionality, then fail back. DR runbooks that are never tested are not reliable' },
            { pillar: 'reliability', text: 'Use AWS Fault Injection Service (FIS) for continuous chaos engineering — inject AZ failures, API throttles, and network latency to validate resilience before real incidents' },
            { pillar: 'cost-optimization', text: 'For Pilot Light pattern, use AWS Backup with cross-region copy for RDS snapshots — cheaper than running a read replica if RPO of hours is acceptable' },
          ],
          comparisons: [
            {
              headers: ['Pattern', 'RTO', 'RPO', 'DR Cost (vs Prod)', 'Best For'],
              rows: [
                ['Backup & Restore', 'Hours', 'Hours', '<5%', 'Non-critical, data archives'],
                ['Pilot Light', '30-60 min', 'Minutes', '10-20%', 'Important apps, DB-heavy'],
                ['Warm Standby', '5-30 min', 'Seconds', '20-40%', 'Business-critical apps'],
                ['Active-Active', 'Seconds-minutes', 'Near-zero', '~100%', 'Mission-critical, global'],
              ],
            },
          ],
          useCases: [
            {
              scenario: 'A healthcare company runs a patient records system in us-east-1. Compliance requires RTO ≤ 4 hours and RPO ≤ 1 hour. Budget is limited — cannot afford a full secondary environment.',
              wrongChoices: ['Active-Active — overkill for the requirements and doubles the cost', 'Backup & Restore only — cannot guarantee 4-hour RTO for large databases without pre-staged infrastructure'],
              correctChoice: 'Pilot Light: Aurora Global DB secondary in us-west-2 (keeps DB current, RPO <1min), pre-built AMIs and CloudFormation templates for the application tier. On disaster: run CloudFormation to launch app tier, promote Aurora secondary, update Route 53.',
              reasoning: 'Pilot Light keeps the expensive DB layer running (meeting RPO <1hr easily), while the application tier is only launched during actual DR (meeting RTO ≤4hr). This minimizes cost while meeting compliance requirements.',
            },
          ],
        },
        {
          id: 'dr-testing',
          title: 'DR Testing & Chaos Engineering',
          content: '**Why DR drills matter**: An untested DR plan is not a DR plan — it\'s a hope. Every element of the failover procedure must be validated under realistic conditions before a real disaster occurs.\n\n**AWS Fault Injection Service (FIS)**: Managed chaos engineering service. Inject failures into AWS resources using experiment templates:\n- EC2: terminate instances, stop instances, inject CPU stress, inject network latency\n- ECS/EKS: kill tasks/pods, inject container resource pressure\n- RDS/Aurora: failover to replica, simulate replication lag\n- AZ: simulate AZ failure by stopping all instances in a specific AZ\n- Network: block traffic between subnets, inject packet loss\n\n**FIS experiment design**:\n1. Define steady state (system is healthy — define what metrics indicate this)\n2. Hypothesize blast radius (what SHOULD happen when we inject this fault)\n3. Run experiment with a Stop Condition (if production error rate > 5%, stop automatically)\n4. Observe actual behavior vs hypothesis\n5. Fix gaps, then repeat\n\n**DR runbook elements**:\n- Failure detection: CloudWatch alarms, Route 53 health checks, application-level alerts\n- Decision criteria: who declares DR, what threshold triggers invocation\n- Step-by-step recovery procedures with expected completion times\n- Communication plan: who notifies whom, customer communication templates\n- Rollback procedures: how to fail back to primary region after recovery\n\n**GameDays**: Scheduled events where the team practices DR scenarios. Start with announced game days, progress to unannounced "fire drills" for realistic preparation.',
          keyPoints: [
            { text: 'FIS Stop Conditions: automatically halt experiment if real metrics exceed safety thresholds — prevents chaos engineering from causing actual production outages', examTip: true },
            { text: 'Test failover, validate functionality, THEN test failback — the return to primary region is often the most error-prone step', examTip: true },
            { text: 'DR drill should test the ENTIRE runbook including detection, decision, execution, validation, and communication — not just the technical steps', examTip: true },
          ],
        },
      ],
    },
    {
      id: 'dr-services',
      title: 'AWS DR Services & Tools',
      sections: [
        {
          id: 'dr-elastic-disaster-recovery',
          title: 'AWS Elastic Disaster Recovery (DRS)',
          content: '**AWS Elastic Disaster Recovery (DRS)**: Continuous block-level replication of on-premises or cloud servers to AWS. Minimizes downtime and data loss. Replaces CloudEndure Disaster Recovery.\n\n**How it works**:\n- Install DRS agent on source servers (physical, VMware, AWS EC2)\n- Agent continuously replicates block-level changes to a staging area in the target AWS region\n- No network traffic interruption — thin agents use minimal bandwidth\n- Recovery: launch recovery instances in minutes from the latest replicated state\n- Point-in-time recovery: recover from any point in the last 14-day history\n\n**Key metrics**: RPO of seconds (continuous replication), RTO of minutes (pre-configured launch templates, automated recovery steps).\n\n**AWS Backup**: Centralized backup service across: EC2, EBS, RDS, DynamoDB, EFS, FSx, DocumentDB, Neptune, S3. Backup plans (policies): define backup frequency, retention, cross-region copy, cross-account copy. Vault Lock: immutable backup storage (WORM) to protect against ransomware.\n\n**AWS Resilience Hub**: Assesses application architecture against RTO/RPO targets. Analyzes CloudFormation stacks, ECS, EKS, Route 53, DynamoDB, RDS. Generates resilience score and actionable recommendations. Validates that recovery procedures will meet defined targets before a disaster.',
          keyPoints: [
            { text: 'AWS DRS: seconds RPO via continuous block-level replication. Minutes RTO via pre-staged recovery infrastructure. Replaces manual snapshot-based DR', examTip: true },
            { text: 'AWS Backup Vault Lock: immutable backups protected from deletion even by administrators — critical for ransomware recovery', examTip: true },
            { text: 'AWS Resilience Hub: validates architecture against RTO/RPO targets before a disaster. Identifies gaps in the DR architecture', examTip: true },
          ],
          bestPractices: [
            { pillar: 'reliability', text: 'Use AWS Backup with cross-region copy rules for all stateful resources — centralizes backup management and ensures DR copies exist in the recovery region' },
            { pillar: 'security', text: 'Enable Backup Vault Lock on production vaults — prevents backup deletion during ransomware events or compromised administrator credentials' },
            { pillar: 'operational-excellence', text: 'Run AWS Resilience Hub assessments quarterly or after major infrastructure changes — validates that RTO/RPO targets remain achievable as architecture evolves' },
          ],
        },
      ],
    },
  ],
};
