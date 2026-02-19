"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthLayout } from "./auth-layout";
import { useAuthStore } from "../stores/useAuthStore";
import { loginSchema, type LoginFormData } from "../schemas/login.schema";
import { useLogin } from "../hooks/useLogin";
import type { AuthError } from "../types/errors";
import { useRateLimitCountdown } from "@/lib/hooks/useRateLimitCountdown";
import { useRateLimitStore } from "@/lib/stores/useRateLimitStore";

interface LoginFormProps {
  readonly redirectPath?: string | null;
}

export function LoginForm({ redirectPath }: LoginFormProps) {
  const t = useTranslations("auth.login");
  const { isAuthenticated } = useAuthStore();
  const { handleLogin, isLoading, error, clearError } = useLogin(redirectPath ?? undefined);
  const [showPassword, setShowPassword] = useState(false);

  // Rate limit countdown hook - shows toast notification with countdown
  useRateLimitCountdown();

  // Get countdown text for display in form - update every second
  const resetTime = useRateLimitStore((state) => state.resetTime);
  const getCountdownText = useRateLimitStore((state) => state.getCountdownText);

  // Use tick state to trigger re-render every second for countdown updates
  // This avoids calling Date.now() during render and avoids synchronous setState in effects
  // The tick value is not used, only setTick is used to trigger re-renders
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!resetTime) {
      return;
    }

    // Update tick every second to trigger re-render and recalculate countdown
    // setTick from useState is stable and doesn't need to be in dependencies
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [resetTime]);

  // Calculate countdown text and rate limited status
  // getCountdownText() is safe to call here because it's called during render
  // and the tick state ensures it updates every second
  const countdownText = resetTime
    ? (() => {
        const text = getCountdownText();
        if (text === "a moment") {
          return null;
        }
        return text;
      })()
    : null;

  const isRateLimited = countdownText !== null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect handled by useLogin hook
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (error) {
      setError("root", {
        message: error,
      });
      clearError();
    }
  }, [error, setError, clearError]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await handleLogin(data);
      // rememberMe value is available here if needed later
    } catch (err) {
      const errorValue = err as AuthError;
      const errorMessage =
        errorValue.response?.data?.error?.message ||
        errorValue.message ||
        "Login failed. Please try again.";
      setError("root", {
        message: errorMessage,
      });
    }
  };

  const isFormLoading = isLoading || isSubmitting;

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <Card className="border border-foreground/10 bg-background/80 backdrop-blur-md shadow-lg">
          <CardHeader className="space-y-2 px-6 pb-2 pt-6">
            <CardTitle className="text-4xl font-light tracking-tight text-foreground">
              {t("title")}
            </CardTitle>
            <CardDescription className="text-sm font-light text-muted-foreground">
              {t("description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 px-6 pb-6 pt-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <FieldGroup className="space-y-4">
                <Field className="space-y-2">
                  <FieldLabel
                    htmlFor="email"
                    className="text-sm font-light text-foreground/70"
                  >
                    {t("emailLabel")}
                  </FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    {...register("email")}
                    disabled={isFormLoading}
                    aria-invalid={!!errors.email}
                    className="h-11 font-light bg-background/50 border-foreground/10"
                  />
                  {errors.email && (
                    <FieldError className="text-xs font-light">
                      {errors.email.message}
                    </FieldError>
                  )}
                </Field>

                <Field className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FieldLabel
                      htmlFor="password"
                      className="text-sm font-light text-foreground/70"
                    >
                      {t("passwordLabel")}
                    </FieldLabel>
                    <button
                      type="button"
                      className="text-xs font-light text-primary hover:underline transition-colors"
                    >
                      {t("forgotPassword")}
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("passwordPlaceholder")}
                      {...register("password")}
                      disabled={isFormLoading}
                      aria-invalid={!!errors.password}
                      className="h-11 pr-10 font-light bg-background/50 border-foreground/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isFormLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <FieldError className="text-xs font-light">
                      {errors.password.message}
                    </FieldError>
                  )}
                </Field>

                <Field>
                  <label className="flex cursor-pointer items-center gap-2">
                    <Checkbox
                      {...register("rememberMe")}
                      disabled={isFormLoading}
                    />
                    <span className="text-sm font-light text-muted-foreground">
                      {t("rememberMe")}
                    </span>
                  </label>
                </Field>

                {errors.root && (
                  <Field>
                    <FieldError className="text-xs font-light">
                      {errors.root.message}
                    </FieldError>
                  </Field>
                )}

                {/* Rate limit countdown display */}
                {countdownText && resetTime && (
                  <Field>
                    <div className="rounded-md bg-muted/50 px-3 py-2 text-sm font-light text-muted-foreground">
                      <p>
                        {t("rateLimitMessage", { countdown: countdownText }) ||
                          `Too many login attempts. Please try again in ${countdownText}.`}
                      </p>
                    </div>
                  </Field>
                )}

                <Field className="pt-1">
                  <Button
                    type="submit"
                    disabled={isFormLoading || isRateLimited}
                    className="h-11 w-full text-sm font-light tracking-wide uppercase"
                  >
                    {isFormLoading ? t("submitting") : t("submit")}
                  </Button>
                </Field>

                <Field>
                  <p className="text-center text-sm font-light text-muted-foreground">
                    {t("registerText")}{" "}
                    <Link
                      href="/register"
                      className="text-primary hover:underline transition-colors"
                    >
                      {t("registerLink")}
                    </Link>
                  </p>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </AuthLayout>
  );
}
