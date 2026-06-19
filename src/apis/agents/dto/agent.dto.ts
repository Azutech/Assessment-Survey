import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateAgentSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  avatar: z.string().optional(),
});

export class CreateAgentDto extends createZodDto(CreateAgentSchema) {}

// const UpdateAgentSchema = z.object({
//   fullName: z.string().min(1, 'Full name is required').optional(),
//   email: z.string().email('Invalid email address').min(1, 'Email is required').optional(),
//   password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
//   phoneNumber: z.string().min(1, 'Phone number is required').optional(),
//   avatar: z.string().optional(),
//   lastActiveTime: z.date().optional(),
//   lastLocation: z.string().optional(),
//   uniqueId: z.string().optional(),
//   status: z.string().optional(),
//   totalResponse: z.number().optional(),
//   userType: z.string().optional(),
// });
// export class UpdateAgentDto extends createZodDto(UpdateAgentSchema) {}
