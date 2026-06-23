import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAdminDto, LoginAdminDto } from './dto/admin.dto';
import { AdminRepository } from './repository/admin.repository';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import { JwtService } from 'src/guards/jwt/jwt.service';
import { AgentRepository } from '../agents/repository/agent.repository';
import { AgentStatus } from '../agents/utils/enum/util.enum';
import { SurveyRepository } from '../surveys/repository/survey.repository';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly jwtService: JwtService,
    private readonly agentRepository: AgentRepository,
    private readonly surveyRepository: SurveyRepository,
  ) {}
  async create(createAdminDto: CreateAdminDto) {
    let { email, password, fullName } = createAdminDto;

    const existingAdmin = await this.adminRepository.findOne({
      email: email,
    });
    if (existingAdmin?.email) {
      throw new ConflictException('Admin with this email already exists');
    }

    password = hashSync(password, genSaltSync());

    let modEmail = email.trim().toLowerCase();

    const newUser: CreateAdminDto = {
      fullName,
      email: modEmail,
      password,
      avatar: `https://ui-avatars.com/api/?name=${modEmail}&background=f5f5f5`,
    };

    const theUser = await this.adminRepository.createAdmin(newUser);

    return {
      message: 'Admin created successfully \u2705',
      data: theUser,
    };
  }

  async validateAdmin(loginDto: LoginAdminDto) {
    const { email, password } = loginDto;

    let theUser = await this.adminRepository.findOne({ email: email });
    if (!theUser?.email) {
      throw new NotFoundException('User not found');
    }

    const validPassword = compareSync(password, theUser?.password);
    if (!validPassword) {
      throw new BadRequestException('Invalid Password');
    }

    const authTokenParam = {
      userId: theUser?._id,
      userType: theUser?.userType,
      exportPermission: theUser?.exportPermission,
    };

    return {
      auth: this.jwtService.createEncryptedToken(authTokenParam),
      message: 'login successful \u2705',
    };
  }

  async deactivateAgent(userId: string) {
    const agent = await this.agentRepository.findOne({ _id: userId });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    if (agent.status === AgentStatus.INACTIVE) {
      throw new BadRequestException('Agent is already deactivated');
    }

    await this.agentRepository.updateinfo(
      { _id: userId },
      { status: AgentStatus.INACTIVE },
    );

    return {
      message: 'Agent deactivated successfully \u2705',
    };
  }
  async activateAgent(userId: string) {
    const agent = await this.agentRepository.findOne({ _id: userId });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    if (agent.status === AgentStatus.ACTIVE) {
      throw new BadRequestException('Agent is already activated');
    }

    await this.agentRepository.updateinfo(
      { _id: userId },
      { status: AgentStatus.ACTIVE },
    );

    return {
      message: 'Agent activated successfully \u2705',
    };
  }

  async adminDashboard(userId: string) {
    const admin = await this.adminRepository.findOne(
      { _id: userId },
      '-password',
    );

    if (!admin) {
      throw new NotFoundException('admin not found');
    }

    return {
      message: 'Admin dashboard data retrieved successfully \u2705',
      data: admin,
    };
  }

  async willingnessToPayDistributionChart() {
    const data = await this.surveyRepository.getWillingnessToPayDistribution();
    return data;
  }
  async getElectricityDistribution() {
    const data = await this.surveyRepository.getElectricityDistribution();
    return data;
  }
  async dashboardSummary() {
    const data = await this.surveyRepository.getDashboardSummary();
    return data;
  }
}
