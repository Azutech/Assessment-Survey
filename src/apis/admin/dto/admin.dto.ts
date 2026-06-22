import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const blockedDomains = [
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'trashmail.com',
];

const CreateAdminSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required'),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email address')
    .refine(
      (email) => {
        const domain = email.split('@')[1]?.toLowerCase();
        return !blockedDomains.includes(domain);
      },
      { message: 'Temporary email addresses are not allowed' },
    ),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(
      /[@$!%*?&.#^()_\-+=]/,
      'Password must contain at least one special character',
    ),
});

export class CreateAdminDto extends createZodDto(CreateAdminSchema) {
  avatar: string;
}

const loginAdminSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email address')
    .refine(
      (email) => {
        const domain = email.split('@')[1]?.toLowerCase();
        return !blockedDomains.includes(domain);
      },
      { message: 'Temporary email addresses are not allowed' },
    ),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(
      /[@$!%*?&.#^()_\-+=]/,
      'Password must contain at least one special character',
    ),
});
export class LoginAdminDto extends createZodDto(loginAdminSchema) {}
