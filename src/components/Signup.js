'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function SignUp() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleSignUp = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)

      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      })

      if (error) {
        throw error
      }

      if (data?.user) {
        setMessage('가입 확인 이메일을 확인해주세요.')
        setEmail('')
        setPassword('')
      }
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col space-y-4 min-w-[300px]'>
      <h1 className='text-2xl font-bold text-center'>회원가입</h1>

      <form
        onSubmit={handleSignUp}
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
          {loading ? '처리중...' : '회원가입'}
        </button>
      </form>

      {message && <p className='text-center text-sm'>{message}</p>}
    </div>
  )
}
