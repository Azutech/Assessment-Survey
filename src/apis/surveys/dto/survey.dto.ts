// surveys/dto/create-survey.dto.ts
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const ImagesSchema = z.object({
  shopExteriorImage: z.string().url('Invalid exterior image URL'),
  shopInteriorImage1: z.string().url().optional().nullable(),
  shopInteriorImage2: z.string().url().optional().nullable(),
  shopInteriorImage3: z.string().url().optional().nullable(),
});

const ApplianceSchema = z.object({
  name: z.string().trim().min(1, 'Appliance name is required'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
  hoursPerDay: z.coerce
    .number()
    .int()
    .min(0)
    .max(24, 'Must be between 0 and 24'),
  watts: z.coerce.number().int().min(1, 'Watts is required'),
});

const CreateSurveySchema = z
  .object({
    // Step 1: Identity
    businessName: z.string().trim().min(1, 'Business name is required'),
    businessType: z.string().trim().min(1, 'Business type is required'),
    customerName: z.string().trim().min(1, 'Customer name is required'),
    gender: z.enum(['Male', 'Female']).optional(),
    phoneNumber: z.string().trim().min(1, 'Phone number is required'),
    ageRange: z.enum([
      'Under 18',
      '18-25',
      '26-35',
      '36-45',
      '46-55',
      'Above 55',
    ]),
    numberOfEmployees: z.coerce
      .number()
      .int()
      .min(0, 'Must be 0 or more')
      .optional(),
    shopStatus: z.enum(['occupied', 'unoccupied', 'locked up']).optional(),

    // Step 2: Location
    marketName: z.string().trim().min(1, 'Market is required'),
    GPS: z
      .string()
      .trim()
      .min(1, 'GPS is required — please enable location access')
      .regex(/^-?\d+(\.\d+)? -?\d+(\.\d+)?$/, 'GPS must be in format: lat lng'),
    shopSection: z.string().trim().optional(),
    shopSectionNumber: z.string().trim().optional(),
    shopBlock: z.string().trim().optional(),
    shopNumber: z.string().trim().optional(),

    // Step 3: Energy Profile
    currentEnergySource: z.enum([
      'petrol-generator',
      'diesel-generator',
      'grid-power',
      'solar-home-system',
      'battery-lamp',
      'none',
    ]),
    generatorOwnership: z.boolean().optional(),
    generatorSize: z.string().trim().optional(),
    electricitySupply: z.enum(['0-2', '2-5', '5-10', '10-12', '>12']),
    energyChallenges: z
      .array(
        z.enum([
          'high-cost',
          'fuel-scarcity',
          'maintenance',
          'pollution',
          'other',
        ]),
      )
      .max(7, 'Maximum 7 challenges')
      .optional()
      .default([]),
    collectionFrequency: z.string().trim().optional(),
    loadProfile: z.string().trim().optional(),
    estimatedFutureLoad: z.string().trim().optional(),

    // Step 4: Appliances
    appliances: z
      .array(ApplianceSchema)
      .max(14, 'Maximum 14 appliances')
      .optional()
      .default([]),

    // Step 5: Commercial & Consent
    willingnessToPay: z.string().trim().optional(),
    paymentPreference: z
      .enum([
        'prepaid-card',
        'monthly-subscription',
        'bank-transfer',
        'mobile-money',
        'pay-as-you-go',
      ])
      .optional(),
    applianceUsed: z
      .enum(['Light', 'Medium sized', 'Heavy appliances'])
      .optional(),
    additionalComments: z.string().trim().optional(),
    consent: z
      .boolean()
      .refine((v) => v === true, { message: 'Consent is required to submit' }),

    // Step 6: Media
    signature: z
      .string()
      .trim()
      .min(1, 'Signature is required')
      .regex(/^data:image\/(png|jpeg);base64,/, 'Invalid signature format'),
    images: ImagesSchema,

  })
  .superRefine((data, ctx) => {
    const isGenerator = ['petrol-generator', 'diesel-generator'].includes(
      data.currentEnergySource,
    );

    if (isGenerator && !data.generatorSize) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['generatorSize'],
        message: 'Generator size is required for generator energy source',
      });
    }

    if (isGenerator && data.generatorOwnership === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['generatorOwnership'],
        message: 'Generator ownership is required for generator energy source',
      });
    }
  });

export class CreateSurveyDto extends createZodDto(CreateSurveySchema) {
  address: string;
  agentDetails: string;
  endTime: Date;
  agentId: string;
  duration: string;
  LGA_Eligibility: boolean;
  category:string;
  startTime:Date
}
