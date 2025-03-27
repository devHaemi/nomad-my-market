'use client'

import { useState } from 'react'

import Header from '@/components/Header'
import ItemList from '@/components/ItemList'
import NavigationBar from '@/components/NavigationBar'
import AddItemButton from '@/components/AddItemButton'
import AddItemModal from '@/components/AddItemModal'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const client = new QueryClient({
    defaultOptions: {},
  })

  return (
    <QueryClientProvider client={client}>
      <Header />
      <ItemList />
      <AddItemButton onClick={() => setIsModalOpen(true)} />
      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <NavigationBar />
    </QueryClientProvider>
  )
}
