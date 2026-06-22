import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { hashSync, genSaltSync, compareSync } from 'bcrypt';
import { CreateAgentDto, LoginDto } from './dto/agent.dto';
import { AgentRepository } from './repository/agent.repository';
import { trimObjectStrings } from 'src/common/utils/trim-Object.util';
import { AgentStatus } from './utils/enum/util.enum';
import { JwtService } from 'src/guards/jwt/jwt.service';

@Injectable()
export class AgentsService {
  constructor(private readonly agentRepository: AgentRepository, private readonly jwtService: JwtService) {}

  async addAgent(createAgentDto: CreateAgentDto) {
    const sanitizedDto = trimObjectStrings(createAgentDto);

    let { fullName, email, phoneNumber, password } = sanitizedDto;

    // check email
    const emailExists = await this.agentRepository.findOne({ email });
    if (emailExists?.email) {
      throw new ConflictException('Agent with this email already exists');
    }

    // check phone
    const phoneExists = await this.agentRepository.findOne({ phoneNumber });
    if (phoneExists?.phoneNumber) {
      throw new ConflictException(
        'Agent with this phone number already exists',
      );
    }

    password = hashSync(password, genSaltSync());

    const allAgents = await this.agentRepository.findAll({});

    const usedNumbers = allAgents
      .map((c) => {
        const parts = c.uniqueId?.split('-');
        return parts && parts[1] ? parseInt(parts[1], 10) : NaN;
      })
      .filter((n) => !isNaN(n))
      .sort((a, b) => a - b);

    let nextSerialNumber = usedNumbers.length + 1;

    for (let i = 0; i < usedNumbers.length; i++) {
      if (usedNumbers[i] !== i + 1) {
        nextSerialNumber = i + 1;
        break;
      }
    }

    const uniqueId = `MP/LAPOWER26-${nextSerialNumber.toString().padStart(3, '0')}`;

    const newUser: CreateAgentDto = {
      fullName,
      email,
      phoneNumber,
      password,
      uniqueId,
      avatar: `https://ui-avatars.com/api/?name=${email}&background=f5f5f5`,
    };

    return this.agentRepository.create(newUser);
  }

    async validateAgent(loginDto: LoginDto) {

      const { email, password } = loginDto;

      let modEmail = email.trim().toLowerCase();

      let theUser = await this.agentRepository.findOne({ email: modEmail });
      if (!theUser?.email) {

        throw new NotFoundException('User not found')
   
      }

      if (theUser?.status !== AgentStatus.ACTIVE) {

                throw new BadRequestException('User is not active')

    
      }

      const validPassword = compareSync(password, theUser?.password);
      if (!validPassword) {

                        throw new BadRequestException('Invalid Password')

      
      }

      const authTokenParam = {
        userId: theUser?._id,
        userType: theUser?.userType,
      };

      return {
        auth: this.jwtService.createEncryptedToken(authTokenParam),
        message: 'login successful \u2705',
      };
   
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
  async findAllAgentsWithCustomerCount(search?: string) {
    const agents = await this.agentRepository.findAll({}, search);
    if (agents.length === 0) {
      return [];
    }

    // ✅ Use repository instead of model
    // const customerCounts =
    //   await this.customerRepository.countCustomersByAgent();

    // // Build a map for fast lookup
    // const countMap = customerCounts.reduce((acc, curr) => {
    //   acc[curr._id] = curr.totalCustomers;
    //   return acc;
    // }, {});

    // // Merge agent data with customer count
    // const agentsWithCounts = agents.map((agent) => ({
    //   ...(agent.toObject?.() || agent),
    //   totalCustomers: countMap[agent._id.toString()] || 0,
    // }));

    return agents;
  }

  async agentDashboard(userId: string) {
    const agents = await this.agentRepository.findOne(
      { _id: userId },
      '-password',
    );
    if (!agents) {
      throw new BadRequestException('Agent not found');
    }
    return agents;
  }
}
