'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import Footer from './Footer'
//import { Search } from '@/components/syntax/Search'

function Header() {
  let [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <Navbar showSearch={false}></Navbar>
    )
}

export function Layout({ children }: { children: React.ReactNode }) {
  let pathname = usePathname()

  return (
    <div className="flex w-full flex-col">
      <Header />
      {children}
      <Footer></Footer>
    </div>
  )
}
