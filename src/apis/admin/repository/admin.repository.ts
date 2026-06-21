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

  async updateAllIkotunMarkets(): Promise<void> {
    try {
      // Find all customers with Ikotun market
      const customers = await this.adminModel.find({
        email: {
          $in: [
            'kapata@noemdek.com',
            'kolasupo@madnpark.com',
            'kfatai@noemdek.co.uk',
            'bhassan@noemdek.co.uk',
          ],
        },
      });

      console.log(
        `Found ${customers.length} customers to update for ${customers[0]?.fullName}`,
      );

      // Update each customer
      for (const customer of customers) {
        await this.updateinfo(
          { _id: customer._id },
          { exportPermission: 'active' },
        );
        console.log(`Updated customer: ${customer._id}`);
      }

      console.log('All customers updated successfully');
    } catch (error) {
      console.error('Error updating customers:', error);
      throw error;
    }
  }
}
