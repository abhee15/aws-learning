import type { ExamDomain } from './topic';

export type QuestionType = 'single' | 'multiple';
export type QuestionDifficulty = 1 | 2 | 3;

export interface Option {
  id: string;
  text: string;
  correct: boolean;
  explanation?: string;
}

export interface Explanation {
  overall: string;
  examTip?: string;
  awsDocUrl?: string;
}

export interface Question {
  id: string;
  stem: string;
  topicSlug: string;
  examDomain: ExamDomain;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  options: Option[];
  explanation: Explanation;
  tags?: string[];
}
