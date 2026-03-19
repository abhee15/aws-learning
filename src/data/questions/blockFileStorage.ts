import type { Question } from './index';

export const blockFileStorageQuestions: Question[] = [
  {
    id: 'bfs-001',
    stem: 'A company runs a financial trading application on EC2 that requires consistent, sub-millisecond disk latency for transaction processing. The database writes thousands of small random I/O operations per second and requires 50,000 IOPS. Which EBS volume type meets these requirements?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'block-file-storage',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'EBS io2 Block Express with Provisioned IOPS (up to 256,000 IOPS)', correct: true, explanation: 'io2 Block Express is the highest-performance EBS volume type, supporting up to 256,000 IOPS and 4,000 MB/s throughput with sub-millisecond latency. Designed for I/O-intensive databases requiring consistent high performance.' },
      { id: 'b', text: 'EBS gp3 with maximum IOPS configured to 16,000', correct: false, explanation: 'gp3 supports a maximum of 16,000 IOPS — insufficient for the 50,000 IOPS requirement. For >16,000 IOPS, Provisioned IOPS (io1/io2) volumes are required.' },
      { id: 'c', text: 'EBS st1 (Throughput Optimized HDD) for maximum throughput', correct: false, explanation: 'st1 is optimized for sequential throughput (max 500 MB/s) and is designed for big data, log processing workloads — not random I/O intensive databases. HDD-based volumes have much higher latency than SSD volumes.' },
      { id: 'd', text: 'Instance store (NVMe) for maximum local I/O performance', correct: false, explanation: 'Instance store provides very high IOPS and low latency but is ephemeral — data is lost when the instance stops or is terminated. A financial trading database requires durable persistent storage, disqualifying instance store.' }
    ],
    explanation: {
      overall: 'EBS io2 Block Express is designed for the most demanding I/O workloads: SAP HANA, Oracle Database, SQL Server with intensive I/O. It supports: 64 TB max volume size, 256,000 IOPS max, 4,000 MB/s max throughput, 99.999% durability SLA (10x more durable than io1). For 50,000 IOPS: provision an io2 Block Express volume with 50,000 IOPS. Pricing: charged for IOPS provisioned + GB provisioned separately. On io2: 500 IOPS per GB ratio (vs 50 IOPS/GB for io1).',
      examTip: 'EBS volume types by use case: gp3 = general purpose SSD, 3,000-16,000 IOPS, default choice. io1/io2 = >16,000 IOPS or critical OLTP, provisioned. io2 Block Express = >64,000 IOPS or sub-millisecond latency. st1 = streaming workloads, big data, 500 MB/s throughput, sequential access. sc1 = cold data, infrequent access, 250 MB/s. For SAP HANA certification: requires io1/io2 with specific IOPS-to-GB ratios. gp3 vs gp2: gp3 has independent IOPS/throughput configuration (cheaper to achieve high IOPS vs gp2).'
    },
    tags: ['ebs', 'io2', 'provisioned-iops', 'block-express', 'high-performance-storage']
  },
  {
    id: 'bfs-002',
    stem: 'A company\'s Kubernetes workloads on EKS need persistent storage for stateful applications. Multiple pods across different nodes need to read AND write to the same shared storage simultaneously. EBS volumes do not meet this requirement. What storage solution should they use?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'block-file-storage',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Amazon EFS (Elastic File System) with EFS CSI driver for Kubernetes', correct: true, explanation: 'EFS is a fully managed NFS file system that supports concurrent access from thousands of pods across multiple AZs. The EFS CSI driver creates PersistentVolumes that mount EFS to pods. EFS scales automatically and supports ReadWriteMany access mode.' },
      { id: 'b', text: 'EBS volumes with EBS CSI driver and ReadWriteMany access mode', correct: false, explanation: 'EBS volumes only support ReadWriteOnce (single node attachment). EBS cannot be mounted to multiple EC2 instances simultaneously (except EBS Multi-Attach on io1/io2, which is limited to 16 instances within a single AZ and requires specialized application support).' },
      { id: 'c', text: 'Amazon S3 with s3fs FUSE driver mounted to each pod', correct: false, explanation: 'While s3fs can mount S3 as a filesystem, it does not provide POSIX compliance, has high latency for small I/O operations, and is not recommended for database or application workloads that expect traditional filesystem semantics.' },
      { id: 'd', text: 'Amazon FSx for Lustre for high-performance parallel file system access', correct: false, explanation: 'FSx for Lustre provides high-performance shared storage and does support multi-node access. However, it is designed for HPC workloads requiring high throughput, not general-purpose Kubernetes persistent storage. EFS is more appropriate for typical Kubernetes workloads.' }
    ],
    explanation: {
      overall: 'Amazon EFS is the standard solution for shared persistent storage in EKS/Kubernetes. Key features: NFS v4.1/4.2 protocol, POSIX compliant, concurrent access from multiple pods/nodes, automatic scaling (no provisioning), Standard and IA storage classes, encryption at rest and in transit. Kubernetes integration: EFS CSI driver creates PersistentVolumes with ReadWriteMany access mode. Access points provide application-specific entry points with POSIX identity enforcement.',
      examTip: 'EKS storage options: EBS CSI = block storage, ReadWriteOnce (single pod), good for databases. EFS CSI = file storage, ReadWriteMany (multiple pods/nodes), good for shared application data, CMS content, shared config. FSx for Lustre CSI = HPC workloads, ML training data. EBS Multi-Attach = io1/io2 only, same AZ, up to 16 instances, requires cluster-aware filesystem (OCFS2, GFS2). For typical stateful Kubernetes apps (WordPress, shared uploads): EFS. For high-performance databases: EBS io2.'
    },
    tags: ['efs', 'kubernetes', 'eks', 'persistent-storage', 'readwritemany']
  },
  {
    id: 'bfs-003',
    stem: 'A company stores 100 TB of machine learning training datasets on Amazon EFS. The data is used intensively during training runs but sits idle between runs. They want to reduce EFS costs by 70% without changing the access patterns during active training. What is the most effective solution?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'block-file-storage',
    examDomain: 'cost-optimization',
    options: [
      { id: 'a', text: 'Enable EFS Intelligent-Tiering (Lifecycle Management) to automatically move infrequently accessed files to EFS-IA storage class', correct: true, explanation: 'EFS Intelligent-Tiering monitors file access patterns and moves files not accessed for the configured period (7, 14, 30, 60, 90 days) to EFS-IA, which costs 91% less than EFS Standard. Files are transparently moved back to Standard when accessed.' },
      { id: 'b', text: 'Migrate training data from EFS to Amazon S3 and use EFS only for active training', correct: false, explanation: 'While S3 is cheaper than EFS for storage, migrating between EFS and S3 requires data movement operations that are complex and time-consuming. EFS Lifecycle Management provides automatic tiering without data migration.' },
      { id: 'c', text: 'Use EFS Provisioned Throughput instead of Bursting to reduce storage costs', correct: false, explanation: 'Provisioned Throughput is a performance feature for workloads that need consistent throughput regardless of storage amount — it is separate from storage pricing and does not reduce storage costs. It actually adds to cost.' },
      { id: 'd', text: 'Switch to Amazon FSx for Lustre for more cost-effective high-performance storage', correct: false, explanation: 'FSx for Lustre is more expensive than EFS Standard for general storage. Transitioning to FSx requires data migration and different access patterns (Lustre is optimized for sequential HPC workloads, not general-purpose file access).' }
    ],
    explanation: {
      overall: 'EFS storage classes: EFS Standard = $0.30/GB-month (frequent access, multi-AZ). EFS Standard-IA = $0.025/GB-month (infrequent access, +$0.01/GB retrieval). EFS One Zone = $0.16/GB-month. EFS One Zone-IA = $0.0133/GB-month. Lifecycle Management automatically moves files to IA class after 7, 14, 30, 60, or 90 days without access. When accessed, files are transparently served from IA (with slight latency increase and retrieval fee). ML datasets not accessed between runs can save 83%+ by tiering to EFS-IA.',
      examTip: 'EFS Intelligent-Tiering vs S3 Intelligent-Tiering: EFS = for NFS-mounted file system workloads. S3 = for object storage. Both automatically move objects/files based on access patterns. EFS performance modes: General Purpose (default, lowest latency for most workloads) vs Max I/O (higher aggregate throughput, higher latency, scale-out parallel workloads). Throughput modes: Bursting (throughput scales with storage size) vs Provisioned (fixed throughput regardless of storage). For ML: General Purpose + Bursting + Lifecycle Management is typically optimal.'
    },
    tags: ['efs', 'intelligent-tiering', 'lifecycle-management', 'efs-ia', 'cost-optimization']
  },
  {
    id: 'bfs-004',
    stem: 'A company needs Windows file shares for 500 users with Active Directory integration, DFS namespaces, and shadow copies (VSS). The file system must support SMB 3.0 protocol and integrate with their on-premises AD. Which AWS file storage service meets all requirements?',
    type: 'single',
    difficulty: 1,
    topicSlug: 'block-file-storage',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Amazon FSx for Windows File Server with AWS Managed Microsoft AD or self-managed AD', correct: true, explanation: 'FSx for Windows File Server is a fully managed Windows native file system. It supports: SMB 3.0/2.1, Active Directory integration (AWS Managed or self-managed on-premises AD via DX/VPN), DFS Namespaces and Replication, shadow copies (VSS), NTFS ACLs, and Windows-specific features.' },
      { id: 'b', text: 'Amazon EFS with NFS protocol accessed from Windows clients', correct: false, explanation: 'EFS uses NFS protocol, not SMB. Windows clients require NFS client software and do not natively support EFS without configuration. EFS does not support DFS namespaces, shadow copies, or native AD integration with Windows access control semantics.' },
      { id: 'c', text: 'Amazon S3 with AWS Storage Gateway File Gateway presenting SMB shares', correct: false, explanation: 'Storage Gateway File Gateway can present S3 as SMB shares but lacks native Windows features like DFS Namespaces, shadow copies (VSS), and full AD integration. It is designed for hybrid cloud access, not replacing Windows File Server features.' },
      { id: 'd', text: 'EC2 Windows instances with locally attached EBS volumes sharing files via SMB', correct: false, explanation: 'Self-managed Windows file servers on EC2 work but require operational management (patching, HA setup, backup). FSx for Windows provides all Windows file server features as a fully managed service without EC2 management overhead.' }
    ],
    explanation: {
      overall: 'Amazon FSx for Windows File Server provides a fully managed, Windows-native file system with: SMB 2.0/2.1/3.0, NFS (read-only), AWS Managed AD or self-managed AD join, DFS Namespaces and Replication, Shadow Copies (scheduled or manual, VSS-compatible), Windows ACLs and NTFS permissions, user storage quotas, Single-AZ and Multi-AZ deployments. For Multi-AZ: synchronous replication with automatic failover in 30 seconds.',
      examTip: 'FSx file system comparison: FSx for Windows = SMB, AD integration, DFS, shadow copies (Windows workloads). FSx for Lustre = high-performance parallel FS for HPC/ML. FSx for NetApp ONTAP = NetApp with multi-protocol (SMB, NFS, iSCSI), replication, tiering, SnapMirror. FSx for OpenZFS = Linux ZFS features, NFS. For Windows-specific features (shadow copies, DFS, Windows ACLs): FSx for Windows is the ONLY managed AWS option that provides all these natively.'
    },
    tags: ['fsx-windows', 'smb', 'active-directory', 'dfs', 'shadow-copies']
  },
  {
    id: 'bfs-005',
    stem: 'A media company runs video editing workflows requiring access to large video files (50-500 GB each) from multiple EC2 instances simultaneously. Peak I/O during rendering requires 1 GB/s throughput with low latency. They also need to access data directly from S3 (their archive). Which storage service is optimized for this HPC/media workload?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'block-file-storage',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Amazon FSx for Lustre with S3 data repository integration', correct: true, explanation: 'FSx for Lustre is a high-performance parallel file system delivering hundreds of GB/s throughput and millions of IOPS. S3 data repository integration automatically surfaces S3 objects as files in the Lustre namespace — data is lazy-loaded on first access. Optimized for HPC and media workloads.' },
      { id: 'b', text: 'Amazon EFS with provisioned throughput for consistent 1 GB/s performance', correct: false, explanation: 'EFS supports up to 3 GB/s throughput in General Purpose mode (with Provisioned Throughput). However, FSx for Lustre provides significantly higher aggregate throughput (hundreds of GB/s) and is specifically designed for parallel HPC/media workloads.' },
      { id: 'c', text: 'EBS io2 volumes with Multi-Attach for shared block storage access', correct: false, explanation: 'EBS Multi-Attach is limited to io1/io2, single AZ, up to 16 instances, and requires cluster-aware file systems. It is not suitable for general-purpose shared file access across many instances in a media production environment.' },
      { id: 'd', text: 'Amazon S3 with mountpoint-s3 (s3fs) for direct filesystem access to video files', correct: false, explanation: 'S3 has high latency for small sequential I/O and is object storage, not a POSIX filesystem. Video editing applications expect low-latency filesystem semantics that S3 cannot provide efficiently.' }
    ],
    explanation: {
      overall: 'Amazon FSx for Lustre is a fully managed implementation of the Lustre high-performance parallel file system used in HPC. For media workflows: (1) 100s of GB/s aggregate throughput, (2) Millions of IOPS, (3) Sub-millisecond latency, (4) POSIX-compliant shared access from multiple EC2 instances. S3 repository integration: import files from S3 on demand (lazy loading) or pre-cache with HSM. Export processed files back to S3. Deployment option: Scratch (temporary, high performance, no HA) or Persistent (replicated across AZs, HA).',
      examTip: 'FSx for Lustre deployment types: Scratch 1 = 200 MB/s/TiB, no HA, temporary data. Scratch 2 = 200 MB/s/TiB, no HA, 6x faster metadata. Persistent 1 = 50-200 MB/s/TiB, HA, long-term storage. Persistent 2 = 125-1000 MB/s/TiB, HA, NVMe SSD, best performance. S3 integration: Data Repository Associations (DRA) — specific S3 prefixes linked to Lustre directories. Auto-import: new S3 objects automatically appear in Lustre namespace. Auto-export: data written to Lustre automatically synced back to S3.'
    },
    tags: ['fsx-lustre', 'hpc', 'media-workflow', 's3-integration', 'high-performance']
  },
  {
    id: 'bfs-006',
    stem: 'An application on EC2 takes regular EBS snapshots for backup. Snapshots of a 2 TB gp3 volume take 45 minutes and compete with application I/O during the backup window. The team wants to reduce backup impact on application performance. What is the recommended approach?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'block-file-storage',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Use Amazon Data Lifecycle Manager (DLM) to automate snapshots with no impact on volume performance', correct: false, explanation: 'DLM automates snapshot scheduling (a good practice) but EBS snapshots do have some performance impact on the volume during the initial snapshot creation phase. DLM does not eliminate the performance impact.' },
      { id: 'b', text: 'Pause the application, create a snapshot, then resume — ensuring data consistency', correct: false, explanation: 'Pausing the application eliminates I/O contention during snapshot but introduces application downtime. For production applications, this violates availability requirements.' },
      { id: 'c', text: 'Enable EBS Fast Snapshot Restore (FSR) on the target AZ to speed up snapshot restoration', correct: false, explanation: 'FSR accelerates restoring FROM a snapshot (eliminates the warm-up period for new volumes). It does not affect the time or performance impact of creating (taking) snapshots.' },
      { id: 'd', text: 'Use EBS multi-volume crash-consistent snapshots via AWS Backup or application-consistent snapshots using VSS', correct: true, explanation: 'For application consistency: use VSS (Windows) or application-specific quiescing (Linux) before snapshots. EBS snapshots are incremental (only changed blocks after first snapshot) so subsequent snapshots are faster. AWS Backup coordinates multi-volume application-consistent snapshots.' }
    ],
    explanation: {
      overall: 'EBS snapshot performance considerations: (1) First snapshot = full copy (slow). (2) Subsequent snapshots = incremental (only changed blocks — much faster). (3) Snapshot I/O uses a small portion of volume throughput but typically does not significantly impact application performance for most workloads. For the 45-minute first snapshot: subsequent daily incremental snapshots will be much faster (minutes, not hours). For application consistency: VSS on Windows, AWS Backup with pre/post hooks on Linux.',
      examTip: 'EBS snapshot types: Crash-consistent = point-in-time (like pulling power plug — OS-level consistent but may miss in-flight transactions). Application-consistent = application quiesced before snapshot (databases flushed, all I/O committed). For databases: use database-native backup for application-consistent backups OR use AWS Backup with SSM pre-snapshot hook to flush transactions. FSR (Fast Snapshot Restore): reduces volume initialization time after restore — volumes from FSR-enabled snapshots perform at max capacity immediately (no warm-up). FSR is expensive ($0.75/FSR-snapshot/AZ/hour).'
    },
    tags: ['ebs', 'snapshots', 'aws-backup', 'application-consistent', 'dlm']
  },
  {
    id: 'bfs-007',
    stem: 'A company needs to share file data between their on-premises Linux servers and AWS EC2 instances simultaneously. On-premises servers have NFS clients. The file system must support concurrent access, POSIX semantics, and sync in near-real time without large data transfers. Which solution enables this hybrid file sharing?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'block-file-storage',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Amazon EFS with VPN or Direct Connect, mounted simultaneously on EC2 instances and on-premises Linux servers via NFS', correct: true, explanation: 'EFS supports NFS v4.0/4.1 access from both AWS (EC2) and on-premises servers. Through VPN or Direct Connect, on-premises NFS clients can mount EFS directly. All clients see the same consistent POSIX file system in real time — no data synchronization needed.' },
      { id: 'b', text: 'AWS DataSync to synchronize files bidirectionally between on-premises NFS and EFS', correct: false, explanation: 'DataSync copies files between storage systems on a schedule (not real-time concurrent access). It is a migration/sync tool, not a shared file system. Both systems would have separate copies, not a unified shared filesystem.' },
      { id: 'c', text: 'AWS Storage Gateway Volume Gateway to replicate block storage between on-premises and AWS', correct: false, explanation: 'Volume Gateway provides iSCSI block storage, not NFS file system access. It does not provide shared POSIX filesystem semantics between on-premises and EC2 instances.' },
      { id: 'd', text: 'Amazon S3 with mountpoint-s3 on both on-premises and EC2 for shared access', correct: false, explanation: 'S3 provides eventual consistency for some operations and does not provide POSIX filesystem semantics. mountpoint-s3 is read-heavy optimized and does not support concurrent writes from multiple clients reliably.' }
    ],
    explanation: {
      overall: 'EFS as a hybrid shared file system: on-premises servers mount EFS via NFS (v4.0/4.1) over Direct Connect or AWS VPN. EC2 instances mount EFS directly within the VPC. All clients share the same namespace and see updates in real time (NFS consistency). For access: use EFS mount target IP addresses or DNS names from the on-premises side. For security: EFS supports Kerberos authentication and can use VPC security groups + NACLs to control access from on-premises CIDR ranges.',
      examTip: 'EFS hybrid access requirements: (1) VPN or Direct Connect between on-premises and VPC. (2) EFS mount target in the VPC accessible from on-premises. (3) On-premises servers have NFS v4 client. (4) EFS security group allows NFS (port 2049) from on-premises IP range. EFS DNS resolution from on-premises: use Route 53 Resolver Outbound Endpoints to forward aws.amazon.com DNS queries from on-premises to Route 53. EFS throughput: Bursting scales with amount of data stored. For consistent high throughput: use Provisioned Throughput mode.'
    },
    tags: ['efs', 'hybrid-storage', 'nfs', 'direct-connect', 'on-premises']
  },
  {
    id: 'bfs-008',
    stem: 'A company runs an Oracle RAC (Real Application Clusters) database on-premises and wants to migrate to AWS. Oracle RAC requires shared block storage accessible simultaneously from multiple database nodes. What AWS storage solution supports this Oracle RAC requirement?',
    type: 'single',
    difficulty: 3,
    topicSlug: 'block-file-storage',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Amazon FSx for NetApp ONTAP with iSCSI LUNs supporting multi-host shared block access', correct: true, explanation: 'FSx for NetApp ONTAP supports iSCSI (block storage protocol) with multi-host access for Oracle RAC. ONTAP provides the shared block device that multiple Oracle nodes can access concurrently, similar to NetApp SAN used with Oracle RAC on-premises.' },
      { id: 'b', text: 'EBS io2 with Multi-Attach to share block storage between Oracle RAC nodes', correct: false, explanation: 'EBS Multi-Attach allows multiple EC2 instances to attach to a single io1/io2 volume, but it requires cluster-aware file systems and is limited to 16 instances in a single AZ. Oracle RAC requires specific shared disk group management (ASM) that may not work well with EBS Multi-Attach limitations.' },
      { id: 'c', text: 'Amazon EFS for Oracle RAC shared storage with NFS access from database nodes', correct: false, explanation: 'Oracle RAC requires shared block storage (not NFS/file storage) for ASM disk groups. EFS does not meet Oracle RAC\'s requirement for shared block device access.' },
      { id: 'd', text: 'Amazon S3 as an object storage backend for Oracle ASM disk groups', correct: false, explanation: 'Oracle ASM requires raw block devices, not object storage. S3 cannot serve as an ASM disk group. Oracle on AWS typically uses FSx for NetApp ONTAP (iSCSI) or AWS-managed FSx ONTAP for Oracle RAC shared storage.' }
    ],
    explanation: {
      overall: 'Oracle RAC on AWS: Oracle RAC requires shared disk storage accessible from multiple nodes simultaneously. Options: (1) FSx for NetApp ONTAP with iSCSI LUNs (recommended — managed service, HA, multi-protocol). (2) Dell PowerStore or Pure Storage from AWS Marketplace (third-party). (3) Amazon EBS Multi-Attach (limited, requires ASM cluster-aware configuration). AWS recommends FSx for NetApp ONTAP as the preferred shared storage for Oracle RAC on EC2. ONTAP also supports NFS for Oracle dataguard and SnapMirror for replication.',
      examTip: 'FSx for NetApp ONTAP capabilities: NFS, SMB, iSCSI (multi-protocol). SnapMirror replication to on-premises or other AWS regions. Tiering to S3 (FabricPool). Compression and deduplication. SnapVault for backup. Multi-AZ HA with synchronous replication. For Oracle RAC: iSCSI LUNs for ASM disk groups, NFS for Oracle datafiles, SnapMirror for DR. FSx ONTAP supports BYOL (Bring Your Own License) NetApp protocols and data management features.'
    },
    tags: ['fsx-ontap', 'oracle-rac', 'iscsi', 'shared-block-storage', 'database']
  },
  {
    id: 'bfs-009',
    stem: 'A company wants to implement automated EBS snapshot lifecycle management: create daily snapshots of all tagged EC2 volumes, retain them for 30 days, then automatically delete old snapshots. They manage 500 volumes across 3 regions. What AWS service provides this automated lifecycle management?',
    type: 'single',
    difficulty: 1,
    topicSlug: 'block-file-storage',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Amazon Data Lifecycle Manager (DLM) with tag-based snapshot policies', correct: true, explanation: 'DLM automates EBS snapshot creation, retention, and deletion based on tag-based policies. Create a policy: target volumes with specific tags, take daily snapshots, retain for 30 days, automatically delete older snapshots. Works across regions with cross-region copy rules.' },
      { id: 'b', text: 'AWS Backup with a backup plan and lifecycle rules for EBS volumes', correct: false, explanation: 'AWS Backup also supports EBS snapshot automation and is valid. However, DLM is specifically designed for EBS and EC2 AMI lifecycle management. For EBS-only lifecycle management, DLM is the more focused tool.' },
      { id: 'c', text: 'AWS Lambda triggered by CloudWatch Events (EventBridge) cron to create and delete snapshots', correct: false, explanation: 'Custom Lambda-based snapshot management works but requires building and maintaining the logic for snapshot creation, tagging, retention, and deletion across 3 regions. DLM provides this as a managed service without custom code.' },
      { id: 'd', text: 'AWS Systems Manager Automation runbooks for snapshot creation and cleanup', correct: false, explanation: 'SSM Automation can execute runbooks for snapshots but requires more configuration than DLM. DLM is the purpose-built, simpler solution for EBS snapshot lifecycle management.' }
    ],
    explanation: {
      overall: 'Amazon Data Lifecycle Manager (DLM) policies: Target: resource tags or specific instance/volume IDs. Schedule: hourly, daily, weekly, monthly. Retention: count-based (keep last N snapshots) or age-based (delete snapshots older than X days). Cross-region copy: automatically copy snapshots to other regions for DR. Cross-account copy: share snapshots with other AWS accounts. Fast Snapshot Restore: enable FSR on created snapshots for specific AZs. DLM is free — you only pay for snapshot storage.',
      examTip: 'DLM vs AWS Backup for EBS: DLM = EBS snapshots and AMIs only, simple lifecycle policies, free service. AWS Backup = unified backup service for EBS, RDS, DynamoDB, EFS, FSx, EC2 (AMI), Storage Gateway, S3, Aurora, VMware on-premises, DocumentDB. AWS Backup = compliance vault lock (WORM), cross-account backup, cross-region backup, unified dashboard. Use DLM for simple EBS snapshot automation. Use AWS Backup when you need unified multi-service backup management or compliance features.'
    },
    tags: ['dlm', 'ebs-snapshots', 'lifecycle-management', 'automation', 'retention']
  },
  {
    id: 'bfs-010',
    stem: 'A company is migrating from an on-premises tape backup library to AWS. They need to replace physical tapes with a virtual tape library (VTL) compatible with their existing tape backup software (NetBackup, Veeam). The solution must maintain compatibility without modifying backup software. What AWS service enables this?',
    type: 'single',
    difficulty: 1,
    topicSlug: 'block-file-storage',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'AWS Storage Gateway Tape Gateway presenting a virtual tape library backed by S3 and Glacier', correct: true, explanation: 'Tape Gateway presents a VTL interface (virtual tape drives, media changer) compatible with standard backup software. Backup software sees Tape Gateway as a physical tape library. Data is stored in S3 (active tapes) and S3 Glacier (archived tapes). No software changes needed.' },
      { id: 'b', text: 'AWS Backup with tape import functionality for physical tape migration', correct: false, explanation: 'AWS Backup does not support physical tape libraries or present a VTL interface. It is a cloud-native backup service that works with AWS services, not a replacement for tape backup infrastructure.' },
      { id: 'c', text: 'Amazon S3 Glacier as a direct replacement for physical tape archives', correct: false, explanation: 'Glacier stores archive data but does not present a VTL interface. Backup software cannot connect to Glacier directly as a tape library without the Tape Gateway middleware.' },
      { id: 'd', text: 'Amazon FSx for Windows File Server to store backup data with SMB protocol access for backup software', correct: false, explanation: 'File storage does not replace tape library interfaces. Backup software that uses tape protocols (iSCSI VTL) cannot interact with SMB file shares as tape libraries.' }
    ],
    explanation: {
      overall: 'AWS Storage Gateway Tape Gateway: deploys as a VM on-premises or EC2. Backup software connects to it as a physical tape library via iSCSI. Virtual tapes (100 GB to 5 TB each, up to 1 PB total) stored in S3 (active, retrievable immediately) or archived to S3 Glacier (low cost) or Glacier Deep Archive (lowest cost). Compatible with: Veeam, NetBackup, Backup Exec, Commvault, and others. Eliminates physical tape hardware, offsite shipping, and tape management while maintaining backup software compatibility.',
      examTip: 'Storage Gateway types: File Gateway = NFS/SMB to S3 (hybrid cloud storage). Volume Gateway = iSCSI block to S3 (stored volumes = all local + S3 backup; cached volumes = S3 primary + local cache). Tape Gateway = VTL to S3/Glacier (tape library replacement). For tape library migration: always Tape Gateway. For NFS/SMB to S3: File Gateway. For iSCSI block storage with S3 backend: Volume Gateway. All Gateway types require a VM (on-premises VMware, Hyper-V, KVM) or EC2 instance.'
    },
    tags: ['storage-gateway', 'tape-gateway', 'vtl', 'backup', 'glacier']
  },
  {
    id: 'bfs-011',
    stem: 'A company runs a containerized application on ECS with Fargate. The application generates temporary processing files during execution that need fast local disk access but do not need to persist after the task completes. Attaching EBS volumes is not supported on Fargate. What storage option is available?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'block-file-storage',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Fargate ephemeral storage (up to 200 GB per task) for temporary files that do not persist after task termination', correct: true, explanation: 'Fargate tasks include 20 GB of ephemeral storage by default, expandable to 200 GB at task definition time (additional storage charged by GB-hour). This ephemeral storage is deleted when the task stops — perfect for temporary processing files.' },
      { id: 'b', text: 'EBS volumes mounted via ECS volume configuration for temporary storage', correct: false, explanation: 'Fargate does not support EBS volume attachment (unlike EC2-backed ECS). Fargate tasks use ephemeral storage for local disk needs. EBS attachment is only available for EC2-backed ECS tasks.' },
      { id: 'c', text: 'S3 for temporary file storage using the AWS SDK within the application', correct: false, explanation: 'While S3 could store temporary files, it has higher latency than local disk and requires S3 API calls. For fast local disk access during processing, Fargate ephemeral storage provides much better performance than S3.' },
      { id: 'd', text: 'EFS mounted to the Fargate task for shared temporary storage', correct: false, explanation: 'EFS can be mounted to Fargate tasks for shared persistent storage, but it is a remote file system (NFS latency, ~1-2ms). For fast local disk access for temporary files, Fargate ephemeral storage is more performant and appropriate.' }
    ],
    explanation: {
      overall: 'Fargate storage options: (1) Ephemeral storage — 20 GB default (included), expand to 200 GB at task definition level ($0.000111/GB-hour for additional storage). Data deleted when task stops. Good for: temp files, build artifacts, processing scratch space. (2) EFS volumes — mount to /efs path in container, NFS access, persistent, shared across tasks. Good for: shared state, persistent data. (3) S3 via SDK — high latency, best for large objects. Ephemeral storage is local NVMe-backed — provides high I/O performance for temporary workloads.',
      examTip: 'Fargate vs EC2 ECS storage: Fargate = ephemeral storage (local, 20-200 GB) + EFS (network, persistent). EC2-backed ECS = ephemeral (instance store), EBS (network block), EFS (network file). Fargate does NOT support EBS (no instance to attach to). Fargate ephemeral storage is encrypted by default using Fargate-managed keys. For large temporary storage needs (>200 GB): use EC2-backed ECS with EBS, or write to S3 in stages.'
    },
    tags: ['fargate', 'ephemeral-storage', 'ecs', 'temporary-storage', 'container-storage']
  },
  {
    id: 'bfs-012',
    stem: 'A company uses Amazon EBS gp2 volumes for their databases. They need to increase the volumes from 500 GB to 2 TB while the database is online. The database is on a Linux EC2 instance. What is the correct procedure to expand EBS volume capacity without downtime?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'block-file-storage',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Modify the EBS volume size to 2 TB in the console/API, then extend the file system on the Linux instance using growpart and resize2fs/xfs_growfs', correct: true, explanation: 'EBS Elastic Volumes allows modifying size, IOPS, throughput, and volume type without detaching the volume or stopping the instance. After the volume modifies, the OS still sees the old file system size — you must extend the partition and file system to use new capacity.' },
      { id: 'b', text: 'Take a snapshot, create a new 2 TB volume from the snapshot, stop the instance, swap volumes, and restart', correct: false, explanation: 'This approach works but requires instance downtime (stopping/starting) and is the pre-Elastic Volumes method. Elastic Volumes allows online resize without any downtime — the old snapshot+swap approach is unnecessary.' },
      { id: 'c', text: 'Enable EBS Multi-Attach and attach an additional 1.5 TB volume alongside the existing 500 GB volume', correct: false, explanation: 'Multi-Attach allows multiple instances to share a single EBS volume but does not combine multiple volumes into a single logical disk. The database would still see two separate block devices, not a single 2 TB volume.' },
      { id: 'd', text: 'Enable EBS storage auto-scaling to automatically increase volume size when capacity is low', correct: false, explanation: 'There is no native EBS storage auto-scaling feature. While you can build custom automation (CloudWatch alarm → Lambda → EBS modify), this is not a built-in feature. Manual Elastic Volumes modification is the correct approach.' }
    ],
    explanation: {
      overall: 'EBS Elastic Volumes allows changing: size (increase only, never decrease), volume type (e.g., gp2 → gp3), IOPS (for io1/io2/gp3), and throughput (gp3). The modification is online with no downtime. However, after the EBS volume is extended: (1) Linux: run `growpart /dev/xvda 1` to extend the partition, then `resize2fs /dev/xvda1` (ext4) or `xfs_growfs /` (XFS). (2) Windows: Disk Management → Extend Volume. Modification can take from minutes to hours depending on volume size and change extent.',
      examTip: 'EBS Elastic Volumes limitations: Can only INCREASE size (not decrease). One modification per volume per 6 hours (after modification completes). During modification: volume performance is temporarily reduced. After EBS modification completes, the OS does NOT automatically see the new space — must manually extend partition and filesystem. For multi-volume RAID configurations (RAID 0 for throughput, RAID 1 for mirroring): each underlying EBS volume can be independently expanded. Prefer gp3 over gp2 (cheaper for equivalent IOPS, IOPS configurable independently).'
    },
    tags: ['ebs', 'elastic-volumes', 'resize', 'online-expansion', 'file-system']
  },
  {
    id: 'bfs-013',
    stem: 'A company discovers they have thousands of unused EBS volumes (previously attached to terminated EC2 instances) accumulating costs. They want to automatically identify and optionally delete unattached EBS volumes across all accounts in their AWS Organization. What is the most scalable approach?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'block-file-storage',
    examDomain: 'cost-optimization',
    options: [
      { id: 'a', text: 'AWS Config with a custom rule detecting unattached EBS volumes and AWS Config remediation to delete them (with approval workflow)', correct: true, explanation: 'AWS Config continuously monitors EBS volume attachment state. A custom Config rule flags unattached volumes. Config remediation actions (using SSM Automation) can delete volumes, optionally with a manual approval step via SNS before deletion.' },
      { id: 'b', text: 'AWS Trusted Advisor checks for unattached EBS volumes and manually review recommendations monthly', correct: false, explanation: 'Trusted Advisor identifies unattached volumes but requires manual action. For Organization-wide automated management of 10,000s of volumes, a Config-based automated remediation is more scalable than monthly manual review.' },
      { id: 'c', text: 'Use AWS Cost Explorer to identify EBS storage costs and manually terminate volumes', correct: false, explanation: 'Cost Explorer shows spending but cannot identify specific unattached volumes or automate remediation. It shows aggregate EBS costs, not per-volume attachment status.' },
      { id: 'd', text: 'CloudWatch Events rule triggering Lambda daily to list and delete all EBS volumes with state "available"', correct: false, explanation: 'While technically possible, deleting ALL "available" state volumes is dangerous — some may be intentionally detached (snapshots being created, backup volumes being staged). Config with approval workflow provides safer, more controlled remediation.' }
    ],
    explanation: {
      overall: 'AWS Config for EBS governance: (1) Enable Config in all accounts (via Organizations). (2) Create a custom Config rule (or use managed rule ec2-volume-inuse-check). (3) Mark non-compliant resources (unattached volumes). (4) Config remediation with SSM Automation document to: tag volumes for deletion review, notify owners via SNS, automatically delete after N days if not reclaimed. This provides automated detection + controlled remediation with audit trail. Use Config Aggregator for Organization-wide visibility.',
      examTip: 'EBS state machine: in-use (attached to instance) → available (detached) → creating/deleting (transitional). Config rule for unattached EBS: use ec2-volume-inuse-check managed rule (triggers on volumes with state != in-use). For cost savings also check: EBS volumes with 0 read/write activity (possible under-use). AWS Cost Optimization Hub (2023): provides centralized rightsizing recommendations including unattached EBS. Also check for unassociated Elastic IPs ($3.65/month each) using eip-attached Config rule.'
    },
    tags: ['ebs', 'config', 'cost-optimization', 'unattached-volumes', 'remediation']
  },
  {
    id: 'bfs-014',
    stem: 'A company wants to replicate an Amazon EFS file system to another AWS Region for disaster recovery. They need near-real-time replication with minimal data loss (RPO < 1 hour) and the ability to failover to the replica EFS in another region if the primary becomes unavailable. What feature provides this?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'block-file-storage',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Amazon EFS Replication to automatically replicate the EFS file system to a destination region', correct: true, explanation: 'EFS Replication provides continuous, asynchronous replication to a destination EFS file system in another region. RPO is typically in the minute range. The destination is read-only during replication. For DR failover, delete the replication configuration and the destination EFS becomes writable.' },
      { id: 'b', text: 'AWS DataSync to schedule hourly file synchronization from source EFS to destination EFS', correct: false, explanation: 'DataSync hourly sync provides approximately 1-hour RPO but is not continuous replication. EFS Replication provides near-continuous replication (minutes RPO) which better meets the < 1 hour requirement. DataSync also has higher operational overhead for DR purposes.' },
      { id: 'c', text: 'AWS Backup to create cross-region EFS backups every hour with automated restore', correct: false, explanation: 'AWS Backup for EFS creates point-in-time snapshots, not continuous replication. Restoring from backup takes time (the restore must complete before the EFS is accessible) and achieves hourly RPO only if backups run exactly every hour without delay.' },
      { id: 'd', text: 'EFS Multi-AZ with cross-region gateway endpoints for DR failover', correct: false, explanation: 'EFS Multi-AZ provides high availability within a region (across AZs) but does not replicate to another region. Cross-region replication requires EFS Replication.' }
    ],
    explanation: {
      overall: 'EFS Replication: (1) One-click setup in EFS console — select source and destination regions/EFS. (2) Continuous async replication (typically < 1 minute RPO). (3) Destination is read-only during active replication. (4) For DR failover: delete replication configuration → destination EFS becomes read-write in < 30 seconds. (5) Replication is charged at $0.06/GB/month for replicated storage. After failover, applications in the DR region can mount the destination EFS and continue.',
      examTip: 'EFS Replication vs DataSync: EFS Replication = continuous async (< 1 minute RPO), purpose-built for EFS-to-EFS DR, one-click setup. DataSync = scheduled sync (configurable frequency), supports NFS/SMB/S3/EFS sources and destinations, more flexible but more operational overhead. For EFS DR: EFS Replication is the native, simplest solution. RPO depends on replication lag — typically < 1 minute but can be higher during peak load. Monitor EFS Replication EfsMetered CloudWatch metric for replication lag.'
    },
    tags: ['efs', 'replication', 'disaster-recovery', 'cross-region', 'rpo']
  },
  {
    id: 'bfs-015',
    stem: 'A company needs to provide high-performance NFS storage for a genomics research cluster on EC2. The workload reads 50 TB datasets sequentially at maximum throughput during analysis runs and requires burst read throughput of 10 GB/s. Between runs, the data sits idle. Which storage configuration provides the required burst performance cost-effectively?',
    type: 'single',
    difficulty: 3,
    topicSlug: 'block-file-storage',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Amazon EFS in Bursting Throughput mode — throughput scales with data stored (50 TB generates substantial burst credits)', correct: false, explanation: 'EFS Bursting Throughput scales with storage: 50 TB × 50 MB/s/TB = 2,500 MB/s (2.5 GB/s) burst throughput. This is below the 10 GB/s requirement. EFS max throughput is 10+ GB/s in Provisioned mode but the Bursting mode cap is insufficient.' },
      { id: 'b', text: 'Amazon EFS with Provisioned Throughput set to 10 GB/s', correct: false, explanation: 'EFS Provisioned Throughput supports up to 10+ GB/s (region dependent). However, you pay for provisioned throughput 24/7 even when idle between runs — expensive for workloads with infrequent but intensive access periods.' },
      { id: 'c', text: 'Amazon FSx for Lustre with scratch file system for burst reads, S3 as the data repository backend', correct: true, explanation: 'FSx Lustre Scratch 2 provides up to 200 MB/s/TiB baseline throughput. A 50 TB Lustre filesystem provides 10 GB/s baseline throughput. S3 stores the permanent data; Lustre lazily loads data on demand. After analysis runs, the Lustre scratch filesystem can be deleted — no idle storage costs beyond S3.' },
      { id: 'd', text: 'Multiple EBS io2 volumes in a RAID 0 striped configuration for maximum throughput', correct: false, explanation: 'EBS volumes are attached to a single instance. For a multi-node cluster requiring shared NFS access to the same dataset, EBS cannot serve as shared NFS storage. FSx for Lustre or EFS are the correct shared file system solutions.' }
    ],
    explanation: {
      overall: 'For HPC genomics workloads requiring burst throughput: FSx for Lustre is purpose-built. Architecture: (1) Genomics data stored permanently in S3 (~$23/TB-month vs Lustre $140/TB-month). (2) Create FSx Lustre Scratch filesystem only for analysis runs (link to S3 repository). (3) Data lazy-loaded from S3 to Lustre on first access. (4) Analysis completes at full Lustre throughput (10 GB/s for 50 TB Scratch 2). (5) Export results back to S3. (6) Delete Lustre cluster — no idle storage costs. Pay for Lustre only during analysis runs (hours vs months).',
      examTip: 'FSx Lustre throughput calculation: Scratch 2 = 200 MB/s/TiB. 50 TiB = 50 × 200 MB/s = 10,000 MB/s = 10 GB/s. Persistent 2 = 125-1000 MB/s/TiB (configurable). For cost optimization: use S3 as the data lake (cheap long-term), create Lustre clusters on-demand for compute-intensive runs. FSx Lustre S3 integration: import metadata from S3 without copying data (data copied on first access), export back to S3 after processing. Scratch = no HA, temporary. Persistent = HA, long-term, replication within AZ.'
    },
    tags: ['fsx-lustre', 'hpc', 'genomics', 'burst-throughput', 's3-integration']
  },
  {
    id: 'bfs-016',
    stem: 'A company migrates a Windows file server to AWS. The server hosts home directories for 2,000 users, department shares with 5 TB of data, and a legacy application that requires SMB 2.0 protocol, DFS Namespaces (DFSN) for unified paths like \\\\company.com\\shares, and VSS-based shadow copies for user self-service file recovery. Which AWS storage service natively supports all these Windows-specific requirements?',
    type: 'single', difficulty: 2, topicSlug: 'block-file-storage', examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Amazon EFS with an NFS-to-SMB protocol translation gateway on EC2', correct: false, explanation: 'EFS is a Linux NFS filesystem. It does not support SMB protocol, DFS Namespaces, or VSS shadow copies. An NFS-to-SMB gateway would add latency and complexity while not fully supporting Windows-specific features like VSS.' },
      { id: 'b', text: 'Amazon FSx for Windows File Server with AWS Managed Microsoft AD integration, DFS Namespaces support, and VSS-based shadow copies', correct: true, explanation: 'FSx for Windows File Server: (1) SMB 2.0-3.1.1 protocol native support. (2) DFS Namespaces — can join existing DFSN or create new namespace; files accessible via \\\\company.com\\shares paths. (3) VSS shadow copies — automated or on-demand snapshots accessible by users via Previous Versions tab. (4) AWS Managed Microsoft AD or self-managed AD integration for user authentication. All requirements met natively.' },
      { id: 'c', text: 'AWS Storage Gateway File Gateway with SMB support for Active Directory authentication', correct: false, explanation: 'Storage Gateway File Gateway provides SMB access to S3-backed storage. It does not support DFS Namespaces or VSS shadow copies. Storage Gateway is designed for hybrid cloud storage (cache on-premises, store in S3), not as a primary Windows file server replacement in AWS.' },
      { id: 'd', text: 'Amazon S3 with S3 Object Lambda to reformat file access for Windows SMB clients', correct: false, explanation: 'S3 is an object store accessed via HTTP/HTTPS APIs. It has no native SMB protocol support, DFS Namespaces, or VSS capability. S3 Object Lambda transforms S3 GET responses but cannot provide SMB protocol access.' },
    ],
    explanation: { overall: 'FSx for Windows File Server: fully managed Windows native file system. Protocols: SMB 2.0/2.1/3.0/3.1.1. Active Directory: AWS Managed AD or self-managed on-premises AD (with Direct Connect/VPN). Features: VSS shadow copies (user self-service via Previous Versions), DFS Namespaces (DFSN) for unified namespace across multiple servers, DFS Replication (DFSR) for multi-AZ replication, Windows ACLs (NTFS permissions), encryption at rest (AWS KMS) and in transit (SMB Kerberos). High availability: Multi-AZ deployment with automatic failover. Storage: SSD or HDD, throughput-optimized.', examTip: 'Windows file server migration decision tree: Needs SMB + AD + VSS + DFS → FSx for Windows. Needs NFS for Linux/Unix → EFS. Needs NFS + SMB (multi-protocol) → FSx NetApp ONTAP. Needs Lustre HPC → FSx Lustre. Needs on-premises cache with S3 backend (hybrid) → Storage Gateway File Gateway. Key FSx Windows features to memorize: VSS = Previous Versions / shadow copies. DFSN = unified namespace. DFSR = cross-AZ/cross-region replication.' },
    tags: ['fsx-windows', 'smb', 'dfs', 'vss', 'windows-migration'],
  },
  {
    id: 'bfs-017',
    stem: 'A media production company stores 500 TB of raw video footage on Amazon S3. Video editors on-premises need to work with this content using their Adobe Premiere Pro and DaVinci Resolve workstations, which require a POSIX-compatible NFS mount. Editors need fast access to their current project files (~500 GB per editor) without downloading the entire 500 TB archive. Which solution provides the most cost-effective hybrid access?',
    type: 'single', difficulty: 2, topicSlug: 'block-file-storage', examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'AWS Storage Gateway File Gateway deployed on-premises — presents S3 as NFS mount, caches active files locally for low-latency access', correct: true, explanation: 'Storage Gateway File Gateway: (1) NFS (v3 and v4.1) or SMB protocol for on-premises access. (2) Transparent S3 backend — files appear as native NFS, stored in S3 as objects. (3) Local cache (on the Gateway VM) — active/recently-accessed files served from local SSD/HDD cache, eliminating S3 latency for hot data. (4) No need to download 500 TB — only active project files (~500 GB) are cached locally. Cost-effective: S3 storage ($0.023/GB vs EFS $0.30/GB).' },
      { id: 'b', text: 'Amazon EFS with Direct Connect to mount the NFS share on-premises and DataSync to sync S3 content to EFS', correct: false, explanation: 'Copying 500 TB from S3 to EFS adds $150,000+/month in EFS storage costs ($0.30/GB for Standard) vs $11,500/month for S3 Standard. DataSync sync adds transfer costs. EFS over Direct Connect provides the NFS mount but at dramatically higher cost and complexity compared to Storage Gateway backed by S3.' },
      { id: 'c', text: 'Deploy a Lustre client on each editor workstation connecting to an FSx Lustre cluster linked to S3', correct: false, explanation: 'Adobe Premiere and DaVinci Resolve are Windows/macOS applications that do not support Lustre client. FSx Lustre requires a Linux Lustre client and is designed for HPC Linux workloads, not Windows/macOS creative workstations.' },
      { id: 'd', text: 'Use AWS Direct Connect with an S3 interface endpoint to allow on-premises workstations to access S3 via HTTP/HTTPS', correct: false, explanation: 'S3 via HTTP/HTTPS is an object API, not a filesystem. Adobe Premiere and DaVinci Resolve require a POSIX NFS mount and cannot natively use the S3 API for file access. The editors would need custom integration or third-party S3 mount tools, neither of which are standard.' },
    ],
    explanation: { overall: 'Storage Gateway File Gateway architecture: On-premises VM (VMware, Hyper-V, KVM, hardware appliance, or EC2) runs Gateway software. Exposes NFS or SMB shares to on-premises clients. Files written to the share are uploaded to S3 (each file = one S3 object). Local cache: configurable size (SSD recommended), LRU eviction — recently accessed files served from cache at local NFS speeds. S3 integration: files browsable in S3 console, lifecycle policies apply, any S3 feature available. Use cases: cloud-tiered NAS, hybrid backup, media workflows, content distribution.', examTip: 'Storage Gateway types: File Gateway (NFS/SMB → S3, local cache). Volume Gateway (iSCSI block volumes → EBS snapshots; Stored=primary on-prem, Cached=primary in cloud). Tape Gateway (VTL virtual tape → S3/Glacier). Exam differentiator: "on-premises applications need NFS/SMB access to cloud storage" → File Gateway. "on-premises block storage with cloud backup" → Volume Gateway. "replace tape backup infrastructure" → Tape Gateway. File Gateway local cache is the key feature enabling low-latency access to frequently used files without downloading all data.' },
    tags: ['storage-gateway', 'file-gateway', 'nfs', 'hybrid-storage', 'media-workflow'],
  },
  {
    id: 'bfs-018',
    stem: 'A database administrator runs a critical Oracle RAC cluster that requires shared block storage accessible simultaneously from multiple EC2 instances with sub-millisecond latency, Oracle ASM (Automatic Storage Management) compatibility, and support for cluster-aware fencing. The cluster has 4 nodes. Which AWS storage solution supports Oracle RAC on EC2?',
    type: 'single', difficulty: 3, topicSlug: 'block-file-storage', examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Amazon EBS io2 volumes with Multi-Attach to allow up to 16 EC2 instances to share the same EBS volume', correct: false, explanation: 'EBS Multi-Attach allows up to 16 Nitro EC2 instances in the same AZ to mount the same io2 volume. However, EBS Multi-Attach does not support Oracle ASM and requires the application (the cluster) to manage concurrent writes — EBS has no built-in cluster coordination. Oracle RAC requires a cluster-aware shared filesystem or block device with SCSI reservations for fencing, which EBS Multi-Attach does not provide.' },
      { id: 'b', text: 'Amazon FSx for NetApp ONTAP with iSCSI LUNs supporting SCSI Persistent Reservations for Oracle RAC cluster fencing', correct: true, explanation: 'FSx NetApp ONTAP supports iSCSI protocol with SCSI Persistent Reservations (PR). Oracle RAC uses SCSI PR commands for cluster node fencing (evicting failed nodes from shared storage). ONTAP also supports Oracle ASM — ASM formats the iSCSI LUNs. Multi-node simultaneous access is supported. This is the AWS-supported path for Oracle RAC on AWS using managed shared storage.' },
      { id: 'c', text: 'Amazon EFS with NFS v4.1 advisory locks for Oracle RAC shared storage', correct: false, explanation: 'Oracle RAC requires SCSI block-level locking for ASM disk groups, not NFS advisory locks. Oracle does not support EFS (NFS) as ASM storage. NFS can be used for Oracle Database Files with Direct NFS (DNFS), but not for Oracle RAC shared block storage.' },
      { id: 'd', text: 'AWS Storage Gateway Volume Gateway in cached mode for shared iSCSI block storage', correct: false, explanation: 'Storage Gateway Volume Gateway presents iSCSI volumes to on-premises servers, with primary storage in S3. It is a hybrid storage solution for on-premises servers, not for EC2-to-EC2 shared storage. It does not support SCSI Persistent Reservations required for Oracle RAC fencing.' },
    ],
    explanation: { overall: 'Oracle RAC on AWS storage options: FSx NetApp ONTAP is the recommended managed storage. Features: iSCSI LUN support, SCSI Persistent Reservations (required for Oracle ASM cluster fencing), NFS v3/v4, SMB, NVMe/FC. Oracle ASM on ONTAP: create iSCSI LUNs → present to EC2 nodes via iSCSI initiator → Oracle ASM formats disk groups. High availability: Multi-AZ FSx ONTAP with HA pairs. Alternative: EC2 instances with dedicated shared-disk EC2 instances using clustering software — much higher operational complexity. AWS also recommends migrating Oracle RAC to Aurora PostgreSQL or RDS Oracle Multi-AZ for managed HA.', examTip: 'FSx NetApp ONTAP use cases: (1) Multi-protocol (NFS + SMB) access. (2) Oracle RAC iSCSI with SCSI-PR. (3) Snapshots, clones, thin provisioning, deduplication (storage efficiency). (4) SnapMirror for replication. (5) On-premises NetApp migration (familiar management). FSx ONTAP storage tiering: Primary (SSD, in-memory cache) → Capacity Pool (S3-backed, lower cost). Automatic tiering based on access patterns. Key differentiator vs other FSx: multi-protocol AND iSCSI AND SCSI-PR support.' },
    tags: ['fsx-ontap', 'oracle-rac', 'iscsi', 'scsi-persistent-reservations', 'shared-storage'],
  },
  {
    id: 'bfs-019',
    stem: 'A company has hundreds of unattached EBS volumes across 10 AWS accounts totaling $18,000/month in storage costs. These volumes were left behind from terminated EC2 instances. The company wants to automatically identify unattached volumes and delete them after a 30-day grace period, with notification to the account team before deletion. Which approach implements this governance at scale?',
    type: 'single', difficulty: 2, topicSlug: 'block-file-storage', examDomain: 'cost-optimization',
    options: [
      { id: 'a', text: 'AWS Trusted Advisor checks for low-utilization EBS volumes with SNS notifications to account teams', correct: false, explanation: 'Trusted Advisor checks for unattached EBS volumes but provides detection only, not automated remediation. It sends findings to the account owner but does not enforce a grace period, send pre-deletion notifications, or automatically delete volumes after 30 days.' },
      { id: 'b', text: 'AWS Config rule with ec2-ebs-volumes-unattached-check, EventBridge rule to trigger a Step Functions workflow — notify via SNS on day 0, tag volume, delete after 30 days if still unattached', correct: true, explanation: 'Full governance workflow: (1) Config rule detects unattached EBS volumes → EventBridge rule triggers Step Functions. (2) Step Functions Day 0: tag volume (scheduled-for-deletion=2024-XX-XX), notify account team via SNS. (3) Step Functions waits 30 days (Wait state). (4) Step Functions Day 30: checks if volume is still unattached; if yes → delete; if now attached → remove tag, send cleared notification. This scales across all accounts via Config Aggregator and a delegated administrator account.' },
      { id: 'c', text: 'Lambda function scheduled via EventBridge (cron daily) to call EC2 DescribeVolumes, filter unattached, and immediately delete', correct: false, explanation: 'Immediate deletion without grace period or notification could delete volumes that were intentionally detached temporarily (e.g., for snapshot creation, volume swapping). The 30-day grace period and pre-deletion notification are requirements that this approach does not satisfy.' },
      { id: 'd', text: 'AWS Systems Manager Automation runbook to periodically scan accounts and create Jira tickets for manual deletion by account teams', correct: false, explanation: 'Manual Jira-based deletion processes are not scalable for hundreds of volumes across 10 accounts and do not guarantee remediation — account teams may not act on tickets. The requirement is automated deletion with notification, not manual workflows.' },
    ],
    explanation: { overall: 'EBS cost governance at scale: Multi-account approach using Config Aggregator + Organizations. (1) Deploy Config rule ec2-ebs-volumes-unattached-check to all accounts via CloudFormation StackSets. (2) Config → EventBridge → Step Functions for remediation workflow with wait state. (3) Step Functions: State 1: SNS notification + add tag "scheduled-for-deletion" with date. State 2: Wait 30 days. State 3: check attachment status. State 4a: still unattached → create final snapshot (safety net) → delete volume. State 4b: now attached → remove tag + send cleared notification. Additional enhancement: create an EBS snapshot before deletion for recovery.', examTip: 'EBS volume states: in-use (attached to running/stopped EC2), available (unattached), creating, deleting, deleted, error. Available volumes still incur storage charges. EBS cost optimization: (1) Delete unattached volumes. (2) Rightsize gp3 vs gp2 (gp3 is 20% cheaper with same default performance). (3) Delete snapshots beyond retention window. (4) Use EBS Lifecycle Manager for automated snapshot management. Identify unattached volumes: EC2 DescribeVolumes with State=available filter, or Config rule, or Cost Explorer resource-level cost breakdown.' },
    tags: ['ebs', 'cost-governance', 'config', 'step-functions', 'unattached-volumes'],
  },
  {
    id: 'bfs-020',
    stem: 'A financial services company uses Amazon EBS gp2 volumes for their trading database EC2 instances. Each instance has a 2 TB root volume and a 4 TB data volume. During market open hours (9:30-11:30 AM), IOPS performance degrades causing transaction latency spikes. AWS support confirms the volumes are hitting the burst IOPS limit. The company needs consistent high IOPS throughout the trading day without performance variability. What is the most cost-effective solution?',
    type: 'single', difficulty: 2, topicSlug: 'block-file-storage', examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Upgrade data volumes from gp2 to gp3 and configure baseline IOPS to 16,000 at $0.005/provisioned IOPS-month', correct: false, explanation: 'gp3 allows provisioning up to 16,000 IOPS independently of volume size. At 16,000 IOPS, gp3 is $0.08/GB-month base + $0.005/IOPS-month for IOPS above 3,000. For 4 TB: base = $327/month, additional IOPS (13,000 × $0.005) = $65/month. Total ~$392/month per volume. This is cost-effective and eliminates burst credits. However, verify if 16,000 IOPS is sufficient.' },
      { id: 'b', text: 'Convert data volumes from gp2 to io2 Block Express with provisioned IOPS equal to peak requirement, providing sub-millisecond latency and no burst limitations', correct: false, explanation: 'io2 Block Express provides the highest IOPS (up to 256,000) and sub-millisecond latency, but at $0.125/IOPS-month it is significantly more expensive than gp3 for IOPS requirements under 64,000. For a trading database needing consistent performance without the highest tier requirements, gp3 is more cost-effective.' },
      { id: 'c', text: 'Migrate from gp2 to gp3 volumes using Elastic Volumes (online modification, no downtime) and provision the required IOPS baseline explicitly — gp3 does not use burst credits', correct: true, explanation: 'gp2 problem: burst credits depleted at sustained high IOPS → throttled to 3 IOPS/GB baseline (2 TB gp2 = 6,000 baseline IOPS). gp3 solution: no burst credit model; IOPS is a constant provisioned value (3,000-16,000 IOPS regardless of size). Elastic Volumes allows online gp2→gp3 conversion and IOPS modification with zero downtime. Cost: gp3 base ~$0.08/GB (20% cheaper than gp2) + provisioned IOPS at $0.005/IOPS-month above 3,000.' },
      { id: 'd', text: 'Add additional gp2 volumes and stripe them using software RAID0 to aggregate IOPS across multiple volumes', correct: false, explanation: 'RAID0 striping across multiple gp2 volumes aggregates baseline IOPS but each individual gp2 volume still has its own burst credit bucket. If all volumes deplete their burst credits simultaneously (which they will under sustained load), IOPS degrades proportionally. RAID0 does not solve the fundamental burst credit exhaustion issue of gp2.' },
    ],
    explanation: { overall: 'EBS gp2 vs gp3: gp2: IOPS = 3 IOPS/GB (min 100, max 16,000); burst to 3,000 IOPS using I/O credit bucket; inconsistent performance under sustained load. gp3: IOPS = configurable 3,000-16,000 independent of size; no burst model; consistent performance; 20% cheaper base price vs gp2. gp3 migration: use Elastic Volumes (ModifyVolume API) for online conversion — no snapshot restore needed, no downtime, no detach required. Live conversion takes minutes to hours depending on volume size. After modification: verify performance in CloudWatch EBS metrics (VolumeConsumedReadWriteOps, VolumeQueueLength).', examTip: 'EBS volume types decision guide: gp3 = default choice, cost-effective, configurable IOPS/throughput independently. gp2 = legacy, avoid for new deployments. io2/io2 Block Express = mission-critical databases needing >16,000 IOPS or sub-millisecond latency, multi-attach capability. st1 = throughput-optimized HDD, big data, log processing (cold data). sc1 = cold HDD, infrequent access, lowest cost. Elastic Volumes: modify type, size, IOPS, throughput online without downtime. Limit: can only increase size (not decrease), wait 6 hours between modifications.' },
    tags: ['ebs', 'gp2', 'gp3', 'elastic-volumes', 'iops-performance'],
  },
];
