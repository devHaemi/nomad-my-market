import Header from '@/components/Header'
import ItemList from '@/components/ItemList'
import NavigationBar from '@/components/NavigationBar'

export default function Home() {
  return (
    <div>
      <Header />
      {/* 기존 컨텐츠 */}
      <ItemList />
      <NavigationBar />
    </div>
  )
}
