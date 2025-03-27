declare namespace App {
  interface Locals {
    user: typeof import('astro:db').User.$inferSelect | null
    session: typeof import('astro:db').Session.$inferSelect | null
  }
}
