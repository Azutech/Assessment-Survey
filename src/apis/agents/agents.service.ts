import { Injectable } from '@nestjs/common';
import { CreateAgentDto } from './dto/agent.dto';

@Injectable()
export class AgentsService {

  constructor() {}
  
  create(createAgentDto: CreateAgentDto) {
    return 'This action adds a new agent';
  }


}
