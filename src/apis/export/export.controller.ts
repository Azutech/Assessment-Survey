import { Controller, Get, Query, Res } from '@nestjs/common';
import { ExportService, PdfQuality } from './export.service';
import { ExportFilter } from '../surveys/repository/survey.repository';
import { Response } from 'express';
import { OptionalBoolPipe } from 'src/common/utils/parse-boolean.util';

@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('pdf')
  async exportPDF(
    @Res() res: Response,
    @Query('quality') quality: PdfQuality = 'medium',
    @Query('status') status?: string,
    @Query('market') market?: string,
    @Query('lga') lga?: string,
    @Query('energySource') energySource?: string,
    @Query('dateRange') dateRange?: string,
  ) {
    const filter: ExportFilter = {
      status,
      market,
      lga,
      energySource,
      dateRange,
    };
    return this.exportService.exportPDF(filter, quality, res);
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

    const stream = await this.exportService.buildCsvStream({
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
