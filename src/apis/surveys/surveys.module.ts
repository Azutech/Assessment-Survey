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
import { CustomJwtModule } from 'src/guards/jwt/jwt.module';
import { AdminRepository } from '../admin/repository/admin.repository';
import { Admin, AdminSchema } from '../admin/entity/admin.entity';

@Module({
  imports: [
    CustomJwtModule,
    HttpModule,
    MongooseModule.forFeature([
      { name: Market.name, schema: MarketSchema },
      { name: Survey.name, schema: surveySchema },
      { name: Agent.name, schema: agentSchema },
      { name: Admin.name, schema: AdminSchema },
    ]),
  ],
  controllers: [SurveysController],
  providers: [
    SurveysService,
    SurveyRepository,
    MarketRepository,
    AgentRepository,
    AdminRepository,
  ],
})
export class SurveysModule {}
