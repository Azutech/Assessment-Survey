import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { parse, isValid, startOfDay, endOfDay, isAfter } from 'date-fns';
import { SurveyDocument, Survey } from '../entity/survey.entity';
import { Model, Types } from 'mongoose';
import { PropDataInput } from '../../../common/utils/utils.interface';
import { SurveyI } from '../interfaces/survey.interface';

@Injectable()
export class SurveyRepository {
  constructor(
    @InjectModel(Survey.name) private surveyModel: Model<SurveyDocument>,
  ) {}

  async create(customer: SurveyI): Promise<Survey> {
    const newCustomer = new this.surveyModel(customer);
    return newCustomer.save();
  }

  async findOne(
    where: PropDataInput,
    attribute?: string,
  ): Promise<Survey | null> {
    return this.surveyModel.findOne(where).select(attribute).exec();
  }

  async updateinfo(where: any, data: any): Promise<Survey> {
    try {
      return await this.surveyModel.findOneAndUpdate(where, data, {
        returnDocument: 'after',
      });
    } catch (error) {
      throw error;
    }
  }

  async countMessages() {
    return await this.surveyModel.countDocuments().exec();
  }

  async findAllCustomerIndex(
    where: PropDataInput,
    LGA_Eligibility?: boolean,
    hasPictures?: boolean,
    marketEntity?: string,
    marketState?: string,
    marketLGA?: string,
    agentDetails?: string,
    currentEnergySource?: string,
    marketName?: string,
    search?: string,
    status?: string | string[],
    gpsFilter?: 'withGPS' | 'withoutGPS',
    dateRange?: string,
    // date?: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: any[]; total: number }> {
    try {
      const pipeline: any[] = [];

      const match: any = { ...where };

      if (agentDetails) {
        match.agentDetails = agentDetails;
      }

      if (marketName) {
        match.marketName = marketName;
      }
      if (currentEnergySource) {
        match.currentEnergySource = currentEnergySource;
      }

      if (LGA_Eligibility !== undefined) {
        match.LGA_Eligibility = LGA_Eligibility;
      }

      if (marketLGA) {
        match.marketLGA = marketLGA;
      }
      if (marketState) {
        match.marketState = marketState;
      }
      if (marketEntity) {
        match.marketEntity = marketEntity;
      }

      if (hasPictures !== undefined) {
        match.hasPictures = hasPictures;
      }

      // Status filter (single or multiple)
      if (status) {
        if (Array.isArray(status)) {
          match.status = {
            $in: status.map((s) => new RegExp(`^${s}$`, 'i')),
          };
        } else {
          match.status = { $regex: `^${status}$`, $options: 'i' };
        }
      }

      // GPS Filter
      if (gpsFilter) {
        if (gpsFilter === 'withoutGPS') {
          match.$or = [
            { GPS: { $in: [, /*'6.4474 3.3903'*/ '- -', '', null] } },
            { GPS: { $exists: false } },
          ];
        }

        if (gpsFilter === 'withGPS') {
          match.$and = [
            { GPS: { $ne: null } },
            { GPS: { $ne: '' } },
            { GPS: { $ne: '- -' } },
            // { GPS: { $ne: /*'6.4474 3.3903'*/ } },
          ];
        }
      }

      if (dateRange) {
        const [startStr, endStr] = dateRange.split('/');

        const startDate = parse(startStr, 'yyyy-MM-dd', new Date());
        const endDate = parse(endStr, 'yyyy-MM-dd', new Date());

        if (!isValid(startDate) || !isValid(endDate)) {
          throw new Error(
            `Invalid dateRange format. Expected "YYYY-MM-DD/YYYY-MM-DD", got "${dateRange}"`,
          );
        }

        if (isAfter(startDate, endDate)) {
          throw new Error(
            `Invalid dateRange: start date "${startStr}" must not be after end date "${endStr}"`,
          );
        }

        match.createdAt = {
          $gte: startOfDay(startDate),
          $lte: endOfDay(endDate),
        };
      }

      if (search) {
        const searchOr: any[] = [
          { businessName: { $regex: search, $options: 'i' } },
          { businessType: { $regex: search, $options: 'i' } },
          { customerName: { $regex: search, $options: 'i' } },
          { marketName: { $regex: search, $options: 'i' } },
          { agentDetails: { $regex: search, $options: 'i' } },
        ];

        if (match.$or) {
          match.$and = [
            ...(match.$and || []),
            { $or: match.$or },
            { $or: searchOr },
          ];
          delete match.$or;
        } else {
          match.$or = searchOr;
        }
      }

      // Single match stage
      pipeline.push({ $match: match });

      // Lookup Agent
      pipeline.push({
        $lookup: {
          from: 'agents',
          let: { agentId: '$agentId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', { $toObjectId: '$$agentId' }],
                },
              },
            },
            {
              $project: {
                supervisorId: 1,
                supervisorName: 1,
              },
            },
          ],
          as: 'agent',
        },
      });

      pipeline.push({
        $unwind: {
          path: '$agent',
          preserveNullAndEmptyArrays: true,
        },
      });

      // Facet for pagination + total
      pipeline.push({
        $facet: {
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                _id: { $toString: '$_id' },
                businessName: 1,
                businessType: 1,
                customerName: 1,
                marketName: 1,
                marketEntity: 1,
                businessCategory: 1,
                phoneNumber: 1,
                gender: 1,
                shopNumber: 1,
                shopSectionNumber: 1,
                ageRange: 1,
                numberOfEmployees: 1,
                currentEnergySource: 1,
                generatorOwnership: 1,
                energyChallenges: 1,
                applianceUsed: 1,
                willingnessToPay: 1,
                paymentPreference: 1,
                electricitySupply: 1,
                dailyEnergyConsumption: 1,
                GPS: 1,
                address: 1,
                duration: 1,
                startTime: 1,
                endTime: 1,
                loadProfile: 1,
                estimatedFutureLoad: 1,
                agentId: 1,
                agentDetails: 1,
                shopBlock: 1,
                shopStatus: 1,
                shopSection: 1,
                additionalComments: 1,
                signature: 1,
                consent: 1,
                generatorSize: 1,
                collectionFrequency: 1,
                hasPictures: 1,
                LGA_Eligibility: 1,
                marketLGA: 1,
                marketState: 1,
                category: 1,
                createdAt: 1,
                appliances: 1,
                images: 1,
                status: 1,
                comment: 1,
                auditor: 1,
                // supervisorId: '$agent.supervisorId',
                // supervisorName: '$agent.supervisorName',
              },
            },
          ],
          total: [{ $count: 'count' }],
        },
      });

      const [result] = await this.surveyModel.aggregate(pipeline).exec();

      return {
        data: result?.data || [],
        total: result?.total?.[0]?.count || 0,
      };
    } catch (error) {
      throw error;
    }
  }

  async getElectricityDistribution() {
    try {
      return this.surveyModel.aggregate([
        {
          $group: {
            _id: '$electricitySupply',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            band: '$_id',
            count: 1,
          },
        },
        { $sort: { band: 1 } },
      ]);
    } catch (err: any) {
      throw err;
    }
  }

  async getWillingnessToPayDistribution() {
    try {
      return this.surveyModel.aggregate([
        {
          $group: {
            _id: '$willingnessToPay',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            band: '$_id',
            count: 1,
          },
        },
        { $sort: { count: -1 } },
      ]);
    } catch (err: any) {
      throw err;
    }
  }

  async findAllCustomerExport(
    where: PropDataInput = {},
    agentId?: string,
    marketName?: string,
    marketEntity?: string,
    marketLGA?: string,
    customerName?: string,
    LGA_Eligibility?: boolean,
    hasPictures?: boolean,
    page: number = 1,
    limit: number = 500,
  ): Promise<{ data: any[] }> {
    try {
      const pipeline: any[] = [];
      const skip = (page - 1) * limit;

      // ✅ Build match query
      const match: any = { ...where };

      if (LGA_Eligibility !== undefined) {
        match.LGA_Eligibility = LGA_Eligibility;
      }

      if (hasPictures !== undefined) {
        match.hasPictures = hasPictures;
      }

      if (customerName) {
        match.customerName = { $regex: new RegExp(customerName, 'i') };
      }
      if (agentId) {
        match.agentId = agentId;
      }

      if (marketEntity) {
        match.marketEntity = marketEntity;
      }
      if (marketLGA) {
        match.marketLGA = marketLGA;
      }

      if (marketName) {
        match.marketName = marketName;
      }

      pipeline.push({ $match: match });

      // =========================
      // ✅ AGENT LOOKUP
      // =========================
      pipeline.push({
        $lookup: {
          from: 'agents',
          let: { agentId: '$agentId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', { $toObjectId: '$$agentId' }],
                },
              },
            },
            {
              $project: {
                supervisorId: 1,
                supervisorName: 1,
              },
            },
          ],
          as: 'agent',
        },
      });

      pipeline.push({
        $unwind: {
          path: '$agent',
          preserveNullAndEmptyArrays: true,
        },
      });

      // =========================
      // ✅ SORT + PAGINATION
      // =========================
      pipeline.push({ $sort: { createdAt: -1 } });
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });

      // =========================
      // ✅ FINAL PROJECTION (LEAN)
      // =========================
      pipeline.push({
        $project: {
          _id: { $toString: '$_id' }, // 👈
          businessName: 1,
          businessType: 1,
          customerName: 1,
          marketName: 1,
          marketEntity: 1,
          businessCategory: 1,
          phoneNumber: 1,
          gender: 1,
          shopNumber: 1,
          ageRange: 1,
          numberOfEmployees: 1,
          currentEnergySource: 1,
          generatorOwnership: 1,
          energyChallenges: 1,
          applianceUsed: 1,
          willingnessToPay: 1,
          paymentPreference: 1,
          electricitySupply: 1,
          dailyEnergyConsumption: 1,
          GPS: 1,
          address: 1,
          duration: 1,
          startTime: 1,
          endTime: 1,
          loadProfile: 1,
          estimatedFutureLoad: 1,
          shopBlock: 1,
          shopStatus: 1,
          shopSectionNumber: 1,
          shopSection: 1,
          marketLGA: 1,
          additionalComments: 1,
          signature: 1,
          consent: 1,
          appliances: 1,
          generatorSize: 1,
          collectionFrequency: 1,
          agentId: 1,
          agentDetails: 1,
          LGA_Eligibility: 1,
          hasPictures: 1,
          category: 1,
          createdAt: 1,
          status: 1,

          // ✅ keep only needed image fields (avoid BSON issues)
          images: {
            shopExteriorImage: '$images.shopExteriorImage',
            shopInteriorImage1: '$images.shopInteriorImage1',
            shopInteriorImage2: '$images.shopInteriorImage2',
            shopInteriorImage3: '$images.shopInteriorImage3',
          },

          comment: 1,
          auditor: 1,

          // ✅ from agent lookup
          supervisorId: '$agent.supervisorId',
          supervisorName: '$agent.supervisorName',
        },
      });

      // =========================
      // ✅ EXECUTE
      // =========================
      const data = await this.surveyModel.aggregate(pipeline).exec();

      return { data };
    } catch (error) {
      throw error;
    }
  }
  async getMarketAnalytics(dateRange?: string) {
    try {
      const matchStage: Record<string, any> = {};

      if (dateRange) {
        const [from, to] = dateRange.split(',');
        matchStage.createdAt = {
          $gte: new Date(from),
          $lte: new Date(to),
        };
      }

      const data = await this.surveyModel.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$marketName',
            totalSubmissions: { $sum: 1 },
            verifiedCount: {
              $sum: { $cond: [{ $eq: ['$status', 'verified'] }, 1, 0] },
            },
            avgEnergyConsumption: { $avg: '$dailyEnergyConsumption' },
            energySources: { $push: '$currentEnergySource' },
            marketLGA: { $first: '$marketLGA' },
            marketState: { $first: '$marketState' },
          },
        },
        {
          $addFields: {
            percentageVerified: {
              $round: [
                {
                  $multiply: [
                    { $divide: ['$verifiedCount', '$totalSubmissions'] },
                    100,
                  ],
                },
                2,
              ],
            },
          },
        },
        {
          $lookup: {
            from: 'markets',
            localField: '_id',
            foreignField: '_id',
            as: 'market',
          },
        },
        {
          $unwind: {
            path: '$market',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 0,
            marketId: '$_id',
            marketName: '$market.marketName',
            marketLGA: 1,
            marketState: 1,
            totalSubmissions: 1,
            verifiedCount: 1,
            percentageVerified: 1,
            avgEnergyConsumption: { $round: ['$avgEnergyConsumption', 2] },
            energySources: 1,
          },
        },
        { $sort: { totalSubmissions: -1 } },
      ]);

      const result = data.map((market) => {
        const frequency: Record<string, number> = {};
        for (const source of market.energySources) {
          if (source) frequency[source] = (frequency[source] || 0) + 1;
        }
        const mostCommonEnergySource =
          Object.entries(frequency).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

        const { energySources, ...rest } = market;
        return { ...rest, mostCommonEnergySource };
      });

      return {
        data: result,
        meta: { total: result.length },
      };
    } catch (err: any) {
      throw err;
    }
  }

  async getSummaryAnalytics(dateRange?: string) {
    try {
      const matchStage: Record<string, any> = {};

      if (dateRange) {
        const [from, to] = dateRange.split(',');
        matchStage.createdAt = {
          $gte: new Date(from),
          $lte: new Date(to),
        };
      }

      const [summary, energyBreakdown] = await Promise.all([
        this.surveyModel.aggregate([
          { $match: matchStage },
          {
            $group: {
              _id: null,
              totalSubmissions: { $sum: 1 },
              totalWithGPS: {
                $sum: {
                  $cond: [
                    { $and: [{ $ne: ['$GPS', null] }, { $ne: ['$GPS', ''] }] },
                    1,
                    0,
                  ],
                },
              },
              totalWithPhotos: {
                $sum: { $cond: ['$hasPictures', 1, 0] },
              },
              totalAppliances: {
                $sum: { $size: { $ifNull: ['$appliances', []] } },
              },
              totalKwh: {
                $sum: {
                  $reduce: {
                    input: { $ifNull: ['$appliances', []] },
                    initialValue: 0,
                    in: {
                      $add: [
                        '$$value',
                        { $ifNull: ['$$this.totalConsumption', 0] },
                      ],
                    },
                  },
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              totalSubmissions: 1,
              totalWithGPS: 1,
              totalWithPhotos: 1,
              percentageWithGPS: {
                $round: [
                  {
                    $multiply: [
                      { $divide: ['$totalWithGPS', '$totalSubmissions'] },
                      100,
                    ],
                  },
                  2,
                ],
              },
              percentageWithPhotos: {
                $round: [
                  {
                    $multiply: [
                      { $divide: ['$totalWithPhotos', '$totalSubmissions'] },
                      100,
                    ],
                  },
                  2,
                ],
              },
              avgAppliancesPerShop: {
                $round: [
                  { $divide: ['$totalAppliances', '$totalSubmissions'] },
                  2,
                ],
              },
              totalKwh: { $round: ['$totalKwh', 2] },
            },
          },
        ]),

        // energy source breakdown — separate group
        this.surveyModel.aggregate([
          { $match: matchStage },
          {
            $group: {
              _id: '$currentEnergySource',
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              energySource: '$_id',
              count: 1,
            },
          },
          { $sort: { count: -1 } },
        ]),
      ]);

      const result = summary[0] ?? {
        totalSubmissions: 0,
        totalWithGPS: 0,
        totalWithPhotos: 0,
        percentageWithGPS: 0,
        percentageWithPhotos: 0,
        avgAppliancesPerShop: 0,
        totalKwh: 0,
      };

      return {
        data: {
          ...result,
          energySourceBreakdown: energyBreakdown,
        },
        meta: null,
      };
    } catch (err: any) {
      throw err;
    }
  }

  async getAgentAnalytics(dateRange?: string) {
    try {
      const matchStage: Record<string, any> = {};

      if (dateRange) {
        const [from, to] = dateRange.split(',');
        matchStage.createdAt = {
          $gte: new Date(from),
          $lte: new Date(to),
        };
      }

      const data = await this.surveyModel.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$agentId',
            agentDetails: { $first: '$agentDetails' },
            totalSubmissions: { $sum: 1 },
            firstSubmission: { $min: '$createdAt' },
            lastSubmission: { $max: '$createdAt' },
            durations: { $push: '$duration' },
          },
        },
        {
          $lookup: {
            from: 'agents',
            localField: '_id',
            foreignField: '_id',
            as: 'agent',
          },
        },
        {
          $unwind: {
            path: '$agent',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 0,
            agentId: '$_id',
            agentName: '$agentDetails',
            email: '$agent.email',
            totalSubmissions: 1,
            firstSubmission: 1,
            lastSubmission: 1,
            durations: 1,
          },
        },
        { $sort: { totalSubmissions: -1 } },
      ]);

      // compute average duration per agent — duration stored as "0h 4m 31s"
      const result = data.map((agent) => {
        const totalSeconds = agent.durations.reduce(
          (acc: number, d: string) => {
            if (!d) return acc;
            const hours = parseInt(d.match(/(\d+)h/)?.[1] ?? '0');
            const minutes = parseInt(d.match(/(\d+)m/)?.[1] ?? '0');
            const seconds = parseInt(d.match(/(\d+)s/)?.[1] ?? '0');
            return acc + hours * 3600 + minutes * 60 + seconds;
          },
          0,
        );

        const avgSeconds = Math.floor(
          totalSeconds / (agent.durations.length || 1),
        );
        const avgHours = Math.floor(avgSeconds / 3600);
        const avgMinutes = Math.floor((avgSeconds % 3600) / 60);
        const avgSecs = avgSeconds % 60;

        const { durations, ...rest } = agent;

        return {
          ...rest,
          avgSurveyDuration: `${avgHours}h ${avgMinutes}m ${avgSecs}s`,
          activeDateRange: {
            from: agent.firstSubmission,
            to: agent.lastSubmission,
          },
        };
      });

      return {
        data: result,
        meta: { total: result.length },
      };
    } catch (err: any) {
      throw err;
    }
  }
}
