import type { Topic } from '../../types/topic';

export const blockFileStorageTopic: Topic = {
  id: 'block-file-storage',
  slug: 'block-file-storage',
  title: 'Block & File Storage: EBS, EFS & FSx',
  shortTitle: 'Block/File',
  icon: 'HardDrive',
  color: 'gray',
  examDomains: ['new-solutions', 'cost-optimization'],
  estimatedStudyHours: 5,
  summaryBullets: [
    'EBS: block storage attached to single EC2 instance (except io1/io2 Multi-Attach). gp3 default, io2 Block Express for highest IOPS',
    'EBS snapshots: incremental, stored in S3. Fast Snapshot Restore (FSR) eliminates lazy load latency',
    'EFS: fully managed NFS shared across many EC2/Lambda/ECS. Standard vs One Zone, Bursting vs Provisioned vs Elastic throughput',
    'FSx for Windows: SMB/NTFS, AD-integrated. FSx for Lustre: HPC, ML. FSx for NetApp ONTAP: multi-protocol (NFS/SMB/iSCSI)',
    'Instance Store: ephemeral NVMe directly on host — highest IOPS/throughput, survives reboot, lost on stop/terminate',
  ],
  relatedTopics: ['compute', 'databases', 's3'],
  subtopics: [
    {
      id: 'ebs',
      title: 'Amazon EBS — Block Storage',
      sections: [
        {
          id: 'ebs-volume-types',
          title: 'EBS Volume Types & Selection',
          content: '**Amazon EBS (Elastic Block Store)**: Durable block storage volumes attached to EC2 instances over the network. Persist independently from EC2 instance lifecycle (data survives instance stop/terminate). Single-AZ — volume and instance must be in the same AZ.\n\n**SSD-backed volumes (IOPS-intensive)**:\n\n**gp3 (General Purpose SSD)**: Default choice. 3,000 IOPS baseline (always, regardless of size). Up to 16,000 IOPS and 1,000 MB/s throughput (provisioned independently from capacity). 1 GiB–16 TiB. Cost: cheaper than gp2 at same performance.\n\n**gp2 (General Purpose SSD)**: Legacy default. IOPS tied to size: 3 IOPS/GiB, minimum 100 IOPS, maximum 16,000 IOPS (at 5,334 GiB+). Burst to 3,000 IOPS for volumes < 1 TiB via credit system. Prefer gp3 for new workloads.\n\n**io2 Block Express**: Highest performance. Up to 256,000 IOPS, 4,000 MB/s throughput, sub-millisecond latency. 4 GiB–64 TiB. 99.999% durability (vs 99.8% for others). Supports **Multi-Attach** (up to 16 Nitro EC2 instances in same AZ). Use for: SAP HANA, Oracle RAC, mission-critical OLTP.\n\n**io1**: Up to 64,000 IOPS, 1,000 MB/s. Older generation. Also supports Multi-Attach. Use io2 Block Express instead for new deployments.\n\n**HDD-backed volumes (throughput-intensive, cannot be boot volumes)**:\n\n**st1 (Throughput Optimized HDD)**: Sequential large-block workloads. Up to 500 MB/s throughput, 500 IOPS. Baseline 40 MB/s per TiB, burst 250 MB/s per TiB. Use for: Kafka, data warehouses, log processing, big data.\n\n**sc1 (Cold HDD)**: Lowest cost. 250 MB/s max. 12 MB/s per TiB baseline. Use for: infrequently accessed sequential data, cold data archives.\n\n**Instance Store**: Temporary block-level storage physically attached to the host server. Much higher IOPS/throughput than EBS (NVMe-direct). Survives instance reboot. Lost on stop, hibernate, or terminate. No replication — all-or-nothing. Use for: buffer/cache/scratch, distributed workloads that replicate their own data (Hadoop, Cassandra, Kafka brokers).',
          keyPoints: [
            { text: 'gp3: IOPS and throughput are independent of volume size — provision exactly what you need without over-sizing for IOPS', examTip: true },
            { text: 'io2 Multi-Attach: up to 16 Nitro instances share one volume in same AZ. Application must manage concurrent writes (cluster-aware file system like GFS2)', examTip: true },
            { text: 'HDD volumes (st1, sc1) cannot be used as boot volumes — must use SSD (gp2, gp3, io1, io2)', gotcha: true },
            { text: 'Instance Store is lost on stop/terminate but survives reboot. EBS persists across all lifecycle events', examTip: true },
            { text: 'EBS volume and EC2 instance must be in the same AZ. To move volume: snapshot → create new volume in target AZ from snapshot', gotcha: true },
          ],
          bestPractices: [
            { pillar: 'cost-optimization', text: 'Migrate gp2 to gp3: gp3 is 20% cheaper at baseline and allows independent IOPS/throughput provisioning — audit all gp2 volumes and convert to gp3 (no downtime required)' },
            { pillar: 'performance', text: 'Use io2 Block Express for latency-sensitive OLTP: sub-millisecond latency and 99.999% durability outweigh the cost premium for databases like SAP HANA or Oracle' },
            { pillar: 'reliability', text: 'Enable EBS-optimized instances: dedicated bandwidth between EC2 and EBS eliminates contention with network I/O, ensuring consistent storage performance' },
          ],
          useCases: [
            {
              scenario: 'A database team runs PostgreSQL on a gp2 EBS volume (2 TiB). The database performs well during normal hours but experiences latency spikes during the morning batch jobs when IOPS exceed the burst threshold. Engineers suspect burst credit exhaustion. They need consistent high IOPS without over-sizing the volume.',
              wrongChoices: ['Increase the gp2 volume to 5.3+ TiB to get 16,000 baseline IOPS — expensive, wastes storage, still uses burst model', 'Switch to an io2 volume — io2 costs significantly more per GB and per IOPS than gp3 for this use case'],
              correctChoice: 'Migrate the gp2 volume to gp3 using Elastic Volumes (no downtime). Provision exactly 8,000 IOPS and 500 MB/s throughput on gp3 — no burst credits, consistent performance at lower cost than gp2',
              reasoning: 'gp3 eliminates the burst credit model — IOPS and throughput are constant at the provisioned level. Elastic Volumes allows online modification from gp2 to gp3 with no downtime. gp3 is also 20% cheaper at baseline than gp2 with the same storage capacity. 8,000 IOPS handles both normal and batch workloads consistently.',
            },
          ],
          comparisons: [
            {
              headers: ['Volume Type', 'Max IOPS', 'Max Throughput', 'Durability', 'Boot', 'Use Case'],
              rows: [
                ['gp3', '16,000', '1,000 MB/s', '99.8%', 'Yes', 'General workloads, default choice'],
                ['gp2', '16,000', '250 MB/s', '99.8%', 'Yes', 'Legacy, prefer gp3'],
                ['io2 Block Express', '256,000', '4,000 MB/s', '99.999%', 'Yes', 'SAP HANA, Oracle RAC, OLTP'],
                ['io1', '64,000', '1,000 MB/s', '99.8%', 'Yes', 'High IOPS, older generation'],
                ['st1', '500', '500 MB/s', '99.8%', 'No', 'Kafka, data warehouse, sequential'],
                ['sc1', '250', '250 MB/s', '99.8%', 'No', 'Cold data, infrequent access'],
                ['Instance Store', 'Millions', '>10 GB/s', 'None (ephemeral)', 'Yes', 'Buffers, cache, distributed DBs'],
              ],
            },
          ],
        },
        {
          id: 'ebs-snapshots',
          title: 'EBS Snapshots & Data Management',
          content: '**EBS Snapshots**: Point-in-time backup of EBS volumes stored in S3 (AWS-managed, not visible in your S3 console). Incremental: first snapshot copies all data, subsequent snapshots copy only changed blocks. Delete any snapshot safely — AWS recombines block references so no data is lost.\n\n**Snapshot operations**:\n- Create volume from snapshot in any AZ or region\n- Share snapshots with other AWS accounts\n- Copy snapshots to other regions for DR or AMI distribution\n- Snapshot a running volume (recommended: stop I/O or application-level quiesce for consistency)\n\n**Fast Snapshot Restore (FSR)**: Eliminates the lazy initialization penalty where newly created volumes from snapshots deliver poor performance until all blocks are touched. FSR pre-warms blocks in specific AZ. Cost: charged per AZ per snapshot per hour. Use for: launch templates where performance must be consistent from first use.\n\n**EBS Snapshot Archive**: Move snapshots to archive tier — 75% cheaper than standard snapshot pricing. Retrieval takes 24-72 hours. Use for: compliance retention where you never expect to restore, legal hold snapshots.\n\n**Amazon Data Lifecycle Manager (DLM)**: Automate EBS snapshot and AMI creation, retention, and deletion. Policies target resources by tag. Schedule: every N hours or daily/weekly/monthly at specified time. Cross-region copy and cross-account sharing built in. Use instead of custom Lambda scripts.\n\n**EBS Encryption**: AES-256 encryption of data at rest and in transit between EC2 and EBS. Uses KMS CMK. Encrypted snapshot → encrypted volume (and vice versa). To encrypt an unencrypted volume: snapshot → copy snapshot with encryption enabled → create volume from encrypted snapshot. Account-level default: enable \"EBS Encryption by Default\" with a default CMK — all new volumes automatically encrypted.',
          keyPoints: [
            { text: 'EBS snapshots are incremental but you can safely delete any snapshot — AWS manages block references across snapshots', examTip: true },
            { text: 'Fast Snapshot Restore: eliminates first-touch latency for volumes created from snapshots. Required for consistent performance in auto-scaling fleets', examTip: true },
            { text: 'To encrypt an existing unencrypted volume: create snapshot → copy with encryption → create volume from encrypted snapshot', examTip: true },
            { text: 'DLM automates snapshot lifecycle. For cross-account backup policies, DLM can copy snapshots to a central DR account automatically', examTip: true },
          ],
          bestPractices: [
            { pillar: 'reliability', text: 'Use DLM policies with cross-region copy for production EBS volumes — automates RPO compliance without custom Lambda scripts' },
            { pillar: 'cost-optimization', text: 'Move compliance snapshots older than 90 days to EBS Snapshot Archive tier — 75% cost reduction for snapshots you rarely restore' },
            { pillar: 'security', text: 'Enable EBS Encryption by Default at the account level with a CMK — ensures all new volumes and snapshots are encrypted without relying on individual developers' },
          ],
        },
      ],
    },
    {
      id: 'efs',
      title: 'Amazon EFS — Shared File Storage',
      sections: [
        {
          id: 'efs-core',
          title: 'EFS Architecture & Configuration',
          content: '**Amazon EFS (Elastic File System)**: Managed NFS (Network File System) — multiple EC2 instances, Lambda functions, ECS tasks, and on-premises servers can mount the same file system simultaneously. Multi-AZ by default (Standard storage class). Scales automatically — no provisioning required.\n\n**Storage Classes**:\n- **EFS Standard**: Multi-AZ, highest availability. Data stored across multiple AZs. Access from any AZ.\n- **EFS Standard-IA (Infrequent Access)**: Same multi-AZ durability, lower cost. Files accessed less frequently auto-tiered here with lifecycle policy.\n- **EFS One Zone**: Data stored in a single AZ. 47% cheaper than Standard. Not for production workloads requiring HA.\n- **EFS One Zone-IA**: Cheapest. Single AZ + IA tier.\n\n**Throughput Modes**:\n- **Bursting Throughput (default)**: Throughput scales with storage size. Baseline: 50 KiB/s per GiB stored. Burst: up to 100 MiB/s (minimum) using burst credits. Works well for spiky workloads with small file systems.\n- **Provisioned Throughput**: Specify throughput regardless of storage size. Use when your throughput requirements exceed what Bursting can provide for your storage size.\n- **Elastic Throughput**: Automatically scales throughput up or down based on workload needs. No burst credit model. Charges per GB transferred. Best for unpredictable or highly variable workloads.\n\n**Performance Modes**:\n- **General Purpose (default)**: Lowest latency. Suitable for most workloads (web serving, CMS, home directories).\n- **Max I/O**: Higher aggregate throughput but higher latency. For highly parallelized workloads with 10+ EC2 instances (big data analytics, media processing). Not available with Elastic Throughput.\n\n**Access**:\n- Mount via NFS v4.1/v4.2 using mount targets (ENIs) in each VPC AZ\n- On-premises access: via Direct Connect or VPN, mounting NFS directly or through EFS mount helper\n- EFS Access Points: application-specific entry points with enforced POSIX user/group identity and root directory. Use to give containers access to specific directories without root access.\n\n**EFS vs S3**: EFS is a file system (directory tree, POSIX permissions, mount like a local disk). S3 is object storage (HTTP API, flat namespace). Use EFS for: application code, shared config, home directories, content management. Use S3 for: static assets, data lake, backup archives.',
          keyPoints: [
            { text: 'EFS Standard: multi-AZ, automatically scales. No capacity planning — pay for storage used + data transfer for Elastic Throughput', examTip: true },
            { text: 'EFS Access Points: enforce POSIX UID/GID and chroot to a specific directory. Ideal for multi-tenant ECS tasks sharing one EFS volume', examTip: true },
            { text: 'EFS One Zone is 47% cheaper but single-AZ — not suitable for production workloads needing AZ fault tolerance', gotcha: true },
            { text: 'Elastic Throughput mode handles bursty workloads without manual provisioning — replaces the old Bursting credit model for unpredictable I/O', examTip: true },
          ],
          bestPractices: [
            { pillar: 'cost-optimization', text: 'Enable EFS Intelligent Tiering (lifecycle policy) to automatically move files not accessed in 7-90 days to EFS-IA tier — IA storage is 85% cheaper than Standard' },
            { pillar: 'security', text: 'Use EFS Access Points with IAM authorization — enforce that each application uses only its designated directory and identity, preventing cross-tenant data access in multi-container environments' },
            { pillar: 'performance', text: 'Use Elastic Throughput for unpredictable workloads: eliminates burst credit exhaustion and scales to 10 GiB/s reads automatically without manual provisioning' },
          ],
          useCases: [
            {
              scenario: 'A container platform runs 50 ECS Fargate tasks, each serving personalized content. Each task needs read/write access to user-uploaded files. EBS cannot be attached to multiple Fargate tasks. S3 has no POSIX interface. The application code uses standard file system calls (open/read/write).',
              wrongChoices: ['Use S3 with a FUSE-based S3 mount on each container — high latency, not production-reliable, not officially supported', 'Give each task its own EBS volume with initial file copy — each task gets a separate copy, writes don\'t sync between tasks'],
              correctChoice: 'Mount a shared EFS file system via the ECS task definition volumesFrom configuration. All 50 tasks mount the same EFS, sharing files with POSIX semantics. Use EFS Access Points to give each service its own namespace directory',
              reasoning: 'EFS is the standard shared file system for ECS/Fargate. Fargate tasks can mount EFS natively via the task definition. Multiple tasks share the same EFS simultaneously. EFS Access Points enforce per-service directory isolation — the uploads service sees only /uploads, the thumbnails service sees only /thumbnails, on the same EFS.',
            },
            {
              scenario: 'A DevOps team runs nightly data processing jobs. Each job reads 5 TB of data from EFS, processes it, and discards the output. The EFS bill is $1,500/month for 5 TB of Standard storage. The data is only read during nightly jobs — it sits untouched the other 23 hours.',
              wrongChoices: ['Move to EFS One Zone to save 47% — still charges for all 5 TB even when idle', 'Delete and re-upload data for each nightly job — prohibitive data transfer time'],
              correctChoice: 'Enable EFS Intelligent Tiering with a 1-day lifecycle policy. Files not accessed in 1 day move to EFS-IA (85% cheaper). The nightly job reads them (moves back to Standard briefly), then they tier back to IA. Monthly cost drops from $1,500 to ~$225',
              reasoning: 'EFS-IA costs $0.025/GB vs Standard $0.30/GB. With a 1-day lifecycle: data processed nightly transitions back to IA during idle hours. Reads from IA have a per-GB retrieval fee ($0.01/GB) but at 5 TB/day that\'s $50/month — far less than Standard storage cost. Total monthly cost: ~$50 retrieval + ~$150 storage vs $1,500.',
            },
          ],
          comparisons: [
            {
              headers: ['Feature', 'EBS gp3', 'EFS Standard', 'S3'],
              rows: [
                ['Access', 'Single EC2 (or Multi-Attach)', 'Many instances/services', 'Any client via HTTP'],
                ['Protocol', 'Block (iSCSI)', 'NFS v4', 'REST API'],
                ['Scaling', 'Manual resize', 'Automatic', 'Unlimited'],
                ['Multi-AZ', 'No (single AZ)', 'Yes (default)', 'Yes (≥3 AZs)'],
                ['POSIX', 'Yes', 'Yes', 'No'],
                ['Use case', 'OS disk, DB', 'Shared app files, CMS', 'Object storage, data lake'],
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'fsx',
      title: 'Amazon FSx — Managed Third-Party File Systems',
      sections: [
        {
          id: 'fsx-options',
          title: 'FSx Variants: Windows, Lustre, NetApp ONTAP & OpenZFS',
          content: '**Amazon FSx**: Fully managed file systems built on industry-standard file system software. Four variants for specific use cases.\n\n**FSx for Windows File Server**:\n- Full Windows-native file system (SMB protocol, NTFS, Windows ACLs, DFS Namespaces)\n- Integrates with Microsoft Active Directory (on-premises AD or AWS Managed AD)\n- Multi-AZ deployment option for HA (active + standby file server)\n- Supports Windows shadow copies (VSS — Volume Shadow Copy Service) for point-in-time restore\n- Storage: SSD (up to 64,000 IOPS, 2 GB/s) or HDD\n- Use for: Windows applications, SharePoint, SQL Server file shares, home directories for Windows users\n\n**FSx for Lustre**:\n- High-performance parallel file system for HPC and ML\n- Sub-millisecond latency, millions of IOPS, hundreds of GB/s throughput\n- Native integration with S3: import S3 data into Lustre file system on mount, write results back to S3 automatically (Lazy Load + Export)\n- Deployment options: Scratch (no replication, faster, cheaper — for temporary processing) vs Persistent (replicated within AZ, for longer jobs)\n- Use for: ML training (SageMaker), genomics processing, seismic analysis, rendering, CFD simulation\n\n**FSx for NetApp ONTAP**:\n- Full NetApp ONTAP managed service — supports NFS, SMB, and iSCSI simultaneously (multi-protocol)\n- NetApp SnapMirror replication to other ONTAP systems (on-premises, other regions)\n- Storage efficiency: compression, deduplication, thin provisioning\n- Multi-AZ HA with automatic failover\n- Migrate on-premises NetApp workloads with zero application changes\n- Use for: enterprise apps with mixed Windows/Linux clients, on-premises NetApp lift-and-shift\n\n**FSx for OpenZFS**:\n- OpenZFS managed service — NFS protocol (v3, v4, v4.1, v4.2)\n- Up to 1 million IOPS, sub-millisecond latency\n- ZFS snapshots and clones: instant zero-cost clones of volumes for dev/test\n- Migration target: lift-and-shift from on-premises ZFS or Linux NFS\n- Use for: databases with NFS backend, dev/test with instant clone workflows\n\n**Key Differentiators**:\n- Need Windows + AD: FSx for Windows\n- Need HPC/ML speed + S3 integration: FSx for Lustre\n- Need multi-protocol (NFS + SMB + iSCSI) or NetApp migration: FSx for ONTAP\n- Need Linux NFS with ZFS features: FSx for OpenZFS',
          keyPoints: [
            { text: 'FSx for Lustre + S3: Lazy Load imports S3 objects on first access. Export writes Lustre results back to S3. Enables HPC processing of S3-resident datasets without copying', examTip: true },
            { text: 'FSx for Windows: only option for SMB protocol + NTFS + Windows ACLs + Active Directory integration. Required for Windows-native applications', examTip: true },
            { text: 'FSx for ONTAP: only FSx variant supporting iSCSI block storage, making it a multi-protocol storage solution (NFS + SMB + iSCSI)', examTip: true },
            { text: 'FSx for Lustre Scratch vs Persistent: Scratch has no replication (lower cost, for short jobs). Persistent replicates within AZ (for multi-day jobs)', gotcha: true },
          ],
          bestPractices: [
            { pillar: 'performance', text: 'Use FSx for Lustre with SageMaker for ML training: Lazy Load serves S3 training data at file system speed without manual data copy, reducing time-to-first-training-run' },
            { pillar: 'reliability', text: 'Deploy FSx for Windows in Multi-AZ mode for production workloads: automatic failover to standby file server in under 30 seconds if primary AZ fails' },
            { pillar: 'cost-optimization', text: 'Use FSx for Lustre Scratch deployment for transient HPC jobs: 20% cheaper than Persistent with no durability overhead for single-run processing jobs that write results to S3' },
          ],
          comparisons: [
            {
              headers: ['FSx Variant', 'Protocol', 'Use Case', 'S3 Integration', 'AD Integration'],
              rows: [
                ['FSx for Windows', 'SMB, NTFS', 'Windows apps, SharePoint, SQL Server shares', 'No', 'Yes (required)'],
                ['FSx for Lustre', 'POSIX (NFS-like)', 'HPC, ML training, rendering', 'Yes (native)', 'No'],
                ['FSx for ONTAP', 'NFS, SMB, iSCSI', 'Multi-protocol, NetApp migration', 'No', 'Yes'],
                ['FSx for OpenZFS', 'NFS v3/v4', 'Linux NFS, dev/test clones', 'No', 'No'],
              ],
            },
          ],
        },
      ],
    },
  ],
};
