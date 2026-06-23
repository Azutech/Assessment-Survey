// export/helpers/pdf-builder.helper.ts

import { Response } from 'express';
import { compressImage } from './compress-image.helper';
const PDFDocument = require('pdfkit')

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

interface MarketStat {
  count: number;
  verified: number;
  energyFreq: Record<string, number>;
}

export async function buildPDF(
  res: Response,
  surveys: PdfSurvey[],
  filters: Record<string, any>,
  quality: 'low' | 'medium' | 'high',
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      // compress all exterior images in parallel first
      let totalOriginalBytes = 0;
      let totalCompressedBytes = 0;



      console.log('ready')

      const imageResults = await Promise.all(
        surveys.map(async (survey) => {
          if (!survey.images?.shopExteriorImage) {
            return { survey, image: null };
          }
          const image = await compressImage(
            survey.images.shopExteriorImage,
            quality,
          );
          if (image) {
            totalOriginalBytes += image.originalSize;
            totalCompressedBytes += image.compressedSize;
          }
          return { survey, image };
        }),
      );

      // build PDF in memory
      const doc = new PDFDocument({
        margin: 50,
        autoFirstPage: true,
        info: {
          Title: 'Market Shop Survey Report',
          Author: 'Noemdek Survey System',
        },
      });

          console.log('player')

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('error', reject);
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        const compressedPdfKB = Math.round(pdfBuffer.length / 1024);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
          'Content-Disposition',
          'attachment; filename=report.pdf',
        );
        res.setHeader(
          'X-Original-Size-KB',
          Math.round(totalOriginalBytes / 1024),
        );
        res.setHeader('X-Compressed-Size-KB', compressedPdfKB);
        res.end(pdfBuffer);
        resolve();
      });

      // ── COVER PAGE ──────────────────────────────────────────
      doc
        .fontSize(22)
        .font('Helvetica-Bold')
        .text('Market Shop Survey Report', { align: 'center' });

      doc.moveDown();

      doc
        .fontSize(11)
        .font('Helvetica')
        .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });

      doc.moveDown();

      // date range
      const appliedFilters = Object.entries(filters).filter(([, v]) => v);
      if (appliedFilters.length > 0) {
        doc
          .fontSize(11)
          .font('Helvetica-Bold')
          .text('Filters Applied:');

        doc.font('Helvetica');
        appliedFilters.forEach(([key, value]) => {
          doc.fontSize(10).text(`  ${key}: ${value}`);
        });
        doc.moveDown(0.5);
      }

      doc
        .fontSize(13)
        .font('Helvetica-Bold')
        .text(`Total Submissions: ${surveys.length}`);

      // ── SUMMARY STATISTICS ───────────────────────────────────
      doc.addPage();

      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('Summary Statistics')
        .moveDown();

      const withGPS = surveys.filter((s) => s.GPS).length;
      const withPhotos = surveys.filter(
        (s) => s.images?.shopExteriorImage,
      ).length;
      const verified = surveys.filter((s) => s.status === 'verified').length;
      const pending = surveys.filter((s) => s.status === 'pending').length;
      const unverified = surveys.filter(
        (s) => s.status === 'unverified',
      ).length;

      const stats = [
        ['Total Shops', surveys.length],
        ['Verified', verified],
        ['Pending', pending],
        ['Unverified', unverified],
        ['With GPS', withGPS],
        ['Without GPS', surveys.length - withGPS],
        ['With Photos', withPhotos],
      ];

      stats.forEach(([label, value]) => {
        doc
          .fontSize(11)
          .font('Helvetica-Bold')
          .text(`${label}: `, { continued: true })
          .font('Helvetica')
          .text(`${value}`);
      });

      // ── PER MARKET BREAKDOWN ─────────────────────────────────
      doc.addPage();

      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('Per Market Breakdown')
        .moveDown();

      const marketMap: Record<string, MarketStat> = {};

      for (const survey of surveys) {
        const key = survey.marketName ?? 'Unknown';
        if (!marketMap[key]) {
          marketMap[key] = { count: 0, verified: 0, energyFreq: {} };
        }
        marketMap[key].count += 1;
        if (survey.status === 'verified') marketMap[key].verified += 1;
        if (survey.currentEnergySource) {
          marketMap[key].energyFreq[survey.currentEnergySource] =
            (marketMap[key].energyFreq[survey.currentEnergySource] || 0) + 1;
        }
      }

      // table header
      const tableTop = doc.y;
      const col = { market: 50, submissions: 250, rate: 350, energy: 430 };

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Market', col.market, tableTop)
        .text('Submissions', col.submissions, tableTop)
        .text('Verified %', col.rate, tableTop)
        .text('Top Energy', col.energy, tableTop);

      doc
        .moveTo(50, doc.y + 4)
        .lineTo(560, doc.y + 4)
        .stroke();

      doc.moveDown(0.5);

      for (const [market, stat] of Object.entries(marketMap)) {
        if (doc.y > 700) doc.addPage();

        const rate = Math.round((stat.verified / stat.count) * 100);
        const topEnergy =
          Object.entries(stat.energyFreq).sort((a, b) => b[1] - a[1])[0]?.[0] ??
          'N/A';

        const rowY = doc.y;

        doc
          .fontSize(9)
          .font('Helvetica')
          .text(market, col.market, rowY, { width: 190 })
          .text(`${stat.count}`, col.submissions, rowY)
          .text(`${rate}%`, col.rate, rowY)
          .text(topEnergy, col.energy, rowY, { width: 120 });

        doc.moveDown(0.5);
      }

      // ── PHOTO GALLERY ────────────────────────────────────────
      doc.addPage();

      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('Shop Photo Gallery')
        .moveDown();

      for (const { survey, image } of imageResults) {
        if (doc.y > 650) doc.addPage();

        const x = doc.x;
        const y = doc.y;

        if (image) {
          doc.image(image.buffer, x, y, { width: 200 });
        } else {
          // placeholder block — brief requirement
          doc
            .rect(x, y, 200, 130)
            .stroke()
            .fontSize(9)
            .font('Helvetica')
            .text('No photo available', x, y + 55, {
              width: 200,
              align: 'center',
            });
        }

        doc
          .fontSize(9)
          .font('Helvetica')
          .text(
            `${survey.businessName} — ${survey.marketName ?? 'N/A'}`,
            x,
            y + 135,
            { width: 200 },
          )
          .moveDown(2);
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}