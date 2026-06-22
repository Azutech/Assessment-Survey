import { Module } from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { SurveysController } from './surveys.controller';
import { HttpModule } from '@nestjs/axios';
import { SurveyRepository } from './repository/survey.repository';
import { MarketRepository } from '../markets/repository/market.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Survey, surveySchema } from './entity/survey.entity';
import { Market, MarketSchema } from '../markets/entity/market.entity';
import { Agent, agentSchema } from '../agents/entity/agent.entity';
import { AgentRepository } from '../agents/repository/agent.repository';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: Market.name, schema: MarketSchema },
      { name: Survey.name, schema: surveySchema },
      { name: Agent.name, schema: agentSchema },
    ]),
  ],
  controllers: [SurveysController],
  providers: [
    SurveysService,
    SurveyRepository,
    MarketRepository,
    AgentRepository,
  ],
})
export class SurveysModule {}
