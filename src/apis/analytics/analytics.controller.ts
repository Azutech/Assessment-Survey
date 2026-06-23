import { Controller, Get, Query, Res, HttpStatus } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Response } from 'express';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('marketAnalytics')
  async marketAnalysis (@Res() res: Response, @Query('dateRange') dateRange: string) {

    const analysis = await this.analyticsService.marketAnalytics(dateRange)

    return res.status(HttpStatus.OK).json({success: 'Analysis returned', analysis})

  }

}
