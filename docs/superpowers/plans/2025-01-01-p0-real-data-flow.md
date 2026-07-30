# P0: Real Data Flow — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all mock data with real Supabase database connections, creating the first end-to-end data flow from frontend to PostgreSQL.

**Architecture:** Install Supabase SDK, connect to real PostgreSQL, create API route layer (route.ts) that bridges frontend pages to service layer, migrate one core entity (products) end-to-end as proof of life, then batch migrate remaining entities.

**Tech Stack:** Supabase (PostgREST), @supabase/supabase-js, Next.js App Router API Routes, Zod validation

**Prerequisites:** Supabase project must be created and credentials available. GAP_ANALYSIS.md at project root.

## Global Constraints

- No mock data in production code paths — mock data only in unit tests
- Every API route must have Zod input validation
- Every API route must return typed responses
- Frontend pages must show loading/error/empty states before switching to real data
- Don't delete existing mock-based pages until the real-data version is verified
- All files in `src/lib/services/` must be refactored to use Supabase SDK instead of Drizzle ORM
- Commit after each independently testable task

---

### Task 1: Install Supabase SDK and Create Client

**Files:**
- Create: `src/lib/supabase/client.ts`
- Modify: `package.json`
- Test: `src/__tests__/unit/supabase/client.test.ts`

**Interfaces:**
- Consumes: Supabase project URL and anon key from environment variables
- Produces: `createClient()` function that returns a Supabase client

- [ ] **Step 1: Install dependencies**

```bash
cd /workspace/projects && pnpm add @supabase/supabase-js
```

- [ ] **Step 2: Create Supabase client**

```typescript
// src/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 3: Write client test**

```typescript
// src/__tests__/unit/supabase/client.test.ts
import { describe, it, expect } from 'vitest'

describe('Supabase Client', () => {
  it('should have the required environment variables', () => {
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined()
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined()
  })
})
```

- [ ] **Step 4: Run test to verify**

```bash
cd /workspace/projects && npx vitest run src/__tests__/unit/supabase/client.test.ts -v
```

Expected: PASS (or skip if env vars not set yet)

- [ ] **Step 5: Commit**

```bash
git add package.json src/lib/supabase/ src/__tests__/unit/supabase/
git commit -m "feat: add Supabase SDK client"
```

---

### Task 2: Create Product API Route (GET — list with search/filter)

**Files:**
- Create: `src/app/api/[locale]/products/route.ts`
- Create: `src/__tests__/integration/products.test.ts`
- Test: `src/__tests__/integration/products.test.ts`

**Interfaces:**
- Consumes: `supabase` client from Task 1
- Produces: `GET /api/{locale}/products?keyword=&categoryId=&brandId=&minPrice=&maxPrice=&sortBy=&page=&pageSize=`
  - Returns: `{ data: Product[], total: number, page: number, pageSize: number }`

- [ ] **Step 1: Write the failing integration test**

```typescript
// src/__tests__/integration/products.test.ts
import { describe, it, expect, beforeAll } from 'vitest'

const BASE_URL = 'http://localhost:5000'

describe('Products API', () => {
  it('GET /api/en/products should return a paginated product list', async () => {
    const res = await fetch(`${BASE_URL}/api/en/products?page=1&pageSize=10`)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('data')
    expect(body).toHaveProperty('total')
    expect(body).toHaveProperty('page', 1)
    expect(Array.isArray(body.data)).toBe(true)
  })

  it('GET /api/en/products?keyword=test should filter by keyword', async () => {
    const res = await fetch(`${BASE_URL}/api/en/products?keyword=test&page=1&pageSize=10`)
    expect(res.status).toBe(200)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /workspace/projects && npx vitest run src/__tests__/integration/products.test.ts -v
```

Expected: FAIL with 404 or connection refused

- [ ] **Step 3: Create the API route**

```typescript
// src/app/api/[locale]/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase/client'

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  keyword: z.string().optional(),
  categoryId: z.coerce.number().optional(),
  brandId: z.coerce.number().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sortBy: z.enum(['sort_order', 'created_at', 'price', 'sales']).default('sort_order'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams))
  
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { page, pageSize, keyword, categoryId, brandId, minPrice, maxPrice, sortBy, sortOrder } = parsed.data

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .range((page - 1) * pageSize, page * pageSize - 1)
    .order(sortBy, { ascending: sortOrder === 'asc' })

  if (keyword) query = query.ilike('name', `%${keyword}%`)
  if (categoryId) query = query.eq('category_id', categoryId)
  if (brandId) query = query.eq('brand_id', brandId)
  if (minPrice) query = query.gte('price', minPrice)
  if (maxPrice) query = query.lte('price', maxPrice)

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    data,
    total: count ?? 0,
    page,
    pageSize,
  })
}
```

- [ ] **Step 4: Run integration test to verify**

```bash
cd /workspace/projects && npx vitest run src/__tests__/integration/products.test.ts -v
```

Expected: PASS or FAIL with specific Supabase config issues (env vars not set)

- [ ] **Step 5: Commit**

```bash
git add src/app/api/ src/__tests__/integration/
git commit -m "feat: add GET /api/products route with search/filter/pagination"
```

---

### Task 3: Create Product API Route (POST — create product)

**Files:**
- Create: `src/app/api/[locale]/products/route.ts` (extend existing)
- Modify: `src/__tests__/integration/products.test.ts` (add POST tests)

**Interfaces:**
- Consumes: `supabase` client from Task 1
- Produces: `POST /api/{locale}/products` with body `{ sku, name, price, status, quantity, categoryId?, brandId?, description?, images? }`
  - Returns: `{ data: Product }`

- [ ] **Step 1: Add POST test**

```typescript
// Add to src/__tests__/integration/products.test.ts
it('POST /api/en/products should create a product', async () => {
  const res = await fetch(`${BASE_URL}/api/en/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sku: 'TEST-001',
      name: 'Test Product',
      price: '99.99',
      status: true,
      quantity: 100,
    }),
  })
  expect(res.status).toBe(201)
  const body = await res.json()
  expect(body.data).toHaveProperty('id')
  expect(body.data.sku).toBe('TEST-001')
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /workspace/projects && npx vitest run src/__tests__/integration/products.test.ts -v
```

Expected: FAIL with 405 Method Not Allowed

- [ ] **Step 3: Add POST handler to route**

```typescript
// Add to src/app/api/[locale]/products/route.ts
const createSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/),
  status: z.boolean().default(true),
  quantity: z.number().int().min(0).default(0),
  categoryId: z.number().int().optional(),
  brandId: z.number().int().optional(),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = createSchema.safeParse(body)
  
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('products')
    .insert({ ...parsed.data })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
```

- [ ] **Step 4: Run integration test to verify**

```bash
cd /workspace/projects && npx vitest run src/__tests__/integration/products.test.ts -v
```

Expected: PASS (or FAIL with Supabase not configured — acceptable as env config issue)

- [ ] **Step 5: Commit**

```bash
git add src/app/api/ src/__tests__/integration/
git commit -m "feat: add POST /api/products route"
```

---

### Task 4: Create Product API Route (GET by ID, PUT, DELETE)

**Files:**
- Create: `src/app/api/[locale]/products/[id]/route.ts`
- Modify: `src/__tests__/integration/products.test.ts` (add detail/update/delete tests)

**Interfaces:**
- Consumes: `supabase` client from Task 1
- Produces:
  - `GET /api/{locale}/products/{id}` → `{ data: Product }`
  - `PUT /api/{locale}/products/{id}` → `{ data: Product }`
  - `DELETE /api/{locale}/products/{id}` → `{ success: true }`

- [ ] **Step 1: Write tests for detail, update, delete**

```typescript
// Add to src/__tests__/integration/products.test.ts
it('GET /api/en/products/:id should return a product', async () => {
  const res = await fetch(`${BASE_URL}/api/en/products/1`)
  expect(res.status).toBe(200)
  const body = await res.json()
  expect(body.data).toHaveProperty('id', 1)
})

it('PUT /api/en/products/:id should update a product', async () => {
  const res = await fetch(`${BASE_URL}/api/en/products/1`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Updated Name', price: '199.99' }),
  })
  expect(res.status).toBe(200)
  const body = await res.json()
  expect(body.data.name).toBe('Updated Name')
})

it('DELETE /api/en/products/:id should delete a product', async () => {
  const res = await fetch(`${BASE_URL}/api/en/products/999999`, { method: 'DELETE' })
  expect([200, 404]).toContain(res.status)
})
```

- [ ] **Step 2: Create the dynamic route**

```typescript
// src/app/api/[locale]/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase/client'

const updateSchema = z.object({
  sku: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  status: z.boolean().optional(),
  quantity: z.number().int().min(0).optional(),
  categoryId: z.number().int().nullable().optional(),
  brandId: z.number().int().nullable().optional(),
  description: z.string().nullable().optional(),
  images: z.array(z.string()).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', Number(id))
    .single()

  if (error) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }
  return NextResponse.json({ data })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const parsed = updateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('products')
    .update(parsed.data)
    .eq('id', Number(id))
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ data })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', Number(id))

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 3: Run integration tests**

```bash
cd /workspace/projects && npx vitest run src/__tests__/integration/products.test.ts -v
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/app/api/ src/__tests__/integration/
git commit -m "feat: add GET/PUT/DELETE /api/products/:id routes"
```

---

### Task 5: Create Remaining Core API Routes (Categories, Brands, Cart, Orders, Customers, Auth)

**Files:**
- Create: `src/app/api/[locale]/categories/route.ts`
- Create: `src/app/api/[locale]/categories/[id]/route.ts`
- Create: `src/app/api/[locale]/brands/route.ts`
- Create: `src/app/api/[locale]/brands/[id]/route.ts`
- Create: `src/app/api/[locale]/cart/route.ts`
- Create: `src/app/api/[locale]/orders/route.ts`
- Create: `src/app/api/[locale]/orders/[id]/route.ts`
- Create: `src/app/api/[locale]/auth/register/route.ts`
- Create: `src/app/api/[locale]/auth/login/route.ts`
- Create: `src/app/api/[locale]/customers/me/route.ts`
- Create: `src/app/api/[locale]/customers/addresses/route.ts`
- Create: `src/app/api/[locale]/customers/wishlist/route.ts`

**Interfaces:**
- Consumes: `supabase` client from Task 1
- Produces: Full REST API for all core entities, following the same pattern as Tasks 2-4

- [ ] **Step 1: Create Categories API routes**

```typescript
// src/app/api/[locale]/categories/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { data, error } = await supabase
    .from('categories')
    .insert(body)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
```

- [ ] **Step 2: Create Brands API routes**

```typescript
// src/app/api/[locale]/brands/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const keyword = searchParams.get('keyword')

  let query = supabase.from('brands').select('*').order('sort_order', { ascending: true })
  if (keyword) query = query.ilike('name', `%${keyword}%`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { data, error } = await supabase
    .from('brands')
    .insert(body)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
```

- [ ] **Step 3: Create Cart API routes**

```typescript
// src/app/api/[locale]/cart/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  const sessionToken = request.headers.get('x-session')
  if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await supabase.auth.getUser(sessionToken)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('carts')
    .select('*, cart_items(*)')
    .eq('customer_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data ?? { items: [] } })
}

const addItemSchema = z.object({
  productId: z.number().int(),
  skuId: z.number().int(),
  quantity: z.number().int().min(1),
})

export async function POST(request: NextRequest) {
  const sessionToken = request.headers.get('x-session')
  if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await supabase.auth.getUser(sessionToken)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = addItemSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data, error } = await supabase.rpc('add_to_cart', {
    p_customer_id: user.id,
    p_product_id: parsed.data.productId,
    p_sku_id: parsed.data.skuId,
    p_quantity: parsed.data.quantity,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
```

- [ ] **Step 4: Create Auth API routes**

```typescript
// src/app/api/[locale]/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase/client'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { name: parsed.data.name } },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
```

```typescript
// src/app/api/[locale]/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase/client'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 401 })
  return NextResponse.json({ data })
}
```

- [ ] **Step 5: Create Orders API routes**

```typescript
// src/app/api/[locale]/orders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const page = Number(searchParams.get('page') || 1)
  const pageSize = Number(searchParams.get('pageSize') || 20)

  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .range((page - 1) * pageSize, page * pageSize - 1)
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, total: count ?? 0, page, pageSize })
}

const createOrderSchema = z.object({
  customerId: z.number().int(),
  items: z.array(z.object({
    productId: z.number().int(),
    skuId: z.number().int(),
    quantity: z.number().int().min(1),
    price: z.string(),
  })),
  shippingAddressId: z.number().int(),
  shippingMethod: z.string().optional(),
  paymentMethod: z.string().optional(),
  note: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = createOrderSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data, error } = await supabase.rpc('create_order', {
    p_customer_id: parsed.data.customerId,
    p_items: parsed.data.items,
    p_shipping_address_id: parsed.data.shippingAddressId,
    p_shipping_method: parsed.data.shippingMethod ?? 'flat',
    p_payment_method: parsed.data.paymentMethod ?? 'stripe',
    p_note: parsed.data.note ?? null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
```

- [ ] **Step 6: Create Customer API routes (me, addresses, wishlist)**

```typescript
// src/app/api/[locale]/customers/me/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  const sessionToken = request.headers.get('x-session')
  if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user }, error: authError } = await supabase.auth.getUser(sessionToken)
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return NextResponse.json({ data: user })
}
```

- [ ] **Step 7: Write integration tests for all new routes**

```typescript
// src/__tests__/integration/core-api.test.ts
import { describe, it, expect } from 'vitest'

const BASE_URL = 'http://localhost:5000'

describe('Core API Routes', () => {
  it('GET /api/en/categories returns categories', async () => {
    const res = await fetch(`${BASE_URL}/api/en/categories`)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.data)).toBe(true)
  })

  it('GET /api/en/brands returns brands', async () => {
    const res = await fetch(`${BASE_URL}/api/en/brands`)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.data)).toBe(true)
  })

  it('GET /api/en/orders returns orders list', async () => {
    const res = await fetch(`${BASE_URL}/api/en/orders?page=1&pageSize=10`)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('data')
    expect(body).toHaveProperty('total')
  })
})
```

- [ ] **Step 8: Run all integration tests**

```bash
cd /workspace/projects && npx vitest run src/__tests__/integration/ -v
```

Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add src/app/api/ src/__tests__/integration/
git commit -m "feat: add categories, brands, cart, orders, auth, customers API routes"
```

---

### Task 6: Sync Database Schema to Supabase

**Files:**
- Create: `supabase/migrations/20250101_initial_schema.sql`
- Test: Verify via `supabase db diff` or manual table check

**Interfaces:**
- Consumes: Drizzle schema definitions from `src/lib/db/schema/index.ts`
- Produces: SQL migration file that creates all 17 tables in Supabase

- [ ] **Step 1: Generate SQL migration from Drizzle schema**

```sql
-- supabase/migrations/20250101_initial_schema.sql
-- Generated from src/lib/db/schema/index.ts

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  sku VARCHAR(100) NOT NULL UNIQUE,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  cost_price DECIMAL(10,2),
  weight DECIMAL(10,2),
  status BOOLEAN DEFAULT true,
  quantity INTEGER DEFAULT 0,
  sales INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  brand_id INTEGER REFERENCES brands(id),
  category_id INTEGER REFERENCES categories(id),
  images JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  parent_id INTEGER REFERENCES categories(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image VARCHAR(500),
  sort_order INTEGER DEFAULT 0,
  status BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo VARCHAR(500),
  website VARCHAR(500),
  sort_order INTEGER DEFAULT 0,
  status BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ... remaining tables follow same pattern
```

- [ ] **Step 2: Apply migration to Supabase**

```bash
# Option 1: Use Supabase CLI
supabase db push

# Option 2: Run SQL in Supabase Dashboard SQL Editor
# Copy contents of migration file and paste into Supabase SQL Editor
```

- [ ] **Step 3: Verify tables exist**

```bash
supabase db diff --linked
# or run: SELECT table_name FROM information_schema.tables WHERE table_schema='public';
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: add database migration for all 17 tables"
```

---

### Task 7: Create RLS Policies for Data Security

**Files:**
- Read: `.superpowers/skills/instructions/rls.md` (from Supabase skill)
- Create: `supabase/migrations/20250102_rls_policies.sql`
- Test: Verify via Supabase dashboard

**Interfaces:**
- Consumes: Database tables from Task 6
- Produces: Row-level security policies for all tables

- [ ] **Step 1: Read RLS guidelines**

```bash
cat /skills/public/prod/supabase/references/rls.md
```

- [ ] **Step 2: Create RLS policies**

```sql
-- supabase/migrations/20250102_rls_policies.sql

-- Products: public read, admin write
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);
CREATE POLICY "Products are insertable by admin" ON products
  FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Products are updatable by admin" ON products
  FOR UPDATE USING (auth.role() = 'service_role');

-- Orders: customers see own, admin see all
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid()::text = customer_id::text);
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (auth.role() = 'service_role');
CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid()::text = customer_id::text);

-- Carts: customer only
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own cart" ON carts
  FOR ALL USING (auth.uid()::text = customer_id::text);
```

- [ ] **Step 3: Apply RLS policies**

```bash
# Run in Supabase SQL Editor
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: add RLS policies for data security"
```

---

### Task 8: Seed Sample Data

**Files:**
- Create: `supabase/seed.sql`
- Verify: Check via API

- [ ] **Step 1: Create seed data SQL**

```sql
-- supabase/seed.sql
INSERT INTO categories (name, parent_id, sort_order, status) VALUES
  ('Rides', NULL, 1, true),
  ('Spare Parts', NULL, 2, true),
  ('Safety Equipment', NULL, 3, true);

INSERT INTO brands (name, description, status) VALUES
  ('NodeCoda Pro', 'Professional grade equipment', true),
  ('NodeCoda Lite', 'Cost-effective solutions', true);

INSERT INTO products (sku, name, price, status, quantity, category_id, brand_id) VALUES
  ('RIDE-001', 'Classic Carousel', '150000.00', true, 5, 1, 1),
  ('RIDE-002', 'Roller Coaster X200', '500000.00', true, 2, 1, 1),
  ('RIDE-003', 'Bumper Cars', '80000.00', true, 10, 1, 2);
```

- [ ] **Step 2: Apply seed data**

```bash
# Run in Supabase SQL Editor
```

- [ ] **Step 3: Verify via API**

```bash
curl -s http://localhost:5000/api/en/products?page=1&pageSize=10 | head -50
```

Expected: Returns the seeded products

- [ ] **Step 4: Commit**

```bash
git add supabase/seed.sql
git commit -m "feat: add seed data for development"
```

---

### Task 9: Update Frontend Pages to Use Real API

**Files:**
- Modify: `src/app/[locale]/(shop)/products/page.tsx`
- Modify: `src/app/[locale]/(shop)/products/[id]/page.tsx`
- Modify: `src/app/[locale]/(shop)/cart/page.tsx`
- Modify: `src/app/[locale]/(shop)/checkout/page.tsx`
- Modify: `src/app/[locale]/(shop)/account/page.tsx`
- Modify: `src/app/[locale]/(shop)/account/orders/page.tsx`
- Modify: `src/app/[locale]/(shop)/categories/page.tsx`
- Modify: `src/app/[locale]/(shop)/brands/page.tsx`
- Test: Manual verification in browser

**Interfaces:**
- Consumes: API routes from Tasks 2-5
- Produces: Frontend pages that fetch real data from API instead of mock data

- [ ] **Step 1: Create data fetching hook**

```typescript
// src/hooks/use-api.ts
'use client'
import { useState, useEffect } from 'react'

interface UseApiOptions {
  locale?: string
}

export function useApi<T>(endpoint: string, options?: UseApiOptions) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const locale = options?.locale || 'en'

  useEffect(() => {
    fetch(`/api/${locale}${endpoint}`)
      .then(res => res.json())
      .then(json => {
        setData(json.data || json)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [endpoint, locale])

  return { data, loading, error }
}
```

- [ ] **Step 2: Update Products listing page to fetch from API**

```typescript
// Replace mock data imports in src/app/[locale]/(shop)/products/page.tsx
'use client'
import { useApi } from '@/hooks/use-api'
import { useParams } from 'next/navigation'

export default function ProductsPage() {
  const params = useParams()
  const locale = params.locale as string
  const { data, loading, error } = useApi<any[]>('/products?page=1&pageSize=20', { locale })

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent" /></div>
  if (error) return <div className="text-center py-20 text-red-500">Error: {error}</div>
  if (!data?.length) return <div className="text-center py-20 text-gray-500">No products found</div>

  // ... existing render code with real data
}
```

- [ ] **Step 3: Update Product detail page**

```typescript
// Replace mock data in product detail page
'use client'
import { useApi } from '@/hooks/use-api'
import { useParams } from 'next/navigation'

export default function ProductDetailPage() {
  const params = useParams()
  const locale = params.locale as string
  const id = params.id as string
  const { data: product, loading, error } = useApi<any>(`/products/${id}`, { locale })

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorState message={error} />
  if (!product) return <NotFoundState />

  // ... existing render code
}
```

- [ ] **Step 4: Update remaining pages (cart, checkout, account, categories, brands)**

Each page follows the same pattern:
1. Replace mock data import with `useApi` hook
2. Add loading/error/empty states
3. Keep existing render code

- [ ] **Step 5: Delete mock-data.ts**

```bash
rm /workspace/projects/src/lib/mock-data.ts
```

- [ ] **Step 6: Verify end-to-end in browser**

Open browser, verify:
- Products page loads real data from Supabase
- Product detail page works
- Categories and brands pages work
- Cart load/error states display correctly

- [ ] **Step 7: Commit**

```bash
git add src/hooks/ src/app/ src/lib/
git commit -m "feat: switch frontend pages from mock data to real API calls"
```

---

### Task 10: Run Full Test Suite and Verify

**Files:**
- Run: All existing tests
- Run: New integration tests
- Run: TypeScript check
- Run: Build check

- [ ] **Step 1: Run all unit tests**

```bash
cd /workspace/projects && npx vitest run
```

Expected: 69+ tests pass

- [ ] **Step 2: Run integration tests**

```bash
cd /workspace/projects && npx vitest run src/__tests__/integration/ -v
```

Expected: All integration tests pass

- [ ] **Step 3: Run TypeScript check**

```bash
cd /workspace/projects && pnpm ts-check
```

Expected: No errors

- [ ] **Step 4: Run lint**

```bash
cd /workspace/projects && pnpm lint:build --quiet
```

Expected: No errors

- [ ] **Step 5: Run coverage**

```bash
cd /workspace/projects && npx vitest run --coverage
```

Expected: Coverage thresholds met

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "test: verify all tests pass with real data flow"
```