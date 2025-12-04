"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
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

export function LoginForm() {
  const t = useTranslations("auth.login");
  const { isAuthenticated } = useAuthStore();
  const { handleLogin, isLoading, error, clearError } = useLogin();

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
        <Card className="border border-border/60 bg-card/90 shadow-sm">
          <CardHeader className="space-y-2 px-6 pb-2 pt-6">
            <CardTitle className="text-2xl">{t("title")}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {t("description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 px-6 pb-6 pt-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <FieldGroup className="space-y-4">
                <Field className="space-y-2">
                  <FieldLabel htmlFor="email">{t("emailLabel")}</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    {...register("email")}
                    disabled={isFormLoading}
                    aria-invalid={!!errors.email}
                    className="h-11"
                  />
                  {errors.email && (
                    <FieldError>{errors.email.message}</FieldError>
                  )}
                </Field>

                <Field className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="password">{t("passwordLabel")}</FieldLabel>
                    <button
                      type="button"
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      {t("forgotPassword")}
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t("passwordPlaceholder")}
                    {...register("password")}
                    disabled={isFormLoading}
                    aria-invalid={!!errors.password}
                    className="h-11"
                  />
                  {errors.password && (
                    <FieldError>{errors.password.message}</FieldError>
                  )}
                </Field>

              <Field>
                <label className="flex cursor-pointer items-center gap-2">
                  <Checkbox
                    {...register("rememberMe")}
                    disabled={isFormLoading}
                  />
                  <span className="text-sm text-muted-foreground">
                    {t("rememberMe")}
                  </span>
                </label>
              </Field>

                {errors.root && (
                  <Field>
                    <FieldError>{errors.root.message}</FieldError>
                  </Field>
                )}

                <Field className="pt-1">
                  <Button
                    type="submit"
                    disabled={isFormLoading}
                    className="h-11 w-full text-sm font-semibold tracking-wide"
                  >
                    {isFormLoading ? t("submitting") : t("submit")}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </AuthLayout>
  );
}
