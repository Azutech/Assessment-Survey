import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateMarketSchema = z.object({
  marketName: z.string().min(1, 'Market name is required'),
  marketEntity: z.string().min(1, 'Market entity is required'),
  marketState: z.string().min(1, 'Market state is required'),
  marketLGA: z.string().min(1, 'Market LGA is required'),
  marketGPS: z.string().optional(),
});

export class CreateMarketDto extends createZodDto(CreateMarketSchema) {}
