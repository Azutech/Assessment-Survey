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
}
