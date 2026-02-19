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
import { AuthLayout } from "./auth-layout";
import { registerSchema, type RegisterFormData } from "../schemas/register.schema";
import { useRegister } from "../hooks/useRegister";

interface RegisterFormProps {
  readonly redirectPath?: string | null;
}

export function RegisterForm({ redirectPath }: RegisterFormProps) {
  const t = useTranslations("auth.register");
  const { handleRegister, isLoading, error, clearError } = useRegister(
    redirectPath ?? undefined,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  useEffect(() => {
    if (error) {
      setError("root", { message: error });
      clearError();
    }
  }, [error, setError, clearError]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await handleRegister(data);
    } catch {
      // Error already set via useEffect above
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
                {/* Name */}
                <Field className="space-y-2">
                  <FieldLabel
                    htmlFor="name"
                    className="text-sm font-light text-foreground/70"
                  >
                    {t("nameLabel")}
                  </FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    placeholder={t("namePlaceholder")}
                    {...register("name")}
                    disabled={isFormLoading}
                    aria-invalid={!!errors.name}
                    className="h-11 font-light bg-background/50 border-foreground/10"
                  />
                  {errors.name && (
                    <FieldError className="text-xs font-light">
                      {errors.name.message}
                    </FieldError>
                  )}
                </Field>

                {/* Email */}
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

                {/* Password */}
                <Field className="space-y-2">
                  <FieldLabel
                    htmlFor="password"
                    className="text-sm font-light text-foreground/70"
                  >
                    {t("passwordLabel")}
                  </FieldLabel>
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
                      aria-label={showPassword ? "Hide password" : "Show password"}
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

                {/* Confirm Password */}
                <Field className="space-y-2">
                  <FieldLabel
                    htmlFor="confirm_password"
                    className="text-sm font-light text-foreground/70"
                  >
                    {t("confirmPasswordLabel")}
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      type={showConfirm ? "text" : "password"}
                      placeholder={t("confirmPasswordPlaceholder")}
                      {...register("confirm_password")}
                      disabled={isFormLoading}
                      aria-invalid={!!errors.confirm_password}
                      className="h-11 pr-10 font-light bg-background/50 border-foreground/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      disabled={isFormLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirm_password && (
                    <FieldError className="text-xs font-light">
                      {errors.confirm_password.message}
                    </FieldError>
                  )}
                </Field>

                {errors.root && (
                  <Field>
                    <FieldError className="text-xs font-light">
                      {errors.root.message}
                    </FieldError>
                  </Field>
                )}

                <Field className="pt-1">
                  <Button
                    type="submit"
                    disabled={isFormLoading}
                    className="h-11 w-full text-sm font-light tracking-wide uppercase"
                  >
                    {isFormLoading ? t("submitting") : t("submit")}
                  </Button>
                </Field>

                <Field>
                  <p className="text-center text-sm font-light text-muted-foreground">
                    {t("loginText")}{" "}
                    <Link
                      href="/login"
                      className="text-primary hover:underline transition-colors"
                    >
                      {t("loginLink")}
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
