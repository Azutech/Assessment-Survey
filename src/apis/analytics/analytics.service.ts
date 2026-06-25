import { Injectable } from '@nestjs/common';
import { SurveyRepository } from '../surveys/repository/survey.repository';
import { toArray } from 'pdfkit/js/pdfkit.standalone';

@Injectable()
export class AnalyticsService {
  constructor(private readonly surveyRepository: SurveyRepository) {}

  async marketAnalytics(from?: string, to?: string): Promise<any> {
    const marketAnalysis = await this.surveyRepository.getMarketAnalytics(
      from,
      to,
    );

    return marketAnalysis;
  }

  async summaryAnalytics(from?: string, to?: string): Promise<any> {
    const summaryAnalysis = await this.surveyRepository.getSummaryAnalytics(
      from,
      to,
    );

    return summaryAnalysis;
  }

  async getAgentAnalytics(from?: string, to?: string): Promise<any> {
    const agentAnalysis = await this.surveyRepository.getAgentAnalytics(
      from,
      to,
    );

    return agentAnalysis;
  }
}
