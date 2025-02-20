import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import axios from "axios";

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

interface EditQuestionProps {
    question: Question;
    onUpdate: (updatedQuestion: Question) => void;
    onClose: () => void;
}

const EditQuestion: React.FC<EditQuestionProps> = ({ question, onUpdate, onClose }) => {
    const [editedQuestion, setEditedQuestion] = useState(question);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setEditedQuestion({ ...editedQuestion, [name]: value });
    };

    const handleOptionChange = (index: number, value: string) => {
        const updatedOptions = editedQuestion.options.map((option, i) =>
            i === index ? { ...option, value } : option
        );
        setEditedQuestion({ ...editedQuestion, options: updatedOptions });
    };

    const handleCorrectOptionChange = (index: number) => {
        const updatedOptions = editedQuestion.options.map((option, i) => ({
            ...option,
            isCorrect: i === index ? !option.isCorrect : option.isCorrect,
        }));
        setEditedQuestion({ ...editedQuestion, options: updatedOptions });
    };

    const handleSubmit = async () => {
        try {
            const response = await axios.put(`http://localhost:5000/api/question/${editedQuestion._id}`, editedQuestion);
            onUpdate(response.data);
            onClose();
        } catch (error) {
            console.error("❌ Error updating question:", error);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
            <div className="bg-white p-4 rounded-lg w-[80%]">
                <h2 className="text-xl mb-4">Edit Question</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Question</label>
                    <Input 
                        type="text" 
                        name="question" 
                        value={editedQuestion.question} 
                        onChange={handleChange} 
                        className="mt-1 block w-full"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Options</label>
                    {editedQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center mb-2">
                            <Input 
                                type="text" 
                                value={option.value} 
                                onChange={(e) => handleOptionChange(index, e.target.value)} 
                                className="mt-1 block w-full"
                            />
                            <input 
                                type="checkbox" 
                                checked={option.isCorrect} 
                                onChange={() => handleCorrectOptionChange(index)} 
                                className="ml-2"
                            />
                        </div>
                    ))}
                </div>
                <div className="flex justify-end">
                    <button onClick={onClose} className="mr-2 px-4 py-2 bg-gray-300 rounded">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white rounded">Save</button>
                </div>
            </div>
        </div>
    );
};

export default EditQuestion;
