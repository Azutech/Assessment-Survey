import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Agent } from '../entity/agent.entity';
import { AgentI } from '../interfaces/agent.interface';
import { PropDataInput } from '../../../common/utils/utils.interface';

@Injectable()
export class AgentRepository {
  constructor(
    @InjectModel(Agent.name) public readonly agentModel: Model<Agent>,
  ) {}

  async create(agent: AgentI): Promise<Agent> {
    const newAgent = new this.agentModel(agent);
    return newAgent.save();
  }

  async retrieveForBackup(): Promise<Agent[]> {
    const agents = await this.agentModel.find().exec();
    return agents;
  }

  async findOne(where: PropDataInput, attribute?: any): Promise<Agent | null> {
    if (attribute) {
      return this.agentModel.findOne(where).select(attribute).exec();
    }
    return this.agentModel.findOne(where).exec();
  }

  async updateinfo(where: any, data: any): Promise<Agent> {
    try {
      return await this.agentModel.findOneAndUpdate(where, data, {
        returnDocument: 'after',
      });
    } catch (error) {
      throw error;
    }
  }

  async findAll(where: PropDataInput, search?: string): Promise<any[]> {
    const agentMatch: any = { ...where };

    if (search) {
      agentMatch.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
      ];
    }

    return this.agentModel.aggregate([
      { $match: agentMatch },

      {
        $lookup: {
          from: 'customers',
          let: { agentId: { $toString: '$_id' } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$agentId', '$$agentId'] },
                marketName: { $ne: null },
              },
            },
            { $group: { _id: '$marketName' } },
          ],
          as: 'markets',
        },
      },

      {
        $lookup: {
          from: 'customers',
          let: { agentId: { $toString: '$_id' } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$agentId', '$$agentId'] },
              },
            },
            {
              $addFields: {
                day: {
                  $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                },
              },
            },
            { $group: { _id: '$day', count: { $sum: 1 } } },
          ],
          as: 'dailyResponses',
        },
      },

      {
        $addFields: {
          totalResponses: { $sum: '$dailyResponses.count' },
        },
      },

      {
        $project: {
          fullName: 1,
          email: 1,
          uniqueId: 1,
          phoneNumber: 1,
          lastLocation: 1,
          createdAt: 1,
          lastActiveTime: 1,
          supervisorId: 1,
          status: 1,
          supervisorName: 1,
          markets: {
            $sortArray: {
              input: { $map: { input: '$markets', as: 'm', in: '$$m._id' } },
              sortBy: 1,
            },
          },
          totalResponses: 1,
          dailyResponses: 1,
        },
      },

      { $sort: { totalResponses: -1 } },
    ]);
  }
}
