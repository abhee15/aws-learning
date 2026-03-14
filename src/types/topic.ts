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

export interface Section {
  id: string;
  title: string;
  content: string;
  keyPoints: KeyPoint[];
  services?: string[];
  comparisons?: { headers: string[]; rows: string[][] }[];
  useCases?: UseCaseScenario[];
  mnemonics?: MnemonicEntry[];
}

export interface Subtopic {
  id: string;
  title: string;
  sections: Section[];
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
}
