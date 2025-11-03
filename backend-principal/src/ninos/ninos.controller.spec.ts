import { Test, TestingModule } from '@nestjs/testing';
import { NinosController } from './ninos.controller';

describe('NinosController', () => {
  let controller: NinosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NinosController],
    }).compile();

    controller = module.get<NinosController>(NinosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
