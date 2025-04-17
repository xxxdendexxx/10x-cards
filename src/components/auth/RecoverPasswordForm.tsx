import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RecoverPasswordForm() {
  // TODO: Implement state management
  // TODO: Implement form submission handler
  // TODO: Implement validation (email format)
  // TODO: Implement error/success message display

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Recover Password</CardTitle>
        <CardDescription>
          Enter your email address below. We&apos;ll send you a link to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <Button className="w-full">Send Reset Link</Button>
        <div className="mt-4 text-center text-sm">
          Remembered your password?{" "}
          <a href="/auth/login" className="underline">
            Sign in
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
