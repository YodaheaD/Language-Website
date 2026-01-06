"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "./AuthSession";
// Login form schema using Zod
const loginSchema = z.object({
  username: z
    .string()
    .min(1, "username is required"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters long"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function testConnection() {
    setIsTestingConnection(true);
    
    try {
      const response = await fetch(`/api/test/secure`, {
        method: "GET",
        credentials: "include", // Important for session cookies
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Connection successful! ${data.secret}`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Not authenticated");
      }
    } catch (error) {
      toast.error("Failed to test connection");
    } finally {
      setIsTestingConnection(false);
    }
  }

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Important for session cookies
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      toast.success("Login successful!");
      login(); // Refresh auth status after successful login

      // Optional: redirect after success
      // router.push("/dashboard");
    } catch (error) {
      toast.error((error as Error).message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <Card className="w-full max-w-sm sm:max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl sm:text-2xl">
            Login to your account
          </CardTitle>
          <CardDescription>Enter your username and password below</CardDescription>
          <CardAction>
            <Button variant="link" className="px-0">
              Sign Up
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* username */}
            <div className="grid gap-2">
              <label htmlFor="username">username</label>
              <Input
                id="username"
                type="username"
                placeholder="m@example.com"
                {...register("username")}
                className={errors.username ? "border-red-500" : ""}
              />
              {errors.username && (
                <span className="text-sm text-red-500">
                  {errors.username.message}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="grid gap-2">
              <div className="flex items-center">
                <label htmlFor="password">Password</label>
                <a
                  href="#"
                  className="ml-auto text-sm underline-offset-4 hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <span className="text-sm text-red-500">
                  {errors.password.message}
                </span>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              disabled={isTestingConnection}
              onClick={testConnection}
            >
              {isTestingConnection ? "Testing..." : "Test Connection"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          Secured with HTTPS
        </CardFooter>
      </Card>
    </div>
  );
}
