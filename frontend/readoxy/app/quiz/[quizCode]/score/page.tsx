"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import "./styles.css";

interface Option {
  value: string;
  isCorrect: boolean;
  isSelected: boolean;
}

interface DetailedResult {
  questionId: string;
  question: string;
  correct: boolean;
  options: Option[];
  explanation?: string | null;
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  grade: string;
  isBestScore: boolean;
  detailedResults: DetailedResult[];
}

const ScorePage = () => {
  const router = useRouter();
  const params = useParams();
  const quizCode = params?.quizCode as string;
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuizResults = async () => {
      try {
        // First check if we already have results in localStorage
        const storedResults = localStorage.getItem("quizResults");
        
        if (storedResults) {
          // If we already have results, use them
          setQuizResult(JSON.parse(storedResults));
          setLoading(false);
          return;
        }
        
        // If no stored results, check for quiz data
        const storedQuestions = JSON.parse(localStorage.getItem("quizQuestions") || "[]");
        const storedUserAnswers = JSON.parse(localStorage.getItem("userAnswers") || "{}");
        
        // If no quiz data, don't redirect immediately, try to fetch from API first
        if (storedQuestions.length === 0 || Object.keys(storedUserAnswers).length === 0) {
          console.log("No quiz data found in localStorage, attempting to fetch from API");
          
          // We'll continue and try to fetch from API based on the quizCode
          // This handles cases where the user refreshes the score page
          if (!quizCode) {
            toast.error("No quiz code found");
            router.push("/");
            return;
          }
          
          // Try to fetch the latest quiz result for this code
          try {
            const token = localStorage.getItem("userToken");
            if (!token) {
              toast.error("You must be logged in to view quiz results");
              router.push("/auth/login");
              return;
            }
            
            const response = await fetch(`http://localhost:5000/api/quiz/result/${quizCode}`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            
            if (!response.ok) {
              throw new Error("Failed to fetch quiz results");
            }
            
            const result = await response.json();
            setQuizResult(result);
            setLoading(false);
            return;
          } catch (error) {
            console.error("Error fetching quiz results:", error);
            toast.error("No quiz data available");
            
            // Only redirect after trying to fetch from API
            setTimeout(() => {
              router.push("/");
            }, 2000);
            return;
          }
        }
        
        // Convert user answers to the format expected by the backend
        const answers = storedQuestions.map((question: any) => ({
          questionId: question._id,
          selectedOptions: storedUserAnswers[question._id] || []
        }));

        const response = await fetch("http://localhost:5000/api/quiz/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("userToken")}`
          },
          body: JSON.stringify({ answers })
        });

        if (!response.ok) {
          throw new Error("Failed to submit quiz");
        }

        const result = await response.json();
        setQuizResult(result);
        
        // Store results in localStorage to prevent resubmission
        localStorage.setItem("quizResults", JSON.stringify(result));

        // Clean up localStorage
        localStorage.removeItem("quizQuestions");
        localStorage.removeItem("userAnswers");
      } catch (error) {
        console.error("Error loading quiz results:", error);
        toast.error("Failed to load quiz results");
      } finally {
        setLoading(false);
      }
    };

    loadQuizResults();
    
    // Don't clear results when component unmounts
    // This allows the results to persist if the user navigates away and back
  }, [router, quizCode]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading quiz results...</p>
      </div>
    );
  }

  if (!quizResult) {
    return (
      <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
        <p>No results found. Please try again.</p>
        <Button onClick={() => router.push("/")}>Go to Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row max-w-7xl mx-auto gap-8 h-screen overflow-auto p-4">
        <div className="md:w-1/3">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Quiz Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center">
                <div className="h-44 w-44 flex items-center justify-center text-3xl font-bold text-orange-500 p-8 rounded-full bg-green-300">
                  {quizResult.score} / {quizResult.totalQuestions}
                </div>
                <p className="text-xl mt-4">{quizResult.percentage}%</p>
                <p className="text-lg font-semibold text-gray-700">{quizResult.grade}</p>
                {quizResult.isBestScore && (
                  <p className="text-green-600 font-bold mt-2">🎉 New Best Score!</p>
                )}
              </div>
              <Button 
                onClick={() => router.push("/profile")} 
                className="w-full bg-black text-white hover:bg-gray-800"
              >
                View Quiz History
              </Button>
              <Button 
                onClick={() => router.push("/")}
                variant="outline" 
                className="w-full"
              >
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-2/3">
          <h2 className="text-xl font-bold mb-4">Detailed Results</h2>
          {quizResult.detailedResults.map((result, index) => (
            <Card key={result.questionId} className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white ${result.correct ? "bg-green-500" : "bg-red-500"}`}>
                    {result.correct ? "✓" : "✗"}
                  </span>
                  <span>Question {index + 1}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <p className="font-medium mb-4">{result.question}</p>
                
                <div className="space-y-2">
                  {result.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`p-3 rounded-md ${
                        option.isCorrect && option.isSelected
                          ? "bg-green-100" 
                          : option.isCorrect
                          ? "bg-green-100" 
                          : option.isSelected
                          ? "bg-red-100" 
                          : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">
                          {option.isSelected && option.isCorrect && (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white text-xs">✓</span>
                          )}
                          {option.isSelected && !option.isCorrect && (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs">✗</span>
                          )}
                          {!option.isSelected && option.isCorrect && (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white text-xs">✓</span>
                          )}
                          {!option.isSelected && !option.isCorrect && (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-300 text-white text-xs"></span>
                          )}
                        </div>
                        <span>{option.value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {result.explanation && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">Explanation:</span> {result.explanation}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScorePage;
