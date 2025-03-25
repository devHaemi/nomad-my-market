const ItemCard = ({ item }) => {
  return (
    <div className='flex gap-4 border-b border-gray-800'>
      <div className='w-20 h-20 rounded-md overflow-hidden'>
        <img
          src={item.image}
          alt={item.title}
          className='w-full h-full object-cover'
        />
      </div>

      <div className='flex-1'>
        <h3 className='text-white text-lg font-medium'>{item.title}</h3>
        <div className='text-gray-400 text-sm'>
          {item.location} . {item.timeAgo}
        </div>
        <div className='text-white text-lg font-bold mt-1'>
          {item.price.toLocalString()}원
        </div>
        <div className='text-gray-400 text-sm mt-1'>
          댓글 {item.comments} . 관심 {item.likes}
        </div>
      </div>
    </div>
  )
}

export default ItemCard
