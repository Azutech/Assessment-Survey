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
  UseGuards,
  Req,
} from '@nestjs/common';
import { AgentsService } from './agents.service';
import { CreateAgentDto, LoginDto } from './dto/agent.dto';
import { ZodValidationPipe } from 'node_modules/nestjs-zod/dist/index.cjs';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/guards/jwt/jwt.guard';

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
  @Post('login')
  @UsePipes(new ZodValidationPipe())
  async validateAgent(
    @Body() createAgentDto: LoginDto,
    @Res() res: Response,
  ) {
    const agent = await this.agentsService.validateAgent(createAgentDto);
    return res
      .status(HttpStatus.CREATED)
      .json({ msg: 'Agent created successfully', agent });
  }

  @UseGuards(JwtAuthGuard)
  @Get('agentDashbord')
  async viewDashboard(
    @Req() req: any,
    @Res() res: Response,
  ): Promise<Response> {

    const userId = req.user.userId
    const agent = await this.agentsService.agentDashboard(userId);
    return res
      .status(HttpStatus.OK)
      .json({ msg: 'Agent Dashboard returned', agent });
  }

  @Get('findAllAgents')
  async allAgents(
    @Query('search') search: string,
    @Res() res: Response,
  ): Promise<Response> {
    const agents =
      await this.agentsService.findAllAgentsWithCustomerCount(search);
    return res.status(HttpStatus.OK).json({
      msg: `Agents returned`,
      agents,
    });
  }
}
