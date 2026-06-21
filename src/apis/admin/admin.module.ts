import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminRepository } from './repository/admin.repository';
import { CustomJwtModule } from 'src/guards/jwt/jwt.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from './entity/admin.entity';
import { AgentRepository } from '../agents/repository/agent.repository';
import { Agent, agentSchema } from '../agents/entity/agent.entity';

@Module({
  imports: [
    CustomJwtModule,
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: Agent.name, schema: agentSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminRepository, AgentRepository],
})
export class AdminsModule {}
