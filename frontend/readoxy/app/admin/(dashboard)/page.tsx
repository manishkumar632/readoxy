"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Users,
  BookOpen,
  Trophy,
  Activity,
  Clock,
  ChevronUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeQuizzes: 0,
    completedQuizzes: 0,
    averageScore: 0,
  });

  const userActivityData = [
    { month: "Jan", activeUsers: 400, newUsers: 240 },
    { month: "Feb", activeUsers: 300, newUsers: 139 },
    { month: "Mar", activeUsers: 200, newUsers: 980 },
    { month: "Apr", activeUsers: 278, newUsers: 390 },
    { month: "May", activeUsers: 189, newUsers: 480 },
    { month: "Jun", activeUsers: 239, newUsers: 380 },
  ];

  const quizPerformanceData = [
    { category: "Math", average: 85 },
    { category: "Science", average: 76 },
    { category: "History", average: 82 },
    { category: "English", average: 90 },
    { category: "Geography", average: 78 },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold">2,451</p>
          <div className="flex items-center text-sm text-green-600">
            <ChevronUp className="h-4 w-4" />
            <span>12% from last month</span>
          </div>
        </Card>

        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">
              Active Quizzes
            </h3>
            <BookOpen className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold">145</p>
          <div className="flex items-center text-sm text-green-600">
            <ChevronUp className="h-4 w-4" />
            <span>8% from last week</span>
          </div>
        </Card>

        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">
              Completed Quizzes
            </h3>
            <Trophy className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold">1,234</p>
          <div className="flex items-center text-sm text-green-600">
            <ChevronUp className="h-4 w-4" />
            <span>15% from last month</span>
          </div>
        </Card>

        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">Average Score</h3>
            <Activity className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold">78%</p>
          <div className="flex items-center text-sm text-green-600">
            <ChevronUp className="h-4 w-4" />
            <span>5% from last month</span>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">User Activity</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="activeUsers"
                  stroke="#4F46E5"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="newUsers"
                  stroke="#10B981"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quiz Performance</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quizPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="average" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            {
              user: "John Doe",
              action: "Completed Quiz",
              score: 85,
              time: "2 hours ago",
            },
            {
              user: "Jane Smith",
              action: "Started Quiz",
              score: null,
              time: "3 hours ago",
            },
            {
              user: "Mike Johnson",
              action: "Completed Quiz",
              score: 92,
              time: "5 hours ago",
            },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 border-b last:border-0"
            >
              <div className="flex items-center space-x-4">
                <Clock className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium">{activity.user}</p>
                  <p className="text-sm text-gray-500">{activity.action}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {activity.score && (
                  <span className="text-sm font-medium text-green-600">
                    Score: {activity.score}%
                  </span>
                )}
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
