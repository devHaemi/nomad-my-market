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
      image: '/path/to/image.jpg',
    },
  ]

  return (
    <div className='w-full max-w-2xl mx-auto'>
      {items.map((item) => (
        <ItemCard key={item.id} item={items[0]} />
      ))}
    </div>
  )
}

export default ItemList
