import { defineDb } from 'astro:db'
import {
  Asset,
  AssetCategory,
  Category,
  Condition,
  Location,
  Ownership,
  Status,
} from './tables/assets'
import { Country } from './tables/countries'
import { User } from './tables/users'

// https://astro.build/db/config
export default defineDb({
  tables: {
    Country,
    User,
    Category,
    Condition,
    Location,
    Ownership,
    Status,
    Asset,
    AssetCategory,
  },
})
