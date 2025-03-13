"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, UserCircle, Camera } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function SuperAdminProfile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    profileImage: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [updateType, setUpdateType] = useState<"password" | "email" | null>(
    null
  );
  const [newEmail, setNewEmail] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/superadmin/profile",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem(
                "superAdminToken"
              )}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch profile");

        const data = await response.json();
        setProfile(data);
      } catch (error) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/superadmin/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("superAdminToken")}`,
          },
          body: JSON.stringify({
            ...profile,
            ...(newPassword && { password: newPassword }),
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update profile");

      toast.success("Profile updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        "http://localhost:5000/api/superadmin/profile/image",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("superAdminToken")}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to upload image");

      const data = await response.json();
      setProfile((prev) => ({ ...prev, profileImage: data.imageUrl }));
      toast.success("Profile image updated successfully");
    } catch (error) {
      toast.error("Failed to upload image");
      setImagePreview(profile.profileImage); // Reset preview on error
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleRequestVerification = async (type: "password" | "email") => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/superadmin/request-verification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("superAdminToken")}`,
          },
          body: JSON.stringify({
            type,
            ...(type === "email" && { newEmail }),
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to send verification code");

      setUpdateType(type);
      setIsVerifying(true);
      toast.success("Verification code sent to your email");
    } catch (error) {
      toast.error("Failed to send verification code");
    }
  };

  const handleVerifyAndUpdate = async () => {
    if (!verificationCode) {
      toast.error("Please enter verification code");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/superadmin/verify-update",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("superAdminToken")}`,
          },
          body: JSON.stringify({
            code: verificationCode,
            type: updateType,
            ...(updateType === "password" && { newPassword }),
            ...(updateType === "email" && { newEmail }),
          }),
        }
      );

      if (!response.ok) throw new Error("Invalid verification code");

      toast.success(
        `${
          updateType === "password" ? "Password" : "Email"
        } updated successfully`
      );
      setIsVerifying(false);
      setVerificationCode("");
      setUpdateType(null);

      if (updateType === "email") {
        setProfile((prev) => ({ ...prev, email: newEmail }));
        setNewEmail("");
      } else {
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      toast.error("Failed to verify code");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="h-6 w-6" />
            Profile Settings
          </CardTitle>
          <CardDescription>
            Manage your super admin profile and security settings
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleUpdateProfile}>
          <CardContent className="space-y-6">
            {/* Profile Image Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-100">
                  {imagePreview || profile.profileImage ? (
                    <img
                      src={imagePreview || profile.profileImage}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-100">
                      <UserCircle className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full"
                  onClick={triggerImageUpload}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                title="Upload Profile Image"
              />
            </div>

            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={profile.username}
                onChange={(e) =>
                  setProfile({ ...profile, username: e.target.value })
                }
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  value={newEmail || profile.email}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
                {newEmail && newEmail !== profile.email && (
                  <Button
                    type="button"
                    onClick={() => handleRequestVerification("email")}
                  >
                    Verify Email
                  </Button>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {newPassword &&
                confirmPassword &&
                newPassword === confirmPassword && (
                  <Button
                    type="button"
                    onClick={() => handleRequestVerification("password")}
                  >
                    Verify Password Change
                  </Button>
                )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="ml-auto">
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Verification Dialog */}
      <Dialog open={isVerifying} onOpenChange={setIsVerifying}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Verification Code</DialogTitle>
            <DialogDescription>
              Please enter the verification code sent to your email
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
            />
            <Button onClick={handleVerifyAndUpdate} className="w-full">
              Verify and Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
