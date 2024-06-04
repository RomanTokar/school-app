import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
import { AppService } from './app.service';
import { TeachersModule } from '../teachers/teachers.module';
import { AuthModule } from '../auth/auth.module';
import { StudentsModule } from '../students/students.module';
import { ClassesModule } from '../classes/classes.module';
import { CitiesModule } from '../cities/cities.module';
import { MatnasesModule } from '../matnases/matnases.module';
import { SchoolsModule } from '../schools/schools.module';
import { RemindsModule } from '../reminds/reminds.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        S3_BUCKET_NAME: Joi.string().required(),
        S3_BUCKET_REGION: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().required(),
        PORT: Joi.number().default(3000),
      }),
      validationOptions: {
        abortEarly: true,
      },
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      }),
    }),
    TeachersModule,
    StudentsModule,
    ClassesModule,
    AuthModule,
    CitiesModule,
    MatnasesModule,
    SchoolsModule,
    RemindsModule,
    ScheduleModule.forRoot(),
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
