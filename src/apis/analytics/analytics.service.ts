import { Injectable } from '@nestjs/common';
import { SurveyRepository } from '../surveys/repository/survey.repository';

@Injectable()
export class AnalyticsService {
  constructor(private readonly surveyRepository: SurveyRepository) {}

  async marketAnalytics(dateRange?: string): Promise<any> {
    const marketAnalysis =
      await this.surveyRepository.getMarketAnalytics(dateRange);

    return marketAnalysis;
  }
}
