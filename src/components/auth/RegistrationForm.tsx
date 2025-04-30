import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const formSchema = z
  .object({
    email: z.string().email("Podaj poprawny adres email"),
    password: z.string().min(6, "Hasło musi mieć minimum 6 znaków"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są zgodne",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

export default function RegistrationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error === "email_exists") {
          setError("Ten adres email jest już zarejestrowany");
        } else if (result.error === "validation_error") {
          // W przypadku błędów walidacji po stronie serwera
          setError("Sprawdź poprawność wprowadzonych danych");
        } else {
          setError("Wystąpił błąd podczas rejestracji");
        }
        return;
      }

      // Rejestracja powiodła się, pokazujemy dialog z powiadomieniem
      setRegisteredEmail(data.email);
      setShowSuccessDialog(true);
    } catch (err) {
      console.error("Error during registration:", err);
      setError("Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedirectToLogin = () => {
    window.location.href = "/auth/login";
  };

  return (
    <>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Zarejestruj się</CardTitle>
          <CardDescription>Utwórz nowe konto, aby korzystać z aplikacji.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="grid gap-4">
              {error && <div className="p-3 text-sm border border-red-300 bg-red-50 text-red-600 rounded">{error}</div>}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="m@example.com" type="email" disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hasło</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Potwierdź hasło</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col items-start">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Tworzenie konta..." : "Utwórz konto"}
              </Button>
              <div className="mt-4 text-center text-sm">
                Masz już konto?{" "}
                <a href="/auth/login" className="underline">
                  Zaloguj się
                </a>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konto utworzone pomyślnie!</DialogTitle>
            <DialogDescription>
              Twoje konto z adresem email {registeredEmail} zostało pomyślnie utworzone. Po kliknięciu przycisku
              &quot;Rozumiem&quot; zostaniesz przekierowany na stronę logowania.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleRedirectToLogin} className="w-full">
              Rozumiem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
