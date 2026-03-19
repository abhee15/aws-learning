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
  },
  {
    id: 'ml-016',
    stem: 'A data science team has built 30+ ML models in SageMaker. They struggle to reproduce experiments — they cannot determine which training dataset version, hyperparameters, and code version produced a specific deployed model. When regulators request an audit trail for a credit risk model, the team cannot reconstruct the full lineage. Which SageMaker feature provides end-to-end ML lineage tracking from data to deployed endpoint?',
    type: 'single', difficulty: 2, topicSlug: 'ml', examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'SageMaker Experiments to track training runs, hyperparameters, and metrics in a centralized registry', correct: false, explanation: 'SageMaker Experiments tracks training runs, hyperparameters, and metrics for comparison. It helps compare experiments but does not provide full lineage tracking from dataset version through training to deployed endpoint — it focuses on the training phase only.' },
      { id: 'b', text: 'SageMaker ML Lineage Tracking to automatically record relationships between datasets, training jobs, models, and endpoints throughout the ML lifecycle', correct: true, explanation: 'SageMaker ML Lineage Tracking automatically creates a directed acyclic graph (DAG) of lineage entities: DataSet → TrainingJob → Model → ModelPackage → Endpoint. For each entity, it captures: dataset URIs and versions, training job ARN, code versions, hyperparameters, metrics, and endpoint deployments. Lineage is queryable via the API and integrated with SageMaker Studio.' },
      { id: 'c', text: 'AWS CloudTrail to log all SageMaker API calls for a complete audit trail of model creation and deployment', correct: false, explanation: 'CloudTrail logs API calls (who called what API when) but does not understand ML-specific lineage relationships — it cannot tell you that a deployed endpoint came from a specific training job that used a specific dataset version. CloudTrail is for security auditing, not ML lineage.' },
      { id: 'd', text: 'SageMaker Model Registry with model version tags containing dataset URIs and hyperparameter metadata', correct: false, explanation: 'Model Registry stores versioned model packages with metadata, but lineage must be manually populated through tags and metadata — it does not automatically trace back to training datasets and code. ML Lineage Tracking automatically builds the full lineage graph across all SageMaker entities.' },
    ],
    explanation: { overall: 'SageMaker ML Lineage Tracking: automatically tracks entities and their associations throughout the ML lifecycle. Entities: DataSet (S3 location, version), TrainingJob (code, hyperparameters, metrics), ProcessingJob (data transformations), Model (artifact location), Endpoint (deployed model). Associations: ContributedTo (dataset → training job), AssociatedWith (training job → model), DeployedTo (model → endpoint). Query: use LineageQuery API to traverse the graph. Integration: SageMaker Studio Lineage tab visualizes the DAG. Useful for: regulatory audits, experiment reproduction, impact analysis (which endpoints use this dataset?).', examTip: 'SageMaker MLOps toolset: Experiments (compare training runs) + Lineage Tracking (trace data-to-deployment) + Model Registry (version management + approval workflow) + Pipelines (CI/CD for ML) + Model Monitor (production drift detection) + Clarify (bias + explainability). For regulatory compliance (GDPR, financial regulations): Lineage Tracking provides the audit trail proving which data and code version produced a deployed model. Model Registry approval workflow ensures human review before production deployment.' },
    tags: ['sagemaker', 'lineage-tracking', 'mlops', 'audit-trail', 'model-governance'],
  },
  {
    id: 'ml-017',
    stem: 'A company processes thousands of PDF contracts daily. Each contract must have specific fields extracted (party names, dates, payment terms, jurisdiction clauses) and classified as Standard, Non-Standard, or Requires-Legal-Review. Currently, lawyers manually review every contract. The company wants to automate extraction and classification to reduce manual review by 80%. The solution must work with no prior ML training data. Which AWS services best address this requirement?',
    type: 'multiple', difficulty: 2, topicSlug: 'ml', examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Amazon Textract with Queries feature to extract specific named fields from contracts without training data', correct: true, explanation: 'Textract Queries allows you to ask natural language questions about document content (e.g., "What is the payment term?", "Who are the contracting parties?"). Textract returns the specific text answering the query. No training data or custom model needed — Textract is pre-trained on diverse document types including contracts.' },
      { id: 'b', text: 'Amazon Comprehend custom document classifier trained on labeled contracts to classify documents as Standard/Non-Standard/Requires-Legal-Review', correct: true, explanation: 'While the requirement says "no prior ML training data," this refers to initial setup — Comprehend custom classification requires labeled examples (training data). However, if the company has some labeled contracts, Comprehend custom classifier is the right tool for document classification. Alternatively, Comprehend\'s pre-trained capabilities can classify text using built-in categories.' },
      { id: 'c', text: 'Amazon Textract AnalyzeDocument with FORMS feature to extract key-value pairs from PDF contracts', correct: false, explanation: 'Textract FORMS is designed for structured forms with labeled field boxes (like tax forms or applications). Legal contracts are unstructured text without labeled form fields. The Queries feature is more appropriate for extracting specific information from unstructured contract text.' },
      { id: 'd', text: 'Amazon Comprehend entity recognition to identify people, organizations, dates, and legal terms in extracted contract text', correct: true, explanation: 'After Textract extracts the contract text, Comprehend\'s pre-trained entity recognition identifies PERSON (contracting parties), DATE (effective dates, payment dates), ORGANIZATION (company names), and LOCATION (jurisdiction) entities from the text. No custom training needed — these entity types are built into Comprehend.' },
    ],
    explanation: { overall: 'IDP (Intelligent Document Processing) on AWS pipeline: (1) Textract — extract text, forms, tables, and run Queries against document content; pre-trained, no custom ML needed. (2) Comprehend — NLP on extracted text: entity recognition (people, dates, orgs), key phrase extraction, sentiment, PII detection; pre-trained models available. (3) Custom models when needed: Textract custom entity extraction (domain-specific terms like "PAYMENT_TERM"), Comprehend custom classifier/NER (domain-specific classification). (4) A2I (Augment AI) — human review loop for low-confidence predictions.', examTip: 'Textract extraction types: DetectDocumentText (raw text OCR), AnalyzeDocument FORMS (key-value pairs from form fields), AnalyzeDocument TABLES (tabular data), Queries (natural language Q&A against document), AnalyzeExpense (invoices/receipts), AnalyzeID (identity documents). Comprehend pre-trained: entities (PERSON, ORG, DATE, LOCATION, QUANTITY), key phrases, sentiment, dominant language, PII detection. Custom Comprehend: classification (labels you define) and NER (entity types you define).' },
    tags: ['textract', 'comprehend', 'intelligent-document-processing', 'contract-analysis', 'entity-extraction'],
  },
  {
    id: 'ml-018',
    stem: 'A company runs SageMaker training jobs on ml.p3.16xlarge instances for deep learning. Training jobs take 4-8 hours each. The team runs 20-30 training jobs per week. Monthly compute costs are $85,000. A cost optimization review suggests using Managed Spot Training. The training code already uses SageMaker checkpointing to S3. What is the maximum potential cost reduction from Managed Spot Training, and what trade-off must the team accept?',
    type: 'single', difficulty: 2, topicSlug: 'ml', examDomain: 'cost-optimization',
    options: [
      { id: 'a', text: 'Up to 50% cost reduction; trade-off is that jobs may take up to 2x longer due to interruptions', correct: false, explanation: 'SageMaker Managed Spot Training offers up to 90% savings, not 50%. The extended training time estimate is also not precise — with checkpointing, interrupted jobs resume from the last checkpoint rather than starting over, so total training time increase depends on interruption frequency.' },
      { id: 'b', text: 'Up to 90% cost reduction; trade-off is that Spot interruptions can extend job duration (jobs must resume from S3 checkpoints), and maximum wait time must be configured', correct: true, explanation: 'SageMaker Managed Spot Training: up to 90% savings on training compute. Trade-offs: (1) Jobs may be interrupted when Spot capacity is reclaimed — resumes from last checkpoint. (2) MaxWaitTimeInSeconds must be set (max time including interruption wait) — typically 2-3x expected training time. (3) Job completion time is non-deterministic. With checkpointing already implemented, interruptions cause minimal rework (only progress since last checkpoint is lost).' },
      { id: 'c', text: 'Up to 70% cost reduction; trade-off is that Spot instances are only available in specific regions and availability zones', correct: false, explanation: 'Spot savings for ML instances are typically 70-90% depending on instance type and region, but the specific savings claim of 70% is not the maximum. Regional availability is a minor operational consideration, not a primary trade-off. The main trade-off is job interruption, not geographic limitations.' },
      { id: 'd', text: 'Up to 90% cost reduction with no meaningful trade-off because SageMaker automatically handles Spot interruptions transparently', correct: false, explanation: 'While SageMaker manages Spot capacity automatically, the trade-off is real: job duration becomes non-deterministic, MaxWaitTimeInSeconds must be sized appropriately, and checkpointing must be implemented (already done here). Jobs that cannot be interrupted (e.g., time-critical research deadlines) should use On-Demand.' },
    ],
    explanation: { overall: 'SageMaker Managed Spot Training: automatically uses EC2 Spot instances for training. Configuration: UseManagedSpot=True, CheckpointConfig (S3 path + local path), MaxWaitTimeInSeconds (max job duration including wait for Spot capacity, must be > MaxRuntimeInSeconds). AWS handles Spot interruption: saves checkpoint → job paused → capacity restored → resumes from checkpoint. Billing: only billed for actual compute time used, not wait time. Savings: typically 70-90% vs On-Demand. Best for: long training jobs with checkpointing (>1 hour), batch/non-time-critical training, fault-tolerant distributed training.', examTip: 'Spot Training prerequisites: (1) Checkpointing implemented (SageMaker SDK checkpoint_s3_uri parameter). (2) Training code must be able to resume from checkpoint (load model state, optimizer state, epoch number). (3) MaxWaitTimeInSeconds must be configured (e.g., 3× expected training time). SageMaker training cost components: instance hours (EC2), data storage (S3 input/output), model artifacts storage. Managed Spot reduces the EC2 instance hours cost by up to 90%. At $85k/month, potential savings: ~$60-75k/month.' },
    tags: ['sagemaker', 'managed-spot-training', 'cost-optimization', 'checkpointing', 'deep-learning'],
  },
  {
    id: 'ml-019',
    stem: 'A manufacturing company deploys a SageMaker real-time endpoint to detect product defects from camera images on the assembly line. The endpoint is called 10,000 times per minute during a 16-hour production shift and is idle for 8 hours overnight. The current single-instance endpoint costs $15,000/month. How can the company reduce costs while maintaining the latency and throughput requirements during production hours?',
    type: 'single', difficulty: 2, topicSlug: 'ml', examDomain: 'cost-optimization',
    options: [
      { id: 'a', text: 'Switch to SageMaker Serverless Inference to eliminate idle-hour costs by paying only per invocation', correct: false, explanation: 'Serverless Inference has cold starts (latency spikes when scaling from zero) which are unacceptable for a production assembly line requiring consistent low-latency responses. Additionally, at 10,000 invocations/minute for 16 hours, the per-invocation cost could exceed the always-on endpoint cost.' },
      { id: 'b', text: 'Use SageMaker Inference Recommender to right-size the instance type, and use Application Auto Scaling with scheduled scaling to scale down to 1 instance overnight', correct: true, explanation: 'Two optimizations: (1) Inference Recommender runs load tests to find the optimal (possibly cheaper) instance type that meets latency/throughput requirements. (2) Scheduled Auto Scaling: scale to required instances during production hours (e.g., 6 AM - 10 PM), scale to minimum (1 instance) overnight. Eliminates idle capacity costs while maintaining SLA during shifts.' },
      { id: 'c', text: 'Deploy the model to a SageMaker Batch Transform job triggered by camera images accumulated in S3', correct: false, explanation: 'Batch Transform is for batch inference on datasets, not real-time per-image inference. Assembly line defect detection requires immediate (millisecond-latency) inference on each image as it is captured — Batch Transform adds unacceptable latency for real-time quality control.' },
      { id: 'd', text: 'Use SageMaker Asynchronous Inference for large payloads with SQS queue-based autoscaling including scale-to-zero', correct: false, explanation: 'Asynchronous Inference is for long-processing requests (>15 seconds) with large payloads, not real-time image classification. While it supports scale-to-zero, the queuing model introduces latency that is incompatible with real-time assembly line inspection requiring immediate feedback.' },
    ],
    explanation: { overall: 'SageMaker endpoint cost optimization strategies: (1) Right-size instance — use Inference Recommender to benchmark latency/throughput on multiple instance types; find minimum cost instance meeting SLA. (2) Auto Scaling — target tracking (track InvocationsPerInstance metric), step scaling, or scheduled scaling. Scheduled: production hours = N instances; overnight = 1 instance. (3) Multi-model endpoints — host multiple models on one instance (if models share hardware). (4) Serverless Inference — for irregular/infrequent traffic with cold-start tolerance. (5) Graviton instances (ml.c7g) — up to 20% cost savings for compatible models.', examTip: 'SageMaker inference modes: Real-time = synchronous, low-latency, persistent endpoint. Serverless = auto-scale to zero, cold starts, per-request billing. Async = queue-based, for large payloads / long processing, scale-to-zero capable. Batch Transform = offline batch processing, no endpoint needed. Choose based on: latency requirement (real-time < 10ms, serverless cold start 1-10s), traffic pattern (steady → real-time, spiky → serverless/async), payload size (large → async), processing time (long → async).' },
    tags: ['sagemaker', 'inference', 'auto-scaling', 'cost-optimization', 'scheduled-scaling'],
  },
];
