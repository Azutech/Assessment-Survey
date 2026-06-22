export interface SurveyI {
  marketName: string;
  marketLGA: string;
  marketState: string;
  marketEntity: string;
  businessName: string;
  businessType: string;
  customerName: string;
  gender: string;
  phoneNumber: string;
  shopNumber: string;
  address: string;
  ageRange: string;
  numberOfEmployees: string;
  currentEnergySource: string;
  generatorOwnership: boolean;
  energyChallenges: string[];
  applianceUsed?: string;
  willingnessToPay: string;
  paymentPreference: string;
  electricitySupply: string;
  GPS: string;
  agentDetails: string;
  startTime: Date;
  endTime: Date;
  agentId: string;
  duration: string;
  shopBlock: string;
  shopSection: string;
  category: string;
  appliances?: any[];
  LGA_Eligibility: boolean;
  hasPictures: boolean;
  shopSectionNumber?: string;
  // Optional fields (match DTO)
  loadProfile?: string;
  estimatedFutureLoad?: string;
  generatorSize?: string;
  consent?: boolean;
  signature?: string;
  additionalComments?: string;
  collectionFrequency?: string;
  images: Images;
  userId?: string;
}

export interface Images {
  shopExteriorImage: string;
  shopInteriorImage1?: string;
  shopInteriorImage2?: string;
  shopInteriorImage3?: string;
}
