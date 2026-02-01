'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MockInterviewPage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/interview')
  }, [router])

  return null
}
