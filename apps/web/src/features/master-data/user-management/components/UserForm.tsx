"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User, Role, CreateUserFormData, UpdateUserFormData } from "../types";

const userFormSchema = z.object({
  email: z.string().email("Invalid email format").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  name: z.string().min(1, "Name is required"),
  role_id: z.string().min(1, "Role is required"),
  status: z.enum(["active", "inactive"]).optional(),
});

type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormProps {
  readonly defaultValues?: User;
  readonly onSubmit: (data: CreateUserFormData | UpdateUserFormData) => Promise<void>;
  readonly onCancel: () => void;
  readonly isLoading?: boolean;
  readonly roles: Role[];
  readonly isEdit?: boolean;
}

export function UserForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
  roles,
  isEdit = false,
}: UserFormProps) {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: defaultValues
      ? {
          email: defaultValues.email,
          password: undefined,
          name: defaultValues.name,
          role_id: defaultValues.role_id,
          status: defaultValues.status,
        }
      : {
          email: "",
          password: "",
          name: "",
          role_id: "",
          status: "active",
        },
  });

  const handleSubmit = async (data: UserFormData) => {
    if (isEdit) {
      const updateData: UpdateUserFormData = {
        email: data.email !== defaultValues?.email ? data.email : undefined,
        name: data.name !== defaultValues?.name ? data.name : undefined,
        role_id: data.role_id !== defaultValues?.role_id ? data.role_id : undefined,
        status: data.status !== defaultValues?.status ? data.status : undefined,
      };
      // Remove undefined values
      Object.keys(updateData).forEach((key) => {
        if (updateData[key as keyof UpdateUserFormData] === undefined) {
          delete updateData[key as keyof UpdateUserFormData];
        }
      });
      await onSubmit(updateData);
    } else {
      const createData: CreateUserFormData = {
        email: data.email,
        password: data.password || "",
        name: data.name,
        role_id: data.role_id,
        status: data.status || "active",
      };
      await onSubmit(createData);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel>Email</FieldLabel>
          <Input
            type="email"
            placeholder="user@example.com"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <FieldError>{form.formState.errors.email.message}</FieldError>
          )}
        </Field>

        {!isEdit && (
          <Field>
            <FieldLabel>Password</FieldLabel>
            <Input
              type="password"
              placeholder="••••••"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <FieldError>{form.formState.errors.password.message}</FieldError>
            )}
          </Field>
        )}

        <Field>
          <FieldLabel>Name</FieldLabel>
          <Input placeholder="John Doe" {...form.register("name")} />
          {form.formState.errors.name && (
            <FieldError>{form.formState.errors.name.message}</FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel>Role</FieldLabel>
          <Select
            onValueChange={(value) => form.setValue("role_id", value)}
            defaultValue={form.watch("role_id")}
            value={form.watch("role_id")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.role_id && (
            <FieldError>{form.formState.errors.role_id.message}</FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel>Status</FieldLabel>
          <Select
            onValueChange={(value) => form.setValue("status", value as "active" | "inactive")}
            defaultValue={form.watch("status") || "active"}
            value={form.watch("status") || "active"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.status && (
            <FieldError>{form.formState.errors.status.message}</FieldError>
          )}
        </Field>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}

