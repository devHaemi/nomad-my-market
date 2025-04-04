'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { ArrowLeft, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { use, useEffect, useState } from 'react'
import Comments from '@/components/Comments'

async function fetchItem(id) {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// 좋아요 상태 확인 함수
async function checkLikeStatus(itemId, userId) {
  try {
    const { data, error } = await supabase
      .from('likes')
      .select('*')
      .eq('item_id', itemId)
      .eq('user_id', userId)

    // PGRST116은 결과가 없는 경우이므로 false 반환
    if (error && error.code === 'PGRST116') {
      return false
    }

    // 다른 에러가 있는 경우 throw
    if (error) throw error

    if (data.length > 0) {
      return true
    } else {
      return false
    }
  } catch (error) {
    console.error('좋아요 상태 확인 중 에러:', error)
    return false
  }
}

async function incrementViews(id) {
  try {
    // 현재 아이템의 조회수를 가져옴
    const { data: currentItem, error: fetchError } = await supabase
      .from('items')
      .select('views')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    // 조회수 증가
    const { error: updateError } = await supabase
      .from('items')
      .update({ views: (currentItem.views || 0) + 1 })
      .eq('id', id)

    if (updateError) throw updateError
  } catch (error) {
    console.error('조회수 증가 중 에러:', error)
  }
}

export default function ItemDetail({ params }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()
  const [userId, setUserId] = useState(null)
  const [isLiked, setIsLiked] = useState(false)

  // 현재 로그인한 사용자 정보 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        // 좋아요 상태 확인
        const liked = await checkLikeStatus(resolvedParams.id, user.id)
        setIsLiked(liked)
      }
    }
    fetchUser()

    // 조회수 증가 후 쿼리 무효화
    const updateViewCount = async () => {
      await incrementViews(resolvedParams.id)
      // 쿼리 무효화하여 데이터 새로고침
      queryClient.invalidateQueries(['item', resolvedParams.id])
    }

    updateViewCount()
  }, [resolvedParams.id, queryClient])

  const handleStartChat = async () => {
    if (!userId) {
      alert('로그인이 필요합니다.')
      return
    }

    try {
      // 이미 존재하는 채팅방 확인
      const { data: existingRoom, error: findError } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('item_id', resolvedParams.id)
        .eq('buyer_id', userId)
        .single()

      if (findError && findError.code !== 'PGRST116') {
        throw findError
      }

      if (existingRoom) {
        router.push(`/chat/${existingRoom.id}`)
        return
      }

      // 새 채팅방 생성
      const { data: newRoom, error: createError } = await supabase
        .from('chat_rooms')
        .insert([
          {
            item_id: resolvedParams.id,
            seller_id: item.user_id,
            buyer_id: userId,
          },
        ])
        .select()
        .single()

      if (createError) throw createError

      router.push(`/chat/${newRoom.id}`)
    } catch (error) {
      console.error('채팅방 생성 중 오류:', error)
      alert('채팅방을 생성할 수 없습니다.')
    }
  }

  const {
    data: item,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['item', resolvedParams.id],
    queryFn: () => fetchItem(resolvedParams.id),
  })

  // 좋아요 토글 뮤테이션
  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('로그인이 필요합니다.')

      if (isLiked) {
        // 좋아요 취소
        await supabase
          .from('likes')
          .delete()
          .eq('item_id', resolvedParams.id)
          .eq('user_id', userId)

        await supabase
          .from('items')
          .update({ likes: item.likes - 1 })
          .eq('id', resolvedParams.id)
      } else {
        // 좋아요 추가
        await supabase
          .from('likes')
          .insert([{ item_id: resolvedParams.id, user_id: userId }])

        await supabase
          .from('items')
          .update({ likes: item.likes + 1 })
          .eq('id', resolvedParams.id)
      }
    },
    onSuccess: () => {
      setIsLiked(!isLiked)
      queryClient.invalidateQueries(['item', resolvedParams.id])
    },
    onError: (error) => {
      alert(error.message)
    },
  })

  if (isLoading) {
    return (
      <div className='w-full flex justify-center items-center p-8'>
        <div className='loading loading-spinner loading-lg'></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='w-full p-4 text-center text-red-500'>
        에러가 발생했습니다: {error.message}
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-zinc-900 text-white'>
      {/* 헤더 */}
      <div className='sticky top-0 z-50 bg-zinc-900 border-b border-zinc-800 p-4'>
        <button
          onClick={() => router.back()}
          className='p-2 hover:bg-zinc-800 rounded-full'
        >
          <ArrowLeft className='w-6 h-6' />
        </button>
      </div>

      {/* 이미지 */}
      <div className='w-full aspect-square'>
        <img
          src={item.image_url}
          alt={item.title}
          className='w-full h-full object-cover'
        />
      </div>

      {/* 상품 정보 */}
      <div className='p-4 space-y-4'>
        <h1 className='text-2xl font-bold'>{item.title}</h1>
        <div className='text-gray-400'>
          {item.location} · {item.timeAgo}
        </div>
        <p className='text-gray-300 whitespace-pre-wrap'>{item.description}</p>
        <div className='text-2xl font-bold'>
          {item.price.toLocaleString()}원
        </div>
        <div className='text-gray-400'>
          조회 {item.views || 0} · 관심 {item.likes} · 댓글 {item.comments}
        </div>
      </div>

      {/* 댓글 섹션 */}
      <div className='p-4 pb-20'>
        <h2 className='text-xl font-bold mb-4'>댓글</h2>
        <Comments itemId={resolvedParams.id} />
      </div>

      {/* 하단 고정 버튼 */}
      <div className='fixed bottom-0 left-0 right-0 p-4 bg-zinc-900 border-t border-zinc-800'>
        <div className='flex gap-2'>
          <button
            onClick={() => toggleLikeMutation.mutate()}
            className={`btn btn-circle btn-outline ${
              isLiked ? 'text-red-500 hover:text-red-600' : ''
            }`}
            disabled={!userId}
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => handleStartChat(userId, resolvedParams, item)}
            className='btn btn-primary flex-1'
          >
            채팅하기
          </button>
        </div>
      </div>
    </div>
  )
}
