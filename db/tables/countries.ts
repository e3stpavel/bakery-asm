import { column, defineTable } from 'astro:db'

export const Country = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text({ unique: true }),
  },
})
