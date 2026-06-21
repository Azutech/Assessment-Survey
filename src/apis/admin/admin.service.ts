import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/admin.dto';

@Injectable()
export class AdminService {
  create(createAdminDto: CreateAdminDto) {
    return 'This action adds a new admin';
  }
}
