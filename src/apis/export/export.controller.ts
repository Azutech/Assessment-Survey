import { Controller, Get, Query, Res } from '@nestjs/common';
import { ExportService, PdfQuality } from './export.service';
import { ExportFilter } from '../surveys/repository/survey.repository';
import { Response } from 'express';


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
    const filter: ExportFilter = { status, market, lga, energySource, dateRange };
    return this.exportService.exportPDF(filter, quality, res);
  }
}
