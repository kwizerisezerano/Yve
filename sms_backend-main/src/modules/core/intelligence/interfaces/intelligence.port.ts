export const INTELLIGENCE_PORT = 'INTELLIGENCE_PORT';

export interface IntelligenceContext {
  tenantId: string;
  messageCount?: number;
  failureRate?: number;
  topRoutes?: string[];
}

export interface Recommendation {
  action: string;
  reason: string;
  confidence: number; // 0–1
}

export interface IntelligencePort {
  analyze(context: IntelligenceContext): Promise<Recommendation>;
}
