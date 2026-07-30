'use client';

import { useEffect } from 'react';

// ============================================================
// JSON-LD 结构化数据组件
// ============================================================

/**
 * 组织架构数据 (Organization)
 */
export function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'NodeCoda',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://nodecoda.com',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://nodecoda.com'}/logo.png`,
    description: 'NodeCoda - 游乐设备制造与跨境电商平台. Amusement ride manufacturing and cross-border e-commerce platform.',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+86-400-888-9999',
      contactType: 'customer service',
      availableLanguage: ['Chinese', 'English'],
    },
    sameAs: [
      'https://www.facebook.com/nodecoda',
      'https://www.linkedin.com/company/nodecoda',
    ],
  };

  return <JsonLdScript data={jsonLd} />;
}

/**
 * 面包屑导航数据 (BreadcrumbList)
 */
export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <JsonLdScript data={jsonLd} />;
}

/**
 * 产品结构化数据 (Product)
 */
export function ProductJsonLd({
  name,
  description,
  sku,
  image,
  brand,
  price,
  currency = 'CNY',
  availability = 'https://schema.org/InStock',
}: {
  name: string;
  description: string;
  sku: string;
  image?: string;
  brand?: string;
  price?: string;
  currency?: string;
  availability?: string;
}) {
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    sku,
    image: image || undefined,
    brand: brand ? { '@type': 'Brand', name: brand } : undefined,
  };

  if (price) {
    jsonLd.offers = {
      '@type': 'Offer',
      price,
      priceCurrency: currency,
      availability,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };
  }

  return <JsonLdScript data={jsonLd} />;
}

/**
 * 文章结构化数据 (Article)
 */
export function ArticleJsonLd({
  title,
  description,
  datePublished,
  author = 'NodeCoda',
}: {
  title: string;
  description: string;
  datePublished: string;
  author?: string;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    author: { '@type': 'Person', name: author },
    datePublished,
    publisher: {
      '@type': 'Organization',
      name: 'NodeCoda',
    },
  };

  return <JsonLdScript data={jsonLd} />;
}

// ============================================================
// 通用 JSON-LD 注入脚本组件
// ============================================================

function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  useEffect(() => {
    // 避免重复注入，加一个简单去重 key
    const key = data['@type'] as string + '_' + (data.name as string || data.headline as string || '');
    const id = `json-ld-${key.replace(/[^a-zA-Z0-9]/g, '_')}`;
    if (document.getElementById(id)) return;

    const script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data, null, 2);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, []);

  return null;
}