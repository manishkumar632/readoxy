"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function QuizCodeInput() {
  const [quizCode, setQuizCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const router = useRouter();

  const handleStartQuiz = async () => {
    if (!quizCode.trim()) {
      toast.error("Please enter a quiz code");
      return;
    }

    try {
      setVerifying(true);
      const response = await fetch("http://localhost:5000/api/quiz/verify/quizcode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quizcode: quizCode.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid quiz code");
      }

      // Redirect to quiz page with the code
      router.push(`/quiz/${quizCode.trim()}`);
    } catch (error) {
      console.error("Error verifying quiz code:", error);
      toast.error(error instanceof Error ? error.message : "Failed to verify quiz code");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        type="text"
        placeholder="Enter quiz code"
        value={quizCode}
        onChange={(e) => setQuizCode(e.target.value.toUpperCase())}
        className="uppercase"
        maxLength={6}
      />
      <Button 
        onClick={handleStartQuiz}
        disabled={verifying || !quizCode.trim()}
      >
        {verifying ? "Verifying..." : "Start Quiz"}
      </Button>
    </div>
  );
} 