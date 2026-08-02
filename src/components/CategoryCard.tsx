'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import { Shield, Cog, FerrisWheel, Rocket, Ship, Sword } from 'lucide-react'
import type { CategoryTreeNode } from '@/lib/api'

interface CategoryCardProps {
  category: CategoryTreeNode
}

const iconMap = [Shield, Cog, FerrisWheel, Rocket, Ship, Sword]

const colors = [
  'from-blue-500 to-blue-600',
  'from-orange-500 to-orange-600',
  'from-green-500 to-green-600',
  'from-purple-500 to-purple-600',
  'from-pink-500 to-pink-600',
  'from-cyan-500 to-cyan-600',
]

export function CategoryCard({ category }: CategoryCardProps) {
  const locale = useLocale()
  const Icon = iconMap[Number(category.id) % iconMap.length]
  const color = colors[Number(category.id) % colors.length]
  const childCount = category.children?.length ?? 0

  return (
    <Link
      href={`/${locale}/categories/${category.id}`}
      className="group flex flex-col items-center rounded-lg border border-gray-200 bg-white p-6 text-center transition-all hover:shadow-lg hover:-translate-y-1"
    >
      <div className={`mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${color} text-white shadow-md transition-transform duration-300 group-hover:scale-110`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-1 text-sm font-semibold text-gray-900">{category.name}</h3>
      {childCount > 0 && (
        <p className="text-xs text-gray-500">{childCount} subcategories</p>
      )}
    </Link>
  )
}