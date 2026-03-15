import type { Topic } from '../../types/topic';

export const messagingTopic: Topic = {
  id: 'messaging',
  slug: 'messaging',
  title: 'Messaging: SQS, SNS, EventBridge & Kinesis',
  shortTitle: 'Messaging',
  icon: 'MessageSquare',
  color: 'pink',
  examDomains: ['new-solutions', 'continuous-improvement'],
  estimatedStudyHours: 5,
  summaryBullets: [
    'SQS Standard: at-least-once, best-effort order. FIFO: exactly-once, strict order, 3,000 msg/s (batching)',
    'SNS fan-out: one publish → multiple subscribers (SQS, Lambda, HTTP, email, SMS, Kinesis)',
    'Kinesis Data Streams: real-time, ordered per shard, 1MB/s write, 2MB/s read per shard',
    'Kinesis Firehose: fully managed ETL to S3/Redshift/OpenSearch — no consumer code needed',
    'SQS visibility timeout >= Lambda timeout — prevents duplicate processing during execution',
  ],
  relatedTopics: ['serverless', 'databases', 'compute'],
  solutionArchitectures: [
    {
      id: 'msg-arch-fanout',
      title: 'SNS Fan-Out with SQS Subscribers',
      description: 'SNS topic publishes one message to multiple SQS queues simultaneously. Each queue independently processes the message at its own pace. Provides decoupling, durability, and independent scaling per subscriber.',
      useCase: 'Order processing: one order event triggers inventory update, payment processing, email notification, and analytics — all independently and durably',
      components: [
        { name: 'SNS Topic', role: 'Receives the published event once. Fans out to all subscribers simultaneously. Supports filtering so each SQS queue only receives relevant events' },
        { name: 'SQS Queue (per subscriber)', role: 'Buffers messages for each consumer. Provides durability (messages retained up to 14 days), backpressure, and independent processing rate per consumer' },
        { name: 'Lambda / Consumer', role: 'Each queue has an independent Lambda or application consumer. Processes at its own pace without affecting other consumers' },
        { name: 'SNS Filter Policies', role: 'Attribute-based filtering on the subscription — Inventory queue only receives order.created, Refund queue only receives order.cancelled. Reduces unnecessary message delivery' },
        { name: 'SQS DLQ', role: 'Each SQS queue has a DLQ — failed messages after N retries go here. CloudWatch alarm on DLQ depth for alerting' },
      ],
      dataFlow: [
        'Producer publishes ONE message to SNS topic with message attributes (e.g., eventType=order.created)',
        'SNS evaluates filter policies for each subscription → delivers to matching SQS queues only',
        'Each SQS queue receives independent copy of the message → stored durably',
        'Lambda A (inventory) polls its SQS queue → processes → deletes message on success',
        'Lambda B (email) polls its SQS queue → processes at its own rate independently of Lambda A',
        'On Lambda failure: message returns to SQS after visibility timeout → retried N times → sent to DLQ',
      ],
      keyDecisions: [
        'SNS + SQS (not SNS direct to Lambda) — SQS provides buffering and retry; direct SNS→Lambda fails immediately on Lambda throttle',
        'SNS filter policies per subscription — avoids consumers receiving and discarding irrelevant events',
        'Set SQS visibility timeout = 6× Lambda timeout to prevent duplicate processing',
        'Enable raw message delivery on SNS→SQS if consumer processes the raw message body (not SNS envelope)',
      ],
      tradeoffs: [
        { pro: 'Subscribers are fully decoupled — adding new subscriber requires only adding SQS subscription, no producer changes', con: 'Each SQS subscription costs separately — high volume fan-out to many queues can be costly' },
        { pro: 'Each subscriber processes at its own rate — fast consumers don\'t starve slow ones', con: 'At-least-once delivery from SQS — consumers must be idempotent' },
      ],
      examAngle: 'SNS → SQS fan-out is the classic "one event, multiple consumers, decoupled" pattern. Key exam distinction: SNS direct→Lambda for real-time low-latency; SNS→SQS→Lambda for durability and retry. EventBridge replaces SNS for more complex routing rules and multi-account fan-out.',
    },
    {
      id: 'msg-arch-kinesis-pipeline',
      title: 'Real-Time Analytics Pipeline with Kinesis',
      description: 'Ingests high-volume streaming data (clickstream, IoT sensors, application logs) into Kinesis Data Streams for real-time processing, then fans out to Kinesis Firehose for durable storage and downstream analytics.',
      useCase: 'Real-time dashboards, fraud detection, IoT telemetry processing, clickstream analytics — any scenario requiring processing of streaming data at scale with sub-second latency',
      components: [
        { name: 'Kinesis Data Streams', role: 'Ordered, durable stream. Partitioned by shard (1MB/s in, 2MB/s out per shard). Retention 24hr-365 days. Multiple independent consumers via Enhanced Fan-Out' },
        { name: 'Lambda (real-time)', role: 'Processes records in micro-batches from Kinesis. Parallelization factor up to 10 per shard for higher throughput. Real-time enrichment, filtering, anomaly detection' },
        { name: 'Kinesis Data Analytics (Flink)', role: 'SQL or Apache Flink application for stateful stream processing — windowed aggregations, joins across streams, complex event patterns' },
        { name: 'Kinesis Firehose', role: 'Reads from Kinesis Data Streams (or accepts direct PUT). Buffers and delivers to S3 (Parquet/ORC conversion), Redshift, OpenSearch. No consumer code needed' },
        { name: 'S3 + Athena', role: 'Firehose delivers to S3 in partitioned format. Athena queries S3 directly for historical analysis and ad-hoc queries without a database' },
        { name: 'CloudWatch Dashboard', role: 'Real-time metrics from Lambda and Kinesis Analytics for operational visibility. Custom metrics from processed records' },
      ],
      dataFlow: [
        'Producers (mobile apps, IoT devices, servers) → PUT records into Kinesis Data Streams with partition key',
        'Kinesis routes records to shards based on partition key hash — same key always goes to same shard (ordering)',
        'Lambda Enhanced Fan-Out: dedicated 2MB/s throughput per shard per consumer — low latency real-time processing',
        'Lambda processes records → writes enriched data to DynamoDB (hot storage) and publishes alerts to SNS',
        'Kinesis Analytics Flink: reads same stream → windowed aggregations → writes to Redshift for dashboards',
        'Kinesis Firehose: reads stream → buffers (1-15 min or 1-128MB) → converts to Parquet → delivers to S3',
      ],
      keyDecisions: [
        'Partition key design: high cardinality to distribute load across shards. Low cardinality causes hot shards',
        'Enhanced Fan-Out for Lambda consumers needing <200ms latency vs standard GetRecords (polling, shared 2MB/s per shard)',
        'Shard count = max(ingest rate / 1MB/s, peak consumer rate / 2MB/s) — shard splitting/merging for elasticity',
        'Kinesis Firehose with dynamic partitioning for S3 to partition data by date/customer for Athena query efficiency',
      ],
      tradeoffs: [
        { pro: 'Ordered processing per partition key — critical for event sequencing (user session events)', con: 'Shard management required — must monitor for hot shards and scale manually (or via auto-scaling)' },
        { pro: 'Multiple independent consumers via Enhanced Fan-Out without impacting each other\'s throughput', con: 'Retention cost for long-term storage in Kinesis — Firehose to S3 is cheaper for archival' },
      ],
      examAngle: 'Kinesis Data Streams for real-time processing with ordering guarantees. Kinesis Firehose for managed ETL delivery to S3/Redshift/OpenSearch without consumer code. SQS for task queue decoupling. Key distinction: Kinesis = ordered streaming, multiple consumers; SQS = point-to-point queue, message deleted after consumption.',
    },
  ],
  subtopics: [
    {
      id: 'msg-sqs',
      title: 'SQS Deep Dive',
      sections: [
        {
          id: 'msg-sqs-types',
          title: 'SQS Standard vs FIFO',
          content: '**SQS Standard Queue**: Unlimited throughput. At-least-once delivery (rare duplicate messages possible). Best-effort ordering (not guaranteed). 14-day retention. Up to 256 KB per message. Use for: high-throughput decoupling where exact-once or ordering not critical.\n\n**SQS FIFO Queue**: Exactly-once processing. Strict ordering within a message group (MessageGroupId). Throughput: 3,000 messages/s with batching, 300 msg/s without batching. Deduplication via MessageDeduplicationId (5-minute deduplication window). Queue name must end with `.fifo`. Use for: financial transactions, order processing, anything requiring guaranteed ordering.\n\n**Key SQS settings**:\n- **Visibility Timeout**: Time a message is hidden from other consumers while being processed. If consumer fails to delete within this window, message becomes visible again. Default 30s, max 12 hours. For Lambda: must be >= 6× Lambda timeout.\n- **Message Retention**: 1 minute to 14 days (default 4 days).\n- **Delay Queue**: Delay initial delivery of new messages (0-900 seconds). Per-queue or per-message (MessageDelay attribute).\n- **Dead Letter Queue (DLQ)**: After maxReceiveCount failures, message moved to DLQ. Separate queue for failed message analysis. DLQ for FIFO must also be FIFO.\n- **Long Polling**: Consumer waits up to 20 seconds for messages to arrive before returning empty response. Reduces empty responses, lowers cost. Always prefer over short polling.\n\n**SQS + Lambda**: Lambda polls SQS and processes in batches. Key settings: batch size (1-10,000), batch window (accumulate messages up to N seconds), bisect-on-error (split batch in half to isolate failing message), partial batch failure reporting (report specific failed items for retry).\n\n**Extended Client Library**: For messages exceeding 256 KB, store payload in S3 and send S3 reference in SQS message. Supports up to 2 GB payload.',
          keyPoints: [
            { text: 'SQS Standard: at-least-once (may duplicate), best-effort order. FIFO: exactly-once, strict order within MessageGroupId', examTip: true },
            { text: 'Visibility timeout must be >= 6× Lambda timeout — Lambda needs time to process before the message reappears', gotcha: true },
            { text: 'FIFO deduplication window = 5 minutes. ContentBasedDeduplication hashes the body automatically', examTip: true },
            { text: 'Long polling (WaitTimeSeconds=20) reduces cost vs short polling — always use long polling in production', examTip: true },
            { text: 'DLQ redrive: send messages back from DLQ to source queue for re-processing after fixing consumer bug', examTip: true },
          ],
          bestPractices: [
            { pillar: 'reliability', text: 'Configure DLQ on all production SQS queues with CloudWatch alarm on DLQ ApproximateNumberOfMessages > 0 — detect consumer failures immediately' },
            { pillar: 'reliability', text: 'Design SQS consumers to be idempotent — Standard queues can deliver the same message more than once; idempotent processing prevents side effects on duplicates' },
            { pillar: 'cost-optimization', text: 'Use long polling (WaitTimeSeconds=20) instead of short polling — reduces empty ReceiveMessage API calls by up to 95% for low-traffic queues' },
            { pillar: 'operational-excellence', text: 'Use partial batch failure reporting with Lambda SQS trigger — report specific failed item identifiers so only failed messages retry, not the entire batch' },
          ],
          useCases: [
            {
              scenario: 'An order processing Lambda reads from a Standard SQS queue. Occasionally, messages are processed twice, causing duplicate order confirmations to customers.',
              wrongChoices: ['Switch to FIFO queue — ordering is not the issue, duplicates are still possible with at-least-once delivery', 'Increase visibility timeout — doesn\'t prevent duplicate delivery from Standard queue behavior'],
              correctChoice: 'Make the Lambda idempotent: check DynamoDB for existing order record before processing. Use conditional writes (if not exists) to prevent duplicate order creation. Standard queue duplicates are by design — idempotency is the correct mitigation.',
              reasoning: 'SQS Standard queues can deliver messages more than once by design for maximum throughput. The solution is consumer idempotency (check-before-act), not queue type. FIFO prevents duplicates but limits throughput to 3,000 msg/s.',
            },
          ],
          comparisons: [
            {
              headers: ['Feature', 'SQS Standard', 'SQS FIFO'],
              rows: [
                ['Throughput', 'Unlimited', '3,000 msg/s (batching), 300 (no batch)'],
                ['Delivery', 'At-least-once', 'Exactly-once'],
                ['Ordering', 'Best-effort', 'Strict (per MessageGroupId)'],
                ['Deduplication', 'None', '5-minute window'],
                ['Use case', 'High throughput, idempotent consumers', 'Financial, order processing, exact-once critical'],
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'msg-sns',
      title: 'SNS & Fan-Out Patterns',
      sections: [
        {
          id: 'msg-sns-deep',
          title: 'SNS Architecture',
          content: '**Amazon SNS**: Pub/Sub messaging service. Publisher sends message to a Topic. SNS delivers to all subscribers in parallel. Push-based (unlike SQS pull).\n\n**Supported subscriber types**: SQS queues, Lambda functions, HTTP/HTTPS endpoints, Email/Email-JSON, SMS (mobile text), Platform Application (mobile push: APNs, GCM/FCM), Kinesis Data Firehose.\n\n**SNS Message Filtering**: JSON-based filter policy applied to subscription. SNS only delivers messages matching the filter to that subscriber. Based on message attributes. Reduces subscriber processing of irrelevant messages. Example: order.type=PRIORITY → premium queue, order.type=STANDARD → standard queue.\n\n**SNS FIFO Topics**: Strict ordering, exactly-once delivery. Subscribers must be SQS FIFO queues. Supports message deduplication. Use for: ordered fan-out to multiple systems.\n\n**SNS message size**: Up to 256 KB. Use Extended Client Library for S3-backed large messages.\n\n**Cross-account SNS**: Add a resource policy to the SNS topic allowing another account to publish or subscribe. Used for centralized event bus pattern across multiple AWS accounts.\n\n**SNS + SQS Fan-Out**: Classic pattern. Publish once to SNS → multiple SQS queues receive the message. Each SQS queue processes independently. SQS provides durability and retry. Better than SNS direct to Lambda for resilient processing.\n\n**Mobile Push Notifications**: SNS sends directly to platform endpoints (APNs for iOS, FCM for Android). Can send to millions of devices with a single API call. Platform Application manages device tokens.',
          keyPoints: [
            { text: 'SNS fan-out to SQS is preferred over SNS to Lambda for resilient processing — SQS absorbs Lambda throttles and provides retry', examTip: true },
            { text: 'SNS filter policies: subscription-level filtering so each subscriber only receives relevant messages — reduces noise and processing cost', examTip: true },
            { text: 'SNS FIFO → SQS FIFO for ordered fan-out. Standard SNS → Standard SQS for unordered high-throughput fan-out', examTip: true },
            { text: 'SNS raw message delivery: delivers the original message body without SNS envelope — enable when SQS consumer doesn\'t need SNS metadata', examTip: true },
          ],
        },
      ],
    },
    {
      id: 'msg-kinesis',
      title: 'Kinesis Data Streams & Firehose',
      sections: [
        {
          id: 'msg-kinesis-streams',
          title: 'Kinesis Data Streams vs Firehose',
          content: '**Kinesis Data Streams**: Managed streaming data service. Records ordered within a shard. Multiple consumers can read the same records. Records retained 24 hours (default) to 365 days. Producers: Kinesis SDK, Kinesis Agent, CloudWatch Logs, AWS IoT, Amazon MSK.\n\n**Shard capacity**: 1 MB/s or 1,000 records/s write per shard. 2 MB/s read per shard (shared across all standard consumers). Enhanced Fan-Out: dedicated 2 MB/s per shard per registered consumer (push-based, low latency ~70ms).\n\n**Kinesis vs SQS**:\n- Kinesis: ordered per partition key, multiple consumers read same data, data stays in stream for retention period\n- SQS: unordered (Standard) or FIFO, message deleted after consumption, single logical consumer\n\n**Kinesis Data Firehose**: Fully managed data delivery service. Consumes from Kinesis Data Streams, MSK, or directly via PUT API. Buffers data, optionally transforms via Lambda, delivers to: S3, Redshift, OpenSearch, HTTP endpoint, Splunk. No consumer code needed. Not real-time — buffered delivery (60s minimum buffer interval).\n\n**Kinesis Data Analytics (Managed Service for Apache Flink)**: Run Apache Flink applications or SQL queries against streaming data. Stateful processing: windowed aggregations, stream joins, complex event processing. Reads from Kinesis Data Streams or MSK.\n\n**Partition Key design**: Determines which shard a record goes to (MD5 hash of key). Good: high cardinality (userId, deviceId). Bad: low cardinality (region with 3 values → only 3 effective shards). Hot shard detection: monitor GetRecords.IteratorAgeMilliseconds per shard — if high, that shard is overloaded.\n\n**Resharding**: Split shard (increase capacity) or merge shards (reduce cost). Takes a few minutes. Cannot split/merge same shard twice within 30 seconds. Use Kinesis Scaling Utilities (Lambda-based auto-scaling) for automated resharding.',
          keyPoints: [
            { text: 'Kinesis: ordered per shard, multiple consumers, data retained and re-readable. SQS: consumed once, deleted after processing', examTip: true },
            { text: 'Enhanced Fan-Out: 2 MB/s dedicated throughput per consumer per shard — eliminates consumer throttling in high-fan-out scenarios', examTip: true },
            { text: 'Kinesis Firehose is NOT real-time — minimum 60-second buffer interval. Use Kinesis Data Streams + Lambda for sub-second processing', gotcha: true },
            { text: 'Partition key determines shard assignment — low cardinality keys cause hot shards. Use random suffix if ordering not required', gotcha: true },
          ],
          bestPractices: [
            { pillar: 'performance', text: 'Use Enhanced Fan-Out for Lambda consumers that need low latency — standard polling has ~5s average latency vs ~70ms with EFO push delivery' },
            { pillar: 'reliability', text: 'Monitor IteratorAgeMilliseconds per shard — high values indicate consumer lag. Alert and scale consumers or add shards before the retention window expires' },
            { pillar: 'cost-optimization', text: 'Use Kinesis Firehose for archival delivery to S3 — no consumer code, automatic format conversion (JSON to Parquet), dynamic partitioning. Cheaper than running custom consumers for delivery only' },
            { pillar: 'operational-excellence', text: 'Use bisect-on-error for Lambda Kinesis triggers — on batch failure, split batch in half to isolate and skip the poison-pill record causing repeated failures' },
          ],
          comparisons: [
            {
              headers: ['Feature', 'SQS', 'Kinesis Data Streams', 'Kinesis Firehose'],
              rows: [
                ['Ordering', 'FIFO (limited) or none', 'Per shard (partition key)', 'N/A (delivery service)'],
                ['Consumer model', 'Pull (delete on consume)', 'Pull/push (data persists)', 'Managed (no code needed)'],
                ['Multiple consumers', 'No (one logical consumer)', 'Yes (multiple independent)', 'No (one destination per stream)'],
                ['Latency', 'Near real-time', 'Real-time (~70ms EFO)', '60s minimum buffer'],
                ['Retention', '1min - 14 days', '24hr - 365 days', 'N/A (delivery only)'],
                ['Use case', 'Task queue, decoupling', 'Real-time analytics, ML', 'ETL to S3/Redshift/OpenSearch'],
              ],
            },
          ],
        },
      ],
    },
  ],
};
