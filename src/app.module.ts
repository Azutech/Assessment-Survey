import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MarketsModule } from './apis/markets/markets.module';
import { SurveysModule } from './apis/surveys/surveys.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AgentsModule } from './apis/agents/agents.module';
import { FileuploadModule } from './fileupload/fileupload.module';
import { AdminModule } from './apis/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // optional, defaults to process.env
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('DATABASE_URL'),
      }),
    }),
    MarketsModule,
    SurveysModule,
    AgentsModule,
    FileuploadModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
