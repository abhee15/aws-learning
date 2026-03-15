import type { Topic } from '../../types/topic';

export const s3Topic: Topic = {
  id: 's3',
  slug: 's3',
  title: 'Amazon S3 & Object Storage',
  shortTitle: 'S3',
  icon: 'Cloud',
  color: 'green',
  examDomains: ['new-solutions', 'cost-optimization'],
  estimatedStudyHours: 5,
  summaryBullets: [
    'S3 storage classes: Standard → IA → One Zone-IA → Glacier Instant → Glacier Flexible → Glacier Deep Archive',
    'Lifecycle policies automate transitions and expirations — combine with Intelligent-Tiering for unknowns',
    'S3 Replication: CRR (cross-region DR/compliance), SRR (same-region log aggregation/dev copies)',
    'Object Lock (WORM): Governance mode (can be overridden with perms) vs Compliance (no override, ever)',
    'Pre-signed URLs for temporary access without exposing credentials; Multipart for objects >100MB',
  ],
  relatedTopics: ['security', 'databases', 'serverless'],
  solutionArchitectures: [
    {
      id: 's3-arch-data-lake',
      title: 'S3-Based Data Lake with Athena',
      description: 'Centralized repository for structured, semi-structured, and unstructured data at any scale. S3 as the durable storage layer, Athena for serverless SQL queries, Glue for ETL and schema management.',
      useCase: 'Analytics, business intelligence, ML feature stores, log analysis — any workload needing petabyte-scale data storage with flexible querying without a provisioned data warehouse',
      components: [
        { name: 'S3 (Raw Zone)', role: 'Ingests raw data exactly as received — logs, JSON, CSV, Parquet. Immutable raw zone ensures source data is always preserved for reprocessing' },
        { name: 'AWS Glue ETL', role: 'Serverless Spark ETL jobs transform raw data → cleaned/enriched format. Converts to Parquet (columnar, 10× query speedup). Partitions by date/region for Athena efficiency' },
        { name: 'S3 (Curated Zone)', role: 'Transformed, partitioned Parquet data organized by domain. Athena queries this zone — columnar format reduces data scanned and cost' },
        { name: 'AWS Glue Data Catalog', role: 'Centralized metadata repository. Tables, schemas, and partition locations. Athena uses Catalog to understand S3 data structure. Shared with EMR and Redshift Spectrum' },
        { name: 'Amazon Athena', role: 'Serverless interactive SQL on S3. Presto-based. Pay per TB scanned ($5/TB). No infrastructure. Use partitioning + columnar formats to minimize scan cost' },
        { name: 'S3 Lifecycle', role: 'Auto-transitions curated zone data: S3 Standard → IA (30 days) → Glacier (1 year) → delete (7 years). Raw zone transitions faster — raw data less frequently accessed' },
      ],
      dataFlow: [
        'Data arrives in S3 raw zone via Kinesis Firehose, AWS DataSync, or direct PUT from applications',
        'S3 event notification triggers Glue job OR Glue Crawler discovers new data on schedule',
        'Glue ETL: read raw → validate schema → enrich (join reference data) → convert to Parquet → partition by date',
        'Write Parquet files to curated zone: s3://data-lake/curated/domain=orders/year=2024/month=01/',
        'Glue Catalog updated with new partition locations → immediately queryable via Athena',
        'Analyst runs Athena SQL: `SELECT * FROM orders WHERE year=2024 AND month=01` → scans only relevant partition',
      ],
      keyDecisions: [
        'Parquet/ORC columnar format + partitioning reduces Athena scan cost by 10-100× vs raw JSON/CSV',
        'Separate S3 buckets for raw/curated/published zones with different IAM policies and lifecycle rules',
        'Glue Data Catalog as single source of truth — connect EMR, Redshift Spectrum, and Athena to same catalog',
        'S3 Object Lock on raw zone for compliance — prevents raw data modification or deletion',
      ],
      tradeoffs: [
        { pro: 'No infrastructure to manage — Athena and Glue scale automatically. Pay only for data scanned/processed', con: 'Query latency higher than Redshift for complex analytical workloads — seconds vs sub-second' },
        { pro: 'Flexible schema — add new fields without table migration. Raw zone preserves ability to reprocess with new logic', con: 'Requires discipline with partitioning and file format — ad-hoc raw data queries are extremely expensive' },
      ],
      examAngle: 'Data lake pattern: S3 + Glue Catalog + Athena. Key cost optimization: always use columnar format (Parquet) + partitioning to minimize Athena data scanned. Glue Crawler discovers partitions automatically. Athena Workgroups for per-team cost control and query result encryption.',
    },
  ],
  subtopics: [
    {
      id: 's3-storage',
      title: 'S3 Storage Classes & Lifecycle',
      sections: [
        {
          id: 's3-storage-classes',
          title: 'Storage Classes & Cost Optimization',
          content: '**S3 Standard**: General purpose. 11 nines durability, 4 nines availability. Replicated across 3+ AZs. No retrieval fee. No minimum storage duration. Use for frequently accessed data.\n\n**S3 Standard-IA (Infrequent Access)**: Same durability as Standard. 99.9% availability. Retrieval fee per GB. 30-day minimum storage charge. 128 KB minimum object size for billing. Use for data accessed monthly — backup files, disaster recovery, older reports.\n\n**S3 One Zone-IA**: Single AZ only. 99.5% availability. 20% cheaper than Standard-IA. Data LOST if AZ destroyed. Use for: re-creatable data (thumbnails, transcodes, secondary backups), data that already exists in another region/location.\n\n**S3 Glacier Instant Retrieval**: Millisecond retrieval. 90-day minimum storage. Quarterly access pattern. Same latency as Standard-IA but lower storage cost. Use for: medical images, news media archives that occasionally need fast retrieval.\n\n**S3 Glacier Flexible Retrieval (formerly Glacier)**: Minutes to hours retrieval. Three retrieval modes: Expedited (1-5 min, highest cost), Standard (3-5 hours), Bulk (5-12 hours, cheapest). 90-day minimum. Use for: archives accessed 1-2 times/year, compliance archives.\n\n**S3 Glacier Deep Archive**: Lowest cost ($0.00099/GB/month). 12-hour retrieval (Standard), 48-hour (Bulk). 180-day minimum. Use for: long-term compliance archives (7-10 years), digital preservation.\n\n**S3 Intelligent-Tiering**: Automatically moves objects between access tiers based on usage. No retrieval fees. Small monthly monitoring fee per object. Access tiers: Frequent, Infrequent (30 days), Archive Instant (90 days), Archive (90-180 days, optional). Use when access patterns are unknown or unpredictable.\n\n**Lifecycle Policies**: Automate transitions and expirations:\n- Transition to IA after 30 days of no access\n- Transition to Glacier after 90 days\n- Expire (delete) after 365 days\n- Delete expired object delete markers (S3 Versioning cleanup)\n- Abort incomplete multipart uploads (prevent accumulation of unfinished uploads)',
          keyPoints: [
            { text: 'S3 One Zone-IA: data lost if AZ fails. Only use for re-creatable data or secondary copies of already-replicated data', gotcha: true },
            { text: 'Glacier Instant Retrieval: millisecond access like Standard-IA but lower cost — use for quarterly-accessed archives needing fast retrieval', examTip: true },
            { text: 'Intelligent-Tiering monitoring fee per object — not cost-effective for small objects (<128 KB) due to fee overhead exceeding storage savings', gotcha: true },
            { text: 'All S3 classes have 11 nines durability (except One Zone-IA within the zone) — durability is not a differentiator, availability is', examTip: true },
          ],
          bestPractices: [
            { pillar: 'cost-optimization', text: 'Enable S3 Intelligent-Tiering for data lakes and backups with unknown or changing access patterns — automatic optimization without retrieval fees or lifecycle rule complexity' },
            { pillar: 'cost-optimization', text: 'Set lifecycle rules to abort incomplete multipart uploads after 7 days — incomplete uploads accumulate and are charged as stored bytes without appearing in bucket listings' },
            { pillar: 'cost-optimization', text: 'Use S3 Storage Lens to identify buckets with high storage costs and low access rates — right-size to IA or Glacier classes based on actual access metrics' },
            { pillar: 'sustainability', text: 'Prefer S3 Glacier for long-term archives over keeping data in Standard — significantly lower energy consumption per GB stored for cold data' },
          ],
          comparisons: [
            {
              headers: ['Storage Class', 'Retrieval', 'Min Duration', 'Availability', 'Use Case'],
              rows: [
                ['Standard', 'Instant, free', 'None', '99.99%', 'Frequently accessed'],
                ['Standard-IA', 'Instant, fee/GB', '30 days', '99.9%', 'Monthly access, DR'],
                ['One Zone-IA', 'Instant, fee/GB', '30 days', '99.5%', 'Re-creatable, secondary backup'],
                ['Glacier Instant', 'Milliseconds', '90 days', '99.9%', 'Quarterly access, fast retrieval'],
                ['Glacier Flexible', '1-5min to 12hr', '90 days', '99.99%', 'Annual archives'],
                ['Glacier Deep Archive', '12-48 hours', '180 days', '99.99%', '7-10yr compliance archives'],
                ['Intelligent-Tiering', 'Varies by tier', 'None', '99.9%', 'Unknown/changing patterns'],
              ],
            },
          ],
        },
      ],
    },
    {
      id: 's3-security',
      title: 'S3 Security & Access Control',
      sections: [
        {
          id: 's3-access',
          title: 'Bucket Policies, ACLs & Access Points',
          content: '**S3 Access Control Layers** (evaluated together):\n1. **S3 Block Public Access**: Account-level or bucket-level setting. Overrides bucket policies and ACLs. Enable for all buckets — never allow public unless explicitly required.\n2. **Bucket Policy**: JSON resource-based policy on the bucket. Can grant cross-account access, enforce HTTPS (`aws:SecureTransport`), restrict to VPC endpoint (`aws:SourceVpc`), require encryption (`s3:x-amz-server-side-encryption`).\n3. **ACLs (Access Control Lists)**: Legacy, object-level grants. Disabled by default with Object Ownership=BucketOwnerEnforced. Avoid using — bucket policies are more expressive and manageable.\n4. **IAM Policies**: Identity-based policies granting s3:GetObject, s3:PutObject, etc. to roles/users.\n\n**S3 Access Points**: Named endpoints with distinct policies for different application use cases. Each access point enforces its own policy. Example: Marketing AP (read-only for their prefix), DataEngineering AP (read-write for their prefix). Simplifies bucket policy complexity when many teams share a bucket.\n\n**Object Ownership**: BucketOwnerEnforced (recommended) — disables ACLs, bucket owner owns all objects even if written by another account. BucketOwnerPreferred — bucket owner becomes owner if uploader uses bucket-owner-full-control canned ACL.\n\n**Presigned URLs**: Temporary signed URL for GET or PUT. Anyone with the URL can access the object. Expiry: 1 second to 7 days. Signed with the requesting principal\'s credentials — if the IAM user\'s access is revoked, presigned URL still works until expiry.\n\n**S3 Encryption**:\n- **SSE-S3**: AWS-managed AES-256 key. Default since Jan 2023. Zero configuration.\n- **SSE-KMS**: Customer Managed Key (CMK) or AWS managed KMS key. Audit trail in CloudTrail for every key usage. Supports key rotation and cross-account access.\n- **SSE-C**: Customer-provided key. AWS encrypts/decrypts but does not store the key — you must provide it on every request. Highest control, highest operational burden.\n- **Client-Side Encryption**: Encrypt before uploading, decrypt after downloading. AWS never sees plaintext.\n- **In-transit**: Enforce HTTPS via bucket policy condition `aws:SecureTransport: false → Deny`.',
          keyPoints: [
            { text: 'Enable S3 Block Public Access at the account level and only selectively disable for specific buckets that need public access', examTip: true },
            { text: 'Presigned URLs remain valid until expiry even if the signing user\'s permissions are revoked — consider short TTLs for sensitive operations', gotcha: true },
            { text: 'SSE-KMS: every object access calls KMS Decrypt — high-volume buckets can exhaust KMS API throttle limits (5,500-30,000 req/s)', gotcha: true },
            { text: 'Object Ownership = BucketOwnerEnforced disables ACLs entirely — recommended for all new buckets (simpler, no ACL confusion)', examTip: true },
          ],
          bestPractices: [
            { pillar: 'security', text: 'Enforce HTTPS-only access via bucket policy: Deny requests where `aws:SecureTransport = false` — prevents data interception on unencrypted connections' },
            { pillar: 'security', text: 'Restrict S3 access to specific VPC endpoints using `aws:SourceVpce` condition — implements data perimeter preventing exfiltration via public internet' },
            { pillar: 'operational-excellence', text: 'Enable S3 Server Access Logging or CloudTrail Data Events for all buckets containing sensitive data — provides audit trail of every GetObject and PutObject' },
            { pillar: 'security', text: 'Enable MFA Delete for versioned buckets containing compliance data — prevents deletion of object versions without MFA even by privileged users' },
          ],
        },
        {
          id: 's3-replication',
          title: 'S3 Replication & Object Lock',
          content: '**S3 Replication**: Asynchronous replication of objects to a destination bucket. Requires versioning enabled on both source and destination.\n\n**Cross-Region Replication (CRR)**: Source and destination in different regions. Use cases: compliance (data residency in specific region), disaster recovery (geo-redundant copy), reduce latency (replicate to region closer to users).\n\n**Same-Region Replication (SRR)**: Source and destination in same region. Use cases: log aggregation (consolidate logs from multiple buckets), production to test environment (live data copy for testing), compliance (copy to separate account for immutability).\n\n**Replication key characteristics**:\n- Existing objects NOT automatically replicated — use S3 Batch Replication for existing objects\n- Delete markers NOT replicated by default (can optionally enable delete marker replication)\n- Deletions of specific versions NOT replicated — protects against malicious deletion\n- No transitive replication: A→B and B→C does not replicate A to C (must configure A→C separately)\n- Can replicate to different storage class (e.g., replicate to Glacier in destination for cost)\n- Replication Time Control (RTC): 99.99% of objects replicated within 15 minutes — SLA-backed, extra cost\n\n**S3 Object Lock**: WORM (Write Once Read Many) — prevents object deletion or overwrite for a retention period. Requires versioning.\n- **Governance Mode**: Prevents overwrite/delete without special IAM permission (`s3:BypassGovernanceRetention`). Allows authorized administrators to extend retention periods or remove lock.\n- **Compliance Mode**: NO ONE can overwrite or delete during retention period — not even root user. Cannot shorten retention period. Cannot delete bucket with compliance-locked objects. Use for SEC 17a-4, HIPAA, FINRA compliance.\n- **Legal Hold**: Indefinite hold without retention period. Can be placed/removed by users with `s3:PutObjectLegalHold` permission. Overrides expiration policies.',
          keyPoints: [
            { text: 'S3 Replication does NOT replicate existing objects — use S3 Batch Replication for existing objects in the bucket', gotcha: true },
            { text: 'Delete markers are NOT replicated by default — deletion of source objects does NOT delete replicated copies', examTip: true },
            { text: 'Object Lock Compliance mode: no one — not even root — can delete during retention period. Required for SEC 17a-4 and similar regulations', examTip: true },
            { text: 'Replication Time Control (RTC): 15-minute replication SLA for compliance — standard replication has no time guarantee', examTip: true },
          ],
        },
      ],
    },
    {
      id: 's3-performance',
      title: 'S3 Performance & Advanced Features',
      sections: [
        {
          id: 's3-perf',
          title: 'S3 Performance Optimization',
          content: '**S3 Request Rates**: No prefix-based limits since 2018. 3,500 PUT/POST/DELETE per second per prefix. 5,500 GET/HEAD per second per prefix. Prefix = everything before the last `/` in the object key. Multiple prefixes multiply throughput.\n\n**Multipart Upload**: Recommended for objects > 100 MB, required for objects > 5 GB. Upload parts in parallel for higher throughput. If a part fails, only that part retries. Parts: 5 MB minimum (except last), 5 GB maximum per part, max 10,000 parts. Always set lifecycle rule to abort incomplete multipart uploads.\n\n**S3 Transfer Acceleration**: Routes uploads and downloads through CloudFront edge locations using AWS global backbone. 50-500% faster for long-distance transfers (e.g., customers in Asia uploading to us-east-1 bucket). Extra cost per GB. Test benefit with Speed Comparison tool before enabling.\n\n**S3 Select**: Server-side filtering of S3 objects using SQL expressions. Retrieve only the columns and rows you need from CSV, JSON, or Parquet files. Reduces data transferred to your application by up to 80%. Cheaper than reading full objects and filtering client-side.\n\n**S3 Byte-Range Fetches**: Parallelize GET requests by requesting specific byte ranges. Useful for downloading only a portion of large objects. Combine multiple ranges in parallel for higher throughput (similar to multipart upload but for downloads).\n\n**S3 Versioning**: Each overwrite creates a new version. All versions stored and charged. Delete marker added on delete (object not truly deleted — previous versions still accessible). Enable for: WORM compliance (with Object Lock), accidental deletion protection, audit history.\n\n**S3 Event Notifications**: Trigger on s3:ObjectCreated, s3:ObjectRemoved, s3:ObjectRestore. Targets: SQS, SNS, Lambda, EventBridge. EventBridge recommended for richer filtering and multiple targets. Delivery not guaranteed exactly-once — design consumers idempotently.',
          keyPoints: [
            { text: 'S3 prefix performance: 3,500 write + 5,500 read per second per prefix. Use multiple prefixes for higher aggregate throughput', examTip: true },
            { text: 'Multipart upload: required for >5GB, recommended for >100MB. Always add lifecycle rule to abort incomplete multiparts', examTip: true },
            { text: 'S3 Select reduces data scanned (and cost) by filtering at S3 — like a SQL WHERE clause at the storage layer', examTip: true },
            { text: 'Transfer Acceleration is for long-distance uploads/downloads (cross-continental). Not beneficial for same-region or adjacent regions', examTip: true },
          ],
          bestPractices: [
            { pillar: 'performance', text: 'Use parallel byte-range GETs to download large S3 objects faster — split the object into 8-16 byte ranges and fetch in parallel threads' },
            { pillar: 'cost-optimization', text: 'Use S3 Select to retrieve only needed columns from CSV/Parquet — reduces both data transfer costs and client-side processing time' },
            { pillar: 'operational-excellence', text: 'Lifecycle rule to abort incomplete multipart uploads after 7 days — prevents silent storage cost accumulation from failed large file uploads' },
            { pillar: 'reliability', text: 'Enable S3 Versioning on buckets containing application state or critical data — provides instant rollback from accidental overwrites or malicious deletions' },
          ],
        },
      ],
    },
  ],
};
