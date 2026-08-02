import { db } from '@/lib/db/db';
import { customers, customerAddresses, customerWishlists, products } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { NotFoundError, BusinessRuleError } from './errors';

// Validation schemas
export const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(6).max(128),
  name: z.string().min(1).max(255),
  phone: z.string().max(50).optional(),
  newsletter: z.boolean().optional().default(false),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  phone: z.string().max(50).optional().nullable(),
  avatar: z.string().max(500).optional().nullable(),
  newsletter: z.boolean().optional(),
});

export const addressSchema = z.object({
  name: z.string().min(1).max(255),
  phone: z.string().min(1).max(50),
  countryId: z.number().int().positive(),
  zoneId: z.number().int().optional(),
  city: z.string().max(255).optional(),
  address1: z.string().min(1).max(500),
  address2: z.string().max(500).optional(),
  zipCode: z.string().max(50).optional(),
  isDefault: z.boolean().optional().default(false),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AddressInput = z.infer<typeof addressSchema>;

export const CustomerService = {
  /**
   * Register a new customer
   */
  async register(data: RegisterInput) {
    const validated = registerSchema.parse(data);

    // pre: 邮箱未被注册
    const existing = await db
      .select()
      .from(customers)
      .where(eq(customers.email, validated.email));

    if (existing.length > 0) {
      throw new BusinessRuleError('邮箱已被注册');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    const [customer] = await db
      .insert(customers)
      .values({
        email: validated.email,
        password: hashedPassword,
        name: validated.name,
        phone: validated.phone ?? null,
        newsletter: validated.newsletter ?? false,
      })
      .returning();

    // Don't return password
    const { password: _, ...safeCustomer } = customer;
    return safeCustomer;
  },

  /**
   * Login with email and password
   */
  async login(data: LoginInput) {
    const validated = loginSchema.parse(data);

    // pre: 客户存在
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.email, validated.email));

    if (!customer) {
      throw new BusinessRuleError('邮箱或密码错误');
    }

    // pre: 账户状态正常
    if (!customer.status) {
      throw new BusinessRuleError('账户已被禁用');
    }

    // pre: 密码正确
    const isValid = await bcrypt.compare(validated.password, customer.password);
    if (!isValid) {
      throw new BusinessRuleError('邮箱或密码错误');
    }

    // Update last login
    await db
      .update(customers)
      .set({ lastLogin: new Date() })
      .where(eq(customers.id, customer.id));

    // Don't return password
    const { password: _, ...safeCustomer } = customer;
    return safeCustomer;
  },

  /**
   * Find all customers (without password)
   */
  async findAll() {
    const rows = await db.select().from(customers);
    return rows.map(({ password: _, ...safe }) => safe);
  },

  /**
   * Find customer by ID — throws NotFoundError when missing
   */
  async findById(id: number) {
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, id));

    if (!customer) {
      throw new NotFoundError('客户', id);
    }

    const { password: _, ...safeCustomer } = customer;
    return safeCustomer;
  },

  /**
   * Update customer profile — pre: 客户存在
   */
  async updateProfile(id: number, data: UpdateProfileInput) {
    const validated = updateProfileSchema.parse(data);

    // pre: 客户存在
    const [existing] = await db
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.id, id));

    if (!existing) {
      throw new NotFoundError('客户', id);
    }

    const updateData: Record<string, unknown> = {};
    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.phone !== undefined) updateData.phone = validated.phone;
    if (validated.avatar !== undefined) updateData.avatar = validated.avatar;
    if (validated.newsletter !== undefined) updateData.newsletter = validated.newsletter;

    const [customer] = await db
      .update(customers)
      .set(updateData)
      .where(eq(customers.id, id))
      .returning();

    const { password: _, ...safeCustomer } = customer;
    return safeCustomer;
  },

  // ========== Address Management ==========

  /**
   * Add a new address for customer — pre: 客户存在
   */
  async addAddress(customerId: number, data: AddressInput) {
    const validated = addressSchema.parse(data);

    // pre: 客户存在
    const [existing] = await db
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.id, customerId));

    if (!existing) {
      throw new NotFoundError('客户', customerId);
    }

    // post: 如 isDefault=true, 其他地址设为非默认
    if (validated.isDefault) {
      await db
        .update(customerAddresses)
        .set({ isDefault: false })
        .where(eq(customerAddresses.customerId, customerId));
    }

    const [address] = await db
      .insert(customerAddresses)
      .values({
        customerId,
        name: validated.name,
        phone: validated.phone,
        countryId: validated.countryId,
        zoneId: validated.zoneId ?? null,
        city: validated.city ?? null,
        address1: validated.address1,
        address2: validated.address2 ?? null,
        zipCode: validated.zipCode ?? null,
        isDefault: validated.isDefault ?? false,
      })
      .returning();

    return address;
  },

  /**
   * Get all addresses for a customer
   */
  async getAddresses(customerId: number) {
    return db
      .select()
      .from(customerAddresses)
      .where(eq(customerAddresses.customerId, customerId));
  },

  /**
   * Delete an address
   */
  async deleteAddress(customerId: number, addressId: number) {
    const [existing] = await db
      .select({ id: customerAddresses.id })
      .from(customerAddresses)
      .where(
        and(
          eq(customerAddresses.id, addressId),
          eq(customerAddresses.customerId, customerId)
        )
      );

    if (!existing) {
      throw new NotFoundError('地址', addressId);
    }

    await db
      .delete(customerAddresses)
      .where(
        and(
          eq(customerAddresses.id, addressId),
          eq(customerAddresses.customerId, customerId)
        )
      );

    return true;
  },

  // ========== Wishlist Management ==========

  /**
   * Add a product to customer's wishlist — 幂等，重复添加不报错
   * pre: 产品存在
   */
  async addToWishlist(customerId: number, productId: number) {
    // pre: 产品存在
    const [existingProduct] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, productId));

    if (!existingProduct) {
      throw new NotFoundError('产品', productId);
    }

    // 幂等：已存在则直接返回
    const [existing] = await db
      .select()
      .from(customerWishlists)
      .where(
        and(
          eq(customerWishlists.customerId, customerId),
          eq(customerWishlists.productId, productId)
        )
      );

    if (existing) {
      return existing;
    }

    const [item] = await db
      .insert(customerWishlists)
      .values({ customerId, productId })
      .returning();

    return item;
  },

  /**
   * Remove a product from customer's wishlist
   * pre: 收藏记录存在
   */
  async removeFromWishlist(customerId: number, productId: number) {
    // pre: 收藏记录存在
    const [existing] = await db
      .select()
      .from(customerWishlists)
      .where(
        and(
          eq(customerWishlists.customerId, customerId),
          eq(customerWishlists.productId, productId)
        )
      );

    if (!existing) {
      throw new NotFoundError('收藏记录');
    }

    await db
      .delete(customerWishlists)
      .where(
        and(
          eq(customerWishlists.customerId, customerId),
          eq(customerWishlists.productId, productId)
        )
      );

    return true;
  },

  /**
   * Get customer's wishlist
   */
  async getWishlist(customerId: number) {
    return db
      .select()
      .from(customerWishlists)
      .where(eq(customerWishlists.customerId, customerId));
  }
};
