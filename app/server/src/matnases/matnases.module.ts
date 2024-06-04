import { Module } from '@nestjs/common';
import { MatnasesService } from './matnases.service';
import { MatnasesController } from './matnases.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Matnas, MatnasSchema } from './matnas.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Matnas.name, schema: MatnasSchema }]),
  ],
  exports: [MatnasesService],
  controllers: [MatnasesController],
  providers: [MatnasesService],
})
export class MatnasesModule {}
