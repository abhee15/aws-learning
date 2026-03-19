import type { Topic } from '../../types/topic';

export const containersTopic: Topic = {
  id: 'containers',
  slug: 'containers',
  title: 'Containers: ECS, EKS & Fargate',
  shortTitle: 'Containers',
  icon: 'Box',
  color: 'blue',
  examDomains: ['new-solutions', 'cost-optimization'],
  estimatedStudyHours: 6,
  summaryBullets: [
    'ECS: AWS-native, simpler ops. EKS: Kubernetes API compatibility. Fargate: serverless compute for both',
    'ECS Task Definitions define containers; Services maintain desired count and handle load balancer integration',
    'Fargate: no EC2 management, per-vCPU/GB-hour billing. Use Fargate Spot for batch workloads (70% discount)',
    'EKS Managed Node Groups handle worker node lifecycle. Karpenter for intelligent node provisioning',
    'ECR: private container registry with image scanning, lifecycle policies, and cross-region replication',
  ],
  relatedTopics: ['compute', 'serverless', 'security'],
  solutionArchitectures: [
    {
      id: 'containers-arch-ecs-fargate',
      title: 'Microservices on ECS Fargate with ALB',
      description: 'Containerized microservices running on AWS Fargate — no EC2 instances to manage. ALB routes traffic to services via path-based routing. Service Auto Scaling handles traffic spikes. Suitable for teams that want containers without Kubernetes complexity.',
      useCase: 'Microservices architecture for teams wanting container benefits (portability, isolation) without Kubernetes operational overhead or EC2 lifecycle management',
      components: [
        { name: 'Application Load Balancer', role: 'Single ALB with path-based routing: /api/* → API Service TG, /auth/* → Auth Service TG. Dynamic port mapping handles multiple tasks on same host' },
        { name: 'ECS Cluster (Fargate)', role: 'Logical grouping of services. Fargate capacity provider handles compute automatically — no EC2 worker nodes to manage or patch' },
        { name: 'ECS Services', role: 'Each microservice = one ECS Service. Maintains desired task count. Integrates with ALB target group. Rolling deployments with min/max healthy percent' },
        { name: 'Task Definitions', role: 'Versioned container specs: Docker image (from ECR), CPU/memory, environment variables (from Secrets Manager/Parameter Store), IAM task role, log configuration' },
        { name: 'Task IAM Role', role: 'Fine-grained IAM role per service — API service gets DynamoDB access, Auth service gets Cognito access. Principle of least privilege per microservice' },
        { name: 'AWS Secrets Manager', role: 'Task Definition references secrets by ARN — ECS injects as environment variables at runtime. No secrets in container images or task definition plaintext' },
      ],
      dataFlow: [
        'Request → ALB → path-based rule matches → routes to appropriate ECS Service target group',
        'ECS Service selects healthy Fargate task → ALB forwards request to task\'s dynamic port',
        'Task container reads secrets from Secrets Manager (injected as env vars at task startup)',
        'Service calls other services via Service Connect (internal DNS) or ALB internal endpoints',
        'CloudWatch Container Insights captures CPU/memory/network metrics per task and service',
        'Service Auto Scaling: CloudWatch alarm on ALB RequestCountPerTarget → scale in/out ECS service desired count',
      ],
      keyDecisions: [
        'Fargate vs EC2 launch type: Fargate for variable load, no ops overhead. EC2 for cost optimization at sustained load (>50% utilization) or GPU requirements',
        'Task size right-sizing: start with 0.5 vCPU/1GB, monitor Container Insights CPU/memory utilization, adjust. Fargate bills per vCPU and GB reserved, not used',
        'ECS Service Connect vs ALB for inter-service communication: Service Connect for service mesh features (retries, circuit breaking); ALB for external + internal',
        'Fargate Spot for batch/worker services: 70% cost savings with 2-minute interruption notice — same as EC2 Spot handling',
      ],
      tradeoffs: [
        { pro: 'Zero infrastructure management — no EC2 patching, AMI updates, capacity planning', con: 'Fargate per-task billing can exceed EC2 costs for consistently high-utilization workloads (>70% CPU)' },
        { pro: 'Per-task IAM roles provide strong isolation between microservices without shared instance credentials', con: 'Cold start latency: Fargate task provisioning takes 30-60 seconds vs pre-warmed EC2 instances' },
      ],
      examAngle: 'ECS Fargate = serverless containers. No EC2 management. Task IAM role = IAM permissions for the container (not the Fargate host). ECS Exec = SSH equivalent for debugging running containers. Fargate Spot for batch jobs with same 2-minute interruption notice as EC2 Spot.',
    },
  ],
  subtopics: [
    {
      id: 'containers-ecs',
      title: 'ECS Deep Dive',
      sections: [
        {
          id: 'containers-ecs-concepts',
          title: 'ECS Architecture & Key Concepts',
          content: '**Elastic Container Service (ECS)**: AWS-native container orchestration. Tightly integrated with ALB, IAM, CloudWatch, Secrets Manager, ECR. Simpler operational model than Kubernetes.\n\n**Core components**:\n- **Cluster**: Logical isolation boundary. Contains services and tasks. Can use Fargate, EC2, or both capacity providers.\n- **Task Definition**: Blueprint for containers. Specifies: Docker image, CPU/memory, ports, environment variables, volumes, logging, IAM role. Versioned — new version on each update.\n- **Task**: A running instance of a Task Definition. Analogous to a pod in Kubernetes.\n- **Service**: Ensures desired number of tasks are running. Handles rolling deployments, integrates with ALB, supports Auto Scaling.\n\n**Launch Types**:\n- **Fargate**: AWS manages compute. No EC2 instances. Specify CPU (0.25-16 vCPU) and memory (0.5-120 GB) per task. Per-task billing.\n- **EC2**: You manage EC2 worker nodes. ECS agent on each node registers capacity. Allows GPU instances, placement constraints, larger instances.\n\n**IAM Roles for ECS**:\n- **Task Execution Role**: Permissions for ECS agent to pull images from ECR, write to CloudWatch Logs, read Secrets Manager/Parameter Store. Used by the infrastructure layer.\n- **Task Role**: Permissions for YOUR application code running inside the container. Gets credentials via metadata endpoint. Use per-service for least privilege.\n\n**ECS Service Deployments**:\n- **Rolling Update**: Replaces tasks gradually. `minimumHealthyPercent` (0-100%) and `maximumPercent` (100-200%) control the rolling window. No additional infrastructure.\n- **Blue/Green via CodeDeploy**: Provisions green task set, validates, shifts ALB traffic. Instant rollback. Requires ALB.\n- **External Deployment**: Custom deployment controller via ECS API.\n\n**Service Auto Scaling**: Scale ECS service desired count based on CloudWatch metrics. Target Tracking on ALB RequestCountPerTarget is most common. Step Scaling for custom metrics. Scheduled Scaling for known patterns.',
          keyPoints: [
            { text: 'Task Execution Role: ECS infrastructure pulls images, writes logs. Task Role: your app code calls AWS APIs. These are different roles', gotcha: true },
            { text: 'ECS Blue/Green via CodeDeploy: two task sets (blue/green), ALB traffic shifted, instant rollback by shifting back. Requires ALB target groups', examTip: true },
            { text: 'Fargate task size: billed for reserved CPU/memory, not actual usage. Right-size using Container Insights utilization metrics', examTip: true },
            { text: 'ECS Service minimumHealthyPercent=100, maximumPercent=200: rolling deploy always maintains 100% capacity (doubles tasks temporarily)', examTip: true },
          ],
          bestPractices: [
            { pillar: 'security', text: 'Assign separate Task IAM Roles to each ECS service with only the permissions that service needs — never share a single role across all services' },
            { pillar: 'security', text: 'Use Secrets Manager secret injection via Task Definition (secretsFrom) instead of plaintext environment variables — secrets are fetched at task launch, not stored in task definition' },
            { pillar: 'operational-excellence', text: 'Enable ECS Container Insights for cluster-level and service-level CPU/memory/network metrics — required for Service Auto Scaling metric-based decisions' },
            { pillar: 'cost-optimization', text: 'Use Fargate Spot capacity provider for batch processing, CI/CD workers, and background jobs — 70% savings with graceful interruption handling via SIGTERM' },
          ],
          useCases: [
            {
              scenario: 'An ECS service is calling the AWS Secrets Manager API to retrieve database credentials. The task is failing with AccessDenied errors when calling secretsmanager:GetSecretValue, even though the EC2 worker node\'s IAM role has the permission.',
              wrongChoices: ['Add Secrets Manager permissions to the ECS Task Execution Role', 'Embed the secret as a plaintext environment variable in the Task Definition'],
              correctChoice: 'Add secretsmanager:GetSecretValue to the ECS Task Role (not the Execution Role). The Task Role grants permissions to your application code; the Execution Role grants permissions to the ECS infrastructure layer',
              reasoning: 'Task Execution Role = ECS agent pulling images and writing logs. Task Role = your container code calling AWS services. Application code calling Secrets Manager needs the Task Role permission. This is a common exam gotcha — confusing which role grants which permissions.',
            },
            {
              scenario: 'An ECS service runs with minimumHealthyPercent=50 and maximumPercent=150. A rolling deployment starts but the ALB health checks fail on new tasks, causing ECS to keep replacing them in an infinite loop. Production traffic is degraded.',
              wrongChoices: ['Set minimumHealthyPercent=0 to allow all old tasks to be stopped immediately', 'Increase the task replacement timeout — the deployment will eventually succeed'],
              correctChoice: 'Set minimumHealthyPercent=100 and maximumPercent=200 for production services. This ensures old tasks stay fully running until new tasks are proven healthy, then old tasks are drained',
              reasoning: 'With minimumHealthyPercent=50, ECS stops half the old tasks before new tasks are healthy — degrading capacity during deployment. Setting 100/200 means ECS launches new tasks alongside existing ones, only stopping old tasks after new ones pass health checks.',
            },
          ],
        },
      ],
    },
    {
      id: 'containers-eks',
      title: 'EKS & Kubernetes on AWS',
      sections: [
        {
          id: 'containers-eks-concepts',
          title: 'EKS Architecture & AWS Integration',
          content: '**Elastic Kubernetes Service (EKS)**: Managed Kubernetes control plane. AWS manages etcd, API server, controller manager. You manage worker nodes (or use Fargate). Compatible with standard Kubernetes tooling (kubectl, Helm, ArgoCD).\n\n**Worker Node Options**:\n- **Managed Node Groups**: ECS-like management of EC2 worker nodes. AWS handles AMI patching, node updates, graceful draining on scale-in. Uses launch templates for customization.\n- **Self-Managed Nodes**: Full control but manual management of lifecycle, patching, and upgrades.\n- **Fargate Profiles**: Serverless pods — no EC2 nodes. Define namespace/label selectors; matching pods run on Fargate. No DaemonSets. Limited network plugin support (VPC CNI only).\n\n**Karpenter**: Open-source node provisioner (AWS developed). Watches for unschedulable pods, provisions right-sized EC2 instances in seconds. Supports Spot, consolidates nodes when underutilized (deprovisioning). Replaces Cluster Autoscaler for most use cases.\n\n**IAM Integration (IRSA - IAM Roles for Service Accounts)**: Maps Kubernetes Service Accounts to IAM Roles via OIDC federation. Pod assumes specific IAM Role — granular per-pod permissions without sharing node IAM role credentials. The equivalent of ECS Task Roles for Kubernetes.\n\n**AWS Load Balancer Controller**: Kubernetes controller that provisions ALB (for Ingress) or NLB (for Service type LoadBalancer) automatically based on Kubernetes annotations. Replaces the in-tree cloud provider load balancer.\n\n**EKS Add-ons**: AWS manages VPC CNI (networking), CoreDNS, kube-proxy, and EBS/EFS CSI driver lifecycle. Auto-updated, vulnerability-patched versions.\n\n**EKS vs ECS decision**:\n- Choose EKS: Kubernetes expertise on team, need Kubernetes API compatibility, multi-cloud portability, complex scheduling requirements, existing Helm charts\n- Choose ECS: AWS-native team, simpler operations, no Kubernetes complexity, tight AWS service integration priority',
          keyPoints: [
            { text: 'IRSA (IAM Roles for Service Accounts): pod-level IAM permissions via OIDC federation. Never use node IAM role for application permissions', examTip: true },
            { text: 'EKS Fargate: no EC2 nodes, no DaemonSets, no privileged containers, limited pod resource sizes. Use for isolated workloads needing strong isolation', examTip: true },
            { text: 'Karpenter vs Cluster Autoscaler: Karpenter is faster (seconds vs minutes), supports right-sizing, and handles consolidation. Prefer Karpenter for new EKS clusters', examTip: true },
            { text: 'EKS control plane is managed but you pay for it ($0.10/hr). Worker nodes are separate cost (EC2 or Fargate)', examTip: true },
          ],
          bestPractices: [
            { pillar: 'security', text: 'Implement IRSA for all pods requiring AWS API access — eliminates reliance on EC2 instance profile which grants same permissions to all pods on the node' },
            { pillar: 'cost-optimization', text: 'Use Karpenter with Spot instance diversification for non-critical workloads — Karpenter automatically selects lowest-cost Spot instance type from a diverse pool' },
            { pillar: 'reliability', text: 'Spread critical pods across AZs using pod topology spread constraints — prevents all replicas from landing in the same AZ' },
            { pillar: 'operational-excellence', text: 'Enable EKS managed add-ons for VPC CNI, CoreDNS, and kube-proxy — AWS patches security vulnerabilities automatically without manual helm chart updates' },
          ],
          comparisons: [
            {
              headers: ['Feature', 'ECS', 'EKS'],
              rows: [
                ['Control plane', 'AWS fully managed, proprietary', 'AWS managed Kubernetes API'],
                ['Worker nodes', 'EC2 or Fargate', 'EC2, Managed Node Groups, or Fargate'],
                ['Networking', 'awsvpc (VPC native)', 'VPC CNI (VPC native), others possible'],
                ['IAM integration', 'Task IAM Role', 'IRSA (per pod IAM role)'],
                ['Complexity', 'Lower (AWS-native concepts)', 'Higher (Kubernetes concepts)'],
                ['Ecosystem', 'AWS tools only', 'Full Kubernetes ecosystem (Helm, ArgoCD)'],
                ['Choose when', 'AWS-native team, simplicity priority', 'K8s expertise, multi-cloud, existing charts'],
              ],
            },
          ],
          useCases: [
            {
              scenario: 'An EKS pod running a payment processing service needs to call DynamoDB and KMS APIs. The team added the required IAM policies to the EC2 node IAM role. The security team flags this as a violation — all pods on the node share those permissions.',
              wrongChoices: ['Pass AWS credentials as environment variables in the pod spec (security risk — credentials in K8s secrets/env)', 'Create a separate node group just for payment pods with the restricted IAM role'],
              correctChoice: 'Configure IRSA: create an IAM Role for the payment service, associate it with the Kubernetes Service Account using OIDC federation. Only pods using that Service Account assume the IAM Role',
              reasoning: 'IRSA (IAM Roles for Service Accounts) provides pod-level IAM isolation. The payment pod\'s Service Account is annotated with the IAM Role ARN; the EKS OIDC provider federates the identity. Other pods on the same node get no DynamoDB/KMS access — least-privilege at the pod level.',
            },
            {
              scenario: 'An EKS cluster uses Cluster Autoscaler. During traffic spikes, new pods remain Pending for 3-5 minutes waiting for new nodes to provision. The latency spike is unacceptable for the SLA.',
              wrongChoices: ['Pre-warm the cluster by running always-on placeholder pods to keep extra nodes running (wastes cost)', 'Switch to Fargate for all pods — no node provisioning needed'],
              correctChoice: 'Replace Cluster Autoscaler with Karpenter. Karpenter watches for unschedulable pods and provisions right-sized EC2 instances in seconds (not minutes), with support for Spot diversification',
              reasoning: 'Cluster Autoscaler must wait for ASG to provision nodes (~2-3 min). Karpenter directly calls EC2 Fleet API and provisions nodes in ~60 seconds. It also selects optimal instance types and sizes based on pending pod requirements, eliminating the need for multiple node groups.',
            },
          ],
        },
      ],
    },
    {
      id: 'containers-ecr',
      title: 'ECR & Container Image Management',
      sections: [
        {
          id: 'containers-ecr-deep',
          title: 'ECR Architecture & Security',
          content: '**Amazon ECR**: Fully managed private Docker registry. Integrated with ECS, EKS, Lambda, and CodePipeline. Regional service — images stored in the region they\'re pushed to.\n\n**Repository types**:\n- **Private repositories**: Default. IAM policy controls access. Cross-account access via repository policy. Images encrypted at rest with KMS.\n- **Public repositories (ECR Public)**: Share images publicly. Free egress to anyone. Gallery at gallery.ecr.aws.\n\n**Image Scanning**:\n- **Basic scanning**: Uses Clair OS package scanning. Scan on push or manually triggered.\n- **Enhanced scanning**: AWS Inspector integration. Continuous scanning — new CVEs trigger re-scans of existing images. Language package scanning (npm, pip, gem) in addition to OS packages.\n\n**Lifecycle Policies**: Automatically remove old/untagged images to control storage costs. Example rules:\n- Keep last 30 tagged images per repository\n- Delete untagged images older than 7 days\n- Keep images tagged with `prod-*` forever, delete others after 90 days\n\n**Cross-Region and Cross-Account Replication**: Replicate images to other regions or accounts automatically. Use for: multi-region deployments (pull images locally instead of cross-region), disaster recovery (replica in DR region), central image distribution.\n\n**VPC Endpoints for ECR**: Interface endpoints for `ecr.api` and `ecr.dkr` — allows ECS/EKS in private subnets to pull images without NAT Gateway. Also need S3 Gateway Endpoint (ECR stores image layers in S3).',
          keyPoints: [
            { text: 'ECR Enhanced Scanning uses Inspector and continuously re-scans existing images when new CVEs are published — not just at push time', examTip: true },
            { text: 'ECR stores image layers in S3 — need both ECR interface endpoints AND S3 Gateway endpoint for private subnet image pulls', gotcha: true },
            { text: 'Lifecycle policies are critical for cost control — untagged images accumulate rapidly in CI/CD pipelines without cleanup policies', examTip: true },
          ],
          bestPractices: [
            { pillar: 'security', text: 'Enable ECR Enhanced Scanning for production repositories — continuous CVE monitoring catches new vulnerabilities in images already deployed' },
            { pillar: 'cost-optimization', text: 'Configure lifecycle policies on all repositories to delete untagged images after 7 days and keep only last 10-30 tagged versions per repository' },
            { pillar: 'reliability', text: 'Enable cross-region replication for production images — ECS/EKS in each region pulls from local ECR replica, not cross-region, reducing pull latency and avoiding cross-region data transfer costs' },
          ],
        },
      ],
    },
  ],
};
