import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { City } from './city.schema';
import { CreateCityDto } from './dto/create-city.dto';

@Injectable()
export class CitiesService {
  constructor(@InjectModel(City.name) private cityModel: Model<City>) {}

  create(createCityDto: CreateCityDto) {
    return this.cityModel.create(createCityDto);
  }

  findAll() {
    return this.cityModel.find();
  }

  findByName(name: string) {
    return this.cityModel.findOne({ name });
  }
}
