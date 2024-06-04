import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { School } from './school.schema';
import { CreateSchoolDto } from './dto/create-school.dto';

@Injectable()
export class SchoolsService {
  constructor(@InjectModel(School.name) private schoolModel: Model<School>) {}

  create(createSchoolDto: CreateSchoolDto) {
    return this.schoolModel.create(createSchoolDto);
  }

  findAll() {
    return this.schoolModel.find();
  }

  findByName(name: string) {
    return this.schoolModel.findOne({ name });
  }
}
