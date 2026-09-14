import { test, expect } from "@playwright/test";

const publicPages = [
  "/",
  "/about",
  "/about/history",
  "/about/honors",
  "/services",
  "/consulting",
  "/education",
  "/global-programs",
  "/news",
  "/notices",
  "/contact",
  "/privacy",
];

for (const path of publicPages) {
  test(`${path} 는 200이고 h1이 하나다`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
  });

  test(`en ${path} 는 200이다`, async ({ page }) => {
    const response = await page.goto(`/en${path === "/" ? "" : path}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
  });
}

test("/about/honors 의 첫 이미지는 Next 이미지 최적화 경로를 사용한다", async ({
  page,
}) => {
  await page.goto("/about/honors");
  const firstImageSrc = await page
    .locator("main img")
    .first()
    .getAttribute("src");
  expect(firstImageSrc).toMatch(/^\/_next\/image\/?\?/);
});

test("관리자 경로는 로그인 페이지로 리다이렉트된다", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/auth\/sign-in/);
});

test("없는 경로는 404 페이지를 보여준다", async ({ page }) => {
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);
  await expect(page.locator("h1")).toContainText(
    "요청하신 페이지를 찾을 수 없습니다",
  );
});
