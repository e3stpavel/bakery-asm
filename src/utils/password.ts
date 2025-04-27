import { hash, verify } from '@node-rs/argon2'

const hashOptions = {
  memoryCost: 19 * 1024,
  outputLen: 32,
  parallelism: 1,
  timeCost: 2,
}

export async function createPasswordHash(password: string) {
  return await hash(password, hashOptions)
}

export async function verifyPasswordHash(passwordHash: string, password: string) {
  return await verify(passwordHash, password, hashOptions)
}
