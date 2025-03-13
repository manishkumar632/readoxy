"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  IoIosSearch,
  IoMdCreate,
  IoMdTrash,
  IoMdAdd,
  IoMdArrowUp,
  IoMdArrowDown,
} from "react-icons/io";
import axios from "axios";
import EditQuestion from "./EditQuestion";
import { useRouter } from "next/navigation";

interface Option {
  value: string;
  isCorrect: boolean;
}

interface Question {
  _id: string;
  question: string;
  options: Option[];
  tags: string;
  createdAt: string;
}

const page = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(
    null
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sortColumn, setSortColumn] = useState<"question" | "createdAt">(
    "createdAt"
  );
  const router = useRouter();

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/question/${id}`);
      setQuestions(questions.filter((question) => question._id !== id));
      setDeletingQuestion(null);
    } catch (error) {
      console.error("❌ Error deleting question:", error);
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
  };

  const handleUpdate = async (updatedQuestion: Question) => {
    try {
      setQuestions(prevQuestions =>
        prevQuestions.map(q =>
          q._id === updatedQuestion._id ? {
            ...updatedQuestion,
            createdAt: new Date().toISOString()
          } : q
        )
      );

      const response = await axios.get("http://localhost:5000/api/all/questions");
      if (response.status === 200) {
        setQuestions(response.data);
      }
    } catch (error) {
      console.error("❌ Error updating questions state:", error);
      fetchQuestions();
    }
    setEditingQuestion(null);
  };

  const fetchQuestions = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/all/questions");
      if (response.status === 200) {
        setQuestions(response.data);
      } else {
        console.error("❌ Failed to fetch questions:", response.statusText);
      }
    } catch (error) {
      console.error("❌ Error fetching questions:", error);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const highlightText = (text: string, highlight: string) => {
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={index} className="bg-yellow-300">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const filteredQuestions = questions.filter((question) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      question.question.toLowerCase().includes(searchTermLower) ||
      question.options.some((option) =>
        option.value.toLowerCase().includes(searchTermLower)
      ) ||
      (question.tags && question.tags.toLowerCase().includes(searchTermLower))
    );
  });

  const sortedQuestions = filteredQuestions.sort((a, b) => {
    const valueA = new Date(a.createdAt).getTime();
    const valueB = new Date(b.createdAt).getTime();
    if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
    if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (column: "question" | "createdAt") => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Questions Management</h1>
        <button
          onClick={() => router.push("/admin/quiz/servicenow/add")}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <IoMdAdd className="mr-2" /> Add Question
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10"
          />
          <IoIosSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th
                className="border px-4 py-2 cursor-pointer"
                onClick={() => handleSort("question")}
              >
                Question{" "}
                {sortColumn === "question" &&
                  (sortOrder === "asc" ? <IoMdArrowUp /> : <IoMdArrowDown />)}
              </th>
              <th className="border px-4 py-2">Options</th>
              <th className="border px-4 py-2">Tags</th>
              <th
                className="border px-4 py-2 cursor-pointer"
                onClick={() => handleSort("createdAt")}
              >
                Created At{" "}
                {sortColumn === "createdAt" &&
                  (sortOrder === "asc" ? <IoMdArrowUp /> : <IoMdArrowDown />)}
              </th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedQuestions.map((question) => (
              <tr key={question._id}>
                <td className="border px-4 py-2">
                  {highlightText(question.question, searchTerm)}
                </td>
                <td className="border px-4 py-2">
                  <ul>
                    {question.options.map((option, index) => (
                      <li key={index}>
                        {highlightText(option.value, searchTerm)}{" "}
                        {option.isCorrect ? "(Correct)" : ""}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="border px-4 py-2">
                  {question.tags && question.tags.split(',').map((tag, index) => (
                    <span key={index} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                      {tag.trim()}
                    </span>
                  ))}
                </td>
                <td className="border px-4 py-2">
                  {new Date(question.createdAt).toLocaleDateString()}
                </td>
                <td className="border px-4 py-2">
                  <button onClick={() => handleEdit(question)}>
                    <IoMdCreate className="h-5 w-5 text-blue-500" />
                  </button>
                  <button onClick={() => setDeletingQuestion(question)}>
                    <IoMdTrash className="h-5 w-5 text-red-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingQuestion && (
        <EditQuestion
          question={editingQuestion}
          onUpdate={handleUpdate}
          onClose={() => setEditingQuestion(null)}
        />
      )}

      {deletingQuestion && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
          <div className="bg-white p-4 rounded-lg">
            <h2 className="text-xl mb-4">
              Are you sure you want to delete this question?
            </h2>
            <div className="flex justify-end">
              <button
                onClick={() => setDeletingQuestion(null)}
                className="mr-2 px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingQuestion._id)}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default page;
