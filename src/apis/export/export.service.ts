import { Injectable } from '@nestjs/common';
import { SurveyRepository } from '../surveys/repository/survey.repository';


@Injectable()
export class ExportService {
    constructor (
        private readonly surveyRepository: SurveyRepository
    ) {}
}
