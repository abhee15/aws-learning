import type { Topic } from '../../types/topic';

export const migrationTopic: Topic = {
  id: 'migration',
  slug: 'migration',
  title: 'Migration Strategies & Tools',
  shortTitle: 'Migration',
  icon: 'Truck',
  color: 'amber',
  examDomains: ['migration-modernization', 'new-solutions'],
  estimatedStudyHours: 5,
  summaryBullets: [
    '7 Rs migration strategies: Retire, Retain, Rehost, Replatform, Repurchase, Refactor, Relocate',
    'AWS Application Migration Service (MGN): lift-and-shift with continuous block-level replication',
    'AWS DataSync: scheduled data transfer to/from S3, EFS, FSx — managed, encrypted, bandwidth-throttled',
    'Snowball Edge: 80TB device for bulk data migration. Snowmobile: exabyte-scale (container truck)',
    'Migration Evaluator + MAP (Migration Acceleration Program): assessment and funding for large migrations',
  ],
  relatedTopics: ['databases', 'networking', 'compute'],
  subtopics: [
    {
      id: 'migration-strategies',
      title: 'Migration Strategies (7 Rs)',
      sections: [
        {
          id: 'migration-7rs',
          title: 'The 7 Rs Framework',
          content: '**Migration Strategies (7 Rs)**: Framework for categorizing application migration approaches by complexity and benefit.\n\n**Retire**: Decommission applications that are no longer needed. Discovered during migration assessment — often 10-20% of portfolio. Reduces migration scope and ongoing costs.\n\n**Retain (Revisit)**: Keep applications on-premises for now. Reasons: recently upgraded, compliance restrictions, application too complex to migrate immediately, not a good cloud candidate. Revisit in 12-18 months.\n\n**Rehost (Lift-and-Shift)**: Migrate servers as-is to EC2 without code changes. Fastest migration path. Use AWS Application Migration Service (MGN). Immediate infrastructure savings. Easiest to automate. Optimization comes after migration.\n\n**Replatform (Lift-and-Tinker)**: Minor cloud optimizations without changing core architecture. Examples: move to RDS instead of self-managed MySQL on EC2, move to Elastic Beanstalk instead of manual EC2 configuration, move to Aurora Serverless for variable workload. Limited refactoring, significant managed service benefits.\n\n**Repurchase (Drop-and-Shop)**: Move from custom/on-premises application to SaaS. Examples: CRM → Salesforce, email → Office 365, HR → Workday. No migration of application code — data migration only. Highest immediate cost (SaaS licensing) but eliminates maintenance burden.\n\n**Refactor / Re-architect**: Redesign application for cloud-native. Examples: monolith → microservices on EKS, on-premises Oracle → Aurora, scheduled batch → Lambda event-driven. Highest effort and risk. Best long-term agility and scalability.\n\n**Relocate**: Move on-premises VMware infrastructure to VMware Cloud on AWS. No application changes — same VMware stack. Low risk, fast migration for large VMware estates.',
          keyPoints: [
            { text: 'Rehost (lift-and-shift): fastest path to cloud. AWS MGN handles block-level replication. Optimize after migration', examTip: true },
            { text: 'Replatform: "lift-and-tinker" — move to managed service (RDS, Fargate) without code changes. Best cost/benefit ratio for many workloads', examTip: true },
            { text: 'Relocate: VMware Cloud on AWS — move on-premises VMware VMs directly without OS/app changes', examTip: true },
            { text: 'Retire: always look for applications to shut down — reduces migration scope and ongoing cloud costs', examTip: true },
          ],
          bestPractices: [
            { pillar: 'operational-excellence', text: 'Start with discovery (Migration Evaluator, AWS Application Discovery Service) to build accurate inventory before choosing migration strategy per application' },
            { pillar: 'cost-optimization', text: 'Use Rehost for the first migration wave to achieve quick cloud footprint; then optimize in-cloud with Replatform (move to managed services) in wave 2' },
            { pillar: 'operational-excellence', text: 'Apply Refactor only to applications with clear business need for cloud-native capabilities — the highest effort strategy should have the highest ROI justification' },
          ],
          useCases: [
            {
              scenario: 'A company is assessing 400 on-premises applications for cloud migration. They need to categorize each application and estimate migration effort. Application owners report that 15% of applications are rarely used internal tools that could be shut down.',
              wrongChoices: ['Rehost all 400 applications to EC2 first, then optimize in the cloud', 'Refactor all applications to cloud-native microservices for maximum long-term benefit'],
              correctChoice: 'Start with the 7 Rs assessment: Retire the unused 15% (immediate cost savings), Retain recently-upgraded apps, Rehost the bulk for speed, then selectively Replatform and Refactor high-value applications in later waves',
              reasoning: 'The 7 Rs framework applies the right strategy per application. Retiring 60 unused apps eliminates migration cost and reduces cloud spend. Rehosting the remaining majority with MGN maximizes migration velocity. Refactoring only the highest-value apps avoids wasting engineering effort on low-ROI rewrites.',
            },
            {
              scenario: 'A company wants to move their MySQL database from on-premises to Amazon Aurora MySQL with minimal downtime. The database is 2 TB and receives continuous writes 24/7. A weekend maintenance window of 4 hours is available for the final cutover.',
              wrongChoices: ['Take a mysqldump backup, restore to Aurora, update DNS — but downtime equals the dump + restore time (~6-10 hours)', 'Use AWS Snowball to transfer the initial data — Snowball does not support live database replication'],
              correctChoice: 'Use AWS DMS with CDC (Change Data Capture): initial full load from MySQL to Aurora, then continuously replicate binlog changes. During the 4-hour window: pause writes, let CDC catch up, then cut over DNS',
              reasoning: 'DMS CDC maintains near-real-time replication after the initial load. Production runs unchanged until the cutover window. During cutover: stop the application, wait for DMS lag to reach 0 (seconds), update connection string, restart. Downtime = minutes, not hours.',
            },
          ],
          comparisons: [
            {
              headers: ['Strategy', 'Code Changes', 'Migration Speed', 'Cloud Benefit', 'Risk'],
              rows: [
                ['Retire', 'N/A', 'Immediate', 'Cost reduction', 'Low'],
                ['Retain', 'None', 'N/A', 'Minimal', 'Low'],
                ['Rehost', 'None', 'Fast', 'Infrastructure savings', 'Low'],
                ['Replatform', 'Minimal', 'Medium', 'Managed service benefits', 'Medium'],
                ['Repurchase', 'None (data migration)', 'Medium', 'No maintenance burden', 'Medium'],
                ['Refactor', 'Significant', 'Slow', 'Maximum agility/scale', 'High'],
                ['Relocate', 'None (VMware)', 'Fast', 'Same VMware, cloud economics', 'Low'],
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'migration-tools',
      title: 'Migration Services & Tools',
      sections: [
        {
          id: 'migration-mgn',
          title: 'AWS Application Migration Service (MGN)',
          content: '**AWS MGN (Application Migration Service)**: Primary service for lift-and-shift server migrations (replaces CloudEndure Migration). Continuous block-level replication from source (physical, VMware, cloud) to AWS.\n\n**How MGN works**:\n1. Install MGN agent on source servers\n2. Agent performs initial sync of all disk data to staging area in target AWS region\n3. Continuous replication: block-level changes replicated continuously (sub-second RPO)\n4. Testing: launch test instances from replicated data — validate without interrupting source\n5. Cutover: stop source, launch production instance from latest replicated data, update DNS\n6. Decommission: once validated in AWS, decommission source servers\n\n**MGN key benefits**: Minimal downtime cutover (hours of sync catchup, minutes of actual downtime). Continuous replication means data is always current. Automated conversion between on-premises OS/hypervisor format and AWS EC2 AMI format.\n\n**AWS Server Migration Service (SMS)**: Older, VMware-only replication service. Being replaced by MGN. For VMware, also consider HyperV snapshot-based replication with SMS.\n\n**AWS Application Discovery Service**: Collects server specs, performance data, and network dependencies for migration planning. Two modes:\n- Agentless Discovery: VMware vCenter integration, collects CPU/memory/disk/network\n- Agent-based Discovery: Install on each server, captures detailed OS configuration, running processes, network connections. Output: Migration Hub inventory and dependency maps.',
          keyPoints: [
            { text: 'AWS MGN: continuous block-level replication, agent-based, supports physical/VMware/cloud sources. Primary lift-and-shift tool', examTip: true },
            { text: 'MGN test cutover: launch test EC2 without affecting source or replication. Validate before actual cutover', examTip: true },
            { text: 'Application Discovery Service: agentless (VMware/vCenter) or agent-based (any server). Feeds Migration Hub for dependency mapping', examTip: true },
          ],
          bestPractices: [
            { pillar: 'operational-excellence', text: 'Run MGN test cutover waves before actual migration windows — validate that applications function correctly in AWS before committing to production cutover' },
            { pillar: 'reliability', text: 'Use Application Discovery Service to map server dependencies before migration sequencing — migrate dependent components together to avoid broken connections' },
          ],
          useCases: [
            {
              scenario: 'A company is lifting and shifting a 3-tier application (web, app, database) from VMware to AWS. After testing the migrated web and app tiers in AWS, they need to validate that the application works correctly before the production cutover date next Friday.',
              wrongChoices: ['Launch the cutover immediately after replication completes — saves a step', 'Stop the source VMs during testing to ensure the replicated data is current'],
              correctChoice: 'Use MGN\'s Test Cutover feature: launch test instances from current replicated data without stopping the source VMs or interrupting replication. Validate the application stack, then finalize production cutover during the maintenance window',
              reasoning: 'MGN test cutover launches EC2 instances from point-in-time snapshots of the replicated disks. Source servers keep running and replication continues. The test environment lets you validate application function, database connectivity, and performance before committing to production cutover — zero production risk.',
            },
          ],
        },
        {
          id: 'migration-data-transfer',
          title: 'Data Transfer: DataSync, Snowball & Storage Gateway',
          content: '**AWS DataSync**: Managed data transfer service for on-premises NFS/SMB/S3/HDFS to AWS storage (S3, EFS, FSx). Features: bandwidth throttling, scheduling, encryption in-transit, data validation (checksums), incremental transfers. Faster than manual scripts — uses parallel multi-threaded transfer.\n\n**DataSync vs S3 Transfer Acceleration vs Multipart Upload**:\n- DataSync: managed, scheduled, supports NFS/SMB/HDFS sources, for ongoing sync workflows\n- Transfer Acceleration: CloudFront edge ingestion for S3, for direct HTTP uploads from applications\n- Multipart: parallel upload for large individual objects\n\n**AWS Snow Family** (for bulk offline data transfer when network bandwidth is insufficient):\n- **Snowcone**: Small (2 vCPU, 8 GB RAM, 8 TB storage). Ruggedized for field environments. DataSync agent pre-installed.\n- **Snowball Edge Storage Optimized**: 80 TB HDD + 1 TB SSD NVMe. 40 vCPU, 80 GB RAM. Can run EC2 compute locally. Ordered from AWS console, ship device to your site, copy data, return.\n- **Snowball Edge Compute Optimized**: 28 TB HDD + 7.68 TB NVMe SSD. 52 vCPU, 208 GB RAM. GPU option. For edge computing + data collection.\n- **Snowmobile**: 100 PB per truck. AWS sends 45-foot shipping container with 10 Gbps network. For exabyte-scale migrations (entire data centers).\n\n**Snow transfer rule of thumb**: If it would take more than 1 week to transfer data over your available network bandwidth → consider Snowball. 80 TB at 1 Gbps ≈ 7 days; at 100 Mbps ≈ 73 days → use Snowball.\n\n**AWS Storage Gateway**: Bridge between on-premises and AWS storage. Three modes:\n- **S3 File Gateway**: NFS/SMB mount backed by S3. On-premises apps write to gateway, data stored in S3 in S3 native format. Use for file share modernization.\n- **Volume Gateway**: iSCSI block storage backed by S3 with local cache (Cached mode) or stored locally with async backup to S3 (Stored mode). Cached: primary data in S3, frequently accessed in cache. Stored: primary data locally, async backup.\n- **Tape Gateway**: Virtual tape library backed by S3 Glacier. Drop-in replacement for physical tape backup software.',
          keyPoints: [
            { text: 'Snowball: use when network transfer would take > 1 week. Calculate: data size / available bandwidth. 80TB at 1Gbps ≈ 7 days', examTip: true },
            { text: 'DataSync: managed online transfer with scheduling, throttling, validation. Better than CLI scripts for recurring transfer jobs', examTip: true },
            { text: 'Storage Gateway Cached vs Stored volume: Cached = primary in S3, cache on-premises. Stored = primary on-premises, backup to S3', examTip: true },
            { text: 'Snowmobile threshold: generally for >10 PB. For 1-80 TB per device: Snowball Edge. For <8 TB: Snowcone', examTip: true },
          ],
          bestPractices: [
            { pillar: 'operational-excellence', text: 'Use DataSync for ongoing incremental sync after initial Snowball bulk transfer — Snowball for initial large dataset, then DataSync for delta changes until cutover' },
            { pillar: 'cost-optimization', text: 'Compare online transfer cost (data egress + time) vs Snowball rental cost for your dataset size — Snowball is cost-effective for large datasets on slow links' },
          ],
        },
      ],
    },
  ],
};
