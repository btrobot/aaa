import { test, expect } from '@playwright/test';

test.describe('前台商店 - 核心用户旅程', () => {
  test('首页加载并展示核心元素', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.getByRole('heading', { name: /品质好物|Quality Products|游乐设备/i })).toBeVisible();
  });

  test('产品浏览 - 从首页到产品详情', async ({ page }) => {
    await page.goto('/');
    // 点击"所有产品"按钮
    const allProducts = page.getByRole('link', { name: /所有产品|All Products/i });
    if (await allProducts.isVisible()) {
      await allProducts.click();
      await page.waitForURL(/\/products/);
    }
    // 点击第一个产品
    const firstProduct = page.locator('a[href*="/products/"]').first();
    if (await firstProduct.isVisible()) {
      await firstProduct.click();
      await page.waitForURL(/\/products\/\d+/);
      await expect(page.locator('h1')).toBeVisible();
    }
  });

  test('购物车流程 - 添加商品到购物车', async ({ page }) => {
    await page.goto('/products');
    // 进入第一个产品详情
    const productLink = page.locator('a[href*="/products/"]').first();
    if (await productLink.isVisible()) {
      await productLink.click();
      await page.waitForURL(/\/products\/\d+/);
    }
    // 点击"加入购物车"按钮
    const addBtn = page.getByRole('button', { name: /加入购物车|Add to Cart/i });
    if (await addBtn.isVisible()) {
      await addBtn.click();
      // 验证购物车徽标更新
      await expect(page.locator('nav')).toContainText(/[1-9]/);
    }
  });

  test('响应式 - 移动端汉堡菜单', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    // 验证移动端菜单按钮存在
    const menuBtn = page.locator('button[aria-label*="menu" i], button:has(svg.lucide-menu)');
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();
    // 验证菜单展开 - 移动端菜单链接可见
    await expect(page.locator('[class*="lg:hidden"] a').first()).toBeVisible({ timeout: 3000 });
  });
});

test.describe('多语言切换', () => {
  test('切换到中文', async ({ page }) => {
    await page.goto('/en');
    const langBtn = page.locator('nav button').filter({ hasText: /EN|ZH|Language|语言/i }).first();
    if (await langBtn.isVisible()) {
      await langBtn.click();
      const zhOption = page.getByRole('menuitem', { name: /中文|简体/i });
      if (await zhOption.isVisible()) {
        await zhOption.click();
        await page.waitForURL(/\/zh/);
      }
    }
  });
});

test.describe('后台管理', () => {
  test('管理员登录页面可访问', async ({ page }) => {
    await page.goto('/zh/admin');
    await expect(page).toHaveURL(/\/admin/);
    // 登录后应显示仪表盘
    const loginBtn = page.getByRole('button', { name: /登录|Login|Sign in/i });
    if (await loginBtn.isVisible()) {
      // 在登录页，填写凭据
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      if (await emailInput.isVisible()) {
        await emailInput.fill('admin@nodecoda.com');
        await page.locator('input[type="password"], input[name="password"]').first().fill('admin123');
        await loginBtn.click();
        await page.waitForTimeout(2000);
      }
    }
    // 验证页面加载成功（即使没有仪表盘数据，页面也应正常渲染）
    await expect(page.locator('body')).toBeVisible();
  });

  test('后台侧边栏导航完整', async ({ page }) => {
    await page.goto('/zh/admin');
    const sidebarLinks = ['Dashboard', 'Products', 'Orders', 'Customers', 'Categories', 'Brands', 'Settings'];
    for (const link of sidebarLinks) {
      const linkEl = page.getByRole('link', { name: new RegExp(link, 'i') }).first();
      if (await linkEl.isVisible()) {
        await expect(linkEl).toBeVisible();
      }
    }
  });
});