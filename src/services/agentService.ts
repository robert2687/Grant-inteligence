import { GoogleGenAI, Type } from '@google/genai';
import { Grant, Evaluation, AdminData, UserProfile, Project } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

const SEARCH_AGENT_PROMPT = `You are an Autonomous Global Grant-Search Agent operating continuously.
Mission: Identify, monitor, and update all relevant grants, funds, calls, and financing programs worldwide for RMD26.
Scope: Government grants, Horizon Europe, Digital Europe, CEF, EIC, Erasmus+, Innovation, R&D, AI/ML, cloud, cybersecurity, digital transformation, Private foundations, corporate innovation challenges, accelerators.
Constraints: Always prioritize AI/ML, autonomous agents, cloud, SaaS, digital compliance, and innovation. Ensure global coverage. Avoid duplicates.`;

const EVAL_AGENT_PROMPT = `You are a Grant Evaluation & Success Probability Agent.
Mission: Evaluate how well RMD26 fits each funding opportunity and estimate the probability of success.
Inputs: Grant description, Eligibility criteria, Funding priorities, Project concept from RMD26.`;

const COPYWRITER_AGENT_PROMPT = `You are a Grant Proposal Copywriter Agent specializing in high-impact, competitive funding applications.
Mission: Write complete, compelling, and compliant grant proposals for RMD26.
Writing Style: Clear, structured, persuasive, Evidence-based, Aligned with EU and global grant standards, Tailored to evaluators' scoring criteria.`;

const ADMIN_AGENT_PROMPT = `You are a Grant Administration Assistant Agent responsible for managing all administrative, organizational, and compliance-related tasks across the entire grant lifecycle for RMD26.
Mission: Ensure that every grant application is administratively complete, compliant, well-organized, and submitted on time. Support the team with documentation, deadlines, templates, forms, and communication.`;

export const scanForGrants = async (profile?: UserProfile | null, project?: Project | null): Promise<Grant[]> => {
  let contents = "Find 3 new, highly relevant global grant opportunities for an AI/ML and autonomous agents startup named RMD26. Return realistic, currently active or upcoming grants if possible.";
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
  let contents = `Evaluate this grant for RMD26 (AI/ML Autonomous Agents Startup):\n\n${JSON.stringify(grant, null, 2)}`;
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

export const createProposalChat = (grant: Grant | null, evaluation: Evaluation | null, project: Project | null, profile: UserProfile | null) => {
  let systemInstruction = COPYWRITER_AGENT_PROMPT;
  
  let context = "Context Information:\n\n";
  if (grant) context += `Grant Details:\n${JSON.stringify(grant, null, 2)}\n\n`;
  if (evaluation) context += `Evaluation Context:\n${JSON.stringify(evaluation, null, 2)}\n\n`;
  if (project) context += `User's Project:\n${JSON.stringify(project, null, 2)}\n\n`;
  if (profile) context += `User Profile:\n${JSON.stringify(profile, null, 2)}\n\n`;

  systemInstruction += `\n\n${context}\nUse this context to answer the user's questions, draft proposals, and provide guidance.`;

  return ai.chats.create({
    model: 'gemini-3.1-pro-preview',
    config: {
      systemInstruction,
    }
  });
};

export const generateAdminPlan = async (grant: Grant, project: Project | null): Promise<AdminData> => {
  let contents = `Create an administrative checklist and timeline for this grant:\n\n${JSON.stringify(grant, null, 2)}`;
  if (project) {
    contents += `\n\nUser's Project Context:\n${JSON.stringify(project, null, 2)}\n\nTailor the administrative plan to this project.`;
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
                status: { type: Type.STRING, enum: ["pending", "completed"] }
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
                status: { type: Type.STRING, enum: ["missing", "drafted", "finalized"] }
              },
              required: ["name", "status"]
            }
          }
        },
        required: ["tasks", "documents"]
      }
    }
  });
  
  const adminData = JSON.parse(response.text || '{}');
  return { ...adminData, grantId: grant.id };
};
