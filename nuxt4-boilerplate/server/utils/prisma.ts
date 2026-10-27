import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '~~/app/generated/prisma/client'

const prismaClientSingleton = () =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  })

declare global {
  var __prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.__prisma ?? prismaClientSingleton()
if (process.env.NODE_ENV !== 'production') globalThis.__prisma = prisma
