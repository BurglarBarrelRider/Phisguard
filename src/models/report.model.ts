import { User } from './user.model';

export interface RedFlag {
  category: string;
  description: string;
}

export interface AnalysisResult {
  isPhishing: boolean;
  confidenceScore: number;
  summary: string;
  redFlags: RedFlag[];
  recommendedAction: string;
  educationalTakeaway: string;
}

export interface Report {
  id: string;
  user: User;
  originalEmail: string;
  analysis: AnalysisResult;
  timestamp: Date;
  isPublic?: boolean;
  likes: string[];
}
