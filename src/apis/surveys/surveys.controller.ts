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
  Query,
  Put,
} from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { CreateSurveyDto, StatusUpdateDto } from './dto/survey.dto';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/guards/jwt/jwt.guard';
import { AdminOnlyGuard } from 'src/guards/admin.guard';

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
    return res
      .status(HttpStatus.CREATED)
      .json({ message: 'survey added', survey });
  }

   @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  @Put('updateSurveyStatus')
  async updateSurveyStatus(
    @Req() req: any,
    @Res() res: Response,
    @Body() statusUpdateDto: StatusUpdateDto,
    @Query('surveyId') surveyId: string,
  ) {
   const payload = {
    ...statusUpdateDto,
    surveyId,
    userId: req.user.userId,
  };

    const result =
      await this.surveysService.setStatusAndComments(payload, surveyId);
    return res
      .status(HttpStatus.OK)
      .json({message: 'Customer status updated successfully',  result});
  }
}
