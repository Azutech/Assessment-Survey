import { Injectable } from '@nestjs/common';
import { CreateSurveyDto } from './dto/survey.dto';
import { SurveyRepository } from './repository/survey.repository';
import { MarketRepository } from '../markets/repository/market.repository';

@Injectable()
export class SurveysService {
  constructor(
    private readonly surveyRepository: SurveyRepository,
    private readonly marketRepository: MarketRepository,
  ) {}
  
  async addAgentSurvey(surveyDto: CreateSurveyDto) {
    const {
      marketName,
      businessName,
      startTime,
      endTime,
      phoneNumber,
      GPS,
      businessType,
      shopStatus,
      consent,
      marketState,
      marketEntity,
    } = surveyDto;
  }
}
