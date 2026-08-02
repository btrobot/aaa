'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { Mail, Ruler, Weight, DollarSign, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InquiryModal } from '@/components/InquiryModal'
import type { Product } from '@/lib/api'

interface ProductCardProps {
  product: Product
  viewMode?: 'grid' | 'list'
}

export function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const locale = useLocale()
  const t = useTranslations('products')
  const [inquiryOpen, setInquiryOpen] = useState(false)

  const handleOpenInquiry = useCallback(() => {
    setInquiryOpen(true)
  }, [])

  const productImage = product.images?.[0]?.image || '/placeholder.svg'
  const productName = product.description?.name || product.sku
  const brandName = product.brand?.name

  if (viewMode === 'list') {
    return (
      <>
        <div className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md">
          <Link href={`/${locale}/products/${product.id}`} className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
            <Image
              src={productImage}
              alt={productName}
              fill
              className="object-cover"
              sizes="96px"
            />
          </Link>
          <div className="flex flex-1 flex-col justify-between">
            <div>
              <Link href={`/${locale}/products/${product.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                {productName}
              </Link>
              {brandName && (
                <p className="mt-0.5 text-xs text-gray-500">{brandName}</p>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-blue-600">${product.price}</span>
              <Button size="sm" onClick={handleOpenInquiry} className="bg-orange-500 hover:bg-orange-600">
                <Mail className="mr-1 h-3.5 w-3.5" />
                {t('sendInquiry')}
              </Button>
            </div>
          </div>
        </div>
        <InquiryModal open={inquiryOpen} onOpenChange={setInquiryOpen} productId={product.id} productName={product.description?.name ?? ''} productSku={product.sku} />
      </>
    )
  }

  return (
    <>
      <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:shadow-lg hover:-translate-y-1">
        <Link href={`/${locale}/products/${product.id}`} className="relative block aspect-square overflow-hidden bg-gray-100">
          <Image
            src={productImage}
            alt={productName}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          {/* Hover overlay with specs */}
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="space-y-1.5 text-sm text-white">
              {product.sku && (
                <div className="flex items-center gap-1.5">
                  <ShoppingBag className="h-3.5 w-3.5 text-blue-300" />
                  <span className="text-xs">SKU: {product.sku}</span>
                </div>
              )}
              {brandName && (
                <div className="flex items-center gap-1.5">
                  <Ruler className="h-3.5 w-3.5 text-blue-300" />
                  <span className="text-xs">{brandName}</span>
                </div>
              )}
              {product.weight > 0 && (
                <div className="flex items-center gap-1.5">
                  <Weight className="h-3.5 w-3.5 text-blue-300" />
                  <span className="text-xs">{product.weight} kg</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-blue-300" />
                <span className="text-xs font-semibold">${product.price}</span>
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleOpenInquiry}
              className="mt-3 w-full bg-orange-500 text-xs hover:bg-orange-600"
            >
              <Mail className="mr-1 h-3.5 w-3.5" />
              {t('sendInquiry')}
            </Button>
          </div>
        </Link>
        <div className="p-3">
          <Link href={`/${locale}/products/${product.id}`} className="block text-sm font-medium text-gray-900 hover:text-blue-600">
            {productName}
          </Link>
          {brandName && (
            <p className="mt-0.5 text-xs text-gray-500">{brandName}</p>
          )}
          <p className="mt-1.5 text-sm font-semibold text-blue-600">${product.price}</p>
        </div>
      </div>
      <InquiryModal open={inquiryOpen} onOpenChange={setInquiryOpen} productId={product.id} productName={product.description?.name ?? ''} productSku={product.sku} />
    </>
  )
}