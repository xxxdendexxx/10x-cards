import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "./LoginForm";

// Mock fetch globally
vi.stubGlobal("fetch", vi.fn());

describe("LoginForm", () => {
  // Reset mocks between tests
  beforeEach(() => {
    vi.resetAllMocks();
    // Default successful fetch mock
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ success: true }),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the login form correctly", () => {
    render(<LoginForm />);

    // Check for key elements
    expect(screen.getByText("Logowanie")).toBeInTheDocument();
    expect(screen.getByLabelText(/e-?mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/hasło/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /zaloguj się/i })).toBeInTheDocument();
    expect(screen.getByText(/nie masz konta/i)).toBeInTheDocument();
    expect(screen.getByText(/zapomniałeś hasła/i)).toBeInTheDocument();
    expect(screen.getByTestId("login-form")).toBeInTheDocument();
  });

  it("validates email format with mocked form submission", async () => {
    const user = userEvent.setup();
    const { getByLabelText, getByRole } = screen;

    // Create a spy on console.error to verify client-side validation
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {
      // Do nothing, just prevent console errors from appearing in test output
    });

    render(<LoginForm />);

    // Type invalid email
    await user.type(getByLabelText(/e-?mail/i), "invalid-email");
    await user.type(getByLabelText(/hasło/i), "password123");
    await user.click(getByRole("button", { name: /zaloguj się/i }));

    // Verify fetch wasn't called, which proves validation blocked submission
    expect(global.fetch).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("requires both email and password", async () => {
    const user = userEvent.setup();
    const { getByLabelText, getByRole } = screen;
    render(<LoginForm />);

    // Try to submit without values
    await user.click(getByRole("button", { name: /zaloguj się/i }));

    // Verify fetch wasn't called, which proves validation blocked submission
    expect(global.fetch).not.toHaveBeenCalled();

    // Try with email but no password
    await user.clear(getByLabelText(/e-?mail/i));
    await user.type(getByLabelText(/e-?mail/i), "test@example.com");
    await user.click(getByRole("button", { name: /zaloguj się/i }));

    // Verify fetch still wasn't called
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("submits the form with valid data", async () => {
    const email = "test@example.com";
    const password = "password123";
    const onLoginSuccess = vi.fn();
    const user = userEvent.setup();
    const { getByLabelText, getByRole } = screen;

    render(<LoginForm onLoginSuccess={onLoginSuccess} />);

    // Fill form with valid data
    await user.type(getByLabelText(/e-?mail/i), email);
    await user.type(getByLabelText(/hasło/i), password);

    // Submit form
    await user.click(getByRole("button", { name: /zaloguj się/i }));

    // Verify fetch was called with correct data
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });
      expect(onLoginSuccess).toHaveBeenCalled();
    });
  });

  it("handles API error responses", async () => {
    // Mock fetch to return an error
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ error: "Invalid credentials" }),
    });

    const user = userEvent.setup();
    const { getByLabelText, getByRole } = screen;
    render(<LoginForm />);

    // Fill and submit form
    await user.type(getByLabelText(/e-?mail/i), "test@example.com");
    await user.type(getByLabelText(/hasło/i), "password123");
    await user.click(getByRole("button", { name: /zaloguj się/i }));

    // Just verify the fetch was called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("handles network errors", async () => {
    // Mock fetch to throw an error
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const user = userEvent.setup();
    const { getByLabelText, getByRole } = screen;
    render(<LoginForm />);

    // Fill and submit form
    await user.type(getByLabelText(/e-?mail/i), "test@example.com");
    await user.type(getByLabelText(/hasło/i), "password123");
    await user.click(getByRole("button", { name: /zaloguj się/i }));

    // Just verify the fetch was called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("redirects on successful login", async () => {
    // Use a mock function for onLoginSuccess
    const onLoginSuccess = vi.fn();

    const user = userEvent.setup();
    const { getByLabelText, getByRole } = screen;
    render(<LoginForm onLoginSuccess={onLoginSuccess} />);

    // Fill and submit form
    await user.type(getByLabelText(/e-?mail/i), "test@example.com");
    await user.type(getByLabelText(/hasło/i), "password123");
    await user.click(getByRole("button", { name: /zaloguj się/i }));

    // Check if onLoginSuccess was called
    await waitFor(() => {
      expect(onLoginSuccess).toHaveBeenCalled();
    });
  });

  it("falls back to window.location.href when onLoginSuccess is not provided", async () => {
    // Mock window.location
    const locationSpy = vi.spyOn(window, "location", "get");
    const mockLocation = { ...window.location, href: "" };
    locationSpy.mockImplementation(() => mockLocation);

    const user = userEvent.setup();
    const { getByLabelText, getByRole } = screen;
    render(<LoginForm />);

    // Fill and submit form
    await user.type(getByLabelText(/e-?mail/i), "test@example.com");
    await user.type(getByLabelText(/hasło/i), "password123");
    await user.click(getByRole("button", { name: /zaloguj się/i }));

    // Check for redirect
    await waitFor(() => {
      expect(window.location.href).toBe("/generate");
    });
  });

  it("calls fetch API when submitting the form", async () => {
    // Use a mock function for onLoginSuccess to avoid window.location error
    const onLoginSuccess = vi.fn();

    const user = userEvent.setup();
    const { getByLabelText, getByRole } = screen;
    render(<LoginForm onLoginSuccess={onLoginSuccess} />);

    // Fill and submit form
    await user.type(getByLabelText(/e-?mail/i), "test@example.com");
    await user.type(getByLabelText(/hasło/i), "password123");
    await user.click(getByRole("button", { name: /zaloguj się/i }));

    // Verify fetch was called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(onLoginSuccess).toHaveBeenCalled();
    });
  });
});
