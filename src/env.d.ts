declare namespace App {
  interface Locals {
    user: import('~/utils/domain/user').PartialUser | null
    session: import('~/utils/domain/session').Session | null
  }
}
