import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { SurveyRepository } from '../surveys/repository/survey.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Survey, surveySchema } from '../surveys/entity/survey.entity';
import { Agent } from 'node:https';
import { AgentRepository } from '../agents/repository/agent.repository';
import { MarketRepository } from '../markets/repository/market.repository';
import { agentSchema } from '../agents/entity/agent.entity';
import { Market, MarketSchema } from '../markets/entity/market.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Survey.name, schema: surveySchema },
      { name: Agent.name, schema: agentSchema },
      { name: Market.name, schema: MarketSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    SurveyRepository,
    AgentRepository,
    MarketRepository,
  ],
})
export class AnalyticsModule {}
