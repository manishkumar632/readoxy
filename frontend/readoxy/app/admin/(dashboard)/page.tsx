"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  Trophy,
  Activity,
  Clock,
  TrendingUp,
  BarChart3,
  LineChart as LineChartIcon,
  UserCheck,
  History,
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

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const statsCards = [
  {
    title: "Total Users",
    value: "2,451",
    increase: "12%",
    icon: <Users className="h-5 w-5" />,
    color: "text-blue-500",
  },
  {
    title: "Active Quizzes",
    value: "145",
    increase: "8%",
    icon: <BookOpen className="h-5 w-5" />,
    color: "text-purple-500",
  },
  {
    title: "Completed Quizzes",
    value: "1,234",
    increase: "15%",
    icon: <Trophy className="h-5 w-5" />,
    color: "text-yellow-500",
  },
  {
    title: "Average Score",
    value: "78%",
    increase: "5%",
    icon: <Activity className="h-5 w-5" />,
    color: "text-green-500",
  },
];

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
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-500">Last updated: Just now</span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-600">
                  {stat.title}
                </h3>
                <div className={stat.color}>{stat.icon}</div>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span>{stat.increase} from last month</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
          <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <LineChartIcon className="h-5 w-5 text-blue-500" />
                User Activity
              </h3>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
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
        </motion.div>

        <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
          <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                Quiz Performance
              </h3>
              <Trophy className="h-5 w-5 text-yellow-500" />
            </div>
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
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div {...fadeIn} transition={{ delay: 0.4 }}>
        <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <History className="h-5 w-5 text-indigo-500" />
              Recent Activity
            </h3>
            <UserCheck className="h-5 w-5 text-green-500" />
          </div>
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
      </motion.div>
    </div>
  );
}
