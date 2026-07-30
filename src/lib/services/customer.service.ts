import { db } from '@/lib/db/db';
import { customers, customerAddresses, customerWishlists } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

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

export class CustomerService {
  /**
   * Register a new customer
   */
  static async register(data: RegisterInput) {
    const validated = registerSchema.parse(data);

    // Check if email already exists
    const existing = await db
      .select()
      .from(customers)
      .where(eq(customers.email, validated.email));

    if (existing.length > 0) {
      throw new Error('Email already exists');
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
  }

  /**
   * Login with email and password
   */
  static async login(data: LoginInput) {
    const validated = loginSchema.parse(data);

    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.email, validated.email));

    if (!customer) {
      throw new Error('Invalid credentials');
    }

    const isValid = await bcrypt.compare(validated.password, customer.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await db
      .update(customers)
      .set({ lastLogin: new Date() })
      .where(eq(customers.id, customer.id));

    // Don't return password
    const { password: _, ...safeCustomer } = customer;
    return safeCustomer;
  }

  /**
   * Find customer by ID (without password)
   */
  static async findAll() {
    const rows = await db.select().from(customers);
    return rows.map(({ password: _, ...safe }) => safe);
  }

  static async findById(id: number) {
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, id));

    if (!customer) return null;

    const { password: _, ...safeCustomer } = customer;
    return safeCustomer;
  }

  /**
   * Update customer profile
   */
  static async updateProfile(id: number, data: UpdateProfileInput) {
    const validated = updateProfileSchema.parse(data);

    const updateData: Record<string, any> = {};
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
  }

  // ========== Address Management ==========

  /**
   * Add a new address for customer
   */
  static async addAddress(customerId: number, data: AddressInput) {
    const validated = addressSchema.parse(data);

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
  }

  /**
   * Get all addresses for a customer
   */
  static async getAddresses(customerId: number) {
    return db
      .select()
      .from(customerAddresses)
      .where(eq(customerAddresses.customerId, customerId));
  }

  /**
   * Delete an address
   */
  static async deleteAddress(customerId: number, addressId: number) {
    const result = await db
      .delete(customerAddresses)
      .where(
        and(
          eq(customerAddresses.id, addressId),
          eq(customerAddresses.customerId, customerId)
        )
      );

    return (result as any).rowCount > 0;
  }

  // ========== Wishlist Management ==========

  /**
   * Add a product to customer's wishlist
   */
  static async addToWishlist(customerId: number, productId: number) {
    const [item] = await db
      .insert(customerWishlists)
      .values({ customerId, productId })
      .returning();

    return item;
  }

  /**
   * Remove a product from customer's wishlist
   */
  static async removeFromWishlist(customerId: number, productId: number) {
    const result = await db
      .delete(customerWishlists)
      .where(
        and(
          eq(customerWishlists.customerId, customerId),
          eq(customerWishlists.productId, productId)
        )
      );

    return (result as any).rowCount > 0;
  }

  /**
   * Get customer's wishlist
   */
  static async getWishlist(customerId: number) {
    return db
      .select()
      .from(customerWishlists)
      .where(eq(customerWishlists.customerId, customerId));
  }
}