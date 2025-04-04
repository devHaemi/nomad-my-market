import { useState, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

const SearchModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const router = useRouter()

  // 디바운스된 검색 함수
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId
      return (term) => {
        clearTimeout(timeoutId)

        timeoutId = setTimeout(async () => {
          if (term.trim()) {
            const { data, error } = await supabase
              .from('items')
              .select('id, title')
              .ilike('title', `%${term}%`)
              .limit(10)

            if (error) {
              console.error('검색 중 오류 발생:', error)
              return
            }

            setSearchResults(data)
          } else {
            setSearchResults([])
          }
        }, 300)
      }
    })(),
    []
  )

  // 검색어가 변경될 때마다 디바운스된 검색 실행
  useEffect(() => {
    debouncedSearch(searchTerm)
  }, [searchTerm, debouncedSearch])

  // 검색 결과 항목 클릭 처리
  const handleItemClick = (itemId) => {
    router.push(`/items/${itemId}`)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 z-50'>
      <div className='fixed top-0 left-0 right-0 bg-zinc-900 p-4'>
        <div className='flex items-center gap-2'>
          <input
            type='text'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder='검색어를 입력하세요'
            className='input input-bordered flex-1'
            autoFocus
          />
          <button onClick={onClose} className='btn btn-ghost btn-circle'>
            <X className='h-6 w-6' />
          </button>
        </div>

        {/* 검색 결과 목록 */}
        {searchResults.length > 0 && (
          <div className='mt-4 space-y-2'>
            {searchResults.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className='p-3 hover:bg-zinc-800 cursor-pointer rounded-lg'
              >
                {item.title}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchModal
