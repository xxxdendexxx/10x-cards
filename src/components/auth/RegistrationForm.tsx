import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegistrationForm() {
  // TODO: Implement state management
  // TODO: Implement form submission handler
  // TODO: Implement validation (email format, password strength, password match)
  // TODO: Implement error handling

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Sign Up</CardTitle>
        <CardDescription>Enter your information to create an account.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input id="confirm-password" type="password" required />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <Button className="w-full">Create account</Button>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <a href="/auth/login" className="underline">
            Sign in
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
