"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import toast, { Toaster } from "react-hot-toast";
import PopUp from "./PopUp";
import "./page.css";
import { useUserAuth } from "@/lib/context/UserAuthContext";
import Submitting from "./Submitting";

interface Option {
  value: string;
  isCorrect: boolean;
}

interface Question {
  _id: string;
  question: string;
  options: Option[];
  totalCorrect: number;
}

interface QuizResponse {
  questions: Question[];
  isAdminSet: boolean;
}

const QuizPage: React.FC = () => {
  const { quizCode } = useParams<{ quizCode: string }>();
  const router = useRouter();
  const { user } = useUserAuth(); // Get user from auth context
  const [validCode, setValidCode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isAdminSet, setIsAdminSet] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string[] }>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // Track submission state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(1200); // 20 minutes countdown (in seconds)
  const [isPopUpOpen, setIsPopUpOpen] = useState<boolean>(false);
  const [warning, setWarning] = useState<number>(0); // Count warning attempts
  const [submissionProgress, setSubmissionProgress] = useState<number>(0); // Track submission progress
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Fetch quiz data
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        // Add user email to the request if available
        const url = user?.email
          ? `${API_URL}/api/quiz/${quizCode}?email=${encodeURIComponent(
              user.email
            )}`
          : `${API_URL}/api/quiz/${quizCode}`;

        const response = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data: QuizResponse = await response.json();

        if (response.ok) {
          setValidCode(true);
          setQuestions(shuffleArray(data.questions));
          setIsAdminSet(data.isAdminSet);
        } else {
          setValidCode(false);
        }
      } catch (error) {
        console.error("❌ Error fetching quiz data:", error);
        toast.error("Failed to fetch quiz data.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quizCode, API_URL, user?.email]);

  // Submission progress animation
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isSubmitting && submissionProgress < 100) {  // Only run if not at 100%
      console.log("Submission animation effect triggered, progress:", submissionProgress);
      
      // Start with a small initial progress
      if (submissionProgress === 0) {
        console.log("Setting initial progress");
        setSubmissionProgress(10);
      }

      interval = setInterval(() => {
        setSubmissionProgress((prev) => {
          // Don't update if we've reached 100%
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          
          // Create a more dynamic progress animation
          const increment =
            Math.random() * 8 + (prev < 30 ? 5 : prev < 60 ? 3 : 1);
          const newProgress = prev + increment;
          const cappedProgress = newProgress > 85 ? 85 : newProgress;
          console.log("Progress updated:", cappedProgress);
          return cappedProgress;
        });
      }, 300);
    }

    return () => {
      if (interval) {
        console.log("Clearing interval");
        clearInterval(interval);
      }
    };
  }, [isSubmitting, submissionProgress]);

  // Timer Effect
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit(); // Auto-submit when timer reaches zero
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Handle answer selection
  const handleAnswerSelection = (
    questionId: string,
    optionValue: string,
    isMultiple: boolean
  ) => {
    setUserAnswers((prev) => {
      const selectedValues = prev[questionId] || [];
      const updatedValues = isMultiple
        ? selectedValues.includes(optionValue)
          ? selectedValues.filter((val) => val !== optionValue)
          : [...selectedValues, optionValue]
        : [optionValue];
      return { ...prev, [questionId]: updatedValues };
    });
  };

  // Navigation functions
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleQuestionClick = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  // Submit quiz
  const handleSubmit = async () => {
    try {
      console.log("handleSubmit started, isSubmitting:", isSubmitting);
      
      // Ensure submission animation is active
      if (!isSubmitting) {
        console.log("Setting isSubmitting to true from handleSubmit");
        setIsSubmitting(true);
        setSubmissionProgress(0);
      }
      
      console.log("Submission animation started");

      // Store questions and user answers to local storage
      localStorage.setItem("quizQuestions", JSON.stringify(questions));
      localStorage.setItem("userAnswers", JSON.stringify(userAnswers));

      // Add a longer delay to ensure animation is visible before API call
      console.log("Waiting for animation to be visible");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Prepare answers in the correct format
      console.log("Preparing answers");
      const formattedAnswers = questions.map((q) => ({
        questionId: q._id,
        selectedOptions: userAnswers[q._id] || [],
      }));

      // Submit answers directly
      console.log("Submitting answers to API");
      const response = await fetch(`${API_URL}/api/quiz/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
        body: JSON.stringify({ answers: formattedAnswers }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit quiz");
      }

      const result = await response.json();
      console.log("Received response from API");

      // Store results in localStorage to prevent resubmission
      localStorage.setItem("quizResults", JSON.stringify(result));

      // Complete the progress animation
      console.log("Setting progress to 100%");
      await new Promise((resolve) => setTimeout(resolve, 300)); // Small delay before setting 100%
      setSubmissionProgress(100);

      // Add a small delay to show the completion state
      console.log("Waiting to show completion state");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Quiz submitted successfully! Redirecting...");
      console.log("Success toast shown");

      // Make sure the data is stored before redirecting
      setTimeout(() => {
        // Double-check that the results are still in localStorage
        const storedResults = localStorage.getItem("quizResults");
        if (!storedResults) {
          localStorage.setItem("quizResults", JSON.stringify(result));
        }

        // Reset submission state before redirecting
        console.log("Resetting submission state");
        setIsSubmitting(false);
        
        // Now redirect to the score page
        console.log("Redirecting to score page");
        router.push(`/quiz/${quizCode}/score`);
      }, 1500); // Increased delay to give more time to see the completion animation
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Failed to submit quiz.");
      setIsSubmitting(false); // Stop the animation on error
      setSubmissionProgress(0); // Reset progress on error
    }
  };

  // Popup handlers
  const handleOpenPopUp = () => {
    console.log("Opening popup");
    setIsPopUpOpen(true);
  };
  
  const handleClosePopUp = () => {
    console.log("Closing popup");
    setIsPopUpOpen(false);
  };
  
  const handleConfirmSubmit = () => {
    console.log("Confirm submit clicked");
    // First close the popup
    handleClosePopUp();
    
    // Then set submission state with a small delay to ensure UI updates
    setTimeout(() => {
      console.log("Setting isSubmitting to true");
      setIsSubmitting(true);
      setSubmissionProgress(0);
      
      // Call handleSubmit with a delay to ensure animation is visible
      setTimeout(() => {
        console.log("Calling handleSubmit");
        handleSubmit();
      }, 500);
    }, 100);
  };

  // Format Time Function (MM:SS)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Prevent Tab Switching, Minimize, and Screen Resize
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarning((prev) => prev + 1);
        toast.error("Warning! You switched tabs or minimized the window.");
      }
    };

    const handleBlur = () => {
      setWarning((prev) => prev + 1);
      toast.error("Warning! Do not minimize the window.");
    };

    const handleResize = () => {
      setWarning((prev) => prev + 1);
      toast.error("Warning! Resizing the screen is not allowed.");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Restrict Developer Tools
  useEffect(() => {
    const blockDevTools = (event: KeyboardEvent) => {
      if (
        event.key === "F12" ||
        (event.ctrlKey &&
          event.shiftKey &&
          (event.key === "I" || event.key === "C" || event.key === "J")) ||
        (event.ctrlKey && event.key === "U")
      ) {
        event.preventDefault();
        toast.error("Inspecting elements is disabled!");
      }
    };

    const blockRightClick = (event: MouseEvent) => {
      event.preventDefault();
      toast.error("Right-click is disabled!");
    };

    document.addEventListener("keydown", blockDevTools);
    document.addEventListener("contextmenu", blockRightClick);

    return () => {
      document.removeEventListener("keydown", blockDevTools);
      document.removeEventListener("contextmenu", blockRightClick);
    };
  }, []);

  // Shuffle array function
  const shuffleArray = (array: any[]) => {
    return array
      .map((item) => ({
        ...item,
        options: item.options.sort(() => Math.random() - 0.5),
      }))
      .sort(() => Math.random() - 0.5);
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    const answeredCount = Object.keys(userAnswers).length;
    return Math.round((answeredCount / questions.length) * 100);
  };

  // Check if current question is answered
  const isCurrentQuestionAnswered = () => {
    return !!userAnswers[questions[currentQuestionIndex]?._id]?.length;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <Toaster position="top-center" />
      {isPopUpOpen && (
        <PopUp
          isOpen={isPopUpOpen}
          onClose={handleClosePopUp}
          onConfirm={handleConfirmSubmit}
        />
      )}
      
      {/* Submission overlay - added key to force re-render and z-index to ensure it's on top */}
      {isSubmitting && (
        <div 
          key="submission-overlay"
          className="fixed inset-0 bg-black bg-opacity-80 z-[9999] flex flex-col items-center justify-center backdrop-blur-sm"
        >
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center shadow-2xl animate-fadeIn">
            <div className="mb-6">
              <div className="inline-block p-5 rounded-full bg-blue-50 shadow-inner">
                <svg
                  className="animate-spin h-20 w-20 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {submissionProgress < 100
                ? "Submitting Your Quiz"
                : "Quiz Submitted!"}
            </h3>
            <p className="text-gray-600 mb-6 text-lg">
              {submissionProgress < 100
                ? "Please wait while we process your answers..."
                : "Your answers have been successfully recorded!"}
            </p>

            <div className="w-full bg-gray-200 rounded-full h-5 mb-3 overflow-hidden">
              <div
                className="bg-blue-600 h-5 rounded-full transition-all duration-500 flex items-center justify-end"
                style={{ width: `${submissionProgress}%` }}
              >
                {submissionProgress > 30 && (
                  <div className="animate-pulse bg-white opacity-60 h-2 w-10 rounded-full mr-2"></div>
                )}
              </div>
            </div>

            <div className="flex justify-between text-sm text-gray-500 font-medium mb-4">
              <span>0%</span>
              <span>{Math.round(submissionProgress)}%</span>
              <span>100%</span>
            </div>

            <div className="text-sm text-gray-600 font-medium">
              {submissionProgress < 30
                ? "Preparing your answers..."
                : submissionProgress < 60
                ? "Validating responses..."
                : submissionProgress < 85
                ? "Almost there..."
                : submissionProgress < 100
                ? "Finalizing submission..."
                : "Complete!"}
            </div>

            {submissionProgress === 100 && (
              <div className="mt-6 text-green-600 font-medium flex flex-col items-center justify-center animate-fadeIn">
                <div className="bg-green-100 p-3 rounded-full mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-lg">Submission successful!</span>
                <p className="text-gray-500 text-sm mt-2">
                  Redirecting to your results...
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-[80vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      ) : !validCode ? (
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8 text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Invalid Quiz Code
          </h2>
          <p className="mb-6 text-gray-600">
            The quiz code you entered is invalid or has expired.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Go Home
          </Button>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          {/* Header with quiz info and timer */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Quiz Session
                </h1>
                <div className="mt-2">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      isAdminSet
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {isAdminSet
                      ? "Admin-selected questions"
                      : "Randomly generated questions"}
                  </span>
                </div>
              </div>

              <div className="mt-4 md:mt-0 flex items-center">
                <div className="bg-gray-100 rounded-lg p-3 flex items-center">
                  <div className="text-gray-500 mr-2">Time Remaining:</div>
                  <div
                    className={`text-xl font-bold ${
                      timeLeft <= 180
                        ? "text-red-600 animate-pulse"
                        : "text-blue-600"
                    }`}
                  >
                    {formatTime(timeLeft)}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>
                  {Object.keys(userAnswers).length} of {questions.length}{" "}
                  questions answered
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Question navigation sidebar */}
            <div className="lg:w-1/4">
              <div className="bg-white rounded-xl shadow-sm p-4 sticky top-4">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  Questions
                </h2>
                <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-1">
                  {questions.map((q, i) => (
                    <button
                      key={q._id}
                      className={`w-full text-left py-2 px-3 rounded-lg flex items-center transition-colors ${
                        currentQuestionIndex === i
                          ? "bg-blue-100 text-blue-800 font-medium"
                          : userAnswers[q._id]?.length
                          ? "bg-green-50 text-gray-800 hover:bg-gray-100"
                          : "bg-gray-50 text-gray-800 hover:bg-gray-100"
                      }`}
                      onClick={() => handleQuestionClick(i)}
                    >
                      <div
                        className={`w-6 h-6 flex items-center justify-center rounded-full mr-2 text-sm ${
                          userAnswers[q._id]?.length
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {userAnswers[q._id]?.length ? "✓" : i + 1}
                      </div>
                      <div className="truncate">
                        {q.question.slice(0, 25)}
                        {q.question.length > 25 ? "..." : ""}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6">
                  <Button
                    onClick={handleOpenPopUp}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors"
                    disabled={isSubmitting}
                  >
                    Submit Quiz
                  </Button>
                </div>
              </div>
            </div>

            {/* Main question area */}
            <div className="lg:w-3/4">
              <Card className="shadow-sm border-0">
                <CardHeader className="bg-gray-50 rounded-t-xl border-b pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl text-gray-800">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </CardTitle>
                    <div className="text-sm text-gray-500">
                      {questions[currentQuestionIndex]?.totalCorrect > 1
                        ? `Select ${questions[currentQuestionIndex]?.totalCorrect} answers`
                        : "Select 1 answer"}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="text-lg font-medium mb-6">
                    {questions[currentQuestionIndex]?.question}
                  </div>

                  <div className="space-y-3">
                    {questions[currentQuestionIndex]?.options.map(
                      (option, index) => (
                        <div
                          key={index}
                          className={`border rounded-lg p-3 flex items-center cursor-pointer transition-colors ${
                            userAnswers[
                              questions[currentQuestionIndex]?._id
                            ]?.includes(option.value)
                              ? "bg-blue-50 border-blue-300"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() =>
                            handleAnswerSelection(
                              questions[currentQuestionIndex]?._id,
                              option.value,
                              questions[currentQuestionIndex]?.totalCorrect > 1
                            )
                          }
                        >
                          {questions[currentQuestionIndex]?.totalCorrect > 1 ? (
                            <Checkbox
                              checked={
                                userAnswers[
                                  questions[currentQuestionIndex]?._id
                                ]?.includes(option.value) || false
                              }
                              className="mr-3"
                            />
                          ) : (
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                                userAnswers[
                                  questions[currentQuestionIndex]?._id
                                ]?.includes(option.value)
                                  ? "bg-blue-600 border-blue-600"
                                  : "border-gray-300"
                              }`}
                            >
                              {userAnswers[
                                questions[currentQuestionIndex]?._id
                              ]?.includes(option.value) && (
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                              )}
                            </div>
                          )}
                          <span>{option.value}</span>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Navigation buttons */}
              <div className="flex justify-between mt-6">
                <Button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0 || isSubmitting}
                  variant="outline"
                  className="px-6"
                >
                  Previous
                </Button>

                <div className="flex gap-3">
                  {!isCurrentQuestionAnswered() && (
                    <div className="hidden sm:block text-amber-600 self-center text-sm font-medium">
                      ⚠️ Question not answered
                    </div>
                  )}

                  {currentQuestionIndex === questions.length - 1 ? (
                    <Button
                      onClick={handleOpenPopUp}
                      className="bg-green-600 hover:bg-green-700 px-6"
                      disabled={isSubmitting}
                    >
                      Finish Quiz
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      className="px-6"
                      disabled={isSubmitting}
                    >
                      Next
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPage;
