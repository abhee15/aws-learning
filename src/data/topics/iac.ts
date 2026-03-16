import type { Topic } from '../../types/topic';

export const iacTopic: Topic = {
  id: 'iac',
  slug: 'iac',
  title: 'Infrastructure as Code: CloudFormation & CDK',
  shortTitle: 'IaC',
  icon: 'GitBranch',
  color: 'violet',
  examDomains: ['new-solutions', 'continuous-improvement'],
  estimatedStudyHours: 4,
  summaryBullets: [
    'CloudFormation: declarative YAML/JSON templates. Stacks manage lifecycle. Change Sets preview changes before apply',
    'StackSets deploy to multiple accounts/regions from a single template — OUs or explicit account lists',
    'CDK synthesizes to CloudFormation. Constructs L1 (raw CFN), L2 (opinionated defaults), L3 (patterns)',
    'cfn-init and cfn-signal for EC2 bootstrapping within CloudFormation with creation policy timeouts',
    'Drift detection identifies manually changed resources. Nested stacks for reusable modules',
  ],
  relatedTopics: ['compute', 'security', 'iam'],
  subtopics: [
    {
      id: 'iac-cfn',
      title: 'CloudFormation Deep Dive',
      sections: [
        {
          id: 'iac-cfn-core',
          title: 'CloudFormation Core Concepts',
          content: '**AWS CloudFormation**: Infrastructure as code via declarative YAML or JSON templates. Define desired state; CloudFormation handles resource creation, update, and deletion in the correct order based on dependency graph.\n\n**Template sections**:\n- **Parameters**: User-supplied values at stack creation/update. Types: String, Number, AWS::EC2::Image::Id, etc. SSM Parameter references for dynamic values.\n- **Mappings**: Static lookup tables (e.g., region-to-AMI mapping). Access with `Fn::FindInMap`.\n- **Conditions**: Conditionally create resources based on parameter values (e.g., create bastion only in prod).\n- **Resources**: Required. AWS resources to create. Each has Type, Properties, DependsOn, DeletionPolicy, UpdateReplacePolicy.\n- **Outputs**: Exported values from the stack for cross-stack references or human consumption.\n\n**Stack operations**:\n- **Create**: Provisions all resources. Rollback on failure (configurable).\n- **Update**: CloudFormation determines update impact per resource: No Interruption, Some Interruption (restart), Replacement (new resource, old deleted). Use Change Sets to preview.\n- **Delete**: Removes all resources (unless DeletionPolicy=Retain or Snapshot).\n\n**Change Sets**: Preview what changes will occur before executing an update. Shows which resources will be Added, Modified, or Removed, and the impact (Replacement vs Modification). Critical for production stack updates — never update without reviewing a change set.\n\n**DeletionPolicy**:\n- `Delete` (default): resource deleted when stack deleted\n- `Retain`: resource kept after stack deletion (S3 buckets with objects, DynamoDB tables)\n- `Snapshot`: snapshot taken before deletion (RDS, EBS)\n\n**CloudFormation StackSets**: Deploy the same template to multiple AWS accounts and/or regions from a single operation. Two permission models: self-managed (IAM roles in each account) or service-managed (AWS Organizations). Use for: security baselines (CloudTrail, Config rules) across all accounts, account vending machine.',
          keyPoints: [
            { text: 'Change Sets preview what WILL happen before executing — always create and review a change set before updating production stacks', examTip: true },
            { text: 'DeletionPolicy=Retain: resource persists after stack deletion. DeletionPolicy=Snapshot: RDS/EBS snapshot before deletion', examTip: true },
            { text: 'StackSets with Organizations service-managed permissions: automatically include new accounts added to target OUs — no manual IAM role setup', examTip: true },
            { text: 'UpdateReplacePolicy: controls behavior when a resource is replaced during update (separate from DeletionPolicy which controls stack deletion)', gotcha: true },
          ],
          bestPractices: [
            { pillar: 'reliability', text: 'Enable rollback triggers on critical stacks — CloudWatch alarms that, if breached during update, automatically rollback the stack to the last known good state' },
            { pillar: 'operational-excellence', text: 'Use StackSets with Organizations service-managed permissions to deploy security baselines (Config rules, CloudTrail, GuardDuty) to all accounts automatically' },
            { pillar: 'security', text: 'Set DeletionPolicy=Retain on stateful resources (S3, DynamoDB, RDS) in production stacks — prevents accidental data loss if someone deletes the stack' },
            { pillar: 'operational-excellence', text: 'Use AWS CloudFormation drift detection regularly — identifies resources manually changed outside CloudFormation, which can cause update failures or unexpected behavior' },
          ],
          useCases: [
            {
              scenario: 'A team needs to deploy identical security baseline configurations (CloudTrail trail, Config rules, GuardDuty) to 50 existing AWS accounts and all future accounts added to the Organization.',
              wrongChoices: ['Manual deployment in each account — error-prone and doesn\'t cover future accounts', 'AWS CLI scripts — not idempotent, hard to update consistently across 50 accounts'],
              correctChoice: 'CloudFormation StackSet with Organizations service-managed permissions targeting the root OU. Automatic deployment enables for all current accounts and "Automatic deployment" setting covers future accounts.',
              reasoning: 'StackSets with Organizations integration automatically deploys to all accounts in targeted OUs, including new accounts as they\'re added. Service-managed permissions eliminate the need to create IAM roles in each account.',
            },
          ],
          comparisons: [
            {
              headers: ['Feature', 'CloudFormation', 'AWS CDK', 'Terraform'],
              rows: [
                ['Language', 'YAML/JSON', 'TypeScript, Python, Java, Go', 'HCL'],
                ['Abstraction', 'Low (raw AWS)', 'High (L2/L3 constructs)', 'Medium'],
                ['State management', 'AWS-managed (in CloudFormation)', 'Synthesizes to CFN (CFN manages state)', 'Local/remote state file'],
                ['Multi-cloud', 'AWS only', 'AWS only', 'Yes (multi-provider)'],
                ['Testing', 'Limited (cfn-lint)', 'Unit tests with jest/pytest', 'terraform validate + plan'],
                ['Best for', 'Simple infra, existing teams', 'Complex infra, developer teams', 'Multi-cloud, existing HCL teams'],
              ],
            },
          ],
        },
        {
          id: 'iac-cfn-ec2',
          title: 'EC2 Bootstrapping & cfn-init',
          content: '**cfn-init**: CloudFormation helper script for EC2 instance initialization. Reads `AWS::CloudFormation::Init` metadata from the template and configures the instance: install packages, create files, run commands, enable services.\n\n**cfn-signal**: EC2 instance signals CloudFormation when initialization is complete (or failed). Used with **Creation Policy** and **Wait Conditions** to pause stack creation until instances are ready.\n\n**Creation Policy example**: Stack marks EC2 instance as CREATE_COMPLETE only after receiving a success signal within a timeout period. If signal not received in time → stack rolls back. Prevents the stack from succeeding before the application is actually running.\n\n**cfn-hup**: Daemon on EC2 that detects CloudFormation stack updates and re-runs cfn-init. Enables configuration updates without replacing instances.\n\n**UserData vs cfn-init**:\n- UserData: simple bash script, runs once at first boot, no CloudFormation integration for success/failure signaling\n- cfn-init: declarative configuration, idempotent, signals CloudFormation, supports cfn-hup for updates\n\n**Systems Manager (SSM) integration**: Modern alternative to cfn-init for complex bootstrapping. Use Launch Templates with SSM Run Command or State Manager associations. More flexible, observable via SSM console.',
          keyPoints: [
            { text: 'cfn-signal + Creation Policy: stack waits for signal before marking resource as CREATE_COMPLETE. Without this, stack succeeds even if EC2 app fails to start', examTip: true },
            { text: 'cfn-hup: re-runs cfn-init on stack updates — enables in-place config changes without instance replacement', examTip: true },
          ],
        },
      ],
    },
    {
      id: 'iac-cdk',
      title: 'AWS CDK',
      sections: [
        {
          id: 'iac-cdk-core',
          title: 'CDK Architecture & Constructs',
          content: '**AWS CDK (Cloud Development Kit)**: Define AWS infrastructure using familiar programming languages. Synthesizes to CloudFormation templates. All CloudFormation features available.\n\n**CDK Construct levels**:\n- **L1 (CfnX)**: Direct mapping to CloudFormation resources. `CfnBucket`, `CfnFunction`. All properties exposed, no defaults. Use when you need exact CFN control.\n- **L2 (Constructs)**: Higher-level abstractions with smart defaults. `Bucket`, `Function`, `Table`. Automatically wires IAM policies, log groups, etc. Most commonly used.\n- **L3 (Patterns)**: Complete application patterns combining multiple services. `ApplicationLoadBalancedFargateService`, `LambdaRestApi`. Implements well-architected patterns by default.\n\n**CDK core concepts**:\n- **App**: Root CDK application.\n- **Stack**: Maps to a CloudFormation stack. Unit of deployment.\n- **Construct**: Building block — can be a single resource or complex pattern.\n- **Environment**: Account + region combination where the stack deploys.\n\n**CDK Pipelines**: CI/CD pipeline construct for deploying CDK apps. Automatically generates CodePipeline with source, synth, asset publishing, and deployment stages. Self-mutating — pipeline updates itself when CDK pipeline code changes.\n\n**CDK Aspects**: Apply operations across the entire CDK tree (all constructs). Use cases: add tags to all resources, enforce bucket encryption, add specific IAM permissions. Applied at synth time.\n\n**CDK Escape Hatch**: Access underlying L1 construct when L2 does not expose a required property. `(myBucket.node.defaultChild as CfnBucket).accelerateConfiguration = ...`',
          keyPoints: [
            { text: 'CDK L2 constructs: opinionated defaults (encryption enabled, log group created). L1 (CfnX): raw CloudFormation, no defaults', examTip: true },
            { text: 'CDK synthesizes to CloudFormation — all CloudFormation features apply. State management, rollback, change sets all work the same', examTip: true },
            { text: 'CDK Aspects: cross-cutting concerns applied to all constructs in scope — tagging policies, security enforcement across entire stack', examTip: true },
          ],
          bestPractices: [
            { pillar: 'operational-excellence', text: 'Use CDK Pipelines for multi-stage deployments (dev → staging → prod) with manual approval gates between stages — infrastructure changes follow the same CI/CD rigor as application code' },
            { pillar: 'security', text: 'Use CDK Aspects to enforce organization-wide security standards (bucket encryption, VPC-only access) across all stacks — catches misconfigurations at synth time before deployment' },
            { pillar: 'operational-excellence', text: 'Write unit tests for CDK constructs using CDK Assertions library — test that the synthesized CloudFormation template contains expected resources and properties' },
          ],
        },
      ],
    },
  ],
};
