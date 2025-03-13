"use client";
import React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

// Define the form types
type FormValues = {
    question: string;
    tags: string;
    options: { value: string; isCorrect: boolean }[];
};

const AdminPage: React.FC = () => {
    const form = useForm<FormValues>({
        defaultValues: {
            question: "",
            tags: "",
            options: [{ value: "", isCorrect: false }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "options",
    });

    const onSubmit = async (data: FormValues) => {
        const newQuestion = {
            question: data.question,
            tags: data.tags,
            options: data.options.map((option) => ({
                value: option.value,
                isCorrect: option.isCorrect,
            })),
        };

        try {
            const response = await fetch(
                "http://localhost:5000/api/question/save",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newQuestion),
                }
            );

            const result = await response.json();

            if (response.ok) {
                console.log("✅ Question saved successfully:", result);
                form.reset();
            } else {
                console.error("❌ Failed to save question:", result.message);
            }
        } catch (error) {
            console.error("❌ Error saving question:", error);
        }
    };

    return (
        <div className="container mx-auto p-4 mb-12">
            <h1 className="text-2xl font-bold mb-4">Admin Page</h1>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    <FormField
                        name="question"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Question:</FormLabel>
                                <FormControl>
                                    <Input {...field} type="text" required />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    <FormField
                        name="tags"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Question Tags:</FormLabel>
                                <FormControl>
                                    <Input 
                                        {...field} 
                                        type="text" 
                                        placeholder="Enter comma-separated tags (e.g., servicenow, java, python)" 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    {fields.map((field, index) => (
                        <div
                            key={field.id}
                            className="flex items-center space-x-4"
                        >
                            <FormField
                                name={`options.${index}.value`}
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>
                                            Option {index + 1}:
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="text"
                                                required
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name={`options.${index}.isCorrect`}
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2">
                                        <FormLabel>Correct:</FormLabel>
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <Button type="button" onClick={() => remove(index)}>
                                Remove Option
                            </Button>
                        </div>
                    ))}
                    
                    <Button className="mr-4"
                        type="button"
                        onClick={() => append({ value: "", isCorrect: false })}
                    >
                        Add Option
                    </Button>
                    <Button type="submit" className="mx-4 bg-green-400">Add Question</Button>
                </form>
            </Form>
        </div>
    );
};

export default AdminPage;
