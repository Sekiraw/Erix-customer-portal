'use client'

import React from 'react'
import Image from 'next/image'

import logo from '@/app/public/logo.png'

export const Icon = () => {
  const { src, alt } = { src: logo, alt: 'App icon' }

  return <Image width={200} className="rounded-md" height={200} src={src} alt={alt} />
}

export default Icon
