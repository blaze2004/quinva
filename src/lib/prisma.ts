import { serverEnv } from "@/config/env/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

const globalForPrisma = global as unknown as { prisma: typeof prisma };

if (serverEnv.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
