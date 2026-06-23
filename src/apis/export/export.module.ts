import { Module } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { SurveyRepository } from '../surveys/repository/survey.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Survey, surveySchema } from '../surveys/entity/survey.entity';
import { Agent, agentSchema } from '../agents/entity/agent.entity';
import { AgentRepository } from '../agents/repository/agent.repository';
import { MarketRepository } from '../markets/repository/market.repository';
import { Market, MarketSchema } from '../markets/entity/market.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Survey.name, schema: surveySchema },
      { name: Agent.name, schema: agentSchema },
      { name: Market.name, schema: MarketSchema },
    ]),
  ],
  controllers: [ExportController],
  providers: [
    ExportService,
    SurveyRepository,
    AgentRepository,
    MarketRepository,
  ],
})
export class ExportModule {}
