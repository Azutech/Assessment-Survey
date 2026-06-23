import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  Res,
  HttpStatus,
  UseGuards,
  Query,
  Put,
} from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { CreateSurveyDto, StatusUpdateDto } from './dto/survey.dto';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/guards/jwt/jwt.guard';
import { AdminOnlyGuard } from 'src/guards/admin.guard';
import { OptionalBoolPipe } from 'src/common/utils/parse-boolean.util';

@Controller('surveys')
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @UseGuards(JwtAuthGuard)
  @Post('addSurvey')
  async create(
    @Req() req: any,
    @Body() createSurveyDto: CreateSurveyDto,
    @Res() res: Response,
  ) {
    const payload = {
      ...createSurveyDto,
      userId: req.user.userId,
    };
    createSurveyDto.userId = req.user.userId;
    const survey = await this.surveysService.addAgentSurvey(payload);
    return res
      .status(HttpStatus.CREATED)
      .json({ message: 'survey added', survey });
  }

  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  @Put('updateSurveyStatus')
  async updateSurveyStatus(
    @Req() req: any,
    @Res() res: Response,
    @Body() statusUpdateDto: StatusUpdateDto,
    @Query('surveyId') surveyId: string,
  ) {
    const payload = {
      ...statusUpdateDto,
      surveyId,
      userId: req.user.userId,
    };

    const result = await this.surveysService.setStatusAndComments(
      payload,
      surveyId,
    );
    return res
      .status(HttpStatus.OK)
      .json({ message: 'Customer status updated successfully', result });
  }

  @Get('viewSurvey')
  async findOne(@Res() res: Response, @Query('surveyId') id: string) {
    const survey = await this.surveysService.viewSurvey(id);
    return res
      .status(HttpStatus.OK)
      .json({ msg: 'Customer retrieved successfully', survey });
  }

  @Get('viewAllCustomer')
  async findAll(
    @Res() res: Response,
    @Query('search') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('agentDetails') agentDetails?: string,
    @Query('marketLGA') marketLGA?: string,
    @Query('marketState') marketState?: string,
    @Query('marketName') marketName?: string,
    @Query('currentEnergySource') currentEnergySource?: string,
    @Query('LGA_Eligibility', OptionalBoolPipe) LGA_Eligibility?: boolean,
    @Query('hasPictures', OptionalBoolPipe) hasPictures?: boolean,
    @Query('status') status?: string | string[],
    @Query('gpsFilter') gpsFilter?: 'withGPS' | 'withoutGPS',
    @Query('dateRange') dateRange?: string,
    @Query('date') date?: string,
    @Query('marketEntity') marketEntity?: string,
  ) {
    const customers = await this.surveysService.viewAllCustomers(
      search,
      marketLGA,
      marketEntity,
      marketState,
      LGA_Eligibility,
      hasPictures,
      currentEnergySource,
      agentDetails,
      marketName,
      status,
      gpsFilter,
      dateRange,
      Number(page),
      Number(limit),
    );

    return res
      .status(HttpStatus.OK)
      .json({ msg: 'Customers retrieved successfully', customers });
  }

  @Get('exportCustomersCsv')
  async exportCustomersCsv(
    @Res() res: Response,
    @Query('agentId') agentId: string,
    @Query('marketName') marketName: string,
    @Query('marketLGA') marketLGA: string,
    @Query('marketEntity') marketEntity: string,
    @Query('customerName') customerName?: string,
    @Query('LGA_Eligibility', OptionalBoolPipe) LGA_Eligibility?: boolean,
    @Query('hasPictures', OptionalBoolPipe) hasPictures?: boolean,
  ) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="survey.csv"');

    const stream = await this.surveysService.buildCsvStream({
      agentId,
      marketName,
      marketLGA,
      marketEntity,
      customerName,
      LGA_Eligibility,
      hasPictures,
    });

    stream.pipe(res);
  }
}
