import { relations } from 'drizzle-orm'
import { users } from './auth'
import { businessMembers, businesses } from './businesses'
import {
  categories,
  categoryTranslations,
  productImages,
  products,
  productTranslations,
} from './catalog'
import { regions } from './regions'
import { villageMembers, villages } from './villages'

export const usersRelations = relations(users, ({ many }) => ({
  villageMemberships: many(villageMembers),
  businessMemberships: many(businessMembers),
}))

export const regionsRelations = relations(regions, ({ one, many }) => ({
  parent: one(regions, {
    fields: [regions.parentCode],
    references: [regions.code],
    relationName: 'region_parent',
  }),
  children: many(regions, { relationName: 'region_parent' }),
}))

export const villagesRelations = relations(villages, ({ one, many }) => ({
  region: one(regions, { fields: [villages.regionCode], references: [regions.code] }),
  members: many(villageMembers),
  businesses: many(businesses),
}))

export const villageMembersRelations = relations(villageMembers, ({ one }) => ({
  village: one(villages, { fields: [villageMembers.villageId], references: [villages.id] }),
  user: one(users, { fields: [villageMembers.userId], references: [users.id] }),
}))

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  village: one(villages, { fields: [businesses.villageId], references: [villages.id] }),
  members: many(businessMembers),
  products: many(products),
}))

export const businessMembersRelations = relations(businessMembers, ({ one }) => ({
  business: one(businesses, { fields: [businessMembers.businessId], references: [businesses.id] }),
  user: one(users, { fields: [businessMembers.userId], references: [users.id] }),
}))

export const categoriesRelations = relations(categories, ({ many }) => ({
  translations: many(categoryTranslations),
  products: many(products),
}))

export const categoryTranslationsRelations = relations(categoryTranslations, ({ one }) => ({
  category: one(categories, {
    fields: [categoryTranslations.categoryId],
    references: [categories.id],
  }),
}))

export const productsRelations = relations(products, ({ one, many }) => ({
  business: one(businesses, { fields: [products.businessId], references: [businesses.id] }),
  village: one(villages, { fields: [products.villageId], references: [villages.id] }),
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  images: many(productImages),
  translations: many(productTranslations),
}))

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}))

export const productTranslationsRelations = relations(productTranslations, ({ one }) => ({
  product: one(products, { fields: [productTranslations.productId], references: [products.id] }),
}))
