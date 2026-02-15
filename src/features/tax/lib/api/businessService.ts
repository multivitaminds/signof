// ─── Business Service ────────────────────────────────────────────────────
//
// Business record CRUD for TaxBandits.
// A Business must exist before any form can be filed.
// Stores payer/employer info (name, TIN, address, contact).

import type { TaxBanditClient } from '../taxBanditClient'

// ─── Response Types ──────────────────────────────────────────────────────

interface CreateBusinessResponse {
  StatusCode: number
  StatusName: string
  BusinessId: string
}

interface GetBusinessResponse {
  StatusCode: number
  StatusName: string
  BusinessId: string
  BusinessName: string
  PayerRef: string
  TaxIdType: string
  TINorSSN: string
  IsEIN: boolean
  ContactName: string
  Phone: string
  Email: string
  Address1: string
  Address2: string
  City: string
  State: string
  ZipCode: string
  Country: string
}

interface ListBusinessResponse {
  StatusCode: number
  StatusName: string
  Businesses: GetBusinessResponse[]
  TotalRecords: number
}

// ─── Input Types ─────────────────────────────────────────────────────────

export interface BusinessData {
  businessName: string
  payerRef?: string
  taxIdType: 'SSN' | 'EIN'
  tin: string
  isEIN: boolean
  contactName: string
  phone: string
  email: string
  address1: string
  address2?: string
  city: string
  state: string
  zip: string
  country?: string
}

// ─── Result Types ────────────────────────────────────────────────────────

export interface BusinessRecord {
  businessId: string
  businessName: string
  payerRef: string
  taxIdType: string
  tin: string
  isEIN: boolean
  contactName: string
  phone: string
  email: string
  address1: string
  address2: string
  city: string
  state: string
  zip: string
  country: string
}

// ─── Service ─────────────────────────────────────────────────────────────

export interface BusinessService {
  create(data: BusinessData): Promise<string>
  get(businessId: string): Promise<BusinessRecord>
  update(businessId: string, data: BusinessData): Promise<void>
  list(): Promise<{ businesses: BusinessRecord[]; totalRecords: number }>
}

function mapResponseToRecord(r: GetBusinessResponse): BusinessRecord {
  return {
    businessId: r.BusinessId,
    businessName: r.BusinessName,
    payerRef: r.PayerRef,
    taxIdType: r.TaxIdType,
    tin: r.TINorSSN,
    isEIN: r.IsEIN,
    contactName: r.ContactName,
    phone: r.Phone,
    email: r.Email,
    address1: r.Address1,
    address2: r.Address2,
    city: r.City,
    state: r.State,
    zip: r.ZipCode,
    country: r.Country,
  }
}

function mapDataToPayload(data: BusinessData): Record<string, unknown> {
  return {
    BusinessName: data.businessName,
    PayerRef: data.payerRef ?? '',
    TaxIdType: data.taxIdType,
    TINorSSN: data.tin.replace(/[^\d]/g, ''),
    IsEIN: data.isEIN,
    ContactName: data.contactName,
    Phone: data.phone.replace(/[^\d]/g, ''),
    Email: data.email,
    Address1: data.address1,
    Address2: data.address2 ?? '',
    City: data.city,
    State: data.state,
    ZipCode: data.zip,
    Country: data.country ?? 'US',
  }
}

export function createBusinessService(client: TaxBanditClient): BusinessService {
  return {
    async create(data: BusinessData) {
      const result = await client.fetch<CreateBusinessResponse>('Business/Create', {
        method: 'POST',
        body: mapDataToPayload(data),
      })
      return result.BusinessId
    },

    async get(businessId: string) {
      const result = await client.fetch<GetBusinessResponse>(
        `Business/Get?BusinessId=${encodeURIComponent(businessId)}`
      )
      return mapResponseToRecord(result)
    },

    async update(businessId: string, data: BusinessData) {
      await client.fetch('Business/Update', {
        method: 'PUT',
        body: { BusinessId: businessId, ...mapDataToPayload(data) },
      })
    },

    async list() {
      const result = await client.fetch<ListBusinessResponse>('Business/List')
      return {
        businesses: (result.Businesses ?? []).map(mapResponseToRecord),
        totalRecords: result.TotalRecords,
      }
    },
  }
}
