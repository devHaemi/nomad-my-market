'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useQueryClient } from '@tanstack/react-query'

const AddItemModal = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const queryClient = useQueryClient()

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { data, error } = await supabase.storage
      .from('item-images')
      .upload(filePath, file)

    if (error) throw error

    const {
      data: { publicUrl },
    } = supabase.storage.from('item-images').getPublicUrl(filePath)

    return publicUrl
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 현재 로그인한 사용자 정보 가져오기
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다.')

      // 이미지 업로드
      let imageUrl = null
      if (image) {
        imageUrl = await uploadImage(image)
      }

      // 상품 데이터 저장
      const { data, error } = await supabase
        .from('items')
        .insert([
          {
            title,
            price: parseInt(price),
            description,
            image_url: imageUrl,
            user_id: user.id,
            location: '서울', // 기본값 또는 사용자 위치
            likes: 0,
            comments: 0,
          },
        ])
        .select()

      if (error) throw error

      // 성공적으로 저장되면 모달 닫기
      queryClient.invalidateQueries({ queryKey: ['items'] })
      onClose()

      // 폼 초기화
      setTitle('')
      setPrice('')
      setDescription('')
      setImage(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
      <div className='bg-zinc-800 rounded-lg w-full max-w-md p-6 relative'>
        <button
          onClick={onClose}
          className='absolute right-4 top-4 text-gray-400 hover:text-white'
        >
          <X className='w-6 h-6' />
        </button>

        <h2 className='text-xl font-bold mb-6'>물건 등록하기</h2>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-2'>제목</label>
            <input
              type='text'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className='input w-full p-2 bg-zinc-700 rounded-md'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>가격</label>
            <input
              type='number'
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className='input w-full p-2 bg-zinc-700 rounded-md'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='input w-full p-2 bg-zinc-700 rounded-md h-32'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>사진</label>
            <input
              type='file'
              onChange={(e) => setImage(e.target.files[0])}
              className='input w-full p-2 bg-zinc-700 rounded-md'
              accept='image/*'
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className='btn btn-primary w-full text-white py-2 rounded-md transition-colors'
          >
            {loading ? '등록 중...' : '등록하기'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddItemModal
