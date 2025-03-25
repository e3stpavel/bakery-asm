import { column, defineTable } from 'astro:db'
import { Country } from './countries'
import { User } from './users'

export const Category = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text({ unique: true }),
  },
})

export const Status = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text({ unique: true }),
  },
})

export const Location = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    countryId: column.number({ references: () => Country.columns.id }),
  },
})

export const Ownership = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text({ unique: true }),
  },
})

export const Condition = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text({ unique: true }),
  },
})

export const Asset = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    description: column.text({ multiline: true, optional: true }),
    statusId: column.number({ references: () => Status.columns.id }),
    locationId: column.number({ references: () => Location.columns.id }),
    createdById: column.number({ references: () => User.columns.id }),
    createdAt: column.date(),
    updatedById: column.number({ references: () => User.columns.id }),
    updatedAt: column.date({}),
    purchasedAt: column.date(),
    purchasePrice: column.number(),
    // vendor
    // warranty
    ownershipId: column.number({ references: () => Ownership.columns.id }),
    conditionId: column.number({ references: () => Condition.columns.id }),
    expectedLifespanInMonths: column.number({ optional: true }),
    serialNumber: column.text({ unique: true }),
    imageUrl: column.text({ optional: true }),
    deletedAt: column.date({ optional: true }),
  },
})

export const AssetCategory = defineTable({
  columns: {
    categoryId: column.number({ references: () => Category.columns.id }),
    assetId: column.number({ references: () => Asset.columns.id }),
  },
})
