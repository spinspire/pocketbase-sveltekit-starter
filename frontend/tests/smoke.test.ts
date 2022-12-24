import { test, expect, type Page } from "@playwright/test";
import playwright from "playwright";

const ts = Date.now();
const email = ts + "@test.com";
const password = "0123456789";

async function doLogin(page: Page) {
  await page.locator("summary").click();
  await page.getByPlaceholder("email").fill(email);
  await page.getByPlaceholder("password").fill(password);
  await page.getByRole("button", { name: "Login" }).click();
  const logout = await page.getByRole("button", { name: "Logout" });
  expect(logout).toBeDefined();
  const name = await page.locator("button>samp").innerText();
  expect(name, email);
}

test("posts logged out", async ({ page }) => {
  await page.goto("/posts");
  const heading = await page.getByRole("heading", { name: "Recent Posts" });
  expect(heading).toBeDefined();
  const p = await page.getByText("Please login to create new posts.");
  expect(p).toBeDefined();
});

test("register", async ({ page }) => {
  await page.goto("/posts");
  await page.locator("summary").click();
  await page.getByPlaceholder("email").fill(email);
  await page.getByPlaceholder("password").fill(password);
  await page.getByLabel("Register").check();
  await page.getByPlaceholder("confirm password").fill("0123456789");
  await page.getByRole("button", { name: "Login" }).click();
  const name = await page.locator("button>samp").innerText();
  expect(name, email);
});

test("login", async ({ page }) => {
  await page.goto("/posts");
  await doLogin(page);
  const name = await page.locator("button>samp").innerText();
  expect(name, email);
});

test("posts logged in", async ({ page }) => {
  await page.goto("/posts");
  await doLogin(page);
  const heading = await page.getByRole("heading", { name: "Recent Posts" });
  expect(heading).toBeDefined();
  const link = await page.getByRole("link", { name: "Create New" });
  expect(link).toBeDefined();
});

const title = "post at " + ts;
const slug = "post-" + ts;

test("create post", async ({ page }) => {
  // second browser to test realtime subscriptions
  const b2 = (await (await playwright.chromium.launch()).newPage()) as Page;
  await b2.goto("/posts");
  await doLogin(b2);

  await page.goto("/posts");
  await doLogin(page);
  await page.getByRole("link", { name: "Create New" }).click();
  await page.getByPlaceholder("title").click();
  const ts = Date.now();
  await page.getByPlaceholder("title").fill(title);
  await page.getByPlaceholder("slug").fill(slug);
  await page.getByPlaceholder("body").fill("line 1\nline 2");
  // await page.locator('input[type="file"]').setInputFiles("posts-1.png");
  await page.locator('input[type="file"]').setInputFiles("README.md");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page).toHaveURL(/\/posts\/$/);
  await page.getByRole("link", { name: title }).click();
  await expect(page).toHaveURL(/\/posts\/.+\/$/);
  const heading = await page.getByRole("heading", { name: title });
  expect(heading).toBeDefined();
  // check realtime activity in the second browser
  const link = await b2.getByRole("link", { name: title });
  expect(link).toBeDefined();
});

test("delete post", async ({ page }) => {
  await page.goto(`/posts/${slug}/#delete`);
  await doLogin(page);
  await page.getByRole("button", { name: "No - Cancel" }).click();
  await expect(page).toHaveURL(/\/posts\/$/);
  await page.goto(`/posts/${slug}/#delete`);
  await page.getByRole("button", { name: "Yes - Proceed" }).click();
  await expect(page).toHaveURL(/\/posts\/$/);
});
