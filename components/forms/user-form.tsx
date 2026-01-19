"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createUserSchema, type CreateUserInput } from "@/lib/validations";
import { ROLES } from "@/lib/constants";
import { Loader2 } from "lucide-react";
import type { UserWithStats } from "@/types";

interface UserFormProps {
  user?: UserWithStats | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!user;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(
      isEditing
        ? createUserSchema.partial({ password: true })
        : createUserSchema
    ),
    defaultValues: {
      email: user?.email || "",
      name: user?.name || "",
      role: user?.role || "VALIDATOR",
      password: "",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: CreateUserInput) => {
    setIsSubmitting(true);

    try {
      const url = isEditing ? `/api/users/${user.id}` : "/api/users";
      const method = isEditing ? "PATCH" : "POST";

      // Remove empty password for edit mode
      const submitData = { ...data };
      if (isEditing && !submitData.password) {
        delete (submitData as { password?: string }).password;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save user");
      }

      toast({
        title: "Success",
        description: isEditing
          ? "User updated successfully"
          : "User created successfully",
      });

      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save user",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          placeholder="Enter full name"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-vodafone-red">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter email address"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-vodafone-red">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          Password {isEditing && "(leave blank to keep current)"}
        </Label>
        <Input
          id="password"
          type="password"
          placeholder={isEditing ? "••••••••" : "Enter password"}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-vodafone-red">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Role</Label>
        <Select
          value={selectedRole}
          onValueChange={(value) =>
            setValue("role", value as CreateUserInput["role"])
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                <div>
                  <span className="font-medium">{role.label}</span>
                  <span className="text-gray-500 ml-2 text-xs">
                    - {role.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-sm text-vodafone-red">{errors.role.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isEditing ? (
            "Update User"
          ) : (
            "Create User"
          )}
        </Button>
      </div>
    </form>
  );
}
