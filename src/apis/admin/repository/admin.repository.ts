import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin } from '../entity/admin.entity';
import { Model } from 'mongoose';
import { PropDataInput } from '../../../common/utils/utils.interface';
import { AdminI } from '../interfaces/admin.interface';

@Injectable()
export class AdminRepository {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
  ) {}

  async createAdmin(admin: AdminI): Promise<Admin> {
    const newAdmin = new this.adminModel(admin);
    return await newAdmin.save();
  }

  async retrieveForBackup(): Promise<Admin[]> {
    const admins = await this.adminModel.find().exec();
    return admins;
  }

  async updateinfo(where: any, data: any): Promise<Admin> {
    try {
      return await this.adminModel.findOneAndUpdate(where, data, {
        new: true,
      });
      // .select('-password');
    } catch (error) {
      throw error;
    }
  }

  async findOne(where: PropDataInput, attribute?: any) {
    if (attribute) {
      return await this.adminModel.findOne(where).select(attribute).exec();
    }
    return await this.adminModel.findOne(where, attribute).exec();
  }
}
