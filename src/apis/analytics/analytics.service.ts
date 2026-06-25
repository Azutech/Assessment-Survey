import { Injectable } from '@nestjs/common';
import { SurveyRepository } from '../surveys/repository/survey.repository';

@Injectable()
export class AnalyticsService {
  constructor(private readonly surveyRepository: SurveyRepository) {}

  async marketAnalytics(from?: string, to?: string): Promise<any> {
    const marketAnalysis =
      await this.surveyRepository.getMarketAnalytics(from, to);

    return marketAnalysis;
  }

  async summaryAnalytics(dateRange?: string): Promise<any> {
    const summaryAnalysis =
      await this.surveyRepository.getSummaryAnalytics(dateRange);

    return summaryAnalysis;
  }

  async getAgentAnalytics(dateRange?: string): Promise<any> {
    const agentAnalysis =
      await this.surveyRepository.getAgentAnalytics(dateRange);

    return agentAnalysis;
  }
}
