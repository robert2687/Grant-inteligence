export interface UserProfile {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  country: string;
  city: string;
  photoUrl: string;
  bio: string;
  profession: string;
  industry: string;
  yearsOfExperience: string;
  skills: string;
  certifications: string;
  website: string;
  preferredGrantTypes: string;
  preferredRegions: string;
  fundingSizeRange: string;
  projectThemes: string;
  preferredDeadlines: string;
}

export interface Grant {
  id: string;
  name: string;
  region: string;
  amount: string;
  deadline: string;
  eligibility: string;
  themes: string[];
  sourceLink: string;
  fitScore: number;
  relevance: string;
  status: 'discovered' | 'evaluating' | 'writing' | 'submitted' | 'rejected';
}

export interface Evaluation {
  grantId: string;
  eligibilityMatch: number;
  thematicFit: number;
  innovationStrength: number;
  trlAlignment: string;
  geographicFit: number;
  consortiumReqs: string;
  budgetFeasibility: string;
  adminComplexity: string;
  competitionLevel: string;
  overallScore: number;
  justification: string;
  risks: string[];
  recommendations: string[];
  decision: 'Go' | 'No-Go';
}

export interface AdminData {
  grantId: string;
  tasks: { name: string; deadline: string; status: 'pending' | 'completed' }[];
  documents: { name: string; status: 'missing' | 'drafted' | 'finalized' }[];
}
