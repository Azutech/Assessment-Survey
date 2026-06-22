import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  Res,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { CreateSurveyDto } from './dto/survey.dto';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/guards/jwt/jwt.guard';

@Controller('surveys')
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @UseGuards(JwtAuthGuard)
  @Post('addSurvey')
  async create(
    @Req() req: any,
    @Body() createSurveyDto: CreateSurveyDto,
    @Res() res: Response,
  ) {
    createSurveyDto.userId = req.user.userId;
    const survey = await this.surveysService.addAgentSurvey(createSurveyDto);
    return res.status(HttpStatus.CREATED).json({message: "survey added", survey });
  }

  // @Get()
  // findAll() {
  //   return this.surveysService.findAll();
  // }
}
