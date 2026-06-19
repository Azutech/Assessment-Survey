import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dto/agent.dto';

@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  create(@Body() createAgentDto: CreateAgentDto) {
    return this.agentsService.create(createAgentDto);
  }
}
