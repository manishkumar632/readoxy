"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { X, Filter, SortAsc, SortDesc, Check } from "lucide-react";

type Question = {
  _id: string;
  question: string;
  tags: string;
  options: {
    value: string;
    isCorrect: boolean;
  }[];
  selected?: boolean;
  createdAt?: string;
};

type SortOption = "newest" | "oldest" | "alphabetical" | "reverseAlphabetical";

const DailyQuizPage: React.FC = () => {
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [currentDailyQuiz, setCurrentDailyQuiz] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [restrictedEmails, setRestrictedEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");

  // Sort questions based on the selected sort option
  const sortQuestions = (questions: Question[], sortOption: SortOption) => {
    const sorted = [...questions];

    switch (sortOption) {
      case "newest":
        return sorted.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      case "oldest":
        return sorted.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateA - dateB;
        });
      case "alphabetical":
        return sorted.sort((a, b) => a.question.localeCompare(b.question));
      case "reverseAlphabetical":
        return sorted.sort((a, b) => b.question.localeCompare(a.question));
      default:
        return sorted;
    }
  };

  // Apply filters when search term or selected tags change
  useEffect(() => {
    const applyFilters = async () => {
      if (!searchTerm && selectedTags.length === 0) {
        setFilteredQuestions(sortQuestions([...allQuestions], sortBy));
        return;
      }

      let filtered = [...allQuestions];

      // Apply search term filter
      if (searchTerm) {
        filtered = filtered.filter((q: Question) =>
          q.question.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply tags filter
      if (selectedTags.length > 0) {
        filtered = filtered.filter((q: Question) => {
          if (!q.tags) return false;
          const questionTags = q.tags
            .toLowerCase()
            .split(",")
            .map((tag) => tag.trim());
          return selectedTags.some((tag) =>
            questionTags.includes(tag.toLowerCase())
          );
        });
      }

      setFilteredQuestions(sortQuestions(filtered, sortBy));
    };

    applyFilters();
  }, [searchTerm, selectedTags, allQuestions, sortBy]);

  // Apply sorting when sort option changes
  useEffect(() => {
    setFilteredQuestions((prevQuestions) =>
      sortQuestions([...prevQuestions], sortBy)
    );
  }, [sortBy]);

  // Fetch all questions and current daily quiz on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all questions
        const questionsResponse = await fetch(
          "http://localhost:5000/api/all/questions",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            },
          }
        );

        // Handle 403 Forbidden (token issues)
        if (questionsResponse.status === 403) {
          refreshAdminToken();
          return;
        }

        if (questionsResponse.ok) {
          const questions = await questionsResponse.json();
          setAllQuestions(questions);
          setFilteredQuestions(sortQuestions(questions, sortBy));

          // Fetch current daily quiz
          const dailyQuizResponse = await fetch(
            "http://localhost:5000/api/daily-quiz"
          );

          if (dailyQuizResponse.ok) {
            const dailyQuiz = await dailyQuizResponse.json();
            setCurrentDailyQuiz(dailyQuiz);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load questions or daily quiz", {
          description: "An error occurred while fetching the data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sortBy]);

  // Fetch restricted emails on component mount
  useEffect(() => {
    const fetchRestrictedEmails = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/restricted-emails",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            },
          }
        );
        
        // Handle 403 Forbidden (token issues)
        if (response.status === 403) {
          refreshAdminToken();
          return;
        }
        
        if (response.ok) {
          const emails = await response.json();
          setRestrictedEmails(emails);
        } else {
          throw new Error("Failed to fetch restricted emails");
        }
      } catch (error) {
        console.error("Error fetching restricted emails:", error);
        toast.error("Failed to load restricted emails", {
          description: "An error occurred while fetching the restricted emails",
        });
      }
    };

    fetchRestrictedEmails();
  }, []);

  // Toggle question selection
  const toggleQuestionSelection = (question: Question) => {
    const isSelected = selectedQuestions.some((q) => q._id === question._id);

    if (isSelected) {
      setSelectedQuestions(
        selectedQuestions.filter((q) => q._id !== question._id)
      );
    } else {
      setSelectedQuestions([...selectedQuestions, question]);
    }
  };

  // Toggle tag selection
  const toggleTagSelection = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
    setSortBy("newest");
  };

  // Save the selected questions as the daily quiz
  const saveDailyQuiz = async () => {
    if (selectedQuestions.length === 0) {
      toast.error("No Questions Selected", {
        description: "Please select at least one question for the daily quiz",
      });
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("http://localhost:5000/api/daily-quiz/set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({
          questionIds: selectedQuestions.map((q) => q._id),
        }),
      });

      // Handle 403 Forbidden (token issues)
      if (response.status === 403) {
        refreshAdminToken();
        return;
      }

      if (response.ok) {
        toast.success("Daily Quiz Updated", {
          description: "Daily quiz has been set successfully",
        });

        // Refresh the current daily quiz
        const dailyQuizResponse = await fetch(
          "http://localhost:5000/api/daily-quiz"
        );
        if (dailyQuizResponse.ok) {
          const dailyQuiz = await dailyQuizResponse.json();
          setCurrentDailyQuiz(dailyQuiz);
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to set daily quiz");
      }
    } catch (error) {
      console.error("Error saving daily quiz:", error);
      toast.error("Failed to Set Daily Quiz", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while setting the daily quiz",
      });
    } finally {
      setSaving(false);
    }
  };

  // Reset the daily quiz
  const resetDailyQuiz = async () => {
    try {
      setResetting(true);

      const response = await fetch(
        "http://localhost:5000/api/daily-quiz/reset",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      // Handle 403 Forbidden (token issues)
      if (response.status === 403) {
        refreshAdminToken();
        return;
      }

      if (response.ok) {
        setCurrentDailyQuiz(null);
        setSelectedQuestions([]);
        toast.success("Daily Quiz Reset", {
          description: "Daily quiz has been cleared successfully",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to reset daily quiz");
      }
    } catch (error) {
      console.error("Error resetting daily quiz:", error);
      toast.error("Failed to Reset Daily Quiz", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while resetting the daily quiz",
      });
    } finally {
      setResetting(false);
    }
  };

  // Function to refresh the admin token by redirecting to login
  const refreshAdminToken = () => {
    // Clear the current token
    localStorage.removeItem("adminToken");
    
    // Show a message to the user
    toast.error("Your session has expired", {
      description: "Please log in again to continue",
    });
    
    // Redirect to login page after a short delay
    setTimeout(() => {
      window.location.href = "/admin/login";
    }, 2000);
  };

  // Add a new restricted email
  const addRestrictedEmail = async () => {
    if (!newEmail) {
      toast.error("Email Required", {
        description: "Please enter an email address to restrict",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error("Invalid Email", {
        description: "Please enter a valid email address",
      });
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/restricted-emails",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          body: JSON.stringify({ email: newEmail }),
        }
      );

      // Handle 403 Forbidden (token issues)
      if (response.status === 403) {
        refreshAdminToken();
        return;
      }

      const data = await response.json();

      if (response.ok) {
        setRestrictedEmails([...restrictedEmails, newEmail]);
        setNewEmail("");
        toast.success("Email Added", {
          description: "The email has been added to the restricted list",
        });
      } else {
        throw new Error(data.message || "Failed to add email");
      }
    } catch (error) {
      console.error("Error adding email:", error);
      toast.error("Failed to Add Email", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while adding the email",
      });
    }
  };

  // Remove a restricted email
  const removeRestrictedEmail = async (email: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/restricted-emails/${encodeURIComponent(email)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      // Handle 403 Forbidden (token issues)
      if (response.status === 403) {
        refreshAdminToken();
        return;
      }

      if (response.ok) {
        setRestrictedEmails(restrictedEmails.filter((e) => e !== email));
        toast.success("Email Removed", {
          description: "The email has been removed from the restricted list",
        });
      } else {
        const data = await response.json();
        throw new Error(data.message || "Failed to remove email");
      }
    } catch (error) {
      console.error("Error removing email:", error);
      toast.error("Failed to Remove Email", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while removing the email",
      });
    }
  };

  // Extract all unique tags from questions
  const allTags = React.useMemo(() => {
    const tags = new Set<string>();

    allQuestions.forEach((question) => {
      if (question.tags) {
        question.tags.split(",").forEach((tag) => {
          tags.add(tag.trim());
        });
      }
    });

    return Array.from(tags)
      .filter((tag) => tag !== "")
      .sort();
  }, [allQuestions]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Daily Quiz Management</h1>

      <Tabs defaultValue="select">
        <TabsList className="mb-6">
          <TabsTrigger value="select">Select Questions</TabsTrigger>
          <TabsTrigger value="current">Current Daily Quiz</TabsTrigger>
          <TabsTrigger value="restricted">Restricted Email</TabsTrigger>
        </TabsList>

        <TabsContent value="select">
          <div className="mb-6 space-y-4">
            {/* Results summary */}
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Showing {filteredQuestions.length} of {allQuestions.length}{" "}
                questions
              </p>
              <p className="text-sm text-gray-500">
                Selected: {selectedQuestions.length} questions
              </p>
            </div>

            {/* Set as Daily Quiz button - Sticky at bottom */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-50">
              <div className="container mx-auto flex justify-end gap-4">
                {currentDailyQuiz && (
                  <Button
                    variant="destructive"
                    onClick={resetDailyQuiz}
                    disabled={resetting}
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    {resetting ? (
                      "Resetting..."
                    ) : (
                      <>
                        <X size={16} />
                        Reset Daily Quiz
                      </>
                    )}
                  </Button>
                )}
                <Button
                  onClick={saveDailyQuiz}
                  disabled={saving || selectedQuestions.length === 0}
                  size="lg"
                >
                  {saving ? "Saving..." : "Set as Daily Quiz"}
                </Button>
              </div>
            </div>

            {/* Add padding at the bottom to prevent content from being hidden behind the sticky button */}
            <div className="pb-20">
              {/* Search and filter controls */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Input
                      placeholder="Search questions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10"
                    />
                    {searchTerm && (
                      <button
                        title="Clear search"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setSearchTerm("")}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Filter size={16} />
                        <span>Tags</span>
                        {selectedTags.length > 0 && (
                          <Badge variant="secondary" className="ml-1">
                            {selectedTags.length}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 max-h-80 overflow-y-auto">
                      {allTags.map((tag) => (
                        <DropdownMenuCheckboxItem
                          key={tag}
                          checked={selectedTags.includes(tag)}
                          onCheckedChange={() => toggleTagSelection(tag)}
                        >
                          {tag}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Select
                    value={sortBy}
                    onValueChange={(value: any) =>
                      setSortBy(value as SortOption)
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="alphabetical">A to Z</SelectItem>
                      <SelectItem value="reverseAlphabetical">
                        Z to A
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {(searchTerm ||
                    selectedTags.length > 0 ||
                    sortBy !== "newest") && (
                    <Button
                      variant="ghost"
                      onClick={clearFilters}
                      className="flex items-center gap-2"
                    >
                      <X size={16} />
                      <span>Clear</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Selected tags display */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1 px-3 py-1"
                    >
                      {tag}
                      <X
                        size={14}
                        className="cursor-pointer ml-1"
                        onClick={() => toggleTagSelection(tag)}
                      />
                    </Badge>
                  ))}
                  {selectedTags.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTags([])}
                      className="text-xs h-7"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Questions grid */}
            {filteredQuestions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {filteredQuestions.map((question) => (
                  <Card
                    key={question._id}
                    className={`cursor-pointer ${
                      selectedQuestions.some((q) => q._id === question._id)
                        ? "border-2 border-blue-500"
                        : ""
                    }`}
                    onClick={() => toggleQuestionSelection(question)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {question.question}
                          </CardTitle>
                          {question.tags && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {question.tags.split(",").map((tag, i) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag.trim()}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Checkbox
                          checked={selectedQuestions.some(
                            (q) => q._id === question._id
                          )}
                          onCheckedChange={() =>
                            toggleQuestionSelection(question)
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {question.options.map((option, index) => (
                          <div key={index} className="flex items-start">
                            <div
                              className={`mr-2 ${
                                option.isCorrect ? "text-green-500" : ""
                              }`}
                            >
                              {index + 1}.
                            </div>
                            <div className="flex-1">
                              <p
                                className={
                                  option.isCorrect
                                    ? "font-medium text-green-500"
                                    : ""
                                }
                              >
                                {option.value}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border rounded-lg bg-gray-50">
                <p className="text-gray-500">No questions match your filters</p>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="current">
          {currentDailyQuiz ? (
            <div>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">
                      Daily Quiz for{" "}
                      {new Date(currentDailyQuiz.date).toLocaleDateString()}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {currentDailyQuiz.isManuallySelected
                        ? "Manually selected by admin"
                        : "Automatically generated"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {currentDailyQuiz.questions.map(
                  (question: any, index: number) => (
                    <Card key={question._id}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {index + 1}. {question.question}
                        </CardTitle>
                        {question.tags && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {question.tags
                              .split(",")
                              .map((tag: string, i: number) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag.trim()}
                                </Badge>
                              ))}
                          </div>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {question.options.map(
                            (option: any, optIndex: number) => (
                              <div key={optIndex} className="flex items-start">
                                <div className="mr-2">
                                  {String.fromCharCode(65 + optIndex)}.
                                </div>
                                <div className="flex-1">
                                  <p>{option.value}</p>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p>No daily quiz has been set for today.</p>
              <Button
                onClick={() => {
                  const element = document.querySelector(
                    '[data-value="select"]'
                  );
                  if (element instanceof HTMLElement) {
                    element.click();
                  }
                }}
                className="mt-4"
              >
                Select Questions
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="restricted">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Restricted Emails</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Enter email to restrict"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addRestrictedEmail();
                      }
                    }}
                  />
                  <Button onClick={addRestrictedEmail}>Add</Button>
                </div>
                <div>
                  {restrictedEmails.length > 0 ? (
                    <div className="space-y-2">
                      {restrictedEmails.map((email, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 border rounded-md"
                        >
                          <span className="font-medium">{email}</span>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeRestrictedEmail(email)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No restricted emails
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DailyQuizPage;
