import type { Topic } from '../../types/topic';

export const observabilityTopic: Topic = {
  id: 'observability',
  slug: 'observability',
  title: 'Observability: CloudWatch, CloudTrail & Config',
  shortTitle: 'Observability',
  icon: 'Eye',
  color: 'teal',
  examDomains: ['continuous-improvement', 'new-solutions'],
  estimatedStudyHours: 5,
  summaryBullets: [
    'CloudWatch Logs Insights: interactive query language for log analysis — not real-time streaming',
    'CloudWatch Metrics: default free metrics, detailed monitoring (1-min) costs extra; custom metrics via PutMetricData',
    'CloudTrail: API audit log — management events free (1 copy), data events paid. 90-day event history free',
    'AWS Config: resource configuration history and compliance rules. Tracks WHO changed WHAT and WHEN',
    'X-Ray: distributed tracing across Lambda, ECS, API Gateway. Identifies bottlenecks and error sources',
  ],
  relatedTopics: ['security', 'serverless', 'compute'],
  solutionArchitectures: [
    {
      id: 'obs-arch-centralized',
      title: 'Centralized Observability for Multi-Account Organization',
      description: 'All AWS accounts in the Organization send logs, metrics, and traces to a centralized Observability account. Security team has read-only access to all account activity. Workload teams retain write access to their own accounts.',
      useCase: 'Enterprise with 10+ AWS accounts requiring centralized security monitoring, cross-account dashboards, and unified alerting without giving security team access to workload accounts',
      components: [
        { name: 'CloudWatch Cross-Account Observability', role: 'Link source accounts to monitoring account. Monitoring account can query logs, metrics, and traces from all source accounts in a single CloudWatch console view' },
        { name: 'CloudTrail Organization Trail', role: 'Created in management account — captures API calls from ALL accounts automatically. Delivered to S3 in log archive account. Source accounts cannot modify or delete the trail' },
        { name: 'Log Archive Account', role: 'Dedicated account stores CloudTrail + Config logs with S3 Object Lock. SCPs prevent log deletion even by account admins. Separate from workload and security accounts' },
        { name: 'Security Account', role: 'GuardDuty delegated admin, Security Hub aggregator, AWS Config aggregator. Cross-account CloudWatch monitoring. Read-only access to all accounts via cross-account roles' },
        { name: 'AWS Config Aggregator', role: 'Aggregates Config compliance data from all accounts and regions. Single pane for compliance posture. Identifies non-compliant resources across the organization' },
        { name: 'EventBridge Cross-Account', role: 'Source accounts send events to central event bus in security account. Centralized alerting rules trigger SNS notifications and Lambda remediation' },
      ],
      dataFlow: [
        'All accounts: CloudTrail writes API events to Organization Trail → S3 in Log Archive account (immutable)',
        'All accounts: CloudWatch Logs subscription filter → cross-account log delivery → central CloudWatch',
        'Security account: CloudWatch cross-account observability pulls metrics/logs from all source accounts on demand',
        'All accounts: AWS Config records resource changes → Config Aggregator in Security account',
        'GuardDuty findings from all accounts → Security Hub in Security account → EventBridge → SNS alert + Lambda remediation',
      ],
      keyDecisions: [
        'Use Organization CloudTrail (not per-account trails) — automatic coverage of new accounts, tamper-resistant from workload accounts',
        'S3 Object Lock (Compliance mode) on log archive bucket — regulators require immutable audit logs',
        'CloudWatch cross-account observability for operational monitoring; cross-account CloudWatch alarms for automated response',
        'Config Aggregator pulls from all regions across all accounts — enable Config in all regions to catch regional resources',
      ],
      tradeoffs: [
        { pro: 'Security team visibility without direct access to workload accounts — separation of duties', con: 'Cross-account log delivery adds latency — not suitable for real-time alerting (use EventBridge cross-account for that)' },
        { pro: 'Tamper-resistant logs in dedicated archive account — attackers cannot delete CloudTrail even if they compromise a workload account', con: 'Requires careful IAM design — security account roles must be read-only to prevent security account compromise from impacting workloads' },
      ],
      examAngle: 'Centralized observability exam pattern: Organization CloudTrail to separate log archive account + Config Aggregator in security account + GuardDuty delegated admin. The management account should not be used for workloads or observability — it is privileged.',
    },
  ],
  subtopics: [
    {
      id: 'obs-cloudwatch',
      title: 'CloudWatch Deep Dive',
      sections: [
        {
          id: 'obs-cloudwatch-metrics',
          title: 'CloudWatch Metrics, Alarms & Dashboards',
          content: '**CloudWatch Metrics**: Time-series data points for AWS services and custom applications. Namespace (e.g., AWS/EC2), MetricName (CPUUtilization), Dimensions (InstanceId=i-123abc).\n\n**Default vs Detailed Monitoring**:\n- Default: 5-minute intervals, free\n- Detailed: 1-minute intervals, extra cost. Required for accurate ASG scaling decisions on fast-moving workloads.\n\n**Custom Metrics**: Applications publish via PutMetricData API. Standard resolution (1-minute granularity) or High Resolution (1-second granularity). Common: application response time, queue depth, business KPIs (orders/minute).\n\n**CloudWatch Alarms**: Evaluate metrics against thresholds. States: OK, ALARM, INSUFFICIENT_DATA. Actions: SNS notification, EC2 action (stop/reboot/recover), ASG scaling action. Composite Alarms: combine multiple alarms with AND/OR logic — reduce alert noise.\n\n**CloudWatch Anomaly Detection**: ML-based expected band based on historical metric patterns. Create alarms when metric deviates from expected band rather than fixed threshold. Adapts to cyclical patterns (daily/weekly).\n\n**CloudWatch Dashboards**: Cross-account, cross-region dashboards. Shared publicly or privately. Math expressions to calculate derived metrics (error rate = errors/requests × 100).\n\n**CloudWatch Container Insights**: Automatic metrics for ECS and EKS: CPU/memory/network at cluster/service/task level. Requires CloudWatch agent or ADOT collector on worker nodes. Prerequisite for ECS Service Auto Scaling on CPU/memory.\n\n**CloudWatch Synthetics**: Canary Lambda functions that run on a schedule to test endpoints. Monitor availability and latency. Creates CloudWatch metrics from canary runs. Use for blue/green deployment validation.',
          keyPoints: [
            { text: 'Default metrics are 5-minute. Detailed monitoring gives 1-minute — required for ASG to react quickly to CPU spikes', examTip: true },
            { text: 'Composite Alarms: combine multiple conditions (CPU AND disk) into one alarm — reduces duplicate alert noise', examTip: true },
            { text: 'CloudWatch Anomaly Detection adapts to time-of-day patterns — better than fixed thresholds for metrics with daily/weekly cycles', examTip: true },
            { text: 'Custom metrics are retained: 15 months total (3hrs for <60s resolution, 15 days for 1-min, 63 days for 5-min, 15 months for 1-hr aggregates)', examTip: true },
          ],
          bestPractices: [
            { pillar: 'operational-excellence', text: 'Create CloudWatch dashboards for each service with key operational metrics — CPU, memory, error rate, latency, throughput. Share dashboards with on-call engineers' },
            { pillar: 'reliability', text: 'Use Composite Alarms to create high-confidence alerts (CPU AND memory simultaneously abnormal) — reduces false positive pages that cause alert fatigue' },
            { pillar: 'cost-optimization', text: 'Enable detailed monitoring only on instances in ASGs where 5-minute resolution causes insufficient scaling responsiveness — detailed monitoring adds ~$0.01/hour per instance' },
          ],
        },
        {
          id: 'obs-cloudwatch-logs',
          title: 'CloudWatch Logs & Insights',
          content: '**CloudWatch Logs**: Centralized log management. Log Groups (per application/service), Log Streams (per instance/Lambda invocation). Configurable retention (1 day to 10 years). Export to S3 for long-term archival and Athena analysis.\n\n**Log Subscriptions**: Real-time streaming from CloudWatch Logs:\n- **Subscription Filters**: Pattern-matched streaming to Lambda (real-time processing), Kinesis Data Streams (buffered real-time), Kinesis Firehose (delivery to S3/OpenSearch)\n- **Cross-account log sharing**: Subscription destination in another account receives log events in near-real-time\n\n**CloudWatch Logs Insights**: Interactive query language for analyzing log data. Query multiple log groups simultaneously. Supports: `fields`, `filter`, `stats`, `sort`, `limit`, `parse`. NOT real-time — queries historical log data. Retention period applies — queries cannot go beyond retention window.\n\n**Common Logs Insights patterns**:\n- `filter @message like /ERROR/ | stats count(*) by bin(5m)` — error rate over time\n- `filter @type = "REPORT" | stats avg(@duration), max(@duration) by bin(5m)` — Lambda duration trends\n- `parse @message /Request took (?<latency>\\d+)ms/ | stats avg(latency) by bin(1h)` — custom field extraction\n\n**CloudWatch Logs Metric Filters**: Create CloudWatch Metrics from log patterns without a separate processing pipeline. Pattern match (e.g., count ERROR occurrences) → custom metric → alarm on threshold.\n\n**Embedded Metrics Format (EMF)**: Libraries for Lambda/ECS/EKS to emit structured log events that CloudWatch automatically extracts as custom metrics. Zero additional API calls — metrics embedded in log JSON.',
          keyPoints: [
            { text: 'Logs Insights is NOT real-time — it queries stored logs. Use Subscription Filter → Lambda for real-time log processing and alerting', gotcha: true },
            { text: 'Metric Filters: extract metrics from logs without a separate pipeline. Free tier: 5 metric filters per log group', examTip: true },
            { text: 'Cross-account subscription: centralize logs from all accounts into security/observability account for SIEM or centralized analysis', examTip: true },
            { text: 'Set log group retention policies — without retention setting, logs are kept forever (indefinite storage cost)', gotcha: true },
          ],
          bestPractices: [
            { pillar: 'cost-optimization', text: 'Set CloudWatch log retention to match your operational and compliance requirements — default is "never expire" which incurs indefinite storage costs' },
            { pillar: 'operational-excellence', text: 'Use Embedded Metrics Format for Lambda functions — emits structured metrics within log lines at zero additional API cost, enabling custom CloudWatch metrics without PutMetricData calls' },
            { pillar: 'security', text: 'Configure subscription filter from application log groups to Kinesis → Firehose → S3 for long-term archival beyond CloudWatch retention — enables forensic analysis years after an incident' },
          ],
        },
      ],
    },
    {
      id: 'obs-cloudtrail-config',
      title: 'CloudTrail & AWS Config',
      sections: [
        {
          id: 'obs-cloudtrail',
          title: 'CloudTrail Audit Logging',
          content: '**AWS CloudTrail**: Records every AWS API call made in your account — who made it, when, from where, with what parameters, and what the response was. Essential for security investigation, compliance, and change tracking.\n\n**Event types**:\n- **Management Events (Control Plane)**: Create/delete/modify API calls (RunInstances, CreateBucket, DeleteSecurityGroup). Logged by default. One free copy per region per account. Additional trails cost.\n- **Data Events**: Object-level S3 operations (GetObject, PutObject), Lambda function invocations, DynamoDB item-level actions. NOT logged by default — explicitly enable. Significant cost at high volume. Selectively enable for sensitive buckets/functions.\n- **Insights Events**: Detect unusual API call rates or error rates using ML. Extra cost. Alerts on significant deviations from baseline.\n\n**CloudTrail Trail**: Delivers event logs to S3 (JSON format, gzipped). Optional: forward to CloudWatch Logs for real-time alerting. Multi-region trail: captures all regions with single configuration. Organization trail: captures all member accounts automatically.\n\n**Log file integrity**: SHA-256 digest files validate that log files haven\'t been tampered with since delivery. Validate with `aws cloudtrail validate-logs` CLI command.\n\n**CloudTrail Lake**: Managed data lake for CloudTrail events. SQL-based querying without S3+Athena setup. Retention up to 7 years. Faster queries than Athena for event investigation. Use for incident response and compliance reporting.',
          keyPoints: [
            { text: 'CloudTrail data events are NOT enabled by default — S3 GetObject and Lambda invocations require explicit enablement. Common exam gotcha for incident investigation scenarios', gotcha: true },
            { text: 'Management events: one free copy per region. Second trail in same region costs money. Organization trail is a single management-account configuration for all accounts', examTip: true },
            { text: 'CloudTrail Lake: SQL queries on CloudTrail events without Athena setup. Up to 7-year retention. Better for interactive security investigation', examTip: true },
            { text: 'Log file integrity validation uses SHA-256 digest chain — detect if log files were deleted or modified after delivery to S3', examTip: true },
          ],
          bestPractices: [
            { pillar: 'security', text: 'Create an Organization CloudTrail from the management account — automatically captures all current and future member account activity without per-account configuration' },
            { pillar: 'security', text: 'Enable CloudTrail data events for S3 buckets containing PII or compliance data — required to answer "who accessed this object?" during incident investigation' },
            { pillar: 'reliability', text: 'Deliver CloudTrail to S3 with Object Lock (Compliance mode) in a dedicated log archive account — prevents log tampering even by privileged users' },
            { pillar: 'operational-excellence', text: 'Create CloudWatch Metrics Filters on CloudTrail logs for: root account usage, failed console logins, security group changes, MFA device changes — alert immediately on suspicious activity' },
          ],
        },
        {
          id: 'obs-config',
          title: 'AWS Config & Compliance',
          content: '**AWS Config**: Continuous recording of AWS resource configuration changes. Answers: "What did this resource look like at 2pm last Tuesday?" and "Is this resource compliant with our policies?"\n\n**Configuration Recorder**: Records configuration changes for specified resource types. Delivers to S3 (configuration history) and SNS (configuration stream for real-time notification). Enabled per region.\n\n**Config Rules**: Evaluate resources against desired configurations. Two types:\n- **AWS Managed Rules**: 300+ pre-built rules (e.g., `s3-bucket-ssl-requests-only`, `ec2-instances-in-vpc`, `iam-root-access-key-check`, `encrypted-volumes`)\n- **Custom Rules**: Lambda function that evaluates config changes. Run on configuration change or periodically.\n\n**Remediation**: Automated or manual remediation of non-compliant resources via SSM Automation documents. Example: `encrypted-volumes` rule → auto-remediation creates encrypted snapshot and replaces unencrypted volume.\n\n**Config Aggregator**: Collects compliance data from multiple accounts and regions. View organization-wide compliance posture from a single account. Use with Security Hub for consolidated findings.\n\n**CloudTrail vs Config**:\n- CloudTrail: WHO did WHAT API call at WHAT TIME (actions)\n- Config: WHAT does this resource\'s configuration look like NOW and HISTORICALLY (state)\n- Use together: Config shows resource changed (what changed), CloudTrail shows who made the change\n\n**Config Conformance Packs**: Collection of Config rules and remediation actions as YAML templates. AWS provides pre-built conformance packs for CIS AWS Foundations, HIPAA, PCI DSS, NIST 800-53.',
          keyPoints: [
            { text: 'CloudTrail = API call audit (actions). Config = resource configuration history (state). Both needed for complete change investigation', examTip: true },
            { text: 'Config Aggregator collects compliance across all accounts in an Organization — use delegated admin in Security account for centralized view', examTip: true },
            { text: 'Config Rules are preventative guardrails (post-deploy) not preventative controls — they detect non-compliance after the fact. Use SCPs for true prevention', gotcha: true },
            { text: 'Conformance Packs: pre-packaged compliance frameworks (CIS/PCI/HIPAA) as Config rules with automated remediation — significantly accelerates compliance posture', examTip: true },
          ],
        },
      ],
    },
    {
      id: 'obs-xray',
      title: 'X-Ray Distributed Tracing',
      sections: [
        {
          id: 'obs-xray-deep',
          title: 'AWS X-Ray Tracing',
          content: '**AWS X-Ray**: Distributed tracing for microservices and serverless applications. Traces requests as they flow through Lambda, API Gateway, ECS, EC2, DynamoDB, SQS, and more.\n\n**Core concepts**:\n- **Trace**: Complete end-to-end record of a request across all services. Contains one or more segments.\n- **Segment**: Work done by a single service. Contains subsegments for external calls, SQL queries, etc.\n- **Subsegment**: Granular breakdown within a segment (DynamoDB GetItem call, HTTP call to external API).\n- **Annotation**: Key-value pairs indexed for filtering in X-Ray console. Searchable. Max 50 per trace.\n- **Metadata**: Key-value pairs NOT indexed — additional context for debugging. Not searchable.\n\n**X-Ray Sampling**: By default, records first request each second + 5% of additional requests. Custom sampling rules: target specific paths (record all /checkout requests), increase rate for error conditions. Balances visibility vs cost.\n\n**X-Ray Service Map**: Visual representation of all services, dependencies, latency, and error rates. Identify bottlenecks and failing components at a glance.\n\n**Integration**:\n- **Lambda**: Enable Active Tracing in function configuration. X-Ray daemon runs alongside Lambda. Automatically traces Lambda invocations.\n- **API Gateway**: Enable X-Ray tracing on stage. Traces requests from API Gateway through Lambda.\n- **ECS/EC2**: Run X-Ray daemon as sidecar container or EC2 process. SDK instruments application code.\n\n**X-Ray Groups**: Filter traces by criteria into named groups. Create CloudWatch metrics for each group. Example: group "slow requests" = duration > 2s → CloudWatch alarm.',
          keyPoints: [
            { text: 'X-Ray Annotations: indexed, searchable (filter by user ID, order ID). Metadata: not indexed, for debugging context only', examTip: true },
            { text: 'X-Ray sampling: captures 1 req/s + 5% by default. High-traffic APIs need custom sampling rules to control cost', examTip: true },
            { text: 'Enable X-Ray Active Tracing on Lambda — trace propagates through downstream Lambda invocations, SQS, and DynamoDB calls automatically', examTip: true },
          ],
          bestPractices: [
            { pillar: 'operational-excellence', text: 'Add X-Ray annotations for key business identifiers (userId, orderId, requestId) — enables filtering traces by customer or order for support investigations' },
            { pillar: 'performance', text: 'Use X-Ray Service Map to identify P99 latency outliers and bottleneck services — prioritizes optimization efforts on the actual slow path rather than assumed bottlenecks' },
            { pillar: 'cost-optimization', text: 'Configure custom X-Ray sampling rules: 100% sampling for errors/faults, reduced rate for successful requests. Balance observability coverage with trace storage costs' },
          ],
        },
      ],
    },
  ],
};
