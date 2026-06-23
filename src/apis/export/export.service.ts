import { Injectable, NotFoundException } from '@nestjs/common';
import { ExportFilter, SurveyRepository } from '../surveys/repository/survey.repository';
import { buildPDF, PdfSurvey } from 'src/helpers/pdf-builder.helper';
import { Response } from 'express';


export type PdfQuality = 'low' | 'medium' | 'high';

@Injectable()
export class ExportService {
    constructor (
        private readonly surveyRepository: SurveyRepository
    ) {}



     async exportPDF(
    filter: ExportFilter,
    quality: PdfQuality = 'medium',
    res: Response,
  ) {
    try {
      const surveys = await this.surveyRepository.findForExport(filter);

      if (!surveys.length) {
        throw new NotFoundException('No surveys found for the given filters')
        // return AppResponse.error({
        //   message: 'No surveys found for the given filters',
        //   status: HttpStatus.NOT_FOUND,
        // });
      }

      const pdfSurveys: PdfSurvey[] = surveys.map((s: any) => ({
        businessName: s.businessName,
        customerName: s.customerName,
        phoneNumber: s.phoneNumber,
        marketName: s.marketName?.marketName ?? s.marketName,
        marketLGA: s.marketLGA,
        marketState: s.marketState,
        currentEnergySource: s.currentEnergySource,
        electricitySupply: s.electricitySupply,
        GPS: s.GPS,
        status: s.status,
        createdAt: s.createdAt,
        appliances: s.appliances ?? [],
        images: s.images ?? {},
      }));

      // clean filters for cover page — remove undefined values
      const appliedFilters = Object.fromEntries(
        Object.entries(filter).filter(([, v]) => v),
      );

      console.log('appliedFilters', appliedFilters)
      console.log('pdfSurveys', pdfSurveys)
      console.log('appliedFilters', appliedFilters)

      await buildPDF(res, pdfSurveys, appliedFilters, quality);
    } catch (err: any) {
      throw err;
    }
  }
}
