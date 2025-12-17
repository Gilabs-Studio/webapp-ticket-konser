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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { Role, CreateRoleFormData, UpdateRoleFormData } from "../types";

const roleFormSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").max(50, "Code must be at most 50 characters").optional(),
  name: z.string().min(3, "Name must be at least 3 characters").max(255, "Name must be at most 255 characters"),
  description: z.string().optional(),
  is_admin: z.boolean().optional(),
  can_login_admin: z.boolean().optional(),
});

type RoleFormData = z.infer<typeof roleFormSchema>;

interface RoleFormProps {
  readonly defaultValues?: Role;
  readonly onSubmit: (data: CreateRoleFormData | UpdateRoleFormData) => Promise<void>;
  readonly onCancel: () => void;
  readonly isLoading?: boolean;
  readonly isEdit?: boolean;
}

export function RoleForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
  isEdit = false,
}: RoleFormProps) {
  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: defaultValues
      ? {
          code: defaultValues.code,
          name: defaultValues.name,
          description: defaultValues.description || "",
          is_admin: defaultValues.is_admin,
          can_login_admin: defaultValues.can_login_admin,
        }
      : {
          code: "",
          name: "",
          description: "",
          is_admin: false,
          can_login_admin: true,
        },
  });

  const handleSubmit = async (data: RoleFormData) => {
    if (isEdit) {
      const updateData: UpdateRoleFormData = {};
      
      // Only include fields that have changed
      if (data.name !== defaultValues?.name) {
        updateData.name = data.name;
      }
      if (data.description !== defaultValues?.description) {
        updateData.description = data.description || "";
      }
      if (data.is_admin !== defaultValues?.is_admin) {
        updateData.is_admin = data.is_admin;
      }
      if (data.can_login_admin !== defaultValues?.can_login_admin) {
        updateData.can_login_admin = data.can_login_admin;
      }
      
      await onSubmit(updateData);
    } else {
      if (!data.code || data.code.trim() === "") {
        form.setError("code", { message: "Code is required" });
        return;
      }
      const createData: CreateRoleFormData = {
        code: data.code.trim(),
        name: data.name,
        description: data.description || "",
        is_admin: data.is_admin || false,
        can_login_admin: data.can_login_admin ?? true,
      };
      await onSubmit(createData);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        {!isEdit && (
          <Field>
            <FieldLabel>Code</FieldLabel>
            <Input
              placeholder="admin"
              {...form.register("code")}
            />
            {form.formState.errors.code && (
              <FieldError>{form.formState.errors.code.message}</FieldError>
            )}
          </Field>
        )}

        <Field>
          <FieldLabel>Name</FieldLabel>
          <Input placeholder="Admin" {...form.register("name")} />
          {form.formState.errors.name && (
            <FieldError>{form.formState.errors.name.message}</FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel>Description</FieldLabel>
          <Textarea
            placeholder="Role description..."
            {...form.register("description")}
            rows={3}
          />
          {form.formState.errors.description && (
            <FieldError>{form.formState.errors.description.message}</FieldError>
          )}
        </Field>

        <Field>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_admin"
              checked={form.watch("is_admin") || false}
              onCheckedChange={(checked) =>
                form.setValue("is_admin", checked === true, { shouldValidate: true })
              }
            />
            <label
              htmlFor="is_admin"
              className="text-sm font-medium leading-none cursor-pointer"
            >
              Is Admin
            </label>
          </div>
        </Field>

        <Field>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="can_login_admin"
              checked={form.watch("can_login_admin") ?? true}
              onCheckedChange={(checked) =>
                form.setValue("can_login_admin", checked === true, { shouldValidate: true })
              }
            />
            <label
              htmlFor="can_login_admin"
              className="text-sm font-medium leading-none cursor-pointer"
            >
              Can Login Admin
            </label>
          </div>
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

