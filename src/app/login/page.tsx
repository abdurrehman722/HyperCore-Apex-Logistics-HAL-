'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Input, Button, Card, CardBody } from '@nextui-org/react'
import { Eye, EyeOff, Zap, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Invalid credentials. Please try again.')
      } else {
        toast.success('Access granted. Welcome to HAL.')
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      toast.error('Authentication service unavailable.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(#00d4ff 1px, transparent 1px), linear-gradient(90deg, #00d4ff 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00d4ff]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#7c3aed]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 mb-4">
            <Zap className="w-8 h-8 text-[#00d4ff]" />
          </div>
          <h1 className="text-2xl font-bold text-white">HyperCore Apex Logistics</h1>
          <p className="text-slate-400 text-sm mt-1">Enterprise Command Center</p>
        </div>

        {/* Login Card */}
        <Card className="bg-[#0f1629] border border-[#1e2d4a] shadow-2xl">
          <CardBody className="p-8">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-4 h-4 text-[#00d4ff]" />
              <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Secure Authentication</span>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                label="Email Address"
                placeholder="operator@hal.corp"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                size="md"
                classNames={{
                  input: 'bg-[#060910] text-white',
                  inputWrapper: 'bg-[#060910] border-[#1e2d4a] hover:border-[#00d4ff]/50 focus-within:border-[#00d4ff]',
                  label: 'text-slate-400',
                }}
              />

              <Input
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                size="md"
                endContent={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-[#00d4ff] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                classNames={{
                  input: 'bg-[#060910] text-white',
                  inputWrapper: 'bg-[#060910] border-[#1e2d4a] hover:border-[#00d4ff]/50 focus-within:border-[#00d4ff]',
                  label: 'text-slate-400',
                }}
              />

              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                className="bg-[#00d4ff] text-black font-semibold mt-2 hover:bg-[#00d4ff]/90"
                size="lg"
              >
                {isLoading ? 'Authenticating...' : 'Access System'}
              </Button>
            </form>

            <div className="mt-6 p-3 rounded-lg bg-[#060910] border border-[#1e2d4a]">
              <p className="text-xs text-slate-500 font-mono text-center">
                Demo: admin@hal.corp / admin123
              </p>
            </div>
          </CardBody>
        </Card>

        <p className="text-center text-xs text-slate-600 mt-6">
          All access attempts are logged and audited • HAL v1.0
        </p>
      </div>
    </div>
  )
}
