import { Test, TestingModule } from '@nestjs/testing';
import { NutrientesController } from './nutrientes.controller';

describe('NutrientesController', () => {
  let controller: NutrientesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NutrientesController],
    }).compile();

    controller = module.get<NutrientesController>(NutrientesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
