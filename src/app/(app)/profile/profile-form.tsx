"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { User, Mail, AtSign, Calendar, Edit2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/client";
import Link from "next/link";
import { Label } from "@/components/ui/label";

const UpdateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
});

type UpdateProfileData = z.infer<typeof UpdateProfileSchema>;

interface ProfilePageProps {
  user: (typeof authClient.$Infer.Session)["user"];
}

export default function ProfilePage({ user }: ProfilePageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  const form = useForm<UpdateProfileData>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      name: user.name || "",
    },
  });

  const onSubmit = async (data: UpdateProfileData) => {
    setIsLoading(true);

    const { error } = await authClient.updateUser({
      name: data.name,
    });

    if (error) {
      toast.error(error.message);
      handleCancelEdit();
    } else {
      toast.success("Profile updated successfully!");
      setIsEditingName(false);
    }

    setIsLoading(false);
  };

  const handleCancelEdit = () => {
    form.reset({ name: user.name || "" });
    setIsEditingName(false);
  };

  const formatDate = (dateString: Date | string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isEditingName ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                  <span className="text-sm">{user.name || "No name set"}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingName(true)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your full name"
                          {...field}
                          autoFocus
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit" disabled={isLoading} size="sm">
                    <Check className="h-4 w-4 mr-1" />
                    {isLoading ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <p className="text-sm text-muted-foreground">
            This information cannot be changed
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Mail className="h-4 w-4" />
                Email Address
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm">{user.email}</p>
                <Badge variant={user.emailVerified ? "default" : "secondary"}>
                  {user.emailVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </div>

            {user.username && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <AtSign className="h-4 w-4" />
                  Username
                </div>
                <p className="text-sm font-mono">{user.username}</p>
              </div>
            )}

            {user.displayUsername && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <User className="h-4 w-4" />
                  Display Username
                </div>
                <p className="text-sm">{user.displayUsername}</p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4" />
                Member Since
              </div>
              <p className="text-sm">{formatDate(user.createdAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Need to change your email or delete your account? Contact support
            for assistance.
          </div>
          <Button variant="outline" asChild>
            <Link href="mailto:support@quinva.visualbrahma.tech">
              Contact Support
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
