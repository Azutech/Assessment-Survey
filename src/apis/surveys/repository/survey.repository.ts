import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SurveyDocument, Survey } from '../entity/survey.entity';
import { Model, Types } from 'mongoose';
import { PropDataInput } from '../../../common/utils/utils.interface';
import { SurveyI } from '../interfaces/survey.interface';

@Injectable()
export class SurveyRepository {
  constructor(
    @InjectModel(Survey.name) private surveyModel: Model<SurveyDocument>,
  ) {}

  async create(customer: SurveyI): Promise<Survey> {
    const newCustomer = new this.surveyModel(customer);
    return newCustomer.save();
  }
}
