"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { ArrowIcon } from "./low-level/icons";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

interface QuizAnswer {
  [key: string]: string;
}

interface QuizResult {
  questionIndex: number;
  question: string;
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
}

interface QuizItem {
  word: string;
  definition: string;
}

export default function QuizMakerManual() {
  const router = useRouter();
  const [tableData, setTableData] = useState<QuizItem[]>([]);
  const [onStep, setOnStep] = useState<
    "Make Quiz" | "Take Quiz" | "Quiz Results"
  >("Make Quiz");
  const [answerType, setAnswerType] = useState<"definition" | "word">(
    "definition"
  );
  const [csvInput, setCsvInput] = useState("");
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<QuizAnswer>();

  const parseCSVData = () => {
    try {
      if (!csvInput.trim()) {
        alert("Please enter some CSV data");
        return;
      }

      const lines = csvInput.trim().split('\n');
      const parsedData: QuizItem[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines

        const [word, definition] = line.split(',').map(item => item.trim());
        
        if (!word || !definition) {
          alert(`Invalid format on line ${i + 1}. Expected format: word,definition`);
          return;
        }

        parsedData.push({ word, definition });
      }

      if (parsedData.length === 0) {
        alert("No valid data found. Please check your CSV format.");
        return;
      }

      // Randomize the data
      const randomizedData = parsedData.sort(() => Math.random() - 0.5);
      setTableData(randomizedData);
      setOnStep("Take Quiz");
    } catch (error) {
      console.error("Error parsing CSV data:", error);
      alert("Error parsing CSV data. Please check the format.");
    }
  };

  const backButton = () => {
    // Clear data
    setTableData([]);
    setQuizResults([]);
    setOnStep("Make Quiz");
    reset();
  };

  // Handle quiz submission
  const onQuizSubmit: SubmitHandler<QuizAnswer> = async (data) => {
    setIsSubmitting(true);

    const results: QuizResult[] = tableData.map((item, index) => {
      const questionKey = `question_${index}`;
      const userAnswer = data[questionKey]?.trim().toLowerCase() || "";

      let correctAnswer: string;
      let question: string;

      if (answerType === "definition") {
        // User answers with definition, question shows word
        question = item.word;
        correctAnswer = item.definition.trim().toLowerCase();
      } else {
        // User answers with word, question shows definition
        question = item.definition;
        correctAnswer = item.word.trim().toLowerCase();
      }

      const isCorrect = userAnswer === correctAnswer;

      return {
        questionIndex: index,
        question,
        correctAnswer: answerType === "definition" ? item.definition : item.word,
        userAnswer: data[questionKey] || "",
        isCorrect,
      };
    });

    setQuizResults(results);
    setIsSubmitting(false);
    setOnStep("Quiz Results");
  };

  // Calculate quiz score
  const calculateScore = () => {
    if (quizResults.length === 0)
      return { correct: 0, total: 0, percentage: 0 };
    const correct = quizResults.filter((result) => result.isCorrect).length;
    const total = quizResults.length;
    const percentage = Math.round((correct / total) * 100);
    return { correct, total, percentage };
  };

  // Handle retesting mistakes
  const retestMistakes = () => {
    // Filter tableData to only include questions that were answered incorrectly
    const incorrectQuestions = quizResults
      .filter((result) => !result.isCorrect)
      .map((result) => tableData[result.questionIndex]);

    if (incorrectQuestions.length > 0) {
      setTableData(incorrectQuestions);
      setQuizResults([]);
      reset();
      setOnStep("Take Quiz");
    }
  };

  // Check if all questions were answered correctly
  const allCorrect = () => {
    return (
      quizResults.length > 0 && quizResults.every((result) => result.isCorrect)
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Table Container */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {onStep === "Make Quiz" && (
          <div className="flex flex-col gap-8 p-8 rounded-sm">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-black">Manual Quiz Maker Setup</h1>
              <button
                onClick={() => router.push('/study')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
              >
                <ArrowIcon direction="left" />
                <span>Back to Study</span>
              </button>
            </div>
            <Separator />
            <div className="px-4">
              <div className="flex flex-col gap-6">
                {/* CSV Input Section */}
                <div className="flex flex-col space-y-3">
                  <label
                    htmlFor="csv-input"
                    className="text-sm font-medium text-black"
                  >
                    Enter your data (Format: word,definition - one per line):
                  </label>
                  <textarea
                    id="csv-input"
                    value={csvInput}
                    onChange={(e) => setCsvInput(e.target.value)}
                    placeholder="Chizu,map&#10;Hana,flower&#10;Inu,dog&#10;Kaban,bag&#10;Kemushi,hairy caterpillar&#10;Ki,tree&#10;Koma,spinning top&#10;Kuruma,car&#10;Nabe,cooking pot"
                    className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    Example format: Each line should contain word,definition separated by a comma
                  </p>
                </div>

                <Separator />

                {/* Answer Type Selection */}
                <div className="flex items-center border-b-2 pb-6 space-x-3">
                  <label className="text-sm font-medium text-black">
                    Answer Type:
                  </label>
                  <select
                    id="answer-type"
                    value={answerType}
                    onChange={(e) => {
                      setAnswerType(e.target.value as "definition" | "word");
                    }}
                    className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-black hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 shadow-sm"
                  >
                    <option value="definition">Definition (Show word, answer with definition)</option>
                    <option value="word">Word (Show definition, answer with word)</option>
                  </select>
                </div>

                {/* Parse and Start Quiz Button */}
                <button
                  onClick={parseCSVData}
                  disabled={!csvInput.trim()}
                  className={`px-6 py-3 rounded-lg transition-colors duration-200 font-medium ${
                    csvInput.trim()
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Create Quiz
                </button>
              </div>
            </div>
          </div>
        )}

        {onStep === "Take Quiz" && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => backButton()}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <ArrowIcon direction="left" />
                <span>Back to Setup</span>
              </button>

              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Manual Quiz</h2>
                <p className="text-gray-600 mt-1">
                  Answer with{" "}
                  {answerType === "definition" ? "definitions" : "words"}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {tableData.length} Questions
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit(onQuizSubmit)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {tableData.map((item, index) => (
                <div
                  key={index}
                  className="bg-slate-50 border border-gray-200 rounded-lg px-6 py-4"
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Question {index + 1}
                    </h3>
                    <p className="text-black text-lg">
                      {answerType === "definition" ? (
                        <>
                          <span className="font-medium">Word:</span> {item.word}
                        </>
                      ) : (
                        <>
                          <span className="font-medium">Definition:</span>{" "}
                          {item.definition}
                        </>
                      )}
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor={`question_${index}`}
                      className="block text-sm font-medium text-black mb-2"
                    >
                      Your answer ({answerType}):
                    </label>
                    <input
                      id={`question_${index}`}
                      type="text"
                      {...register(`question_${index}`, {
                        required: "This field is required",
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                      placeholder={`Enter ${answerType}...`}
                      disabled={isSubmitting}
                    />
                    {errors[`question_${index}`] && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors[`question_${index}`]?.message}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              <div className="col-span-full sticky bottom-0 bg-white border-t border-gray-200 p-4 flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isSubmitting ? (
                    <span className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Checking Answers...</span>
                    </span>
                  ) : (
                    "Submit Quiz"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {onStep === "Quiz Results" && (
          <div className="p-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Quiz Results
              </h2>
              <div className="text-6xl font-bold mb-4">
                <span
                  className={
                    calculateScore().percentage >= 70
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {calculateScore().percentage}%
                </span>
              </div>
              <p className="text-xl text-gray-600">
                {calculateScore().correct} out of {calculateScore().total}{" "}
                correct
              </p>

              <div className="mt-6 flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setOnStep("Take Quiz");
                    reset();
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Retake Quiz
                </button>
                <button
                  onClick={retestMistakes}
                  disabled={allCorrect()}
                  className={`px-6 py-2 rounded-lg transition-colors duration-200 ${
                    allCorrect()
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-orange-600 text-white hover:bg-orange-700"
                  }`}
                >
                  Retest Mistakes
                </button>
                <button
                  onClick={() => backButton()}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  New Quiz
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-96 overflow-y-auto">
              {quizResults.map((result, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    result.isCorrect
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Question {index + 1}
                      </h4>
                      <p className="text-black mb-2">
                        <span className="font-medium">Question:</span>{" "}
                        {result.question}
                      </p>
                      <p className="text-black mb-2">
                        <span className="font-medium">Your Answer:</span>{" "}
                        {result.userAnswer || "No answer"}
                      </p>
                      <p className="text-black">
                        <span className="font-medium">Correct Answer:</span>{" "}
                        {result.correctAnswer}
                      </p>
                    </div>
                    <div className="ml-4">
                      {result.isCorrect ? (
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
