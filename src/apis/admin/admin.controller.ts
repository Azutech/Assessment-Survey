import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
  Req,
  UseGuards,
  Put,
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto, LoginAdminDto } from './dto/admin.dto';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/guards/jwt/jwt.guard';
import { AdminOnlyGuard } from 'src/guards/admin.guard';
// import { AdminOnlyGuard } from 'src/guards/admin.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminsService: AdminService) {}

  @Post('addAdmin')
  async create(@Res() res: Response, @Body() createAdminDto: CreateAdminDto) {
    const result = await this.adminsService.create(createAdminDto);
    return res.status(HttpStatus.CREATED).json(result);
  }

  @Post('login')
  async login(@Res() res: Response, @Body() loginDto: LoginAdminDto) {
    const result = await this.adminsService.validateAdmin(loginDto);
    return res.status(HttpStatus.OK).json(result);
  }

  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  @Put('activateAgent')
  async activateAgent(@Res() res: Response, @Query('userId') userId: string) {
    const result = await this.adminsService.activateAgent(userId);
    return res.status(HttpStatus.OK).json(result);
  }

  @UseGuards(JwtAuthGuard /* AdminOnlyGuard */)
  @Put('deactivateAgent')
  async deactivateAgent(@Res() res: Response, @Query('userId') userId: string) {
    const result = await this.adminsService.deactivateAgent(userId);
    return res.status(HttpStatus.OK).json(result);
  }

  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  async dashboard(@Req() req: any, @Res() res: Response) {
    const userId = req.user.userId;
    const result = await this.adminsService.adminDashboard(userId);
    return res.status(HttpStatus.OK).json(result);
  }
}
