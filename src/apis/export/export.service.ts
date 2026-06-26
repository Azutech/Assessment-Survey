import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ExportFilter,
  SurveyRepository,
} from '../surveys/repository/survey.repository';
import { buildPDF, PdfSurvey } from 'src/helpers/pdf-builder.helper';
import { Response } from 'express';
import { stringify } from 'csv-stringify';

export type PdfQuality = 'low' | 'medium' | 'high';

@Injectable()
export class ExportService {
  constructor(private readonly surveyRepository: SurveyRepository) {}

  async exportPDF(
    filter: ExportFilter,
    quality: PdfQuality = 'medium',
    res: Response,
  ) {
    try {
      const surveys = await this.surveyRepository.findForExport(filter);

      if (!surveys.length) {
        throw new NotFoundException('No surveys found for the given filters');
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
      await buildPDF(res, pdfSurveys, appliedFilters, quality);
    } catch (err: any) {
      throw err;
    }
  }

  async buildCsvStream(filters: {
    agentId: string;
    marketName: string;
    marketLGA: string;
    marketEntity: string;
    customerName?: string;
    LGA_Eligibility?: boolean;
    hasPictures?: boolean;
  }) {
    const stringifier = stringify({ header: true });

    this.streamCsvData(stringifier, filters);

    return stringifier;
  }

  private async streamCsvData(
    stringifier: any,
    filters: {
      agentId: string;
      marketName: string;
      marketLGA: string;
      marketEntity: string;
      customerName?: string;
      LGA_Eligibility?: boolean;
      hasPictures?: boolean;
    },
  ) {
    const BATCH_SIZE = 1000;
    const UNAPPROVED_COORDINATES = '6.4474 3.3903';

    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const { data } = await this.surveyRepository.findAllCustomerExport(
        {},
        filters.agentId,
        filters.marketName,
        filters.marketEntity,
        filters.marketLGA,
        filters.customerName,
        filters.LGA_Eligibility,
        filters.hasPictures,
        page,
        BATCH_SIZE,
      );

      if (!data?.length) break;

      for (const biz of data) {
        stringifier.write(
          this.mapCustomerToCsvRow(biz, UNAPPROVED_COORDINATES),
        );
      }

      hasMore = data.length === BATCH_SIZE;
      page++;
    }

    stringifier.end();
  }

  private mapCustomerToCsvRow(biz: any, UNAPPROVED_COORDINATES: string) {
    return {
      TimeStamp: this.formatDateTime(biz.createdAt),
      'GPS Location': biz.GPS ?? '-',
      'GPS Address':
        biz.GPS === UNAPPROVED_COORDINATES ? '-' : (biz.address ?? '-'),
      'Market name': biz?.marketName ?? '-',
      SectionNumber: biz.shopSectionNumber ?? '-',
      shopSection: biz.shopSectionNumber ?? '-',
      LGA: biz?.marketLGA ?? '-',
      Block: biz.shopBlock ?? '-',
      'Market Entity': biz?.marketEntity ?? '-',
      'Unique ID': biz?._id ?? '-',
      'Shop Number': biz.shopNumber ?? '-',
      'Shop Status': biz.shopStatus ?? '-',
      'Shop Name': biz.businessName ?? '-',
      Supervisor: biz.supervisorName ?? '-',
      'BA Name': biz.agentDetails ?? '-',
      'Shop-owner': biz.customerName ?? '-',
      'Mobile number': biz.phoneNumber ?? '-',
      Gender: biz.gender ?? '-',
      'Age Range': biz.ageRange ?? '-',
      'Shop Type': biz.businessType ?? '-',
      Employees: biz.numberOfEmployees ?? '-',
      'Generator Ownership': biz.generatorOwnership ? 'Yes' : 'No',
      'Generator Size': biz.generatorSize ?? '-',
      'Energy Source': biz.currentEnergySource ?? '-',
      'Spend Range': biz.willingnessToPay ?? '-',
      'Payment Mode': biz.paymentPreference ?? '-',
      'Energy Challenges': biz.energyChallenges?.join(', ') ?? '-',
      'Hours of Electricity': biz.electricitySupply ?? '-',
      'Load profile (kW)': biz.loadProfile ?? '-',
      'Estimated Future Load (kW)': biz.estimatedFutureLoad ?? '-',
      ...this.flattenAppliances(biz.appliances ?? []),
      'Appliances (Previous Format)': biz.applianceUsed ?? '-',
      'Picture (Shop Exterior)': biz?.images?.shopExteriorImage || '-',
      'Picture (Shop Interior 1)': biz?.images?.shopInteriorImage1 || '-',
      'Picture (Shop Interior 2)': biz?.images?.shopInteriorImage2 || '-',
      'Picture (Shop Interior 3)': biz?.images?.shopInteriorImage3 || '-',
      Consent: 'Yes',
      Signature: biz.signature ?? '-',
      'Additional Comments': biz.additionalComments ?? '-',
      Auditor: biz.auditor ?? '-',
      Status: biz.status ?? '-',
      Comment: biz.comment ?? '-',
    };
  }

  private formatDateTime(date: Date) {
    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    const longDate = d
      .toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
      .replace(/(\d{1,2}) (\w+) (\d{4})/, '$1 $2, $3');

    return `${day}/${month}/${year}, ${longDate}`;
  }

  // ✅ Flatten appliances (fixed column structure)
  private flattenAppliances(appliances: any[] = []) {
    const result: Record<string, any> = {};

    const MAX_EXPORT_APPLIANCES = 4;

    for (let i = 0; i < MAX_EXPORT_APPLIANCES; i++) {
      const num = i + 1;
      const appliance = appliances[i] || {};

      result[`Appliance ${num}`] = appliance.name ?? '-';
      result[`Appliance ${num} Quantity`] = appliance.quantity ?? '-';
      result[`Appliance ${num} Hrs/Day`] = appliance.hoursPerDay ?? '-';
      result[`Appliance ${num} Watts`] = appliance.watts ?? '-';
      result[`Appliance ${num} Total (W)`] = appliance.totalConsumption ?? '-';
    }

    return result;
  }
}
