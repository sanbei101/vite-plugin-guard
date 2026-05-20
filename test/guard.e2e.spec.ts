import { chromium, Browser, Page } from "playwright";
import { createServer, ViteDevServer } from "vite";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

describe("Guard E2E Test", () => {
  let server: ViteDevServer;
  let browser: Browser;
  let page: Page;
  let serverUrl: string;

  const CORRECT_PASSWORD = "123456";

  beforeAll(async () => {
    server = await createServer({
      server: { port: 3015 },
    });
    await server.listen();
    serverUrl = `http://localhost:3015`;

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    page = await context.newPage();
  });

  afterAll(async () => {
    if (browser) await browser.close();
    if (server) await server.close();
  });

  it("完整闭环测试：拦截 -> 输错拦截 -> 输对解锁 -> 状态持久化", async () => {
    await page.goto(serverUrl);

    const guardTitle = page.locator("h2");
    expect(await guardTitle.innerText()).toBe("项目已受保护");

    const passwordInput = page.locator('input[type="password"]');
    const unlockButton = page.locator("button:has-text('解锁')");
    expect(await passwordInput.isVisible()).toBe(true);

    await passwordInput.fill("wrong_pwd_1234");
    await unlockButton.click();

    const errorMsg = page.locator(".error");
    expect(await errorMsg.isVisible()).toBe(true);
    expect(await errorMsg.innerText()).toContain("密码错误");

    const tokenBefore = await page.evaluate(() => sessionStorage.getItem("__guard_passed__"));
    expect(tokenBefore).toBeNull();

    await passwordInput.fill(CORRECT_PASSWORD);
    await unlockButton.click();

    await guardTitle.waitFor({ state: "hidden", timeout: 5000 });

    expect(await guardTitle.isVisible()).toBe(false);

    const tokenAfter = await page.evaluate(() => sessionStorage.getItem("__guard_passed__"));
    expect(tokenAfter).toBe("true");

    await page.reload();

    expect(await guardTitle.isVisible()).toBe(false);
  }, 100000);
});
