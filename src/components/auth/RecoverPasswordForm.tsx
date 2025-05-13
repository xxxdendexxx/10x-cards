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
        <CardTitle className="text-2xl">Odzyskiwanie hasła</CardTitle>
        <CardDescription>Wprowadź swój adres email poniżej. Wyślemy Ci link do zresetowania hasła.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <Button className="w-full">Wyślij link do resetowania</Button>
        <div className="mt-4 text-center text-sm">
          Przypomniałeś sobie hasło?{" "}
          <a href="/auth/login" className="underline">
            Zaloguj się
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
