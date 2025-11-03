import { Test, TestingModule } from '@nestjs/testing';
import { NinosService } from './ninos.service';

describe('NinosService', () => {
  let service: NinosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NinosService],
    }).compile();

    service = module.get<NinosService>(NinosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
