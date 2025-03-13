"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserAuth } from "@/lib/context/UserAuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type QuizAttempt = {
  _id: string;
  date: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  detailedResults: {
    questionId: string;
    question: string;
    correct: boolean;
    correctOptions: number[];
    selectedOptions: number[];
  }[];
  submittedAt: string;
};

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, loading, logout } = useUserAuth();
  const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>([]);
  const [todayQuiz, setTodayQuiz] = useState<any>(null);
  const [fetchingData, setFetchingData] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;

      try {
        setFetchingData(true);
        const token = localStorage.getItem("userToken");

        // Fetch quiz history
        const historyResponse = await fetch("http://localhost:5000/api/user/quiz-history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (historyResponse.ok) {
          const history = await historyResponse.json();
          setQuizHistory(history);
        }

        // Fetch today's quiz attempt
        const todayResponse = await fetch("http://localhost:5000/api/user/today-quiz", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (todayResponse.ok) {
          const todayData = await todayResponse.json();
          setTodayQuiz(todayData);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setFetchingData(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  // Format data for the chart
  const chartData = quizHistory
    .slice()
    .reverse()
    .map((attempt) => ({
      date: new Date(attempt.date).toLocaleDateString(),
      score: attempt.percentage,
    }));

  if (loading || fetchingData) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <p className="font-medium">Welcome, {user?.username}</p>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>

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
            <CardTitle className="text-lg">Today's Quiz</CardTitle>
          </CardHeader>
          <CardContent>
            {todayQuiz?.attempted ? (
              <div>
                <p className="text-4xl font-bold">{todayQuiz.percentage}%</p>
                <p className="text-sm text-gray-500">
                  Score: {todayQuiz.score}/{todayQuiz.totalQuestions}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <p className="mb-2">You haven't taken today's quiz yet</p>
                <Button onClick={() => router.push("/quiz/daily")}>Take Quiz</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance">
        <TabsList className="mb-6">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="history">Quiz History</TabsTrigger>
          {todayQuiz?.attempted && (
            <TabsTrigger value="today">Today's Results</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Over Time</CardTitle>
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
                      <Line
                        type="monotone"
                        dataKey="score"
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

        <TabsContent value="history">
          <div className="space-y-4">
            {quizHistory.length > 0 ? (
              quizHistory.map((attempt) => (
                <Card key={attempt._id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">
                        Quiz on {new Date(attempt.date).toLocaleDateString()}
                      </CardTitle>
                      <Badge
                        variant={attempt.percentage >= 70 ? "default" : "destructive"}
                      >
                        {attempt.percentage}%
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      Score: {attempt.score}/{attempt.totalQuestions}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm font-medium">Correct Answers</p>
                        <p className="text-2xl font-bold">{attempt.score}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Incorrect Answers</p>
                        <p className="text-2xl font-bold">
                          {attempt.totalQuestions - attempt.score}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center py-10">No quiz history available</p>
            )}
          </div>
        </TabsContent>

        {todayQuiz?.attempted && (
          <TabsContent value="today">
            <Card>
              <CardHeader>
                <CardTitle>Today's Quiz Results</CardTitle>
                <p className="text-sm text-gray-500">
                  Score: {todayQuiz.score}/{todayQuiz.totalQuestions} ({todayQuiz.percentage}%)
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {todayQuiz.detailedResults.map((result: any, index: number) => (
                    <div key={result.questionId} className="border-b pb-4 last:border-0">
                      <div className="flex items-start">
                        <div
                          className={`mr-2 mt-1 h-5 w-5 rounded-full flex items-center justify-center text-white ${
                            result.correct ? "bg-green-500" : "bg-red-500"
                          }`}
                        >
                          {result.correct ? "✓" : "✗"}
                        </div>
                        <div>
                          <p className="font-medium">
                            {index + 1}. {result.question}
                          </p>
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">
                              {result.correct
                                ? "Correct answer!"
                                : "Your answer was incorrect"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Dashboard; 