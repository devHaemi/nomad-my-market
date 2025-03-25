import ItemCard from './ItemCard'

const ItemList = () => {
  const items = [
    {
      id: 1,
      title: '아이폰15 128GB 팝니다.',
      location: '합정동',
      timeAgo: '47분 전',
      price: 667917,
      comments: 42,
      likes: 39,
      image: 'item1.jpg',
    },
    {
      id: 2,
      title: '갤럭시 S24 울트라 미개봉',
      location: '서교동',
      timeAgo: '2시간 전',
      price: 1450000,
      comments: 15,
      likes: 27,
      image: 'item1.jpg',
    },
    {
      id: 3,
      title: '맥북 프로 M3 Max 팔아요',
      location: '상수동',
      timeAgo: '5분 전',
      price: 2890000,
      comments: 56,
      likes: 84,
      image: 'item1.jpg',
    },
    {
      id: 4,
      title: '에어팟 프로 2세대 급처',
      location: '망원동',
      timeAgo: '1일 전',
      price: 195000,
      comments: 23,
      likes: 45,
      image: 'item1.jpg',
    },
  ]

  return (
    <div className='w-full max-w-2xl mx-auto'>
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  )
}

export default ItemList
