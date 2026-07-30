import { describe, it, expect, vi, beforeEach } from 'vitest';
import { customers, customerAddresses, customerWishlists } from '@/lib/db/schema';

function createChainMock(resolvedValue: any) {
  const buildChain = (endValue: any) => {
    return new Proxy(() => Promise.resolve(endValue), {
      get(_, prop) {
        if (prop === 'then') return (resolve: Function) => resolve(endValue);
        if (prop === 'catch') return () => Promise.resolve(endValue);
        return () => buildChain(endValue);
      },
      apply() {
        return Promise.resolve(endValue);
      },
    });
  };
  return buildChain(resolvedValue);
}

const mockDb = vi.hoisted(() => {
  const defaultInsertReturn = Promise.resolve([{
    id: 1, email: 'test@example.com', name: 'Test User',
    password: 'hashed_pwd', phone: null, avatar: null,
    groupId: null, status: true, newsletter: false,
    lastLogin: null, createdAt: new Date(), updatedAt: new Date(),
  }]);

  return {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => defaultInsertReturn),
      })),
    })),
    select: vi.fn(() => createChainMock([])),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([{
            id: 1, email: 'test@example.com', name: 'Updated User',
            password: 'hashed_pwd', status: true,
          }])),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve({ rowCount: 1 })),
    })),
  };
});

vi.mock('@/lib/db/db', () => ({
  db: mockDb,
}));

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  hash: vi.fn(() => Promise.resolve('hashed_password')),
  compare: vi.fn(() => Promise.resolve(true)),
  default: { hash: vi.fn(() => Promise.resolve('hashed_password')), compare: vi.fn(() => Promise.resolve(true)) },
}));

import { CustomerService } from '@/lib/services/customer.service';

describe('CustomerService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new customer', async () => {
      const result = await CustomerService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        newsletter: false,
      });

      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('email', 'test@example.com');
      expect(mockDb.insert).toHaveBeenCalledWith(customers);
    });

    it('should throw if email already exists', async () => {
      mockDb.select.mockReturnValue(createChainMock([{ id: 1, email: 'test@example.com' }]));

      await expect(
        CustomerService.register({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          newsletter: false,
        })
      ).rejects.toThrow('Email already exists');
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const mockCustomer = {
        id: 1, email: 'test@example.com', name: 'Test User',
        password: 'hashed_password', status: true,
      };
      mockDb.select.mockReturnValue(createChainMock([mockCustomer]));

      const result = await CustomerService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('email', 'test@example.com');
      // Password should not be returned
      expect(result).not.toHaveProperty('password');
    });

    it('should throw with invalid email', async () => {
      mockDb.select.mockReturnValue(createChainMock([]));

      await expect(
        CustomerService.login({
          email: 'wrong@email.com',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw with invalid password', async () => {
      // Mock compare to return false - import the mocked module to access the spy
      const bcryptModule = await import('bcryptjs');
      (bcryptModule.default.compare as any).mockResolvedValueOnce(false);

      const mockCustomer = {
        id: 1, email: 'test@example.com', name: 'Test User',
        password: 'hashed_password', status: true,
      };
      mockDb.select.mockReturnValue(createChainMock([mockCustomer]));

      await expect(
        CustomerService.login({
          email: 'test@example.com',
          password: 'wrong_password',
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('findById', () => {
    it('should find a customer by id', async () => {
      const mockCustomer = { id: 1, email: 'test@example.com', name: 'Test User', status: true };
      mockDb.select.mockReturnValue(createChainMock([mockCustomer]));

      const result = await CustomerService.findById(1);

      expect(result).toHaveProperty('email', 'test@example.com');
      expect(result).not.toHaveProperty('password');
    });

    it('should return null when not found', async () => {
      mockDb.select.mockReturnValue(createChainMock([]));

      const result = await CustomerService.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update customer profile', async () => {
      const result = await CustomerService.updateProfile(1, {
        name: 'Updated User',
        phone: '13800138000',
      });

      expect(result).toHaveProperty('name', 'Updated User');
      expect(mockDb.update).toHaveBeenCalledWith(customers);
    });
  });

  describe('addresses', () => {
    it('should add an address', async () => {
      const mockAddress = { id: 1, customerId: 1, name: 'Home', phone: '13800138000', address1: '123 Main St', countryId: 1, isDefault: false };
      (mockDb.insert as any).mockReturnValue({
        values: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([mockAddress])),
        })),
      });

      const result = await CustomerService.addAddress(1, {
        name: 'Home',
        phone: '13800138000',
        address1: '123 Main St',
        countryId: 1,
        isDefault: false,
      });

      expect(result).toHaveProperty('id', 1);
      expect(mockDb.insert).toHaveBeenCalledWith(customerAddresses);
    });

    it('should list addresses for a customer', async () => {
      const mockAddresses = [
        { id: 1, customerId: 1, name: 'Home', address1: '123 Main St' },
        { id: 2, customerId: 1, name: 'Office', address1: '456 Oak Ave' },
      ];
      mockDb.select.mockReturnValue(createChainMock(mockAddresses));

      const result = await CustomerService.getAddresses(1);

      expect(result).toHaveLength(2);
    });
  });

  describe('wishlist', () => {
    it('should add a product to wishlist', async () => {
      const mockWishlist = { id: 1, customerId: 1, productId: 10, createdAt: new Date() };
      (mockDb.insert as any).mockReturnValue({
        values: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([mockWishlist])),
        })),
      });

      await CustomerService.addToWishlist(1, 10);

      expect(mockDb.insert).toHaveBeenCalledWith(customerWishlists);
    });

    it('should remove a product from wishlist', async () => {
      await CustomerService.removeFromWishlist(1, 10);

      expect(mockDb.delete).toHaveBeenCalledWith(customerWishlists);
    });
  });
});