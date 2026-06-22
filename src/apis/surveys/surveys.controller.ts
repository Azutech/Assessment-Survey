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
} from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { CreateSurveyDto } from './dto/survey.dto';
import { Response } from 'express';

@Controller('surveys')
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @Post()
  async create(
    @Req() req: any,
    @Body() createSurveyDto: CreateSurveyDto,
    @Res() res: Response,
  ) {
    createSurveyDto.userId = req.user.userId
    const survey = await this.surveysService.addAgentSurvey(createSurveyDto);
    return res.status(HttpStatus.CREATED).json({
      
    })
  }

  // @Get()
  // findAll() {
  //   return this.surveysService.findAll();
  // }
}
