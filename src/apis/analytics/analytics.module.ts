import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { SurveyRepository } from '../surveys/repository/survey.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Survey, surveySchema } from '../surveys/entity/survey.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Survey.name, schema: surveySchema }]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, SurveyRepository],
})
export class AnalyticsModule {}
