// export/helpers/pdf-builder.helper.ts
import * as PDFDocument from 'pdfkit';
import { Response } from 'express';
import { compressImage } from './image-compress.helper';

export interface PdfSurvey {
  businessName: string;
  customerName: string;
  phoneNumber: string;
  marketName: string;
  marketLGA: string;
  marketState: string;
  currentEnergySource: string;
  electricitySupply: string;
  GPS: string;
  status: string;
  createdAt: Date;
  appliances: any[];
  images: {
    shopExteriorImage?: string;
    shopInteriorImage1?: string;
    shopInteriorImage2?: string;
    shopInteriorImage3?: string;
  };
}

export async function buildPDF(
  res: Response,
  surveys: PdfSurvey[],
  filters: Record<string, any>,
  quality: 'low' | 'medium' | 'high',
  originalSizeKB: number,
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, autoFirstPage: true });

    let compressedSizeKB = 0;

    // buffer to track compressed size
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
      const total = Buffer.concat(chunks);
      compressedSizeKB = Math.round(total.length / 1024);

      // set headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
      res.setHeader('X-Original-Size-KB', originalSizeKB);
      res.setHeader('X-Compressed-Size-KB', compressedSizeKB);

      res.end(total);
      resolve();
    });
    doc.on('error', reject);

    // -- COVER PAGE --
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('Market Shop Survey Report', { align: 'center' });

    doc.moveDown();

    doc
      .fontSize(11)
      .font('Helvetica')
      .text(`Generated: ${new Date().toISOString()}`, { align: 'center' });

    doc.moveDown(0.5);

    // filters applied
    if (Object.keys(filters).length > 0) {
      doc.fontSize(10).text('Filters applied:', { underline: true });
      Object.entries(filters).forEach(([key, value]) => {
        doc.text(`  ${key}: ${value}`);
      });
      doc.moveDown(0.5);
    }

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(`Total submissions: ${surveys.length}`);

    doc.addPage();

    // -- SUMMARY STATISTICS --
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Summary Statistics');

    doc.moveDown();

    const withGPS = surveys.filter((s) => s.GPS).length;
    const withPhotos = surveys.filter((s) => s.images?.shopExteriorImage).length;
    const verified = surveys.filter((s) => s.status === 'verified').length;

    doc.fontSize(11).font('Helvetica');
    doc.text(`Total Shops: ${surveys.length}`);
    doc.text(`Verified: ${verified}`);
    doc.text(`With GPS: ${withGPS}`);
    doc.text(`With Photos: ${withPhotos}`);

    doc.addPage();

    // -- PER MARKET BREAKDOWN --
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Per Market Breakdown');

    doc.moveDown();

    const marketMap: Record<string, PdfSurvey[]> = {};
    for (const survey of surveys) {
      const key = survey.marketName ?? 'Unknown';
      if (!marketMap[key]) marketMap[key] = [];
      marketMap[key].push(survey);
    }

    for (const [market, entries] of Object.entries(marketMap)) {
      const verifiedCount = entries.filter((e) => e.status === 'verified').length;
      const verificationRate = Math.round((verifiedCount / entries.length) * 100);

      const energyFreq: Record<string, number> = {};
      for (const e of entries) {
        if (e.currentEnergySource) {
          energyFreq[e.currentEnergySource] = (energyFreq[e.currentEnergySource] || 0) + 1;
        }
      }
      const topEnergy = Object.entries(energyFreq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A';

      doc.fontSize(11).font('Helvetica-Bold').text(market);
      doc.fontSize(10).font('Helvetica');
      doc.text(`  Submissions: ${entries.length}`);
      doc.text(`  Verification rate: ${verificationRate}%`);
      doc.text(`  Top energy source: ${topEnergy}`);
      doc.moveDown(0.5);
    }

    doc.addPage();

    // -- PHOTO GALLERY --
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Shop Photo Gallery');

    doc.moveDown();

    // compress all exterior images in parallel
    const imageResults = await Promise.all(
      surveys.map(async (survey) => {
        if (!survey.images?.shopExteriorImage) {
          return { survey, image: null };
        }
        const image = await compressImage(survey.images.shopExteriorImage, quality);
        return { survey, image };
      }),
    );

    for (const { survey, image } of imageResults) {
      if (doc.y > 650) doc.addPage();

      if (image) {
        doc.image(image.buffer, { width: 200 });
      } else {
        // placeholder for missing image
        doc
          .rect(doc.x, doc.y, 200, 130)
          .stroke()
          .fontSize(9)
          .text('No photo available', doc.x + 60, doc.y - 70);
      }

      doc
        .fontSize(9)
        .font('Helvetica')
        .text(`${survey.businessName} — ${survey.marketName ?? 'N/A'}`)
        .moveDown(1);
    }

    doc.end();
  });
}