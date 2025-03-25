import { HomeIcon, MessageCircle, User } from 'lucide-react'
import Link from 'next/link'

export default function NavigationBar() {
  return (
    <nav className='fixed bottom-0 left-0 w-full bg-[#2D2D2D] text-white'>
      <div className='flex justify-around items-center h-[60px]'>
        <Link href='/' className='flex flex-col items-center'>
          <HomeIcon />
          <span className='text-xs mt-1'>홈</span>
        </Link>
        <Link href='/chat' className='flex flex-col items-center'>
          <MessageCircle />
          <span className='text-xs mt-1'>채팅</span>
        </Link>
        <Link href='/mypage' className='flex flex-col items-center'>
          <User />
          <span className='text-xs mt-1'>나의 페이지</span>
        </Link>
      </div>
    </nav>
  )
}
