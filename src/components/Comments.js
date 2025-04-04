import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// 댓글 목록 가져오기
async function fetchComments(itemId) {
  const { data, error } = await supabase
    .from('comments')
    .select(
      `
      *,
      users (
        email
      )
    `
    )
    .eq('item_id', itemId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export default function Comments({ itemId }) {
  const [content, setContent] = useState('')
  const queryClient = useQueryClient()
  const [userId, setUserId] = useState(null)

  // 현재 로그인한 사용자 정보 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }
    }
    fetchUser()
  }, [])

  // 댓글 목록 조회
  const {
    data: comments,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['comments', itemId],
    queryFn: () => fetchComments(itemId),
  })

  // 댓글 작성 뮤테이션
  const addCommentMutation = useMutation({
    mutationFn: async (newComment) => {
      if (!userId) throw new Error('로그인이 필요합니다.')

      // 댓글 작성
      const { data: commentData, error: commentError } = await supabase
        .from('comments')
        .insert([
          {
            content: newComment,
            item_id: itemId,
            user_id: userId,
          },
        ])
        .select()
        .single()

      if (commentError) throw commentError

      // 게시글 작성자 확인
      const { data: itemData, error: itemError } = await supabase
        .from('items')
        .select('user_id')
        .eq('id', itemId)
        .single()

      if (itemError) throw itemError

      // 자신의 글이 아닌 경우에만 알림 생성
      if (itemData.user_id !== userId) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert([
            {
              user_id: itemData.user_id,
              item_id: itemId,
              comment_id: commentData.id,
            },
          ])

        if (notificationError) throw notificationError
      }
    },
    onSuccess: () => {
      setContent('')
      queryClient.invalidateQueries(['comments', itemId])
      queryClient.invalidateQueries(['item', itemId])
    },
    onError: (error) => {
      alert(error.message)
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!content.trim()) return
    addCommentMutation.mutate(content)
  }

  if (isLoading) {
    return <div className='loading loading-spinner loading-sm'></div>
  }

  if (error) {
    return (
      <div className='text-red-500'>에러가 발생했습니다: {error.message}</div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* 댓글 작성 폼 */}
      <form onSubmit={handleSubmit} className='flex gap-2'>
        <input
          type='text'
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder='댓글을 입력하세요'
          className='input input-bordered flex-1'
          disabled={!userId}
        />
        <button
          type='submit'
          className='btn btn-primary'
          disabled={!userId || !content.trim()}
        >
          작성
        </button>
      </form>

      {/* 댓글 목록 */}
      <div className='space-y-4'>
        {comments.map((comment) => (
          <div
            key={comment.id}
            className='flex gap-4 p-4 bg-zinc-800 rounded-lg'
          >
            <div className='flex-1'>
              <div className='flex items-center gap-2 mb-2'>
                {comment.user_id === userId && (
                  <span className='px-2 py-0.5 text-xs bg-primary text-white rounded-full'>
                    작성자
                  </span>
                )}
                <span className='font-bold'>
                  {comment.users?.email || '사용자'}
                </span>
              </div>
              <span className='text-sm text-gray-400'>
                {new Date(comment.created_at).toLocaleString()}
              </span>
              <p className='text-gray-200'>{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
