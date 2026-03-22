'use client'

import { useState, useEffect } from 'react'
import { UserProfile, Role } from '@/types'
import { Button, Chip, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Avatar, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Select, SelectItem, useDisclosure, Skeleton } from '@nextui-org/react'
import { Users, UserPlus, Shield } from 'lucide-react'
import { getRoleBadgeColor } from '@/lib/auth/rbac'
import toast from 'react-hot-toast'

export default function TeamPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'VIEWER' as Role, department: '' })
  const [isCreating, setIsCreating] = useState(false)

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      if (data.success) setUsers(data.data)
    } catch {
      toast.error('Failed to load team')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleCreateUser = async () => {
    setIsCreating(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Team member added')
        fetchUsers()
        onClose()
        setForm({ name: '', email: '', password: '', role: 'VIEWER', department: '' })
      } else {
        toast.error(data.error ?? 'Failed to create user')
      }
    } catch {
      toast.error('Server error')
    } finally {
      setIsCreating(false)
    }
  }

  const handleRoleChange = async (userId: string, role: Role) => {
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Role updated')
        fetchUsers()
      } else {
        toast.error(data.error ?? 'Failed')
      }
    } catch {
      toast.error('Server error')
    }
  }

  const roles: Role[] = ['SUPER_ADMIN', 'FLEET_MANAGER', 'WAREHOUSE_OPS', 'VIEWER']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-[#00d4ff]" />
            <h1 className="text-xl font-bold text-white">Team Management</h1>
          </div>
          <p className="text-sm text-slate-400">Role-based access control administration</p>
        </div>
        <Button
          onPress={onOpen}
          className="bg-[#00d4ff] text-black font-semibold"
          startContent={<UserPlus className="w-4 h-4" />}
        >
          Add Member
        </Button>
      </div>

      {/* RBAC Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {roles.map(role => (
          <div key={role} className="hal-card p-3 flex items-center gap-3">
            <Shield className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div>
              <Chip size="sm" color={getRoleBadgeColor(role) as 'danger' | 'warning' | 'primary' | 'default'} variant="flat" className="font-mono text-[10px] mb-1">
                {role.replace('_', ' ')}
              </Chip>
              <p className="text-xs text-slate-500">
                {users.filter(u => u.role === role).length} member(s)
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Team Table */}
      <div className="hal-card overflow-hidden">
        <Table
          aria-label="Team members"
          removeWrapper
          classNames={{
            th: 'bg-[#060910] text-slate-400 text-xs font-mono border-b border-[#1e2d4a]',
            td: 'border-b border-[#1e2d4a]/50 py-3',
            tr: 'hover:bg-[#060910]/50 transition-colors',
          }}
        >
          <TableHeader>
            <TableColumn>MEMBER</TableColumn>
            <TableColumn>DEPARTMENT</TableColumn>
            <TableColumn>ROLE</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>JOINED</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody
            emptyContent={
              <div className="py-8 text-slate-500 text-sm">
                No team members yet. Add your first member.
              </div>
            }
          >
            {isLoading ? (
              [1, 2, 3].map(i => (
                <TableRow key={i}>
                  {[1, 2, 3, 4, 5, 6].map(j => (
                    <TableCell key={j}><Skeleton className="h-4 rounded bg-[#1e2d4a]" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              users.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar
                        size="sm"
                        name={user.name.split(' ').map(n => n[0]).join('')}
                        classNames={{ base: 'bg-[#00d4ff]/20 text-[#00d4ff]', name: 'text-xs' }}
                      />
                      <div>
                        <p className="text-sm text-white font-medium">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-400">{user.department ?? '—'}</span>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      color={getRoleBadgeColor(user.role) as 'danger' | 'warning' | 'primary' | 'default'}
                      variant="flat"
                      className="font-mono text-[10px]"
                    >
                      {user.role.replace('_', ' ')}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" color={user.isActive ? 'success' : 'default'} variant="dot" className="text-xs">
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-500 font-mono">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Select
                      size="sm"
                      aria-label="Change role"
                      selectedKeys={[user.role]}
                      onSelectionChange={(keys) => handleRoleChange(user.id, Array.from(keys)[0] as Role)}
                      classNames={{ trigger: 'bg-[#060910] border-[#1e2d4a] h-7 min-h-0', mainWrapper: 'w-36' }}
                    >
                      {roles.map(r => <SelectItem key={r}>{r.replace('_', ' ')}</SelectItem>)}
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create User Modal */}
      <Modal isOpen={isOpen} onClose={onClose} className="bg-[#0f1629] border border-[#1e2d4a]">
        <ModalContent>
          <ModalHeader className="text-white">Add Team Member</ModalHeader>
          <ModalBody>
            <div className="space-y-3">
              {[
                { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Smith' },
                { key: 'email', label: 'Email', type: 'email', placeholder: 'john@hal.corp' },
                { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
                { key: 'department', label: 'Department', type: 'text', placeholder: 'Operations' },
              ].map(f => (
                <Input
                  key={f.key}
                  type={f.type}
                  label={f.label}
                  placeholder={f.placeholder}
                  value={(form as Record<string, string>)[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  classNames={{
                    input: 'bg-[#060910] text-white',
                    inputWrapper: 'bg-[#060910] border-[#1e2d4a]',
                    label: 'text-slate-400',
                  }}
                />
              ))}
              <Select
                label="Role"
                selectedKeys={[form.role]}
                onSelectionChange={(keys) => setForm(prev => ({ ...prev, role: Array.from(keys)[0] as Role }))}
                classNames={{ trigger: 'bg-[#060910] border-[#1e2d4a]', label: 'text-slate-400' }}
              >
                {roles.map(r => <SelectItem key={r}>{r.replace('_', ' ')}</SelectItem>)}
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose} className="text-slate-400">Cancel</Button>
            <Button
              color="primary"
              onPress={handleCreateUser}
              isLoading={isCreating}
              className="bg-[#00d4ff] text-black"
              isDisabled={!form.name || !form.email || !form.password}
            >
              Add Member
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
