import { pgEnum } from 'drizzle-orm/pg-core'

export const globalRole = pgEnum('global_role', ['super_admin'])
export const regionLevel = pgEnum('region_level', ['province', 'regency', 'district', 'village'])
export const villageRole = pgEnum('village_role', ['village_admin', 'village_assistant'])
export const businessRole = pgEnum('business_role', ['owner', 'assistant'])
export const recordStatus = pgEnum('record_status', ['draft', 'published', 'archived'])
export const verificationStatus = pgEnum('verification_status', ['pending', 'verified', 'rejected'])
export const invitationTarget = pgEnum('invitation_target', ['village', 'business'])
export const invitationStatus = pgEnum('invitation_status', [
  'pending',
  'accepted',
  'revoked',
  'expired',
])
export const analyticsEventType = pgEnum('analytics_event_type', [
  'product_view',
  'business_view',
  'village_view',
  'whatsapp_click',
  'marketplace_click',
])
export const locale = pgEnum('locale', ['id', 'en'])
