import { Controller, Get, Query, Res, HttpStatus } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Response } from 'express';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('marketAnalytics')
  async marketAnalysis(
    @Res() res: Response,
    @Query('from') from : string,
    @Query('to') to : string
  ) {
    const analysis = await this.analyticsService.marketAnalytics(from, to);

    return res
      .status(HttpStatus.OK)
      .json({ success: 'Market Analysis returned', analysis });
  }

  @Get('summaryAnalytics')
  async summaryAnalytics(
    @Res() res: Response,
    @Query('dateRange') dateRange: string,
  ) {
    const analysis = await this.analyticsService.summaryAnalytics();

    return res
      .status(HttpStatus.OK)
      .json({ success: 'Summary Analysis returned', analysis });
  }
  @Get('agentAnalytics')
  async getAgentAnalytics(
    @Res() res: Response,
    @Query('dateRange') dateRange: string,
  ) {
    const analysis = await this.analyticsService.getAgentAnalytics();

    return res
      .status(HttpStatus.OK)
      .json({ success: 'Agent Analysis returned', analysis });
  }
}
