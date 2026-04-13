import test, { BrowserContext, expect, Route } from "@playwright/test";
import { mockAuthSignedIn, waitForAuthToLoad } from "./helpers/auth";

test.describe("Applications Management", () => {
  const TEST_EMAIL = "test@apply-wise.local";
  const TEST_UID = "test-user-123";

  // Mock /auth/status as onboarding complete
  async function mockOnboardingComplete(context: BrowserContext) {
    await context.route("**/auth/status", (route: Route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ onboardingComplete: true }),
      });
    });
  }

  // Mock GET /applications (empty initially)
  async function mockApplicationsEmpty(context: BrowserContext) {
    await context.route("**/applications", (route: Route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });
  }

  // Mock GET /applications with sample data
  async function mockApplicationsWithData(context: BrowserContext) {
    const mockApps = [
      {
        id: "app-1",
        role: "Software Engineer",
        company: "Tech Corp",
        status: "APPLIED",
        appliedDate: "2025-01-15T10:00:00Z",
        notes: "Great team, promising project",
        jobUrl: "https://example.com/job1",
        createdAt: "2025-01-15T10:00:00Z",
        updatedAt: "2025-01-15T10:00:00Z",
      },
      {
        id: "app-2",
        role: "Product Manager",
        company: "StartupXYZ",
        status: "INTERVIEW",
        appliedDate: "2025-01-10T14:00:00Z",
        notes: null,
        jobUrl: null,
        createdAt: "2025-01-10T14:00:00Z",
        updatedAt: "2025-01-10T14:00:00Z",
      },
    ];

    await context.route("**/applications", (route: Route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockApps),
      });
    });
  }

  // Mock POST /applications/add
  async function mockApplicationAddSuccess(context: BrowserContext) {
    await context.route("**/applications/add", (route: Route) => {
      const request = route.request();
      if (request.method() === "POST") {
        route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            id: "app-new-123",
            role: "Senior Developer",
            company: "Acme Inc",
            status: "APPLIED",
            appliedDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        });
      } else {
        route.continue();
      }
    });
  }

  // Mock GET /applications/:id
  async function mockApplicationDetail(context: BrowserContext) {
    await context.route("**/applications/app-1", (route: Route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "app-1",
          role: "Software Engineer",
          company: "Tech Corp",
          status: "APPLIED",
          appliedDate: "2025-01-15T10:00:00Z",
          notes: "Great team, promising project",
          jobUrl: "https://example.com/job1",
          createdAt: "2025-01-15T10:00:00Z",
          updatedAt: "2025-01-15T10:00:00Z",
        }),
      });
    });
  }

  test.describe("Dashboard - Applications List", () => {
    test.describe.configure({ mode: "serial" });
    let context: BrowserContext;

    test.beforeEach(async ({ browser }) => {
      context = await browser.newContext();
      await mockAuthSignedIn(context, {
        uid: TEST_UID,
        email: TEST_EMAIL,
      });
    });

    test.afterEach(async () => {
      await context.close();
    });

    test("displays empty state when no applications exist", async () => {
      const page = await context.newPage();
      await mockOnboardingComplete(context);
      await mockApplicationsEmpty(context);

      await page.goto("/dashboard");
      await waitForAuthToLoad(page);

      // Wait for empty state message to be visible
      await expect(page.getByText(/no applications yet/i)).toBeVisible();
      await expect(
        page.getByRole("link", { name: /add your first application/i }),
      ).toBeVisible();
    });

    test("displays error state when loading fails", async () => {
      const page = await context.newPage();
      await mockOnboardingComplete(context);

      await context.route("**/applications", (route: Route) => {
        route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Server error" }),
        });
      });

      await page.goto("/dashboard");
      await waitForAuthToLoad(page);
      const errorAlert = page.getByRole("alert");
      await expect(errorAlert).toBeVisible();
    });
  });

  test.describe("Add Application Flow", () => {
    test.describe.configure({ mode: "serial" });
    let context: BrowserContext;

    test.beforeEach(async ({ browser }) => {
      context = await browser.newContext();
      await mockAuthSignedIn(context, {
        uid: TEST_UID,
        email: TEST_EMAIL,
      });
    });

    test.afterEach(async () => {
      await context.close();
    });

    test("navigates to add application page from dashboard", async () => {
      const page = await context.newPage();
      await mockOnboardingComplete(context);
      await mockApplicationsEmpty(context);

      await page.goto("/dashboard");
      await waitForAuthToLoad(page);

      const addBtn = page.getByRole("link", { name: /add application/i });

      // Wait for button to be visible and enabled
      await expect(addBtn).toBeVisible();

      // Click and wait for navigation
      await Promise.all([
        page.waitForURL("**/applications/add"),
        addBtn.first().click(),
      ]);
    });
  });
});
