"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUserAuth } from "@/lib/context/UserAuthContext";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Trash2, Upload } from "lucide-react";
import Image from "next/image";

interface UserProfile {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  bio: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  profileImage?: string;
}

export default function SettingsPage() {
  const { user, isAuthenticated } = useUserAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<UserProfile>({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    bio: "",
    dateOfBirth: "",
    gender: "",
    phoneNumber: "",
    profileImage: "",
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        // Fetch user profile from API
        const response = await fetch("http://localhost:5000/api/user/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProfile({
            username: data.username || user?.username || "",
            email: data.email || user?.email || "",
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            bio: data.bio || "",
            dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split("T")[0] : "",
            gender: data.gender || "",
            phoneNumber: data.phoneNumber || "",
            profileImage: data.profileImage || "",
          });
        } else {
          // If API fails, use data from context
          setProfile({
            username: user?.username || "",
            email: user?.email || "",
            firstName: "",
            lastName: "",
            bio: "",
            dateOfBirth: "",
            gender: "",
            phoneNumber: "",
            profileImage: "",
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        // Use data from context as fallback
        setProfile({
          username: user?.username || "",
          email: user?.email || "",
          firstName: "",
          lastName: "",
          bio: "",
          dateOfBirth: "",
          gender: "",
          phoneNumber: "",
          profileImage: "",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, isAuthenticated, router]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenderChange = (value: string) => {
    setProfile((prev) => ({ ...prev, gender: value }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const response = await fetch("http://localhost:5000/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        toast.success("Profile updated successfully");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating your profile");
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setUpdating(true);

    try {
      const response = await fetch("http://localhost:5000/api/user/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (response.ok) {
        toast.success("Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("An error occurred while updating your password");
    } finally {
      setUpdating(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await fetch("http://localhost:5000/api/user/profile-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => ({ ...prev, profileImage: data.profileImage }));
        toast.success("Profile image uploaded successfully");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to upload profile image");
      }
    } catch (error) {
      console.error("Error uploading profile image:", error);
      toast.error("An error occurred while uploading your profile image");
    } finally {
      setUploadingImage(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteImage = async () => {
    if (!profile.profileImage) return;

    setUploadingImage(true);

    try {
      const response = await fetch("http://localhost:5000/api/user/profile-image", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });

      if (response.ok) {
        setProfile(prev => ({ ...prev, profileImage: "" }));
        toast.success("Profile image deleted successfully");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to delete profile image");
      }
    } catch (error) {
      console.error("Error deleting profile image:", error);
      toast.error("An error occurred while deleting your profile image");
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="flex justify-center items-center min-h-screen">
          <p>Loading settings...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
          
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Profile Information</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and profile details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center mb-8">
                    <div className="relative mb-4">
                      <Avatar className="h-32 w-32 cursor-pointer" onClick={handleImageClick}>
                        {profile.profileImage ? (
                          <AvatarImage 
                            src={profile.profileImage} 
                            alt={profile.username} 
                          />
                        ) : (
                          <AvatarFallback className="bg-blue-100 text-blue-800 text-2xl">
                            {profile.firstName && profile.lastName 
                              ? `${profile.firstName[0]}${profile.lastName[0]}`
                              : profile.username?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Camera className="h-8 w-8 text-white" />
                        </div>
                      </Avatar>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleImageClick}
                        disabled={uploadingImage}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingImage ? "Uploading..." : "Upload Image"}
                      </Button>
                      {profile.profileImage && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDeleteImage}
                          disabled={uploadingImage}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          name="username"
                          value={profile.username}
                          onChange={handleProfileChange}
                          placeholder="Username"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={profile.email}
                          onChange={handleProfileChange}
                          placeholder="Email address"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={profile.firstName}
                          onChange={handleProfileChange}
                          placeholder="First name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={profile.lastName}
                          onChange={handleProfileChange}
                          placeholder="Last name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          name="dateOfBirth"
                          type="date"
                          value={profile.dateOfBirth}
                          onChange={handleProfileChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                          value={profile.gender}
                          onValueChange={handleGenderChange}
                        >
                          <SelectTrigger id="gender">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          name="phoneNumber"
                          value={profile.phoneNumber}
                          onChange={handleProfileChange}
                          placeholder="Phone number"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={profile.bio}
                        onChange={handleProfileChange}
                        placeholder="Tell us about yourself"
                        rows={4}
                      />
                    </div>
                    
                    <Button type="submit" disabled={updating}>
                      {updating ? "Updating..." : "Update Profile"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter your current password"
                          required
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter your new password"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm your new password"
                          required
                        />
                      </div>
                    </div>
                    
                    <Button type="submit" disabled={updating}>
                      {updating ? "Updating..." : "Change Password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
} 