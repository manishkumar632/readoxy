"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserAuth } from "@/lib/context/UserAuthContext";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface QuizAttempt {
  _id: string;
  date: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  grade: string;
  detailedResults: {
    questionId: string;
    question: string;
    correct: boolean;
    explanation?: string;
  }[];
}

export default function ProfilePage() {
  const { user } = useUserAuth();
  const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>([]);
  const [bestScore, setBestScore] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user profile
        const profileResponse = await fetch("http://localhost:5000/api/user/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.profileImage) {
            setProfileImage(profileData.profileImage);
          }
        }

        // Fetch quiz history
        const historyResponse = await fetch("http://localhost:5000/api/user/quiz-history", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        });

        if (!historyResponse.ok) {
          throw new Error("Failed to fetch quiz history");
        }

        const data = await historyResponse.json();
        setQuizHistory(data);

        // Find best score
        const best = data.reduce((prev: QuizAttempt | null, current: QuizAttempt) => {
          if (!prev || current.score > prev.score) {
            return current;
          }
          return prev;
        }, null);
        setBestScore(best);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <>
        <div className="flex justify-center items-center min-h-screen">
          <p>Loading profile...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* User Info */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Profile</CardTitle>
              <Button variant="outline" asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  {profileImage ? (
                    <AvatarImage 
                      src={`http://localhost:5000${profileImage}`} 
                      alt={user?.username} 
                    />
                  ) : (
                    <AvatarFallback className="bg-blue-100 text-blue-800 text-xl">
                      {user?.username?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="space-y-2">
                  <p className="text-lg font-medium">{user?.username}</p>
                  <p className="text-gray-500">{user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Best Score */}
          {bestScore && (
            <Card>
              <CardHeader>
                <CardTitle>Best Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 flex items-center justify-center text-2xl font-bold text-orange-500 rounded-full bg-green-100">
                    {bestScore.score}/{bestScore.totalQuestions}
                  </div>
                  <div>
                    <p className="text-xl font-semibold">{bestScore.percentage}%</p>
                    <p className="text-lg text-gray-700">{bestScore.grade}</p>
                    <p className="text-sm text-gray-500">
                      Achieved on {new Date(bestScore.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quiz History */}
          <Card>
            <CardHeader>
              <CardTitle>Quiz History</CardTitle>
            </CardHeader>
            <CardContent>
              {quizHistory.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  You haven't taken any quizzes yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {quizHistory.map((attempt) => (
                    <Card key={attempt._id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              Score: {attempt.score}/{attempt.totalQuestions} ({attempt.percentage}%)
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(attempt.date).toLocaleDateString()}
                            </p>
                            <p className="text-sm font-medium text-gray-700">
                              Grade: {attempt.grade}
                            </p>
                          </div>
                          <div className="h-16 w-16 flex items-center justify-center text-lg font-bold rounded-full bg-gray-100">
                            {attempt.percentage}%
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
} 