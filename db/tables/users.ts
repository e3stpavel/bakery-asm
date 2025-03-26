import { column, defineTable } from 'astro:db'

export const User = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    firstName: column.text(),
    lastName: column.text(),
    email: column.text({ unique: true }),
  },
})
