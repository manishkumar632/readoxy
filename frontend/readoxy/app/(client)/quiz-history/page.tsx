"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserAuth } from "@/lib/context/UserAuthContext";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Calendar, ChevronDown, ChevronUp, Clock, Info } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
    options?: {
      value: string;
      isCorrect: boolean;
      isSelected: boolean;
    }[];
    explanation?: string;
  }[];
  submittedAt: string;
}

export default function QuizHistoryPage() {
  const { user, isAuthenticated, loading } = useUserAuth();
  const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>([]);
  const [bestScore, setBestScore] = useState<QuizAttempt | null>(null);
  const [fetchingData, setFetchingData] = useState(true);
  const [expandedAttempt, setExpandedAttempt] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated
    if (!loading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    const fetchQuizHistory = async () => {
      try {
        setFetchingData(true);
        const token = localStorage.getItem("userToken");

        const response = await fetch("http://localhost:5000/api/user/quiz-history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch quiz history");
        }

        const data = await response.json();
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
        console.error("Error fetching quiz history:", error);
        toast.error("Failed to load quiz history");
      } finally {
        setFetchingData(false);
      }
    };

    if (isAuthenticated) {
      fetchQuizHistory();
    }
  }, [isAuthenticated, loading, router]);

  // Format data for the charts
  const chartData = quizHistory
    .slice()
    .reverse()
    .map((attempt) => ({
      date: new Date(attempt.date).toLocaleDateString(),
      score: attempt.percentage,
    }));

  const toggleAttemptDetails = (attemptId: string) => {
    if (expandedAttempt === attemptId) {
      setExpandedAttempt(null);
    } else {
      setExpandedAttempt(attemptId);
    }
  };

  if (loading || fetchingData) {
    return (
      <>
        <div className="flex justify-center items-center min-h-screen">
          <p>Loading quiz history...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Quiz History</h1>

          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="history">All Attempts</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="summary">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total Quizzes Attempted</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold">{quizHistory.length}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Average Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold">
                      {quizHistory.length > 0
                        ? Math.round(
                            quizHistory.reduce((sum, attempt) => sum + attempt.percentage, 0) /
                              quizHistory.length
                          )
                        : 0}
                      %
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Best Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {bestScore ? (
                      <div className="flex items-center gap-4">
                        <p className="text-4xl font-bold">{bestScore.percentage}%</p>
                        <div>
                          <Badge>{bestScore.grade}</Badge>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(bestScore.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p>No quizzes attempted yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {quizHistory.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Performance</CardTitle>
                    <CardDescription>Your last 5 quiz attempts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData.slice(0, 5)}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Legend />
                          <Bar
                            dataKey="score"
                            name="Score (%)"
                            fill="#8884d8"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-10">
                    <p className="text-center text-gray-500">
                      You haven't taken any quizzes yet. Complete a quiz to see your performance.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history">
              <div className="space-y-4">
                {quizHistory.length > 0 ? (
                  quizHistory.map((attempt) => (
                    <Card key={attempt._id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">
                              Quiz on {new Date(attempt.date).toLocaleDateString()}
                            </CardTitle>
                            <Badge
                              variant={attempt.percentage >= 70 ? "default" : "destructive"}
                            >
                              {attempt.percentage}%
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAttemptDetails(attempt._id)}
                          >
                            {expandedAttempt === attempt._id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            {new Date(attempt.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-4 w-4" />
                            {new Date(attempt.submittedAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium">Score</p>
                            <p className="text-xl font-bold">
                              {attempt.score}/{attempt.totalQuestions}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Percentage</p>
                            <p className="text-xl font-bold">{attempt.percentage}%</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Grade</p>
                            <p className="text-xl font-bold">{attempt.grade}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Correct Answers</p>
                            <p className="text-xl font-bold">{attempt.score}</p>
                          </div>
                        </div>

                        {expandedAttempt === attempt._id && (
                          <div className="mt-4 border-t pt-4">
                            <h3 className="font-medium mb-2">Detailed Results</h3>
                            <Accordion type="single" collapsible className="w-full">
                              {attempt.detailedResults.map((result, index) => (
                                <AccordionItem key={result.questionId} value={result.questionId}>
                                  <AccordionTrigger>
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white ${
                                          result.correct ? "bg-green-500" : "bg-red-500"
                                        }`}
                                      >
                                        {result.correct ? "✓" : "✗"}
                                      </span>
                                      <span>Question {index + 1}</span>
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <p className="font-medium mb-2">{result.question}</p>
                                    
                                    {result.options ? (
                                      <div className="space-y-2 mt-2">
                                        {result.options.map((option, optIndex) => (
                                          <div
                                            key={optIndex}
                                            className={`p-2 rounded-md ${
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
                                    ) : (
                                      <div className="flex items-center gap-2 mt-2 text-gray-500">
                                        <Info className="h-4 w-4" />
                                        <span>Detailed option information not available</span>
                                      </div>
                                    )}
                                    
                                    {result.explanation && (
                                      <div className="mt-4 p-3 bg-blue-50 rounded-md">
                                        <p className="text-sm text-blue-800">
                                          <span className="font-semibold">Explanation:</span> {result.explanation}
                                        </p>
                                      </div>
                                    )}
                                  </AccordionContent>
                                </AccordionItem>
                              ))}
                            </Accordion>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="py-10">
                      <p className="text-center text-gray-500">
                        You haven't taken any quizzes yet. Complete a quiz to see your history.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="performance">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Over Time</CardTitle>
                  <CardDescription>Your quiz scores over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {chartData.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="score"
                            name="Score (%)"
                            stroke="#8884d8"
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-center py-10">No quiz data available yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
} 