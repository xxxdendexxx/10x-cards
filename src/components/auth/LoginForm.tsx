import * as React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps = {}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Basic email validation regex
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    //console.log("submit form");
    event.preventDefault();
    setError(null); // Clear previous errors
    //setError("dupa");
    //return;
    // Client-side validation
    if (!email || !password) {
      setError("Both email and password are required.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "same-origin",
      });

      if (!response.ok) {
        // Handle non-2xx responses
        const errorData = await response.json();
        setError(errorData.error || "Login failed. Please try again.");
      } else {
        // Successful login
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          window.location.href = "/generate"; // Redirect on success if no callback provided
        }
      }
    } catch {
      //console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm" data-testid="login-card">
      <CardHeader>
        <CardTitle className="text-2xl" data-testid="login-title">
          Logowanie
        </CardTitle>
        <CardDescription data-testid="login-description">
          Wprowadź swój adres e-mail, aby zalogować się do konta.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} data-testid="login-form">
        <CardContent className="grid gap-4">
          <div className="grid gap-2" data-testid="email-field-container">
            <Label htmlFor="email" data-testid="email-label">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              data-testid="email-input"
              aria-invalid={error && !email ? "true" : "false"}
              data-test-scenario="login-email-field"
            />
          </div>
          <div className="grid gap-2" data-testid="password-field-container">
            <Label htmlFor="password" data-testid="password-label">
              Hasło
            </Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              data-testid="password-input"
              aria-invalid={error && !password ? "true" : "false"}
              data-test-scenario="login-password-field"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          {error && (
            <p
              className="text-red-500 text-sm mb-2 text-center w-full"
              data-testid="login-error-message"
              data-test-scenario="login-validation-error"
            >
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            data-testid="login-submit-button"
            data-test-scenario="login-submit-action"
          >
            {isLoading ? (
              <span data-testid="login-loading-state" data-test-scenario="login-in-progress">
                Logowanie...
              </span>
            ) : (
              "Zaloguj się"
            )}
          </Button>
          <div className="mt-4 text-center text-sm w-full" data-testid="login-links">
            Nie masz konta?{" "}
            <a
              href="/auth/register"
              className="underline"
              data-testid="signup-link"
              data-test-scenario="navigate-to-signup"
            >
              Zarejestruj się
            </a>
            <br />
            <a
              href="/auth/recover-password"
              className="underline text-xs"
              data-testid="forgot-password-link"
              data-test-scenario="navigate-to-password-recovery"
            >
              Zapomniałeś hasła?
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
