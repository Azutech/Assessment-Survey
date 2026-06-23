import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { CreateSurveyDto, StatusUpdateDto } from './dto/survey.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { SurveyRepository } from './repository/survey.repository';
import { MarketRepository } from '../markets/repository/market.repository';
import { AgentRepository } from '../agents/repository/agent.repository';
import { APPLIANCES, shopTypeToSectionMap } from './constants/survey.constants';
import { AdminRepository } from '../admin/repository/admin.repository';
// impro

@Injectable()
export class SurveysService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private adminRepository: AdminRepository,
    private readonly surveyRepository: SurveyRepository,
    private readonly marketRepository: MarketRepository,
    private readonly agentRepository: AgentRepository,
  ) {}

  private logger = new Logger();

  async addAgentSurvey(surveyDto: CreateSurveyDto) {
    const {
      marketName,
      businessName,
      startTime,
      endTime,
      phoneNumber,
      GPS,
      businessType,
      // shopStatus,
      // consent,
      // marketState,
      appliances,
      images,
    } = surveyDto;

    const [findMarket, agent, findPhoneNumber] = await Promise.all([
      this.marketRepository.findOne({ marketName: marketName }),

      this.agentRepository.findOne({ _id: surveyDto.userId }),

      this.surveyRepository.findOne({
        phoneNumber: { $regex: new RegExp(`^${phoneNumber}$`, 'i') },
      }),
    ]);

    if (findPhoneNumber) {
      throw new ConflictException(`This Phone Number  is already in use.`);
    }

    if (!findMarket) {
      throw new BadRequestException(`Market not found.`);
    }
    if (!agent) {
      throw new BadRequestException(`Agent not found.`);
    }

    const shopSection = shopTypeToSectionMap[businessType] ?? undefined;

    const hasPictures =
      images && typeof images === 'object' && Object.keys(images).length > 0;

    const resolvedAddress = await this.getAddressFromGPS(GPS);
    const checkappliances = this.processAppliances(surveyDto.appliances);

    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    if (end < start) {
      throw new BadRequestException('endTime cannot be before startTime');
    }
    const surveyDuration = this.calculateSurveyDuration(startTime, endTime);

    const newCustomer = await this.surveyRepository.create({
      ...surveyDto,
      hasPictures: !!hasPictures,
      LGA_Eligibility: findMarket ? findMarket.LGA_Eligibility : false,
      marketState: findMarket ? findMarket.marketState : undefined,
      marketLGA: findMarket ? findMarket.marketLGA : undefined,
      marketEntity: findMarket ? findMarket.marketEntity : undefined,
      businessName: businessName.trim(),
      agentDetails: `${agent.fullName}`,
      agentId: `${agent._id.toString()}`,
      duration: this.formatDuration(surveyDuration),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      address: resolvedAddress || undefined,
      category: 'agent',
      appliances: this.calculateApplianceConsumption(appliances),
      shopSection,
    });

    // Update agent's last activity
    await this.agentRepository.updateinfo(
      { _id: surveyDto.userId },
      {
        lastActiveTime: new Date(),
        lastLocation: newCustomer.GPS,
      },
    );

    return newCustomer;
  }

  async viewSurvey(id: string) {
    const customer = await this.surveyRepository.findOne({ _id: id });

    if (!customer) {
      throw new NotFoundException('Survey not Found');
    }

    return customer;
  }

  async setStatusAndComments(
    statusUpdateDto: StatusUpdateDto,
    surveyId: string,
  ) {
    const { status, comment, userId } = statusUpdateDto;

    const admin = await this.adminRepository.findOne({ _id: userId });
    if (!admin) {
      throw new NotFoundException({ message: 'Admin not found' });
    }

    const validStatuses = ['pending', 'verified', 'unverified'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException({
        message: `Invalid status. Valid options are: ${validStatuses.join(', ')}`,
      });
    }

    const findSurvey = await this.surveyRepository.findOne({
      _id: surveyId,
    });
    if (!findSurvey) {
      throw new NotFoundException({ message: 'Survey not found' });
    }

    const updatedCustomer = await this.surveyRepository.updateinfo(
      { _id: surveyId },
      { status, comment, auditor: admin.fullName },
    );

    return updatedCustomer;
  }

  async viewAllCustomers(
    search?: string,
    marketLGA?: string,
    marketEntity?: string,
    marketState?: string,
    LGA_Eligibility?: boolean,
    hasPictures?: boolean,
    currentEnergySource?: string,
    agentDetails?: string,
    marketName?: string,
    status?: string | string[], // 🔥 added
    gpsFilter?: 'withGPS' | 'withoutGPS', // 🔥 NEW
    dateRange?: string,
    page = 1,
    limit = 50,
  ) {
    const cleanAgentDetails = agentDetails?.trim();
    const hasAgentFilter = cleanAgentDetails && cleanAgentDetails.length > 0;

    const { data, total } = await this.surveyRepository.findAllCustomerIndex(
      {},
      LGA_Eligibility,
      hasPictures,
      marketEntity,
      marketState,
      marketLGA,
      hasAgentFilter ? cleanAgentDetails : undefined,
      currentEnergySource,
      marketName?.trim(),
      search?.trim(),
      status,
      gpsFilter,
      dateRange,
      page,
      limit,
    );

    const count = await this.surveyRepository.countMessages();

    if (data.length === 0) {
      return {
        message: 'No customers found',
        data: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalItems: 0,
          count,
        },
      };
    }

    return {
      message: 'Customers retrieved successfully',
      data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        total: count,
        limit,
        hasMore: page * limit < total,
      },
    };
  }

  private async getAddressFromGPS(gps: string): Promise<string | null> {
    if (!gps) return null;

    const parts = gps
      .trim()
      .replace(/\s+/g, ' ')
      .split(/[,\s]+/)
      .filter(Boolean);

    if (parts.length !== 2) {
      this.logger.warn(`Invalid GPS format: ${gps}`);
      return null;
    }

    const [lat, lon] = parts;

    // const [lat, lon] = gps.split(',').map((c) => c.trim());

    if (!lat || !lon || isNaN(+lat) || isNaN(+lon)) {
      this.logger.warn(`Invalid GPS: ${gps}`);
      return null;
    }

    const apiKey = this.configService.get<string>('LOCATIONIQ_API_KEY');
    const baseUrl =
      this.configService.get<string>('LOCATIONIQ_BASE_URL') ??
      'https://eu1.locationiq.com/v1'; // safer default

    if (!apiKey) {
      this.logger.error('Missing LOCATIONIQ_API_KEY');
      return null;
    }

    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${baseUrl}/reverse`, {
          params: { key: apiKey, lat, lon, format: 'json' },
        }),
      );

      if (data?.error) {
        this.logger.warn(`LocationIQ error: ${data.error}`);
        return null;
      }

      return data?.display_name ?? null;
    } catch (error: any) {
      this.logger.error(
        `Reverse geocode failed:`,
        error.response?.data || error.message,
      );
      return null;
    }
  }

  private calculateSurveyDuration(
    startTime: string | Date,
    endTime: string | Date,
  ): number {
    try {
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();

      if (isNaN(start) || isNaN(end)) {
        throw new Error('Invalid date format for startTime or endTime');
      }

      const durationMs = end - start;

      // Return duration in seconds (you can adjust to milliseconds if preferred)
      return Math.max(0, Math.floor(durationMs / 1000));
    } catch (err: any) {
      throw new Error(`Failed to calculate survey duration: ${err.message}`);
    }
  }

  // Optional: Add a utility method to format duration for display
  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours}h ${minutes}m ${secs}s`;
  }

  private processAppliances(appliancesDto: any[]) {
    return appliancesDto
      .map((item) => {
        const found = APPLIANCES.find((a) => a.value === item.name);
        if (!found) return null;

        const totalConsumption = found.watts * item.quantity;

        return {
          name: item.name,
          quantity: item.quantity,
          hoursPerDay: item.hoursPerDay,
          watts: found.watts,
          totalConsumption,
        };
      })
      .filter(Boolean);
  }

  private calculateApplianceConsumption(appliances: any[] = []) {
    return appliances.map((appliance) => {
      const quantity = Number(appliance.quantity || 0);
      const watts = Number(appliance.watts || 0);

      return {
        ...appliance,
        totalConsumption: watts * quantity,
      };
    });
  }
}
