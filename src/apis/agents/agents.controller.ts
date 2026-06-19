import {
  Controller,
  Res,
  Get,
  Post,
  Body,
  UsePipes,
  Delete,
  HttpStatus,
  Query,
  Search,
} from '@nestjs/common';
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dto/agent.dto';
import { ZodValidationPipe } from 'node_modules/nestjs-zod/dist/index.cjs';
import { Response } from 'express';

@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post('signUp')
  @UsePipes(new ZodValidationPipe())
  async agentSignUp(
    @Body() createAgentDto: CreateAgentDto,
    @Res() res: Response,
  ) {
    const agent = await this.agentsService.addAgent(createAgentDto);
    return res
      .status(HttpStatus.CREATED)
      .json({ msg: 'Agent created successfully', agent });
  }

  @Get('agentDashbord')
  async viewDashboard(
    @Query() id: string,
    @Res() res: Response,
  ): Promise<Response> {
    const agent = await this.agentsService.agentDashboard(id);
    return res
      .status(HttpStatus.OK)
      .json({ msg: 'Agent Dashboard returned', agent });
  }

  @Get('findAllAgents')
  async allAgents(
    @Query('search') search: string,
    @Res() res: Response
  ): Promise<Response> {
    const agents = await this.agentsService.findAllAgents(search);
    return res.status(HttpStatus.OK).json({
      msg: `Agents returned`,
      agents
    })
  }
}
