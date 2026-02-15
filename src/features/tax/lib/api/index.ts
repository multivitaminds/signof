// ─── API Services Barrel Export ──────────────────────────────────────────

// Generic form service factory
export { createFormService } from './formService'
export type { FormService, FormServiceResponse, FormRecord, FormServiceStatusResult, FormServiceListResult } from './formService'

// Form-specific services
export { createForm1099NecService, buildForm1099NecPayload } from './form1099NecService'
export type { Form1099NecPayload, Form1099NecRecipient } from './form1099NecService'

export { createForm1099MiscService, buildForm1099MiscPayload } from './form1099MiscService'
export type { Form1099MiscPayload, Form1099MiscRecipient } from './form1099MiscService'

export { createFormW2Service, buildFormW2Payload } from './formW2Service'
export type { FormW2Payload, FormW2Employee } from './formW2Service'

export { createForm941Service, buildForm941Payload } from './form941Service'
export type { Form941Payload } from './form941Service'

export { createForm940Service, buildForm940Payload } from './form940Service'
export type { Form940Payload } from './form940Service'

export { createForm1095cService, buildForm1095cPayload } from './form1095cService'
export type { Form1095cPayload, Form1095cEmployee, Form1095cMonthlyInfo } from './form1095cService'

// KYC services
export { createKycService } from './kycService'
export type { KycService, TinVerificationResult, AddressValidationResult, CorrectedAddress, AddressInput } from './kycService'

// Business services
export { createBusinessService } from './businessService'
export type { BusinessService, BusinessData, BusinessRecord } from './businessService'
