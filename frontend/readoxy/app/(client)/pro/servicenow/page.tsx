"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useUserAuth } from "@/lib/context/UserAuthContext";
import QuizCodeInput from "@/app/components/QuizCodeInput";

export default function ServiceNowQuizPage() {
  const router = useRouter();
  const { isAuthenticated } = useUserAuth();
  const [requesting, setRequesting] = useState(false);

  const handleGetQuizCode = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to get a quiz code", {
        description: "You need to be logged in to request a quiz code",
        action: {
          label: "Log in",
          onClick: () => router.push("/auth/login"),
        },
      });
      return;
    }

    try {
      setRequesting(true);
      const response = await fetch("http://localhost:5000/api/quiz/generate-code", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate quiz code");
      }

      toast.success("Quiz code generated!", {
        description: "Check your email for the quiz code. It will expire in 24 hours.",
      });
    } catch (error) {
      console.error("Error generating quiz code:", error);
      toast.error("Failed to generate quiz code", {
        description: error instanceof Error ? error.message : "Please try again later",
      });
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">ServiceNow Quiz</CardTitle>
            <CardDescription>
              Test your knowledge of ServiceNow with our comprehensive quiz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose max-w-none">
              <h3>About this Quiz</h3>
              <ul>
                <li>10 questions covering various ServiceNow topics</li>
                <li>Mix of multiple choice and single choice questions</li>
                <li>Time limit: 20 minutes</li>
                <li>Immediate feedback and detailed explanations</li>
                <li>Score tracking and performance history</li>
              </ul>

              <h3>Instructions</h3>
              <ol>
                <li>Request a quiz code by clicking the button below</li>
                <li>Check your email for the quiz code</li>
                <li>Enter the code to start the quiz</li>
                <li>Answer all questions within the time limit</li>
                <li>Submit your answers to see your results</li>
              </ol>
            </div>

            <Separator className="my-6" />

            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <Button 
                  onClick={handleGetQuizCode} 
                  disabled={requesting}
                  size="lg"
                  className="w-full max-w-md"
                >
                  {requesting ? "Generating Code..." : "Get Quiz Code"}
                </Button>
                {!isAuthenticated && (
                  <p className="text-sm text-gray-500">
                    Please{" "}
                    <Button 
                      variant="link" 
                      className="p-0 h-auto font-semibold"
                      onClick={() => router.push("/auth/login")}
                    >
                      log in
                    </Button>
                    {" "}to request a quiz code
                  </p>
                )}
              </div>

              <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-gray-500">Already have a code?</p>
                <div className="w-full max-w-md">
                  <QuizCodeInput />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
