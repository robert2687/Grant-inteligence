import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { Grant, Evaluation, AdminData, UserProfile, Project } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

const SEARCH_AGENT_PROMPT = `You are an Autonomous Global Grant-Search Agent operating continuously.
Mission: Identify, monitor, and update all relevant grants, funds, calls, and financing programs worldwide.
Scope: Government grants, Horizon Europe, Digital Europe, CEF, EIC, Erasmus+, Innovation, R&D, AI/ML, cloud, cybersecurity, digital transformation, Private foundations, corporate innovation challenges, accelerators.
Constraints: Always prioritize AI/ML, autonomous agents, cloud, SaaS, digital compliance, and innovation. Ensure global coverage. Avoid duplicates.`;

const EVAL_AGENT_PROMPT = `You are a Grant Evaluation & Success Probability Agent.
Mission: Evaluate how well the user's project fits each funding opportunity and estimate the probability of success.
Inputs: Grant description, Eligibility criteria, Funding priorities, Project concept.`;

const COPYWRITER_AGENT_PROMPT = `You are a Grant Proposal Copywriter Agent specializing in high-impact, competitive funding applications.
Mission: Write complete, compelling, and compliant grant proposals.
Writing Style: Clear, structured, persuasive, Evidence-based, Aligned with EU and global grant standards, Tailored to evaluators' scoring criteria.`;

const saveProjectDeclaration: FunctionDeclaration = {
  name: "saveProject",
  description: "Save a new project or update an existing project in the workspace. Use this when the user provides project details in the chat.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Project name" },
      summary: { type: Type.STRING, description: "Short summary" },
      objectives: { type: Type.STRING, description: "Objectives" },
      targetImpact: { type: Type.STRING, description: "Target impact" },
      technologyArea: { type: Type.STRING, description: "Technology area" },
      teamMembers: { type: Type.STRING, description: "Team members (optional)" },
      trlLevel: { type: Type.STRING, description: "TRL level (optional)" },
      additionalNotes: { type: Type.STRING, description: "Additional notes" }
    },
    required: ["name", "summary", "objectives", "targetImpact", "technologyArea"]
  }
};

const ADMIN_AGENT_PROMPT = `You are a Grant Administration Assistant Agent responsible for managing all administrative, organizational, and compliance-related tasks across the entire grant lifecycle.
Mission: Ensure that every grant application is administratively complete, compliant, well-organized, and submitted on time. Support the team with documentation, deadlines, templates, forms, and communication.`;

export const scanForGrants = async (profile?: UserProfile | null, project?: Project | null): Promise<Grant[]> => {
  let contents = "Find 3 new, highly relevant global grant opportunities. Return realistic, currently active or upcoming grants if possible.";
  if (profile) {
    contents += `\n\nPersonalize the recommendations based on this user profile:\n${JSON.stringify(profile, null, 2)}`;
  }
  if (project) {
    contents += `\n\nFocus on grants that fit this specific project:\n${JSON.stringify(project, null, 2)}`;
  }
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents,
    config: {
      systemInstruction: SEARCH_AGENT_PROMPT,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: "A unique short ID" },
            name: { type: Type.STRING },
            region: { type: Type.STRING },
            amount: { type: Type.STRING },
            deadline: { type: Type.STRING, description: "YYYY-MM-DD" },
            eligibility: { type: Type.STRING },
            themes: { type: Type.ARRAY, items: { type: Type.STRING } },
            sourceLink: { type: Type.STRING },
            fitScore: { type: Type.NUMBER, description: "0-100" },
            relevance: { type: Type.STRING }
          },
          required: ["id", "name", "region", "amount", "deadline", "eligibility", "themes", "sourceLink", "fitScore", "relevance"]
        }
      }
    }
  });
  
  const grants = JSON.parse(response.text || '[]');
  return grants.map((g: any) => ({ ...g, status: 'discovered' }));
};

export const evaluateGrant = async (grant: Grant, project: Project | null): Promise<Evaluation> => {
  let contents = `Evaluate this grant:\n\n${JSON.stringify(grant, null, 2)}`;
  if (project) {
    contents += `\n\nUser's Project Context:\n${JSON.stringify(project, null, 2)}\n\nEvaluate the grant based on how well it fits this project.`;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents,
    config: {
      systemInstruction: EVAL_AGENT_PROMPT,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          eligibilityMatch: { type: Type.NUMBER },
          thematicFit: { type: Type.NUMBER },
          innovationStrength: { type: Type.NUMBER },
          trlAlignment: { type: Type.STRING },
          geographicFit: { type: Type.NUMBER },
          consortiumReqs: { type: Type.STRING },
          budgetFeasibility: { type: Type.STRING },
          adminComplexity: { type: Type.STRING },
          competitionLevel: { type: Type.STRING },
          overallScore: { type: Type.NUMBER },
          justification: { type: Type.STRING },
          risks: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          decision: { type: Type.STRING, enum: ["Go", "No-Go"] }
        },
        required: ["eligibilityMatch", "thematicFit", "innovationStrength", "trlAlignment", "geographicFit", "consortiumReqs", "budgetFeasibility", "adminComplexity", "competitionLevel", "overallScore", "justification", "risks", "recommendations", "decision"]
      }
    }
  });
  
  const evalData = JSON.parse(response.text || '{}');
  return { ...evalData, grantId: grant.id };
};

export const draftProposal = async (grant: Grant, evaluation: Evaluation | null, project: Project | null): Promise<string> => {
  let contents = `Write a comprehensive Executive Summary and Project Concept for this grant application.\n\nGrant Details:\n${JSON.stringify(grant, null, 2)}\n\nEvaluation Context:\n${JSON.stringify(evaluation, null, 2)}\n\nFormat as Markdown. Include: Executive Summary, Problem Statement, Innovation Description, and Impact Analysis.`;
  if (project) {
    contents += `\n\nUser's Project Context:\n${JSON.stringify(project, null, 2)}\n\nUse this project information to write the proposal.`;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents,
    config: {
      systemInstruction: COPYWRITER_AGENT_PROMPT,
    }
  });
  
  return response.text || '';
};

export const createProposalChat = (grant: Grant | null, evaluation: Evaluation | null, project: Project | null, profile: UserProfile | null, history?: {role: 'user' | 'model', content: string}[]) => {
  let systemInstruction = COPYWRITER_AGENT_PROMPT;
  
  let context = "Context Information:\n\n";
  if (grant) context += `Grant Details:\n${JSON.stringify(grant, null, 2)}\n\n`;
  if (evaluation) context += `Evaluation Context:\n${JSON.stringify(evaluation, null, 2)}\n\n`;
  if (project) context += `User's Project:\n${JSON.stringify(project, null, 2)}\n\n`;
  if (profile) context += `User Profile:\n${JSON.stringify(profile, null, 2)}\n\n`;

  systemInstruction += `\n\n${context}\nUse this context to answer the user's questions, draft proposals, and provide guidance. If the user provides project details, use the saveProject tool to save them.`;

  const formattedHistory = history?.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.content }]
  }));

  return ai.chats.create({
    model: 'gemini-3.1-pro-preview',
    config: {
      systemInstruction,
      tools: [{ functionDeclarations: [saveProjectDeclaration] }]
    },
    history: formattedHistory
  });
};

export const generateAdminPlan = async (grant: Grant, project: Project | null, isEUMode: boolean = false): Promise<AdminData> => {
  let contents = `Create an administrative checklist and timeline for this grant:\n\n${JSON.stringify(grant, null, 2)}`;
  if (project) {
    contents += `\n\nUser's Project Context:\n${JSON.stringify(project, null, 2)}\n\nTailor the administrative plan to this project.`;
  }

  if (isEUMode) {
    contents += `\n\nEU GRANTS MODE ENABLED: This is an EU grant (e.g., Horizon Europe, EIC Accelerator, Digital Europe, Erasmus+, Interreg, CEF). You MUST include the 'euData' object in your JSON response with EU-specific features: PIC validation, consortium partner tracking, Work Package structure, Ethics & Data Management requirements, EU budget categories (Personnel, Subcontracting, Travel, Other Direct Costs, Indirect Costs), TRL alignment checks, and an EU-style submission readiness score (0-100). Make sure to analyze the grant details and project to populate this data.`;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents,
    config: {
      systemInstruction: ADMIN_AGENT_PROMPT,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                deadline: { type: Type.STRING },
                status: { type: Type.STRING, enum: ["completed", "in progress", "missing", "overdue"] }
              },
              required: ["name", "deadline", "status"]
            }
          },
          documents: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                status: { type: Type.STRING, enum: ["completed", "in progress", "missing", "overdue"] }
              },
              required: ["name", "status"]
            }
          },
          submissionReadiness: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                indicator: { type: Type.STRING },
                status: { type: Type.STRING, enum: ["completed", "in progress", "missing", "overdue"] }
              },
              required: ["indicator", "status"]
            }
          },
          complianceWarnings: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                warning: { type: Type.STRING },
                status: { type: Type.STRING, enum: ["completed", "in progress", "missing", "overdue"] }
              },
              required: ["warning", "status"]
            }
          },
          alerts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ["deadline", "document", "registration", "task", "guideline"] },
                message: { type: Type.STRING },
                severity: { type: Type.STRING, enum: ["high", "medium", "low"] },
                affectedItems: { type: Type.ARRAY, items: { type: Type.STRING } },
                nextSteps: { type: Type.STRING }
              },
              required: ["type", "message", "severity", "affectedItems", "nextSteps"]
            }
          },
          euData: {
            type: Type.OBJECT,
            properties: {
              program: { type: Type.STRING, enum: ['Horizon Europe', 'EIC Accelerator', 'Digital Europe', 'Erasmus+', 'Interreg', 'CEF', 'Other'] },
              picValidation: {
                type: Type.OBJECT,
                properties: {
                  status: { type: Type.STRING, enum: ['valid', 'invalid', 'missing', 'pending'] },
                  pic: { type: Type.STRING },
                  message: { type: Type.STRING }
                },
                required: ["status", "message"]
              },
              consortium: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    partnerName: { type: Type.STRING },
                    pic: { type: Type.STRING },
                    role: { type: Type.STRING, enum: ['Coordinator', 'Partner', 'Affiliated Entity'] },
                    country: { type: Type.STRING },
                    status: { type: Type.STRING, enum: ['confirmed', 'pending', 'missing'] }
                  },
                  required: ["partnerName", "pic", "role", "country", "status"]
                }
              },
              workPackages: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    wpNumber: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    leader: { type: Type.STRING },
                    status: { type: Type.STRING, enum: ['draft', 'final', 'missing'] }
                  },
                  required: ["wpNumber", "title", "leader", "status"]
                }
              },
              ethicsAndData: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    requirement: { type: Type.STRING },
                    status: { type: Type.STRING, enum: ['compliant', 'action needed', 'missing'] }
                  },
                  required: ["requirement", "status"]
                }
              },
              budget: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING, enum: ['Personnel', 'Subcontracting', 'Travel', 'Other Direct Costs', 'Indirect Costs'] },
                    amount: { type: Type.NUMBER },
                    status: { type: Type.STRING, enum: ['aligned', 'over limit', 'under limit', 'missing'] }
                  },
                  required: ["category", "amount", "status"]
                }
              },
              trlAlignment: {
                type: Type.OBJECT,
                properties: {
                  expectedTRL: { type: Type.STRING },
                  currentTRL: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ['aligned', 'misaligned', 'unknown'] }
                },
                required: ["expectedTRL", "currentTRL", "status"]
              },
              euReadinessScore: { type: Type.NUMBER }
            },
            required: ["program", "picValidation", "consortium", "workPackages", "ethicsAndData", "budget", "trlAlignment", "euReadinessScore"]
          }
        },
        required: ["tasks", "documents", "submissionReadiness", "complianceWarnings", "alerts"]
      }
    }
  });
  
  const adminData = JSON.parse(response.text || '{}');
  return { ...adminData, grantId: grant.id };
};
