import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CreateSurveyDto } from './dto/survey.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { SurveyRepository } from './repository/survey.repository';
import { MarketRepository } from '../markets/repository/market.repository';
import { AgentRepository } from '../agents/repository/agent.repository';
import { shopTypeToSectionMap } from './constants/survey.constants';

@Injectable()
export class SurveysService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
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
      shopStatus,
      consent,
      marketState,
      marketEntity,
      images,
    } = surveyDto;

    const [findMarket, agent, findPhoneNumber] = await Promise.all([
      this.marketRepository.findOne({ marketName: marketName.trim() }),

      this.agentRepository.findOne({ _id: surveyDto.userId }),

      this.surveyRepository.findOne({
        phoneNumber: { $regex: new RegExp(`^${phoneNumber}$`, 'i') },
      }),
    ]);

    if (findPhoneNumber) {
      throw new ConflictException(
        `This Phone Number ${phoneNumber} is already in use.`,
      );
    }

    if (!findMarket) {
      throw new BadRequestException(`Market ${findMarket} not found.`);
    }
    if (!agent) {
      throw new BadRequestException(`Agent not found.`);
    }

    const shopSection = shopTypeToSectionMap[businessType] ?? undefined;

    const hasPictures =
      images && typeof images === 'object' && Object.keys(images).length > 0;
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
}
