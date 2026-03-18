import type { Question } from './index';

export const mlQuestions: Question[] = [
  {
    id: 'ml-001',
    stem: 'A company wants to add product recommendation functionality to their e-commerce platform without building a custom ML model. They have 2 years of user purchase history and browsing data stored in S3. The recommendations should personalize in real time as users browse. Which AWS service requires the least ML expertise to implement?',
    type: 'single',
    difficulty: 1,
    topicSlug: 'ml',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Amazon Personalize with user-item interaction dataset and real-time campaign', correct: true, explanation: 'Amazon Personalize is a fully managed service that builds, trains, and deploys recommendation models without requiring ML expertise. Import interaction data, train a solution, deploy a campaign, and call the GetRecommendations API for real-time personalized recommendations.' },
      { id: 'b', text: 'Amazon SageMaker with a custom collaborative filtering model built from scratch', correct: false, explanation: 'Building a custom collaborative filtering model requires ML expertise for model selection, training, hyperparameter tuning, and deployment. Amazon Personalize abstracts all this complexity with pre-built algorithms.' },
      { id: 'c', text: 'Amazon Rekognition to analyze product images and recommend visually similar items', correct: false, explanation: 'Rekognition analyzes images for objects, faces, and labels. It cannot create personalized recommendations based on user purchase history. Image similarity is a different use case from purchase-based personalization.' },
      { id: 'd', text: 'AWS Glue ML Transforms with FindMatches for similar product identification', correct: false, explanation: 'Glue ML Transforms (FindMatches) is for deduplication and entity matching in data integration pipelines, not for user personalization or product recommendations.' }
    ],
    explanation: {
      overall: 'Amazon Personalize is AWS\'s fully managed personalization service. It uses the same technology as Amazon.com\'s recommendation engine. Steps: (1) Create dataset group and import historical interaction data (user ID, item ID, timestamp, event type). (2) Train a solution (algorithm + hyperparameters automatically selected). (3) Deploy a campaign (real-time endpoint). (4) Call GetRecommendations or GetPersonalizedRanking API. No ML expertise required — just data ingestion and API calls.',
      examTip: 'Amazon Personalize use cases: user-personalized recommendations, similar items, trending items, personalized ranking of a list. Recipe types: USER_PERSONALIZATION (recommended items for a user), RELATED_ITEMS (similar items), USER_SEGMENTATION. Real-time events: PutEvents API adds real-time interactions during active session, updating recommendations dynamically. Batch recommendations: CreateBatchInferenceJob for offline recommendation generation for all users.'
    },
    tags: ['personalize', 'recommendations', 'machine-learning', 'managed-ml', 'ecommerce']
  },
  {
    id: 'ml-002',
    stem: 'A financial services company needs to detect fraudulent transactions in real time. Their data science team has built a custom XGBoost model trained on historical transaction data. The model must respond in under 50ms and handle 10,000 transactions per second at peak. Which SageMaker deployment option meets these requirements?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'ml',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'SageMaker real-time endpoint with auto-scaling and c5.2xlarge instance type', correct: true, explanation: 'SageMaker real-time endpoints provide synchronous inference with <50ms latency (typically 10-30ms for XGBoost). Auto-scaling adjusts instance count based on requests/second. c5.2xlarge provides high CPU performance suitable for XGBoost inference.' },
      { id: 'b', text: 'SageMaker Serverless Inference with configured concurrency limits', correct: false, explanation: 'Serverless inference has cold start latency (hundreds of milliseconds for cold invocations) that violates the <50ms requirement. It is suitable for intermittent traffic but not high-throughput, latency-sensitive workloads.' },
      { id: 'c', text: 'SageMaker Batch Transform processing transaction batches every minute', correct: false, explanation: 'Batch Transform processes data offline in S3 files. It cannot provide real-time responses — a 1-minute batch interval has far too high latency for real-time fraud detection.' },
      { id: 'd', text: 'SageMaker Asynchronous Inference with SQS queue for high throughput', correct: false, explanation: 'Asynchronous inference queues requests and processes them asynchronously — not suitable for real-time use cases requiring immediate responses. It is designed for large payloads or long-running inference tasks.' }
    ],
    explanation: {
      overall: 'SageMaker real-time endpoints are synchronous HTTP endpoints that return predictions immediately. For 10,000 TPS at <50ms: (1) Deploy on compute-optimized instances (c5/c6i series for CPU-based XGBoost). (2) Configure auto-scaling with target tracking on InvocationsPerInstance metric. (3) Use multi-model endpoints if needed to serve multiple models. (4) Enable endpoint variant weighting for A/B testing. SageMaker Inference Recommender can automatically test multiple instance types to find the optimal cost/performance configuration.',
      examTip: 'SageMaker inference types: Real-time = synchronous, low latency (<100ms typically), auto-scaling, always-on (billed per hour). Serverless = on-demand, cold starts, pay-per-request, max 6 GB memory. Asynchronous = SQS-based, for large payloads (up to 1 GB) or long inference (up to 15 min). Batch Transform = offline S3-to-S3, no endpoint. For latency-sensitive production ML: always use real-time endpoints with auto-scaling. Provisioned Concurrency on Serverless eliminates cold starts but adds cost.'
    },
    tags: ['sagemaker', 'real-time-endpoint', 'inference', 'auto-scaling', 'fraud-detection']
  },
  {
    id: 'ml-003',
    stem: 'A development team wants to add natural language understanding to their customer service chatbot. The chatbot should understand user intent (e.g., "I want to return my order" → RETURN_INTENT) and extract entities (order ID, product name). They want a managed service without training custom NLP models. Which AWS service fits best?',
    type: 'single',
    difficulty: 1,
    topicSlug: 'ml',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Amazon Lex with intent definitions and slot types for entity extraction', correct: true, explanation: 'Amazon Lex is a managed conversational AI service using the same technology as Alexa. It handles intent recognition (user wants to return → RETURN_INTENT), entity extraction (slot filling: order ID, product name), and dialog management without ML model training.' },
      { id: 'b', text: 'Amazon Comprehend for intent classification and entity detection in chat messages', correct: false, explanation: 'Amazon Comprehend is a general NLP service for text analysis (sentiment, entities, key phrases, syntax, custom classifiers). It does not provide dialog management, slot filling, or conversational flow management needed for a chatbot.' },
      { id: 'c', text: 'Amazon Kendra for semantic search of customer service knowledge base', correct: false, explanation: 'Kendra is an enterprise search service that finds relevant documents/answers from knowledge bases. It does not handle conversational intent recognition or entity extraction for interactive chatbots.' },
      { id: 'd', text: 'AWS SageMaker with a custom BERT model fine-tuned on customer service conversations', correct: false, explanation: 'A custom BERT model requires labeled training data, fine-tuning infrastructure, and ongoing maintenance. Amazon Lex provides intent recognition without requiring ML model development.' }
    ],
    explanation: {
      overall: 'Amazon Lex builds conversational interfaces (chatbots, voice bots). Core concepts: Intents (what the user wants to do: RETURN_ORDER, CHECK_STATUS), Slots (entities to collect: order_id, product_name, return_reason), Utterances (sample phrases that trigger intents: "I want to return..." → RETURN_ORDER). Lex handles multi-turn dialog to collect all required slot values. Integration with Lambda for business logic (verify order, process return). Connect to channels (web, mobile, Alexa, Contact Center).',
      examTip: 'Lex vs Comprehend: Lex = conversational AI (intents, slots, dialog management, chatbots). Comprehend = text analytics (sentiment, entities, topics, custom classification). For building a chatbot: Lex. For analyzing text at scale (customer reviews, support tickets): Comprehend. Lex integrates with Amazon Connect (contact center), Slack, Facebook Messenger. Lambda hook: invoked at slot validation and fulfillment stages for custom business logic.'
    },
    tags: ['lex', 'chatbot', 'intent-recognition', 'nlu', 'conversational-ai']
  },
  {
    id: 'ml-004',
    stem: 'A company processes thousands of invoices, contracts, and forms daily. They need to automatically extract text, tables, and key-value pairs (e.g., "Invoice Date: 2024-01-15") from scanned PDF documents without building a custom OCR solution. Which AWS service is most appropriate?',
    type: 'single',
    difficulty: 1,
    topicSlug: 'ml',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Amazon Textract with AnalyzeDocument API for table and form extraction', correct: true, explanation: 'Textract extracts text, tables (preserving rows/columns), and key-value pairs from scanned documents and PDFs. AnalyzeDocument supports FORMS (key-value pairs) and TABLES (structured data) feature types in addition to raw text.' },
      { id: 'b', text: 'Amazon Rekognition DetectText for extracting text from document images', correct: false, explanation: 'Rekognition DetectText finds text in natural scenes (signs, labels in photos). It does not extract structured data like tables and key-value pairs from documents and forms.' },
      { id: 'c', text: 'Amazon Comprehend for named entity recognition to extract structured information', correct: false, explanation: 'Comprehend performs NLP analysis on already-extracted text. It does not perform OCR or extract text from images/PDFs. Textract extracts the text; Comprehend analyzes it.' },
      { id: 'd', text: 'AWS Lambda with Tesseract OCR library for custom document processing', correct: false, explanation: 'Tesseract is open-source OCR that can run in Lambda, but building a custom solution requires significant engineering effort and lacks Textract\'s managed table/form extraction capabilities.' }
    ],
    explanation: {
      overall: 'Amazon Textract goes beyond basic OCR (Optical Character Recognition) to understand document structure: (1) DetectDocumentText — raw text extraction. (2) AnalyzeDocument with FORMS — extracts key-value pairs (form fields and values). (3) AnalyzeDocument with TABLES — extracts table data preserving rows and columns. (4) AnalyzeDocument with SIGNATURES — detects signatures. For invoices: use FORMS to extract Invoice Date, Amount, Vendor; TABLES for line items. Textract supports JPEG, PNG, PDF, TIFF.',
      examTip: 'Textract vs Rekognition: Textract = document intelligence (OCR + structure). Rekognition = image analysis (objects, faces, scenes, labels). Textract use cases: invoices, contracts, medical forms, ID documents (with AnalyzeID), expense reports (with AnalyzeExpense). Amazon A2I (Augmented AI) integrates with Textract for human review of low-confidence extractions. For high-volume async processing: StartDocumentAnalysis → GetDocumentAnalysis (async Textract API for large documents).'
    },
    tags: ['textract', 'document-processing', 'ocr', 'form-extraction', 'intelligent-document']
  },
  {
    id: 'ml-005',
    stem: 'A company wants to moderate user-generated content (UGC) on their social platform to detect and remove inappropriate images (nudity, violence, hate symbols) before they are displayed. They process 500,000 images per day. What is the most efficient architecture?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'ml',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'S3 upload → EventBridge/Lambda → Amazon Rekognition DetectModerationLabels → DynamoDB flagging → human review queue', correct: true, explanation: 'Rekognition DetectModerationLabels classifies images into inappropriate content categories with confidence scores. Lambda processes S3 uploads, calls Rekognition, stores results in DynamoDB, and routes low-confidence/flagged images to a human review queue.' },
      { id: 'b', text: 'S3 upload → SageMaker batch transform with a custom content moderation model → S3 results', correct: false, explanation: 'Building a custom content moderation model requires extensive labeled training data and ongoing maintenance. Rekognition provides pre-trained content moderation without model development. Batch transform also introduces latency — not real-time before display.' },
      { id: 'c', text: 'CloudFront with Lambda@Edge to call Rekognition before serving each image', correct: false, explanation: 'Calling Rekognition from Lambda@Edge for every image request adds latency to every content delivery. Moderation should happen at upload time (asynchronously) rather than at serve time.' },
      { id: 'd', text: 'Amazon Comprehend for detecting inappropriate text overlaid on images', correct: false, explanation: 'Comprehend analyzes text, not images. It cannot detect visual content (nudity, violence, symbols) in images regardless of text extraction.' }
    ],
    explanation: {
      overall: 'Rekognition Content Moderation uses pre-trained models to detect inappropriate content: Explicit/Nudity, Graphic Violence, Rude Gestures, Hate Symbols, Tobacco, Alcohol, Drugs. API returns labels with confidence scores (0-100). Architecture: (1) User uploads to S3, (2) S3 event triggers Lambda, (3) Lambda calls DetectModerationLabels, (4) If confidence > threshold → auto-reject, (5) If borderline confidence → human review via Amazon A2I, (6) Approved images published for display. Processing 500K images/day at ~50ms/image is manageable within Lambda concurrency limits.',
      examTip: 'Rekognition key APIs: DetectModerationLabels (content moderation), DetectLabels (general object detection), DetectFaces (face analysis, emotions), RecognizeCelebrities, DetectText, CompareFaces (face verification). Amazon A2I (Augmented AI) integrates with Rekognition, Textract, and custom ML models for human review workflows. A2I routes low-confidence predictions to human reviewers (MTurk, internal teams), stores reviewed results, and can improve model over time.'
    },
    tags: ['rekognition', 'content-moderation', 'ugc', 'image-analysis', 'a2i']
  },
  {
    id: 'ml-006',
    stem: 'A data science team needs a managed environment for collaborative ML development. They need Jupyter notebooks with auto-scaling compute, shared access to datasets in S3, experiment tracking, model registry, and one-click deployment to production endpoints — all with minimal infrastructure management. Which SageMaker feature set addresses this?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'ml',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Amazon SageMaker Studio with Studio notebooks, Experiments, Model Registry, and deployment pipelines', correct: true, explanation: 'SageMaker Studio is a unified ML development IDE. It includes: Studio Notebooks (auto-scaling compute, no instance management), Experiments (track training runs, metrics, parameters), Model Registry (version and approve models), and Pipelines (MLOps automation). All integrated in a single web interface.' },
      { id: 'b', text: 'Amazon SageMaker Classic Notebook Instances with S3 data access and manual deployment scripts', correct: false, explanation: 'Classic notebook instances require manual instance type selection and management. They lack the collaborative features, auto-scaling compute, integrated experiment tracking, and model registry of SageMaker Studio.' },
      { id: 'c', text: 'AWS Glue Studio with PySpark notebooks for ML feature engineering and model training', correct: false, explanation: 'Glue Studio is for ETL data transformation, not end-to-end ML development. It does not provide experiment tracking, model registry, or ML deployment capabilities.' },
      { id: 'd', text: 'Amazon EMR Notebooks with Spark for distributed ML model training', correct: false, explanation: 'EMR Notebooks provide Jupyter-compatible environments on EMR clusters. They lack the ML-specific features (experiment tracking, model registry, integrated deployment) that SageMaker Studio provides.' }
    ],
    explanation: {
      overall: 'SageMaker Studio is the flagship ML IDE providing: (1) Studio Notebooks — auto-scaling compute (choose instance type on launch, no persistent instance), (2) SageMaker Experiments — track every training run with metrics/parameters/artifacts, compare experiments visually, (3) Model Registry — version models, manage approval states (PendingManualApproval, Approved, Rejected), trigger CD pipelines on approval, (4) SageMaker Pipelines — define ML workflows as code for CI/CD automation, (5) Data Wrangler — no-code data preparation.',
      examTip: 'SageMaker Studio components: Studio Notebooks (interactive dev), Training Jobs (managed distributed training), Experiments (tracking), Model Registry (versioning + governance), Pipelines (MLOps CI/CD), Feature Store (centralized feature management), Data Wrangler (data prep), Clarify (bias/explainability), Canvas (no-code ML). For the exam: Studio = complete ML IDE. Notebooks (classic) = just Jupyter on EC2. Studio is the recommended environment for all new projects.'
    },
    tags: ['sagemaker-studio', 'experiments', 'model-registry', 'mlops', 'jupyter']
  },
  {
    id: 'ml-007',
    stem: 'A company builds and retrains ML models weekly. They want to automatically track model lineage (what data was used for training, which code version, which hyperparameters), compare model performance across versions, and enforce approval gates before models are promoted to production. Which combination of SageMaker features handles this?',
    type: 'multiple',
    difficulty: 3,
    topicSlug: 'ml',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'SageMaker ML Lineage Tracking to automatically record training job metadata and relationships', correct: true, explanation: 'SageMaker automatically tracks lineage of training jobs: input data artifacts, code versions, training jobs, model artifacts, and endpoint deployments. Creates a DAG of relationships enabling full audit trail from deployed model back to training data.' },
      { id: 'b', text: 'SageMaker Model Registry with model groups, versions, and manual/automatic approval workflows', correct: true, explanation: 'Model Registry organizes models into groups (one group per use case), tracks versions with metrics, and supports approval state management (Approved/Rejected/PendingManualApproval). EventBridge triggers CI/CD pipelines on state changes.' },
      { id: 'c', text: 'SageMaker Feature Store to centralize feature transformations across all models', correct: false, explanation: 'Feature Store centralizes reusable ML features for consistent training/inference — a good practice but not specifically required for model versioning, lineage tracking, or approval gates.' },
      { id: 'd', text: 'SageMaker Pipelines for automated model build, evaluation, and conditional registration workflows', correct: true, explanation: 'SageMaker Pipelines defines ML workflows as code. A pipeline can: preprocess data, train model, evaluate performance, and conditionally register to Model Registry only if metrics meet threshold — automating the approval gate logic.' }
    ],
    explanation: {
      overall: 'SageMaker MLOps toolchain: (1) Pipelines = automated ML workflow (data prep → train → evaluate → conditional register). (2) Model Registry = version management + approval gates + deployment tracking. (3) ML Lineage Tracking = automatic metadata capture for all artifacts and relationships. Combined: every pipeline run automatically creates lineage artifacts, registers metrics in the registry, and requires human approval (or automated evaluation gate) before production promotion.',
      examTip: 'SageMaker Model Registry approval flow: model registered with PendingManualApproval → reviewer checks metrics in registry → manual approval/rejection → EventBridge event fires → CodePipeline/Lambda deploys to production endpoint. For automated gates: Pipelines ConditionStep evaluates model metrics → if pass, RegisterModel step; if fail, pipeline fails. Model Package Group = one per ML use case. Model Package = one per trained model version.'
    },
    tags: ['sagemaker', 'model-registry', 'mlops', 'lineage-tracking', 'pipelines']
  },
  {
    id: 'ml-008',
    stem: 'A company uses Amazon Transcribe to convert customer call recordings to text for quality analysis. They want to automatically detect customer sentiment throughout calls, extract mentions of product names, and identify compliance violations (required phrases missing). Which combination of AWS AI services handles all three?',
    type: 'multiple',
    difficulty: 2,
    topicSlug: 'ml',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Amazon Transcribe for speech-to-text with speaker diarization to separate agent and customer speech', correct: true, explanation: 'Transcribe converts audio to text with speaker diarization (identifying who said what). Call Analytics extends this with automatic sentiment analysis per turn, interruption detection, and silence detection for call center-specific insights.' },
      { id: 'b', text: 'Amazon Comprehend for sentiment analysis and custom entity recognition on transcribed text', correct: true, explanation: 'Comprehend analyzes transcribed text for sentiment (positive/negative/neutral/mixed per sentence), and custom entity recognition identifies product mentions trained with your product catalog.' },
      { id: 'c', text: 'Amazon Transcribe Call Analytics for automated post-call analytics including compliance category detection', correct: true, explanation: 'Transcribe Call Analytics provides specialized call center features: categories (detect phrases/keywords for compliance), sentiment per turn, speaker interruptions, and non-talk time — specifically designed for contact center quality analysis.' },
      { id: 'd', text: 'Amazon Polly for converting compliance violation summaries to audio reports', correct: false, explanation: 'Polly is text-to-speech (converts text to audio output). It is not relevant to analyzing inbound call recordings or detecting compliance violations in transcribed text.' }
    ],
    explanation: {
      overall: 'Contact center analytics pipeline: (1) Call recordings in S3, (2) Transcribe Call Analytics: transcription + speaker diarization + sentiment + categories (compliance phrase detection). (3) Comprehend: deeper NLP analysis on transcribed text (custom entities for product recognition, topic modeling). (4) Results stored in DynamoDB/S3 for dashboards in QuickSight. Amazon Connect Contact Lens integrates all of this natively if using Connect as the contact center platform.',
      examTip: 'Speech AI services: Transcribe = speech-to-text (any audio). Transcribe Call Analytics = specialized for call centers (sentiment, categories, interruptions). Polly = text-to-speech (voice synthesis). Lex = conversational AI (understand spoken intent). Comprehend = text NLP analysis. For call center quality: Transcribe Call Analytics + Comprehend combo. For live contact center: Amazon Connect + Contact Lens (real-time transcription + analytics during the call).'
    },
    tags: ['transcribe', 'comprehend', 'call-analytics', 'sentiment-analysis', 'contact-center']
  },
  {
    id: 'ml-009',
    stem: 'A company wants to reduce the cost of their ML training workloads by 70%. They train large deep learning models (PyTorch, TensorFlow) on GPU instances that take 12-24 hours per training run. These training jobs are fault-tolerant (checkpointing implemented). Which SageMaker feature achieves the cost reduction?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'ml',
    examDomain: 'cost-optimization',
    options: [
      { id: 'a', text: 'SageMaker Training with Managed Spot Training using EC2 Spot instances with checkpointing', correct: true, explanation: 'Managed Spot Training uses EC2 Spot Instances for SageMaker training jobs at up to 90% discount vs On-Demand. If Spot is interrupted, SageMaker automatically resumes from the latest checkpoint. With checkpointing, long-running jobs are safe from interruption.' },
      { id: 'b', text: 'SageMaker Serverless Inference for model training instead of dedicated instances', correct: false, explanation: 'Serverless Inference is for model serving (inference), not model training. SageMaker training always uses compute instances — Managed Spot Training is the cost optimization for training.' },
      { id: 'c', text: 'SageMaker Savings Plans for reserved pricing on GPU training instances', correct: false, explanation: 'SageMaker Savings Plans provide up to 64% savings on SageMaker usage (training, inference). However, Managed Spot Training provides up to 90% savings and does not require a 1-3 year commitment. For ephemeral training jobs, Spot is more cost-effective than Savings Plans.' },
      { id: 'd', text: 'SageMaker Training Compiler to reduce training time and thus reduce compute costs', correct: false, explanation: 'Training Compiler accelerates deep learning training (reduces time by 50% on average) which indirectly reduces costs through shorter training duration. But it uses On-Demand instances — Spot Training at 90% discount typically achieves greater cost savings.' }
    ],
    explanation: {
      overall: 'SageMaker Managed Spot Training: (1) Configure MaxWaitTimeInSeconds and MaxRuntimeInSeconds, (2) SageMaker automatically uses Spot Instances, (3) If interrupted, SageMaker waits for Spot capacity and resumes from checkpoint, (4) Checkpoints saved to S3 automatically by SageMaker. Savings: up to 90% vs On-Demand. For 12-24 hour jobs with checkpointing implemented, Spot interruptions (2-minute warning) are manageable. CloudWatch metric: TrainingJobStatus tracks Spot interruptions.',
      examTip: 'Managed Spot Training configuration: EstimatedSavings = (bill without Spot - bill with Spot) / bill without Spot. Set checkpoint path for SageMaker to save/restore state. MaxWaitTimeInSeconds = max time to wait for Spot capacity (should be > MaxRuntimeInSeconds for safety). Note: Spot savings for GPU instances (p3, p4) can be 70-90% vs On-Demand. Billing: charged only for actual compute time (not wait time when Spot is unavailable).'
    },
    tags: ['sagemaker', 'spot-training', 'cost-optimization', 'gpu-training', 'checkpointing']
  },
  {
    id: 'ml-010',
    stem: 'A company wants to detect anomalies in time-series data from manufacturing sensors without labeled anomaly data for training. They have 6 months of historical sensor readings (temperature, pressure, vibration) from 500 machines. The system should alert when readings deviate significantly from historical patterns. Which AWS service requires no labeled training data for this use case?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'ml',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Amazon Lookout for Equipment to detect anomalies in industrial equipment sensor data', correct: true, explanation: 'Lookout for Equipment uses ML to learn normal equipment behavior from historical sensor data without labeled anomaly data (unsupervised). It detects deviations indicating potential failures and sends real-time alerts when anomalies are detected.' },
      { id: 'b', text: 'Amazon SageMaker Random Cut Forest (RCF) algorithm with labeled anomaly examples for supervised detection', correct: false, explanation: 'While RCF can detect anomalies without labeled data (unsupervised), requiring labeled data contradicts the question\'s constraint. Additionally, Lookout for Equipment is purpose-built for industrial equipment and provides better out-of-box accuracy for manufacturing sensors.' },
      { id: 'c', text: 'Amazon Forecast with anomaly detection enabled on historical time-series data', correct: false, explanation: 'Amazon Forecast generates predictions (forecasts) of future values. While it can detect anomalies relative to forecasts, it is not designed for real-time equipment anomaly detection at the IoT sensor level.' },
      { id: 'd', text: 'Amazon Kinesis Data Analytics with ML anomaly detection algorithm RANDOM_CUT_FOREST', correct: false, explanation: 'Kinesis Data Analytics (SQL) has a built-in RANDOM_CUT_FOREST function for streaming anomaly detection. It works per-stream but lacks the multi-sensor correlation and equipment-context awareness that Lookout for Equipment provides for industrial use cases.' }
    ],
    explanation: {
      overall: 'Amazon Lookout for Equipment is purpose-built for industrial predictive maintenance. It learns from historical sensor data (no labels needed) to establish normal patterns and detects deviations. The service: ingests multi-variate sensor data from S3, trains an anomaly detection model on historical data, deploys inference scheduler for real-time predictions, and sends alerts via SNS/EventBridge. Related services: Lookout for Metrics (business KPI anomalies), Lookout for Vision (visual defect detection in manufacturing).',
      examTip: 'AWS Lookout services: Lookout for Equipment = industrial IoT sensor anomaly detection, predictive maintenance. Lookout for Metrics = business metric anomalies (sales, revenue, user metrics) from Redshift/S3/CloudWatch/RDS. Lookout for Vision = visual defect detection in manufacturing images. All three are unsupervised (no labeled anomaly data required). For manufacturing equipment monitoring: Lookout for Equipment is the specific service. Amazon Monitron is an even more hardware-integrated solution (physical sensors + cloud).'
    },
    tags: ['lookout-for-equipment', 'anomaly-detection', 'predictive-maintenance', 'iot', 'unsupervised']
  },
  {
    id: 'ml-011',
    stem: 'A company wants to add AI-powered document question-answering to their internal knowledge base. Employees should be able to ask natural language questions (e.g., "What is the PTO policy?") and receive accurate answers extracted from thousands of internal documents stored in various formats (PDF, Word, HTML). Which AWS service provides this without building custom NLP pipelines?',
    type: 'single',
    difficulty: 1,
    topicSlug: 'ml',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Amazon Kendra for intelligent enterprise search with natural language question answering', correct: true, explanation: 'Kendra indexes documents from multiple sources (S3, SharePoint, Confluence, databases) and uses ML to understand natural language questions, returning precise answers extracted from documents (not just links). Supports PDF, Word, HTML, and more out of the box.' },
      { id: 'b', text: 'Amazon Lex with a custom Q&A intent and Lambda handler querying a DynamoDB knowledge base', correct: false, explanation: 'Lex handles structured conversational flows but requires pre-defined intents and manual knowledge base construction in DynamoDB. It cannot automatically index thousands of documents or extract answers from arbitrary document content.' },
      { id: 'c', text: 'Amazon Comprehend with custom entity recognition trained on HR documents', correct: false, explanation: 'Comprehend extracts entities and analyzes text sentiment but does not provide search or question-answering against a document corpus. It analyzes individual documents, not indexes and searches across thousands of documents.' },
      { id: 'd', text: 'Amazon OpenSearch Service with full-text search for keyword matching in documents', correct: false, explanation: 'OpenSearch provides keyword-based full-text search, not semantic question answering. Employees asking "What is the PTO policy?" need semantically relevant answers, not keyword matches — Kendra provides ML-powered semantic understanding.' }
    ],
    explanation: {
      overall: 'Amazon Kendra is an ML-powered enterprise search service. Key features: (1) Document indexing from 40+ sources (S3, SharePoint, Salesforce, ServiceNow, databases). (2) Natural language understanding for questions. (3) Precise answer extraction (returns the specific sentence/paragraph containing the answer). (4) Relevance tuning for domain-specific content. (5) Access control (users only see documents they have permission to access). For internal knowledge bases: Kendra indexes all documents and employees search with natural language.',
      examTip: 'Kendra vs OpenSearch: Kendra = semantic NLP question answering, managed ML, no ML expertise needed, expensive. OpenSearch = keyword search, full control, requires more setup, cheaper. Kendra use cases: HR knowledge base, IT helpdesk, customer support FAQ, compliance document search. Kendra connectors: S3, RDS, SharePoint, Salesforce, ServiceNow, Confluence, Google Workspace, web crawler. Kendra Intelligent Ranking can also be used to re-rank OpenSearch results for better relevance.'
    },
    tags: ['kendra', 'enterprise-search', 'question-answering', 'document-indexing', 'nlp']
  },
  {
    id: 'ml-012',
    stem: 'A company wants to forecast product demand for 50,000 SKUs over the next 90 days using 3 years of historical sales data. They want to incorporate external factors like holidays, promotions, and weather. They need predictions at the product-store level with quantile forecasts (P50, P90) to manage inventory risk. Which AWS service is purpose-built for this?',
    type: 'single',
    difficulty: 1,
    topicSlug: 'ml',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Amazon Forecast with related time series datasets for external factors and quantile predictions', correct: true, explanation: 'Amazon Forecast is purpose-built for time-series forecasting. It supports related time series (external factors like promotions, weather) and item metadata, automatically selects the best algorithm (DeepAR+, NPTS, etc.), and generates quantile forecasts (P50, P90) for uncertainty quantification.' },
      { id: 'b', text: 'Amazon SageMaker with a custom LSTM model trained on historical sales data', correct: false, explanation: 'A custom LSTM model requires ML expertise, training infrastructure, hyperparameter tuning, and ongoing maintenance. Amazon Forecast abstracts all this with pre-built state-of-the-art forecasting algorithms specifically designed for retail demand forecasting.' },
      { id: 'c', text: 'Amazon QuickSight with ML-powered forecasting in dashboards', correct: false, explanation: 'QuickSight ML Insights provides simple forecasting for visualized metrics (trend extrapolation). It is not designed for large-scale (50K SKUs), multi-variable, quantile forecasting at the operational scale Amazon Forecast supports.' },
      { id: 'd', text: 'AWS Glue with custom time series statistical models (ARIMA) implemented in PySpark', correct: false, explanation: 'Implementing ARIMA in PySpark for 50,000 SKUs requires significant data engineering and ML work. ARIMA also does not handle external factors or quantile forecasts as naturally as Amazon Forecast\'s managed algorithms.' }
    ],
    explanation: {
      overall: 'Amazon Forecast automates demand forecasting using ML algorithms proven at Amazon scale. Setup: (1) Import target time series (historical sales by SKU+store+date). (2) Import related time series (promotions, holidays, weather — time-varying factors). (3) Import item metadata (product category, price). (4) Create predictor (Forecast selects best algorithm via AutoML). (5) Create forecast at desired quantiles (P10, P50, P90). (6) Query via API or export to S3. DeepAR+ handles cold-start items (new products with no history).',
      examTip: 'Amazon Forecast algorithms: AutoML (tries all and selects best), CNN-QR (quantile regression, handles missing values), DeepAR+ (recurrent NN, best for irregular patterns), NPTS (non-parametric, good for intermittent demand), ARIMA (classical statistics), ETS (exponential smoothing). Quantile forecasts: P50 = median forecast (50% chance actual < this), P90 = high estimate (90% chance actual < this). Use P90 for safety stock calculation. Holiday featurization built-in for 66 countries.'
    },
    tags: ['amazon-forecast', 'demand-forecasting', 'time-series', 'quantile', 'retail']
  },
  {
    id: 'ml-013',
    stem: 'A company wants to understand WHY their ML model makes specific predictions (model explainability) and detect potential bias in model predictions across demographic groups before deploying to production. Which SageMaker capability addresses both requirements?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'ml',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Amazon SageMaker Clarify for bias detection during training and feature attribution for explainability', correct: true, explanation: 'SageMaker Clarify detects statistical bias in training data and model predictions across groups (pre-training and post-training bias metrics). It also generates feature importance explanations using SHAP values, showing which features contributed to each prediction.' },
      { id: 'b', text: 'SageMaker Debugger to monitor training metrics and identify overfitting', correct: false, explanation: 'Debugger monitors training job metrics (loss, accuracy) and can catch common training issues (vanishing gradients, overfitting). It does not address fairness/bias analysis or model explainability for predictions.' },
      { id: 'c', text: 'SageMaker Model Monitor to detect data drift and feature attribution changes in production', correct: false, explanation: 'Model Monitor detects data quality issues and drift in production endpoints. While it can detect statistical changes, it does not perform pre-deployment bias analysis or generate SHAP-based explanations.' },
      { id: 'd', text: 'SageMaker Experiments to compare model performance metrics across different demographic slices', correct: false, explanation: 'Experiments tracks training runs and compares metrics. It does not perform statistical bias analysis or generate feature importance explanations for fairness and explainability.' }
    ],
    explanation: {
      overall: 'SageMaker Clarify provides: (1) Pre-training bias metrics: Class Imbalance (CI), Difference in Positive Proportions in Labels (DPL), Statistical Parity Difference (SPD). (2) Post-training bias metrics: Disparate Impact (DI), Equal Opportunity Difference (EOD). (3) Explainability: SHAP (SHapley Additive exPlanations) values for global and local feature importance. Clarify integrates with SageMaker Pipelines for automated bias checks and can generate human-readable PDF reports.',
      examTip: 'Bias terms for the exam: Pre-training bias = imbalance in training data (e.g., fewer examples from minority groups). Post-training bias = model predictions systematically disadvantage a group even if training data is balanced. Clarify bias metrics: Disparate Impact = ratio of prediction rates between groups (< 0.8 suggests bias). SHAP values: positive = feature increased prediction probability, negative = feature decreased it. Always run Clarify before deploying models that affect people (lending, hiring, healthcare).'
    },
    tags: ['sagemaker-clarify', 'bias-detection', 'explainability', 'shap', 'responsible-ai']
  },
  {
    id: 'ml-014',
    stem: 'A company deployed a credit scoring ML model to production 3 months ago. Model accuracy has declined significantly. Data scientists suspect the production data distribution has shifted from training data (feature drift). What SageMaker capability automatically monitors for this in production?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'ml',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'SageMaker Model Monitor with data quality monitoring to detect feature distribution drift', correct: true, explanation: 'Model Monitor continuously monitors SageMaker endpoint inputs and outputs. Data quality monitoring compares production data distribution against a baseline captured from training data. CloudWatch alarms trigger when features drift beyond configured thresholds.' },
      { id: 'b', text: 'SageMaker Debugger with custom rules to detect input data anomalies', correct: false, explanation: 'Debugger monitors training jobs (tensors, gradients, activations). It does not monitor production inference endpoints for data distribution drift.' },
      { id: 'c', text: 'Amazon CloudWatch custom metrics with Lambda to compare production vs training distributions', correct: false, explanation: 'While possible to build custom drift detection with Lambda + CloudWatch, this requires significant custom development. SageMaker Model Monitor provides this as a managed, automated capability.' },
      { id: 'd', text: 'SageMaker Experiments to compare production predictions against baseline experiment results', correct: false, explanation: 'Experiments tracks training runs and metrics, not production inference patterns. It cannot monitor live endpoint traffic for data drift.' }
    ],
    explanation: {
      overall: 'SageMaker Model Monitor has four monitoring types: (1) Data Quality — detects feature distribution drift (missing values, schema changes, statistical distribution shifts). (2) Model Quality — compares predictions against ground truth labels (requires label collection pipeline). (3) Bias Drift — monitors for emerging bias in predictions over time. (4) Feature Attribution Drift — monitors SHAP value changes. Setup: capture training data statistics as baseline → enable data capture on endpoint → create monitoring schedule → CloudWatch alarms on violations.',
      examTip: 'Model Monitor workflow: CreateBaseline (analyze training data, generate statistics/constraints) → CreateMonitoringSchedule (hourly/daily) → endpoint data capture → comparison against baseline → CloudWatch metrics for violations → SNS alerts. Model Monitor uses pre-built containers for statistical analysis. For model quality monitoring: you need to collect ground truth labels and join with predictions (label joiner Lambda). Production ML monitoring is essential for MLOps — models drift over time as real-world data changes.'
    },
    tags: ['sagemaker-model-monitor', 'data-drift', 'feature-drift', 'mlops', 'production-monitoring']
  },
  {
    id: 'ml-015',
    stem: 'A company wants to enable their business analysts to build ML models without writing code, using their own data stored in S3. Models should be deployable to production with point-and-click, and analysts should be able to generate predictions (e.g., customer churn probability) without ML expertise. Which SageMaker feature is designed for this audience?',
    type: 'single',
    difficulty: 1,
    topicSlug: 'ml',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Amazon SageMaker Canvas for no-code ML model building and predictions', correct: true, explanation: 'SageMaker Canvas provides a visual, no-code interface for business users. Analysts can: import data from S3/Redshift, let Canvas automatically build and select the best model (AutoML), review model quality metrics, generate predictions via UI or API, and share models with data scientists.' },
      { id: 'b', text: 'Amazon SageMaker Autopilot for automated ML model building with code generation', correct: false, explanation: 'Autopilot is an AutoML feature for data scientists — it automatically builds models but generates notebooks showing the code, designed for users who want transparency and can work with code outputs. Canvas is the no-code version for business users.' },
      { id: 'c', text: 'AWS Glue DataBrew for visual data transformation and ML feature engineering', correct: false, explanation: 'DataBrew is a visual data preparation tool for cleaning and transforming data. It does not build ML models or generate predictions — it prepares data for ML but is not an end-to-end ML platform.' },
      { id: 'd', text: 'SageMaker Studio Lab for free lightweight ML experiments', correct: false, explanation: 'SageMaker Studio Lab is a free educational environment for learning ML with Jupyter notebooks — it still requires coding knowledge. Canvas provides the truly no-code experience for business users.' }
    ],
    explanation: {
      overall: 'SageMaker Canvas is designed for business analysts and non-ML practitioners. Workflow: (1) Import data (S3, Redshift, Snowflake, Salesforce). (2) Select target column (what to predict: churn=yes/no). (3) Canvas automatically: cleans data, engineers features, trains multiple models (AutoML), selects the best. (4) Review model accuracy and feature importance in visual dashboards. (5) Generate predictions for new data (batch CSV upload or API). (6) Share model with data scientists in SageMaker Studio for further refinement.',
      examTip: 'No-code vs low-code vs code-first ML on AWS: No-code = Canvas (business users), Amazon Personalize, Amazon Forecast, Lookout services. Low-code = SageMaker Autopilot (generates code + auto-selects model, for data scientists who want automation with transparency). Code-first = SageMaker Studio with custom training scripts. For the exam: match the persona (business analyst → Canvas, data scientist with AutoML → Autopilot, ML engineer → SageMaker training/inference APIs).'
    },
    tags: ['sagemaker-canvas', 'no-code-ml', 'automl', 'business-analyst', 'citizen-data-science']
  }
];
