"use client"

import React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { motion } from "framer-motion"
import { Loader2, User, Mail, Phone, MapPin, Edit3, Save, Camera, Shield, Award, BookOpen } from "lucide-react"
import { notifications } from "@/lib/notifications"
import { cn } from "@/lib/utils"

/**
 * Profile Update Form Schema
 */
const profileUpdateSchema = z.object({
  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be less than 100 characters"),
  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .optional()
    .nullable(),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be less than 15 digits")
    .optional()
    .nullable()
    .or(z.literal("")),
  location: z
    .string()
    .max(100, "Location must be less than 100 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
})

type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>

interface UserProfileManagementProps {
  /**
   * Whether to show the profile in a card layout
   */
  showCard?: boolean
  /**
   * ClassName for the container
   */
  className?: string
}

/**
 * UserProfileManagement Component
 * 
 * Comprehensive profile management with:
 * - Avatar upload and management
 * - Personal information editing
 * - Role and verification badges
 * - Form validation and error handling
 * - Beautiful animations and loading states
 */
export function UserProfileManagement({ 
  showCard = true, 
  className 
}: UserProfileManagementProps) {
  const { user, profile, updateProfile, refreshProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const form = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      full_name: profile?.full_name || "",
      bio: profile?.bio || "",
      phone: profile?.phone || "",
      location: profile?.location || "",
    },
  })

  const isLoading = form.formState.isSubmitting

  /**
   * Handle profile update
   */
  const onSubmit = async (data: ProfileUpdateFormData) => {
    try {
      // Clean up empty strings to null
      const updates = {
        ...data,
        bio: data.bio?.trim() || null,
        phone: data.phone?.trim() || null,
        location: data.location?.trim() || null,
      }

      const result = await updateProfile(updates)

      if (result.success) {
        setIsEditing(false)
        await refreshProfile()
        
        notifications.showSuccess({
          title: "Profile updated!",
          description: "Your profile has been successfully updated.",
        })
      } else {
        notifications.showError({
          title: "Update failed",
          description: typeof result.error === 'string' ? result.error : result.error?.message || "Failed to update profile",
        })
      }
    } catch (error) {
      notifications.showError({
        title: "Update failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      })
    }
  }

  /**
   * Handle avatar upload
   */
  const handleAvatarUpload = async (file: File) => {
    if (!file) return

    setIsUploadingAvatar(true)
    setAvatarFile(file)

    try {
      // Create a temporary URL for preview
      const previewUrl = URL.createObjectURL(file)

      // Here you would typically upload to your storage service
      // For now, we'll simulate the upload
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Update profile with new avatar URL
      // In a real implementation, you'd get the URL from your storage service
      const result = await updateProfile({
        avatar_url: previewUrl // This would be the actual uploaded URL
      })

      if (result.success) {
        await refreshProfile()
        notifications.showSuccess({
          title: "Avatar updated!",
          description: "Your profile picture has been updated.",
        })
      } else {
        throw new Error(typeof result.error === 'string' ? result.error : result.error?.message || 'Upload failed')
      }
    } catch (error) {
      notifications.showError({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload avatar",
      })
    } finally {
      setIsUploadingAvatar(false)
      setAvatarFile(null)
    }
  }

  /**
   * Get user initials for avatar fallback
   */
  const getUserInitials = () => {
    if (!profile?.full_name) return "U"
    return profile.full_name
      .split(" ")
      .map(name => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  /**
   * Get role badge color
   */
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive'
      case 'instructor': return 'default'
      case 'group_admin': return 'secondary'
      case 'learner': return 'outline'
      default: return 'outline'
    }
  }

  /**
   * Get role icon
   */
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Shield
      case 'instructor': return BookOpen
      case 'group_admin': return Award
      case 'learner': return User
      default: return User
    }
  }

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const content = (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Avatar Section */}
        <div className="relative">
          <Avatar className="w-24 h-24">
            <AvatarImage 
              src={avatarFile ? URL.createObjectURL(avatarFile) : profile.avatar_url || undefined} 
              alt={profile.full_name || "Profile"}
            />
            <AvatarFallback className="text-lg font-semibold">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          
          {/* Upload Avatar Button */}
          <div className="absolute -bottom-2 -right-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleAvatarUpload(file)
                }
              }}
              className="hidden"
              id="avatar-upload"
              disabled={isUploadingAvatar}
            />
            <label htmlFor="avatar-upload">
              <Button
                size="sm"
                className="rounded-full w-8 h-8 p-0 shadow-lg cursor-pointer"
                disabled={isUploadingAvatar}
                asChild
              >
                <div>
                  {isUploadingAvatar ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </div>
              </Button>
            </label>
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">{profile.full_name}</h2>
              <p className="text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {user.email}
              </p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="gap-2"
            >
              <Edit3 className="h-4 w-4" />
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={getRoleBadgeVariant(profile.role)}>
              {React.createElement(getRoleIcon(profile.role), { className: "h-3 w-3 mr-1" })}
              {profile.role.replace('_', ' ').toUpperCase()}
            </Badge>
            
            {profile.email_verified && (
              <Badge variant="secondary" className="text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30">
                <Shield className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Profile Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              {...form.register("full_name")}
              disabled={!isEditing || isLoading}
              className={cn(
                !isEditing && "bg-muted/50",
                form.formState.errors.full_name && "border-destructive"
              )}
            />
            {form.formState.errors.full_name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.full_name.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                className={cn(
                  "pl-10",
                  !isEditing && "bg-muted/50",
                  form.formState.errors.phone && "border-destructive"
                )}
                disabled={!isEditing || isLoading}
                {...form.register("phone")}
              />
            </div>
            {form.formState.errors.phone && (
              <p className="text-sm text-destructive">
                {form.formState.errors.phone.message}
              </p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                placeholder="City, Country"
                className={cn(
                  "pl-10",
                  !isEditing && "bg-muted/50",
                  form.formState.errors.location && "border-destructive"
                )}
                disabled={!isEditing || isLoading}
                {...form.register("location")}
              />
            </div>
            {form.formState.errors.location && (
              <p className="text-sm text-destructive">
                {form.formState.errors.location.message}
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            placeholder="Tell us about yourself..."
            rows={4}
            className={cn(
              !isEditing && "bg-muted/50",
              form.formState.errors.bio && "border-destructive"
            )}
            disabled={!isEditing || isLoading}
            {...form.register("bio")}
          />
          {form.formState.errors.bio && (
            <p className="text-sm text-destructive">
              {form.formState.errors.bio.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              type="submit"
              className="w-full sm:w-auto gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </motion.div>
        )}
      </form>
    </div>
  )

  if (!showCard) {
    return <div className={className}>{content}</div>
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Manage your personal information and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  )
}