import { Module } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { AgentsController } from './agents.controller';
import { AgentRepository } from './repository/agent.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Agent, agentSchema } from './entity/agent.entity';
import { CustomJwtModule } from 'src/guards/jwt/jwt.module';

@Module({
  imports: [
    CustomJwtModule,
    MongooseModule.forFeature([{ name: Agent.name, schema: agentSchema }]),
  ],
  controllers: [AgentsController],
  providers: [AgentsService, AgentRepository],
})
export class AgentsModule {}
