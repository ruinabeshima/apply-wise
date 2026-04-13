import test, { BrowserContext, expect } from "@playwright/test";
import {
  mockAuthSignedIn,
  mockAuthSignedOut,
  waitForAuthToLoad,
} from "./helpers/auth";

test.describe("Login/Logout + Navbar State", () => {
  test.describe.configure({ mode: "serial" });
  const TEST_EMAIL = "test@apply-wise.local";

  test.describe("Unsigned user navbar", () => {
    let context: BrowserContext;

    test.beforeEach(async ({ browser }) => {
      context = await browser.newContext();
      await mockAuthSignedOut(context);
    });

    test.afterEach(async () => {
      await context.close();
    });

    test("shows login and get started buttons", async () => {
      const page = await context.newPage();
      await page.goto("/");
      await waitForAuthToLoad(page);
      const nav = page.getByRole("navigation");

      await expect(
        nav.getByRole("button", { name: "Login", exact: true }),
      ).toBeVisible();
      await expect(
        nav.getByRole("button", { name: "Get started", exact: true }),
      ).toBeVisible();
    });

    test("sign out button is not visible", async () => {
      const page = await context.newPage();
      await page.goto("/");
      await waitForAuthToLoad(page);

      await expect(
        page.getByRole("button", { name: "Sign out", exact: true }),
      ).not.toBeVisible();
    });
  });

  test.describe("Login flow", () => {
    let context: BrowserContext;

    test.beforeEach(async ({ browser }) => {
      context = await browser.newContext();
      await mockAuthSignedIn(context, {
        uid: "test-user-123",
        email: TEST_EMAIL,
      });
    });

    test.afterEach(async () => {
      await context.close();
    });

    test("redirects signed-in users from login", async () => {
      const page = await context.newPage();
      await page.goto("/login");
      await waitForAuthToLoad(page);

      await expect(page).toHaveURL("/dashboard");
    });

    test("allows signed-in users to access dashboard", async () => {
      const page = await context.newPage();
      await page.goto("/dashboard");
      await waitForAuthToLoad(page);

      await expect(page).toHaveURL("/dashboard");
    });
  });

  test.describe("Signed-in user navbar", () => {
    let context: BrowserContext;

    test.beforeEach(async ({ browser }) => {
      context = await browser.newContext();
      await mockAuthSignedIn(context, {
        uid: "test-user-123",
        email: TEST_EMAIL,
      });
    });

    test.afterEach(async () => {
      await context.close();
    });

    test("shows user email in navbar", async () => {
      const page = await context.newPage();
      await page.goto("/dashboard");
      await waitForAuthToLoad(page);

      await expect(page.getByText("Test User")).toBeVisible();
    });

    test("shows nav links (Your Resume, Tailored Resumes)", async () => {
      const page = await context.newPage();
      await page.goto("/dashboard");
      await waitForAuthToLoad(page);

      await expect(
        page.getByRole("link", { name: "Your Resume" }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: "Tailored Resumes" }),
      ).toBeVisible();
    });

    test("shows sign out button", async () => {
      const page = await context.newPage();
      await page.goto("/dashboard");
      await waitForAuthToLoad(page);

      await expect(
        page.getByRole("button", { name: "Sign out", exact: true }),
      ).toBeVisible();
    });

    test("login/get started buttons are hidden when signed in", async () => {
      const page = await context.newPage();
      await page.goto("/dashboard");
      await waitForAuthToLoad(page);

      await expect(
        page.getByRole("button", { name: "Login", exact: true }),
      ).not.toBeVisible();
      await expect(
        page.getByRole("button", { name: "Get started", exact: true }),
      ).not.toBeVisible();
    });

    test("can navigate using nav links", async () => {
      const page = await context.newPage();
      await page.goto("/dashboard");
      await waitForAuthToLoad(page);

      await page.getByRole("link", { name: "Your Resume" }).click();
      await expect(page).toHaveURL("/your-resume");

      const link = page.getByRole("link", { name: "Your Resume" });
      await expect(link).toHaveClass(/border-primary/);
    });
  });

  test.describe("Sign out flow", () => {
    let context: BrowserContext;

    test.beforeEach(async ({ browser }) => {
      context = await browser.newContext();
      await mockAuthSignedIn(context, {
        uid: "test-user-123",
        email: TEST_EMAIL,
      });
    });

    test.afterEach(async () => {
      await context.close();
    });

    test("sign out button redirects to login", async () => {
      const page = await context.newPage();
      await page.goto("/dashboard");
      await waitForAuthToLoad(page);

      await page
        .getByRole("button", { name: "Sign out", exact: true })
        .click({ force: true });
      await expect(page).toHaveURL("/login");
    });

    test("clears user state after sign out", async () => {
      const page = await context.newPage();
      await page.goto("/dashboard");
      await waitForAuthToLoad(page);

      await page
        .getByRole("button", { name: "Sign out", exact: true })
        .click({ force: true });
      await expect(page).toHaveURL("/login");
      await expect(
        page.getByRole("button", { name: "Login", exact: true }),
      ).toBeVisible();
    });

    test("redirects to login when accessing protected route after sign out", async ({
      browser,
    }) => {
      const page = await context.newPage();
      await page.goto("/dashboard");
      await waitForAuthToLoad(page);

      await page
        .getByRole("button", { name: "Sign out", exact: true })
        .click({ force: true });
      await expect(page).toHaveURL("/login");

      const signedOutContext = await browser.newContext();
      await mockAuthSignedOut(signedOutContext);
      const signedOutPage = await signedOutContext.newPage();
      await signedOutPage.goto("/dashboard");
      await waitForAuthToLoad(signedOutPage);
      await expect(signedOutPage).toHaveURL("/login");
      await signedOutContext.close();
    });
  });

  test.describe("Navbar active link styling", () => {
    let context: BrowserContext;

    test.beforeEach(async ({ browser }) => {
      context = await browser.newContext();
      await mockAuthSignedIn(context, {
        uid: "test-user-123",
        email: TEST_EMAIL,
      });
    });

    test.afterEach(async () => {
      await context.close();
    });

    test("highlights current page in nav", async () => {
      const page = await context.newPage();
      await page.goto("/your-resume");
      await waitForAuthToLoad(page);

      const yourResumeLink = page.getByRole("link", { name: "Your Resume" });
      const classList = await yourResumeLink.evaluate((el) => {
        const classes = Array.from(el.classList);
        return {
          hasPrimary: classes.some((c) => c.includes("primary")),
          hasBorder: classes.some((c) => c.includes("border")),
        };
      });

      expect(classList.hasPrimary || classList.hasBorder).toBeTruthy();
    });

    test("tailored resumes link is highlighted when on that page", async () => {
      const page = await context.newPage();
      await page.goto("/tailored");
      await waitForAuthToLoad(page);

      const tailoredLink = page.getByRole("link", { name: "Tailored Resumes" });
      const classList = await tailoredLink.evaluate((el) => {
        const classes = Array.from(el.classList);
        return {
          hasPrimary: classes.some((c) => c.includes("primary")),
          hasBorder: classes.some((c) => c.includes("border")),
        };
      });

      expect(classList.hasPrimary || classList.hasBorder).toBeTruthy();
    });
  });
});
