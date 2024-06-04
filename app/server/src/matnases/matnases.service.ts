import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Matnas } from './matnas.schema';
import { CreateMatnasDto } from './dto/create-matnas.dto';

@Injectable()
export class MatnasesService {
  constructor(@InjectModel(Matnas.name) private matnasModel: Model<Matnas>) {}

  create(createMatnasDto: CreateMatnasDto) {
    return this.matnasModel.create(createMatnasDto);
  }

  findAll() {
    return this.matnasModel.find();
  }

  findByName(name: string) {
    return this.matnasModel.findOne({ name });
  }
}
