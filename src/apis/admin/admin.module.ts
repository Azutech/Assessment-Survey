import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminRepository } from './repository/admin.repository';
import { CustomJwtModule } from 'src/guards/jwt/jwt.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from './entity/admin.entity';
import { AgentRepository } from '../agents/repository/agent.repository';
import { Agent, agentSchema } from '../agents/entity/agent.entity';
import { SurveyRepository } from '../surveys/repository/survey.repository';
import { Survey, surveySchema } from '../surveys/entity/survey.entity';
import { MarketRepository } from '../markets/repository/market.repository';
import { Market, MarketSchema } from '../markets/entity/market.entity';

@Module({
  imports: [
    CustomJwtModule,
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: Agent.name, schema: agentSchema },
      { name: Survey.name, schema: surveySchema },
      { name: Market.name, schema: MarketSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    AdminRepository,
    AgentRepository,
    SurveyRepository,
    MarketRepository,
  ],
})
export class AdminModule {}
