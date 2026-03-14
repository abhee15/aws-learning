export type ExamDomain =
  | 'organizational-complexity'
  | 'new-solutions'
  | 'migration-modernization'
  | 'cost-optimization'
  | 'continuous-improvement';

export interface KeyPoint {
  text: string;
  examTip?: boolean;
  gotcha?: boolean;
}

export interface MnemonicEntry {
  id: string;
  phrase: string;
  expansion: string[];
  category: string;
  visualCueType: 'acronym' | 'story' | 'comparison' | 'visual';
}

export interface ServiceComparison {
  attribute: string;
  values: Record<string, string>;
}

export interface ArchitectureDiagram {
  id: string;
  title: string;
  description: string;
}

export interface UseCaseScenario {
  scenario: string;
  wrongChoices: string[];
  correctChoice: string;
  reasoning: string;
}

export type WAPillar =
  | 'operational-excellence'
  | 'security'
  | 'reliability'
  | 'performance'
  | 'cost-optimization'
  | 'sustainability';

export interface BestPractice {
  text: string;
  pillar: WAPillar;
  detail?: string;
}

export interface Section {
  id: string;
  title: string;
  content: string;
  keyPoints: KeyPoint[];
  services?: string[];
  comparisons?: { headers: string[]; rows: string[][] }[];
  useCases?: UseCaseScenario[];
  mnemonics?: MnemonicEntry[];
  bestPractices?: BestPractice[];
}

export interface Subtopic {
  id: string;
  title: string;
  sections: Section[];
}

export interface ArchitectureComponent {
  name: string;
  role: string;
}

export interface SolutionArchitecture {
  id: string;
  title: string;
  description: string;
  useCase: string;
  components: ArchitectureComponent[];
  dataFlow: string[];
  keyDecisions: string[];
  tradeoffs: { pro: string; con: string }[];
  examAngle?: string;
}

export interface Topic {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  icon: string;
  color: string;
  examDomains: ExamDomain[];
  estimatedStudyHours: number;
  subtopics: Subtopic[];
  summaryBullets: string[];
  relatedTopics: string[];
  solutionArchitectures?: SolutionArchitecture[];
}
