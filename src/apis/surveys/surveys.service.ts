import { Injectable } from '@nestjs/common';
import { CreateSurveyDto } from './dto/survey.dto';

@Injectable()
export class SurveysService {
  create(createSurveyDto: CreateSurveyDto) {
    return 'This action adds a new survey';
  }

  findAll() {
    return `This action returns all surveys`;
  }
}
