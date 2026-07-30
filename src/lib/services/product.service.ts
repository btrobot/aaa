import { eq, like, and, desc, asc, sql, count } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/db';
import {
  products,
  productDescriptions,
  productCategories,
  productImages,
  productSkus,
  brands,
  categories,
} from '@/lib/db/schema';

// ============================================================
// 类型定义
// ============================================================

export const CreateProductSchema = z.object({
  sku: z.string().min(1, 'SKU 不能为空'),
  brandId: z.number().int().positive().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, '价格格式不正确'),
  costPrice: z.string().optional(),
  weight: z.number().optional(),
  status: z.boolean().optional().default(true),
  quantity: z.number().int().optional().default(0),
  sortOrder: z.number().int().optional().default(0),
  descriptions: z.record(z.string(), z.object({
    name: z.string().min(1, '商品名称不能为空'),
    description: z.string().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    metaKeywords: z.string().optional(),
  })),
  categoryIds: z.array(z.number().int().positive()).optional(),
  images: z.array(z.string()).optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const ProductSearchSchema = z.object({
  keyword: z.string().optional(),
  categoryId: z.number().int().positive().optional(),
  brandId: z.number().int().positive().optional(),
  locale: z.string().default('zh_cn'),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(20),
  sortBy: z.enum(['price', 'sales', 'created_at', 'sort_order']).default('sort_order'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  status: z.boolean().optional(),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type ProductSearchParams = z.infer<typeof ProductSearchSchema>;

// ============================================================
// 商品服务
// ============================================================

export const ProductService = {
  /**
   * 创建商品
   */
  async create(input: CreateProductInput) {
    const validated = CreateProductSchema.parse(input);

    // 创建商品主记录
    const [product] = await db.insert(products).values({
      sku: validated.sku,
      brandId: validated.brandId || null,
      price: validated.price,
      costPrice: validated.costPrice || null,
      weight: validated.weight || 0,
      status: validated.status ?? true,
      quantity: validated.quantity ?? 0,
      sortOrder: validated.sortOrder ?? 0,
    }).returning({ id: products.id });

    // 创建多语言描述
    if (validated.descriptions) {
      for (const [locale, desc] of Object.entries(validated.descriptions)) {
        await db.insert(productDescriptions).values({
          productId: product.id,
          locale,
          name: desc.name,
          description: desc.description || null,
          metaTitle: desc.metaTitle || null,
          metaDescription: desc.metaDescription || null,
          metaKeywords: desc.metaKeywords || null,
        });
      }
    }

    // 关联分类
    if (validated.categoryIds?.length) {
      for (const categoryId of validated.categoryIds) {
        await db.insert(productCategories).values({
          productId: product.id,
          categoryId,
        });
      }
    }

    // 关联图片
    if (validated.images?.length) {
      for (let i = 0; i < validated.images.length; i++) {
        await db.insert(productImages).values({
          productId: product.id,
          image: validated.images[i],
          sortOrder: i,
        });
      }
    }

    return { id: product.id };
  },

  /**
   * 根据 ID 查找商品
   */
  async findById(id: number) {
    const rows = await db.select()
      .from(products)
      .where(eq(products.id, id))
      .leftJoin(productDescriptions, eq(products.id, productDescriptions.productId))
      .leftJoin(brands, eq(products.brandId, brands.id));

    if (!rows.length) return null;

    // 聚合多语言描述
    const product = rows[0].products;
    const descriptions = rows
      .filter(r => r.product_descriptions)
      .map(r => r.product_descriptions!);

    // 获取图片
    const images = await db.select()
      .from(productImages)
      .where(eq(productImages.productId, id))
      .orderBy(productImages.sortOrder);

    // 获取分类
    const cats = await db.select()
      .from(productCategories)
      .where(eq(productCategories.productId, id));

    return {
      ...product,
      descriptions,
      images,
      categoryIds: cats.map(c => c.categoryId),
      brand: rows[0].brands || null,
    };
  },

  /**
   * 搜索商品
   */
  async search(params: ProductSearchParams) {
    const validated = ProductSearchSchema.parse(params);
    const conditions = [];

    // 状态筛选
    if (validated.status !== undefined) {
      conditions.push(eq(products.status, validated.status));
    } else {
      conditions.push(eq(products.status, true)); // 默认只显示上架商品
    }

    // 品牌筛选
    if (validated.brandId) {
      conditions.push(eq(products.brandId, validated.brandId));
    }

    // 关键词搜索
    if (validated.keyword) {
      conditions.push(
        like(productDescriptions.name, `%${validated.keyword}%`)
      );
    }

    // 价格范围
    if (validated.minPrice) {
      conditions.push(sql`${products.price} >= ${validated.minPrice}`);
    }
    if (validated.maxPrice) {
      conditions.push(sql`${products.price} <= ${validated.maxPrice}`);
    }

    // 排序
    const orderBy = validated.sortOrder === 'desc'
      ? desc(products[validated.sortBy as keyof typeof products] as any)
      : asc(products[validated.sortBy as keyof typeof products] as any);

    // 分类筛选
    if (validated.categoryId) {
      const subQuery = db.select({ productId: productCategories.productId })
        .from(productCategories)
        .where(eq(productCategories.categoryId, validated.categoryId));

      const rows = await db.select()
        .from(products)
        .where(and(...conditions, sql`${products.id} IN (${subQuery})`))
        .leftJoin(productDescriptions, and(
          eq(products.id, productDescriptions.productId),
          eq(productDescriptions.locale, validated.locale)
        ))
        .orderBy(orderBy)
        .limit(validated.pageSize)
        .offset((validated.page - 1) * validated.pageSize);

      return rows.map(r => ({ ...r.products, description: r.product_descriptions }));
    }

    const rows = await db.select()
      .from(products)
      .where(and(...conditions))
      .leftJoin(productDescriptions, and(
        eq(products.id, productDescriptions.productId),
        eq(productDescriptions.locale, validated.locale)
      ))
      .orderBy(orderBy)
      .limit(validated.pageSize)
      .offset((validated.page - 1) * validated.pageSize);

    return rows.map(r => ({ ...r.products, description: r.product_descriptions }));
  },

  /**
   * 更新商品
   */
  async update(id: number, input: UpdateProductInput) {
    const validated = UpdateProductSchema.parse(input);

    const updateData: Record<string, any> = {};
    if (validated.sku !== undefined) updateData.sku = validated.sku;
    if (validated.brandId !== undefined) updateData.brandId = validated.brandId;
    if (validated.price !== undefined) updateData.price = validated.price;
    if (validated.costPrice !== undefined) updateData.costPrice = validated.costPrice;
    if (validated.weight !== undefined) updateData.weight = validated.weight;
    if (validated.status !== undefined) updateData.status = validated.status;
    if (validated.quantity !== undefined) updateData.quantity = validated.quantity;
    if (validated.sortOrder !== undefined) updateData.sortOrder = validated.sortOrder;

    if (Object.keys(updateData).length > 0) {
      await db.update(products)
        .set(updateData)
        .where(eq(products.id, id));
    }

    // 更新描述
    if (validated.descriptions) {
      for (const [locale, desc] of Object.entries(validated.descriptions)) {
        const exists = await db.select()
          .from(productDescriptions)
          .where(and(
            eq(productDescriptions.productId, id),
            eq(productDescriptions.locale, locale)
          ));

        if (exists.length) {
          await db.update(productDescriptions)
            .set({
              name: desc.name,
              description: desc.description,
              metaTitle: desc.metaTitle,
              metaDescription: desc.metaDescription,
              metaKeywords: desc.metaKeywords,
            })
            .where(and(
              eq(productDescriptions.productId, id),
              eq(productDescriptions.locale, locale)
            ));
        } else {
          await db.insert(productDescriptions).values({
            productId: id,
            locale,
            name: desc.name,
            description: desc.description,
            metaTitle: desc.metaTitle,
            metaDescription: desc.metaDescription,
            metaKeywords: desc.metaKeywords,
          });
        }
      }
    }

    return { id };
  },

  /**
   * 删除商品
   */
  async delete(id: number) {
    const result = await db.delete(products)
      .where(eq(products.id, id));

    return result.rowCount ? result.rowCount > 0 : false;
  },

  /**
   * 获取热销商品
   */
  async getHotProducts(limit = 8) {
    const rows = await db.select()
      .from(products)
      .where(eq(products.status, true))
      .orderBy(desc(products.sales))
      .limit(limit);

    return rows;
  },

  /**
   * 获取商品总数
   */
  async getCount(params?: { status?: boolean; categoryId?: number }) {
    const conditions = [];
    if (params?.status !== undefined) {
      conditions.push(eq(products.status, params.status));
    }

    if (params?.categoryId) {
      const [result] = await db.select({ count: count() })
        .from(productCategories)
        .where(eq(productCategories.categoryId, params.categoryId));
      return Number(result.count);
    }

    const [result] = await db.select({ count: count() })
      .from(products)
      .where(and(...conditions));

    return Number(result.count);
  },
};