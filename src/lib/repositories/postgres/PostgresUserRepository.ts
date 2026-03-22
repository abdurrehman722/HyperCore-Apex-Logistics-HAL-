import { prisma } from '@/lib/prisma/client'
import { IUserRepository } from '../interfaces/IUserRepository'
import { UserProfile, Role } from '@/types'
import bcrypt from 'bcryptjs'

function toUserProfile(user: {
  id: string
  name: string
  email: string
  role: string
  department: string | null
  avatarUrl: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}): UserProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
    department: user.department ?? undefined,
    avatarUrl: user.avatarUrl ?? undefined,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}

export class PostgresUserRepository implements IUserRepository {
  async getAllUsers(): Promise<UserProfile[]> {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
    return users.map(toUserProfile)
  }

  async getUserById(id: string): Promise<UserProfile | null> {
    const user = await prisma.user.findUnique({ where: { id } })
    return user ? toUserProfile(user) : null
  }

  async getUserByEmail(email: string): Promise<(UserProfile & { password: string }) | null> {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return null
    return { ...toUserProfile(user), password: user.password }
  }

  async createUser(
    input: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> & { password: string }
  ): Promise<UserProfile> {
    const hashed = await bcrypt.hash(input.password, 12)
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashed,
        role: input.role,
        department: input.department,
        avatarUrl: input.avatarUrl,
        isActive: input.isActive,
      },
    })
    return toUserProfile(user)
  }

  async updateUser(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: updates.name,
        email: updates.email,
        role: updates.role,
        department: updates.department,
        avatarUrl: updates.avatarUrl,
        isActive: updates.isActive,
      },
    })
    return toUserProfile(user)
  }

  async updateUserRole(id: string, role: Role): Promise<void> {
    await prisma.user.update({ where: { id }, data: { role } })
  }

  async deleteUser(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } })
  }
}

export const userRepository: IUserRepository = new PostgresUserRepository()
