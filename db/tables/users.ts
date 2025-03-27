import { column, defineTable } from 'astro:db'

export const User = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    firstName: column.text(),
    lastName: column.text(),
    email: column.text({ unique: true }),
    passwordHash: column.text(),
  },
})

export const Session = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.number({ references: () => User.columns.id }),
    expiresAt: column.date(),
  },
})
