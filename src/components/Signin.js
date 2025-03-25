'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function SignIn() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleSignIn = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (error) throw error

      if (data?.user) {
        setMessage('로그인 성공!')
        setEmail('')
        setPassword('')
        setTimeout(() => {
          router.push('/') // 메인 페이지 경로로 이동
          router.refresh() // 페이지 새로고침하여 인증 상태 업데이트
        }, 1000) // 1초 후 리다이렉트 (성공 메시지를 보여주기 위해)
      }
    } catch (error) {
      setMessage('이메일 또는 비밀번호가 올바르지 않습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col space-y-4 min-w-[300px]'>
      <h1 className='text-2xl font-bold text-center'>로그인</h1>

      <form
        onSubmit={handleSignIn}
        className='flex flex-col space-y-4 text-black'
      >
        <input
          type='email'
          placeholder='이메일'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='input input-bordered text-white'
          required
        />

        <input
          type='password'
          placeholder='비밀번호'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='input input-bordered text-white'
          required
        />

        <button type='submit' disabled={loading} className='btn btn-primary'>
          {loading ? '처리중...' : '로그인'}
        </button>
      </form>

      {message && <p className='text-center text-sm'>{message}</p>}
    </div>
  )
}
