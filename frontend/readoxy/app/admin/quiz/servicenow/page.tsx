'use client'
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { IoIosSearch, IoMdCreate, IoMdTrash, IoMdAdd } from "react-icons/io";
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
    createdAt: string;
}

const page = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [questions, setQuestions] = useState<Question[]>([]);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(null);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const router = useRouter();

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/questions");
                setQuestions(response.data);
            } catch (error) {
                console.error("❌ Error fetching questions:", error);
            }
        };

        fetchQuestions();
    }, []);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`http://localhost:5000/api/question/${id}`);
            setQuestions(questions.filter(question => question._id !== id));
            setDeletingQuestion(null);
        } catch (error) {
            console.error("❌ Error deleting question:", error);
        }
    };

    const handleEdit = (question: Question) => {
        setEditingQuestion(question);
    };

    const handleUpdate = (updatedQuestion: Question) => {
        setQuestions(questions.map(q => (q._id === updatedQuestion._id ? updatedQuestion : q)));
        setEditingQuestion(null);
    };

    const highlightText = (text: string, highlight: string) => {
        const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
        return parts.map((part, index) => 
            part.toLowerCase() === highlight.toLowerCase() ? <span key={index} className="bg-yellow-300">{part}</span> : part
        );
    };

    const filteredQuestions = questions.filter(question => {
        const searchTermLower = searchTerm.toLowerCase();
        return (
            question.question.toLowerCase().includes(searchTermLower) ||
            question.options.some(option => option.value.toLowerCase().includes(searchTermLower))
        );
    });

    const sortedQuestions = filteredQuestions.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    const toggleSortOrder = () => {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    };

    return(
        <div className="mt-4">
            {/* Search Bar */}
            <div className="relative w-72 mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IoIosSearch className="h-5 w-5 text-gray-400" />
                </div>
                <Input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchTerm} 
                    onChange={handleSearch} 
                    className="pl-10 rounded-full"
                />
            </div>

            {/* Sort Button */}
            <div className="mb-4 flex justify-between">
                <button onClick={toggleSortOrder} className="px-4 py-2 bg-blue-500 text-white rounded">
                    Sort by Time ({sortOrder === "asc" ? "Ascending" : "Descending"})
                </button>
            </div>

            {/* Questions Table */}
            <div className="overflow-auto h-screen">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="py-2">Question</th>
                            <th className="py-2">Options</th>
                            <th className="py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedQuestions.map((question) => (
                            <tr key={question._id}>
                                <td className="border px-4 py-2">{highlightText(question.question, searchTerm)}</td>
                                <td className="border px-4 py-2">
                                    <ul>
                                        {question.options.map((option, index) => (
                                            <li key={index}>
                                                {highlightText(option.value, searchTerm)} {option.isCorrect ? "(Correct)" : ""}
                                            </li>
                                        ))}
                                    </ul>
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
                        <h2 className="text-xl mb-4">Are you sure you want to delete this question?</h2>
                        <div className="flex justify-end">
                            <button onClick={() => setDeletingQuestion(null)} className="mr-2 px-4 py-2 bg-gray-300 rounded">Cancel</button>
                            <button onClick={() => handleDelete(deletingQuestion._id)} className="px-4 py-2 bg-red-500 text-white rounded">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default page;
