"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldGroup,
} from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Shield } from "lucide-react";

export function ProfilePageClient() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/login");
    }
  }, [isAuthenticated, user, router]);

  if (!user) {
    return null;
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-light tracking-tight text-foreground mb-2">
          Profile
        </h1>
        <p className="text-sm font-light text-muted-foreground">
          Manage your account information
        </p>
      </div>

      <Card className="border border-foreground/10 bg-background/80 backdrop-blur-md shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-center gap-6 mb-8">
            <Avatar className="h-24 w-24 border-2 border-foreground/20">
              <AvatarImage src={user.avatar_url} alt={user.name} />
              <AvatarFallback className="text-xl font-light">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-light tracking-tight text-foreground">
                {user.name}
              </h2>
              <p className="text-sm font-light text-muted-foreground mt-1">
                {user.email}
              </p>
            </div>
          </div>

          <Separator className="my-6 bg-foreground/10" />

          <FieldGroup className="space-y-6">
            <Field>
              <FieldLabel className="text-sm font-light text-foreground/70 flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name
              </FieldLabel>
              <Input
                value={user.name}
                disabled
                className="h-11 font-light bg-background/50 border-foreground/10 mt-2"
              />
            </Field>

            <Field>
              <FieldLabel className="text-sm font-light text-foreground/70 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </FieldLabel>
              <Input
                value={user.email}
                disabled
                className="h-11 font-light bg-background/50 border-foreground/10 mt-2"
              />
            </Field>

            <Field>
              <FieldLabel className="text-sm font-light text-foreground/70 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Role
              </FieldLabel>
              <Input
                value={user.role}
                disabled
                className="h-11 font-light bg-background/50 border-foreground/10 mt-2 capitalize"
              />
            </Field>
          </FieldGroup>

          <Separator className="my-6 bg-foreground/10" />

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="h-11 font-light tracking-wide uppercase border-foreground/30 text-foreground hover:border-foreground/50 hover:bg-foreground/10 bg-background/50"
              onClick={() => router.push("/orders")}
            >
              View Orders
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
