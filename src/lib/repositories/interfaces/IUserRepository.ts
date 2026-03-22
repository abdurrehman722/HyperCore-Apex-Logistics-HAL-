import { UserProfile, Role } from '@/types'

export interface IUserRepository {
  getAllUsers(): Promise<UserProfile[]>
  getUserById(id: string): Promise<UserProfile | null>
  getUserByEmail(email: string): Promise<(UserProfile & { password: string }) | null>
  createUser(user: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> & { password: string }): Promise<UserProfile>
  updateUser(id: string, updates: Partial<UserProfile>): Promise<UserProfile>
  updateUserRole(id: string, role: Role): Promise<void>
  deleteUser(id: string): Promise<void>
}
