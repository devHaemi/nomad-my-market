import { Plus } from 'lucide-react'

const AddItemButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className='fixed btn btn-primary bottom-24 right-6 w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transition-colors'
    >
      <Plus className='w-8 h-8 text-white' />
    </button>
  )
}

export default AddItemButton
