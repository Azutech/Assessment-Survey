import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { hashSync, genSaltSync } from 'bcrypt';
import { CreateAgentDto } from './dto/agent.dto';
import { AgentRepository } from './repository/agent.repository';
import { trimObjectStrings } from 'src/common/utils/trim-Object.util';
import { validatePassword } from './utils/util.interface';

@Injectable()
export class AgentsService {
  constructor(private readonly agentRepository: AgentRepository) {}

  async addAgent(createAgentDto: CreateAgentDto) {
    const sanitizedDto = trimObjectStrings(createAgentDto);

    let { fullName, email, phoneNumber, password } = sanitizedDto;

    let userExists = await this.agentRepository.findOne({ email: email });
    if (userExists?.email) {
      throw new ConflictException('Agent with this email already exists');
    }

    const checkPassword = validatePassword(password);
    if (!checkPassword) {
      throw new BadRequestException(
        'Password must be atleast 8 characters long and contain a number, a special character and an uppercase letter',
      );
    }

    password = hashSync(password, genSaltSync());
  }

  async viewAgent(id: string) {
    const agent = await this.agentRepository.findOne({ _id: id });
    return agent;
  }

  async findAllAgents(search?: string) {
    const agents = await this.agentRepository.retrieveForBackup();
    if (search) {
      return agents.filter((agent) =>
        agent.fullName.toLowerCase().includes(search.toLowerCase()),
      );
    }
    return agents;
  }
}
