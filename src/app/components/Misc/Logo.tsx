'use client'

import React from 'react'
import Image from 'next/image'
import logo from '@/app/public/logo.png'

export const Logo = () => {
  const { src, alt } = { src: logo, alt: 'App icon' }
  const appTitle = 'Customer Portal'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
      <Image width={240} height={240} src={src} alt={alt || 'App icon'} />
      <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{appTitle}</p>
    </div>
  )
}

export default Logo
