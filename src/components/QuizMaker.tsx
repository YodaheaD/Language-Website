"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";

import { ArrowLeft, Folder, Play } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";

// Import ArrowIcon from Quiz-Component (assuming it exists in low-level components)
import { ArrowIcon } from "@/components/low-level/icons";
import JapaneseImage from "./Japanese-Image";

interface QuizAnswer {
  [key: string]: string;
}

interface QuizResult {
  questionIndex: number;
  question: string;
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
  isPartialCorrect: boolean;
  type: string;
  termId: number;
}

type setupTypeProps = {
  setUp?: "Numerical" | "By Set";
};
export default function QuizMaker(
  // Make props optional with default value
  props?: setupTypeProps
) {
  const { setUp = "Numerical" } = props || {};
  const router = useRouter();

  // Step management: "Configuration", "Take Quiz", "Quiz Results"
  const [currentStep, setCurrentStep] = useState<
    "Configuration" | "Take Quiz" | "Quiz Results"
  >("Configuration");

  const [fetchDataSet, setFetchData] = useState<"spanish" | "japanese">(
    "spanish"
  );
  // Holds all sets data
  const [setsData, setSetsData] = useState<any[]>([]);

  const [totalCount, setTotalCount] = useState(0);

  const [setupType, setSetupType] = useState<setupTypeProps>({
    setUp: setUp || "Numerical",
  });
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [answerType, setAnswerType] = useState<"definition" | "word">(
    "definition"
  );

  const [selectSetLang, setSelectSetLang] = useState<
    "spanish" | "japanese" | null
  >(null);
  const [selectSetKey, setSelectSetKey] = useState<number | null>(null);
  // selected folder name
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  // selected set name
  const [selectedSetName, setSelectedSetName] = useState<string | null>(null);

  const [currentSet, setCurrentSet] = useState("");

  // Quiz state variables (from Quiz-Component)
  const [tableData, setTableData] = useState<any[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  // Quiz configuration state
  const [quizConfig, setQuizConfig] = useState<{
    endpoint: string;
    page: string;
    limit: string;
    answerType: string;
    typeofQuiz: string;
  } | null>(null);

  // Initialize react-hook-form for quiz
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<QuizAnswer>();

  const fetchTotalSize = async () => {
    try {
      const endpoint = fetchDataSet === "spanish" ? "spanish" : "japanese";
      const response = await axios.get(
        `/api/data/fetchSize/${endpoint}`
      );
      setTotalCount(response.data.size || 0);
    } catch (error) {
      console.error("Error fetching size:", error);
    }
  };

  const fetchAllSets = async () => {
    try {
      const response = await axios.get(
        `/api/sets`
      );
      setSetsData(response.data || []);
    } catch (error) {
      console.error("Error fetching size:", error);
    }
  };

  // Quiz data fetching logic (from Quiz-Component)
  const fetchQuizData = async (config: typeof quizConfig) => {
    if (!config) return;

    try {
      setIsLoading(true);
      const itemsPerPageValue = parseInt(config.limit);
      const isSetQuiz = config.typeofQuiz.includes("BySet");

      console.log(
        `Fetching ${isSetQuiz ? "set" : "numerical"} quiz - endpoint: ${
          config.endpoint
        }, page: ${config.page}, limit: ${itemsPerPageValue}`
      );

      let url: string;

      if (isSetQuiz) {
        // Extract set information from typeofQuiz format: "BySet-{id}-{folder}-{setName}"
        const parts = config.typeofQuiz.split("BySet-");
        const setInfo = parts[1].split("-");
        const setId = setInfo[0];
        const folderName = setInfo[1] || "";
        const setName = setInfo[2] || "";

        // Build URL for set data: /sets/get-terms/{setId}/{endpoint}
        url = `/api/sets/get-terms/${setId}/${config.endpoint}`;
      } else {
        // Build URL for numerical quiz data
        url = `/api/data/fetch/${config.endpoint}?page=${
          config.page
        }&limit=${itemsPerPageValue}`;
      }

      const response = await axios.get(url);
      let processedData = response.data;

      // Apply ordering based on quiz type
      if (isSetQuiz) {
        // For sets: maintain order using primaryIDLinkage field
        processedData = response.data.sort((a: any, b: any) => {
          return a.primaryIDLinkage - b.primaryIDLinkage;
        });
      } else {
        // For numerical quizzes: randomize order
        processedData = response.data.sort(() => Math.random() - 0.5);
      }

      setTableData(processedData);
      setIsLoading(false);
      setCurrentStep("Take Quiz");
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  };

  const createMistakeSet = async () => {
    console.log(quizResults);
    const incorrectQuestions = quizResults.filter(
      (result) => !result.isCorrect && !result.isPartialCorrect
    );
    console.log("Incorrect Questions for Mistake Set:");
    console.log(incorrectQuestions);
    const incorrectTermIds = incorrectQuestions.map((result) => result.termId);
    console.log("Incorrect Term IDs:");
    console.log(incorrectTermIds);
    if (incorrectTermIds.length === 0) {
      toast.error("No incorrect answers to create a mistake set.");
      return;
    }
    const now = new Date();

    const formattedDate = new Intl.DateTimeFormat("en-US", {
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .format(now)
      //replace / with - and : with _
      .replace(/\//g, "-")
      .replace(/:/g, "-")
      // remove spaces
      .replace(/ /g, "");

    const setName = `${formattedDate}`;
    const payload = {
      langOfSet: quizConfig?.endpoint,
      setName: setName,
      setFolder: "Mistakes",
      description: `Mistake set created on ${now.toLocaleString()}`,
      termIds: incorrectTermIds,
    };

    //ffor now toast the setNAme and termIds
    toast.success(
      `Creating Mistake Set: ${setName} with ${incorrectTermIds} terms.`
    );

    try {
      const response = await axios.post(
        `/api/sets/createSetWithTerms`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.status === 200 || response.status === 201) {
        toast.success("Mistake set created successfully!");
      } else {
        toast.error("Failed to create mistake set.");
      }
    } catch (error) {
      console.error("Error creating mistake set:", error);
      toast.error("An error occurred while creating the mistake set.");
    }
  };

  // Handle quiz submission
  const onQuizSubmit: SubmitHandler<QuizAnswer> = async (data) => {
    if (!quizConfig) return;

    setIsSubmitting(true);

    const results: QuizResult[] = tableData.map((item, index) => {
      const questionKey = `question_${index}`;
      const userAnswer = data[questionKey]?.trim().toLowerCase() || "";

      let correctAnswer: string;
      let question: string;

      if (quizConfig.answerType === "definition") {
        // User answers with definition, question shows word
        question = item.word;
        correctAnswer = item.definition.trim().toLowerCase();
      } else {
        // User answers with word, question shows definition
        question = item.definition;
        correctAnswer = item.word.trim().toLowerCase();
      }

      const isCorrect = userAnswer === correctAnswer;
      // use includes to check for partial correctness
      const isPartialCorrect =
        !isCorrect && correctAnswer.includes(userAnswer) && userAnswer !== "";
      return {
        questionIndex: index,
        question,
        correctAnswer:
          quizConfig.answerType === "definition" ? item.definition : item.word,
        userAnswer: data[questionKey] || "",
        isCorrect,
        type: item.type || "",
        isPartialCorrect,
        termId: item.primaryid,
      };
    });

    setQuizResults(results);
    setIsSubmitting(false);
    setCurrentStep("Quiz Results");
  };

  // Calculate quiz score
  const calculateScore = () => {
    if (quizResults.length === 0)
      return { correct: 0, total: 0, percentage: 0 };
    const correct = quizResults.filter(
      (result) => result.isCorrect || result.isPartialCorrect
    ).length;
    const total = quizResults.length;
    const percentage = Math.round((correct / total) * 100);
    return { correct, total, percentage };
  };

  // Handle retesting mistakes
  const retestMistakes = () => {
    // Filter tableData to only include questions that were answered incorrectly
    const incorrectQuestions = quizResults
      .filter((result) => !result.isCorrect || !result.isPartialCorrect)
      .map((result) => tableData[result.questionIndex]);

    if (incorrectQuestions.length > 0) {
      setTableData(incorrectQuestions);
      setQuizResults([]);
      reset();
      setCurrentStep("Take Quiz");
    }
  };

  // Check if all questions were answered correctly
  const allCorrect = () => {
    return (
      quizResults.length > 0 &&
      quizResults.every((result) => result.isCorrect || result.isPartialCorrect)
    );
  };

  // Start quiz function
  const startQuiz = (config: {
    endpoint: string;
    page: string;
    limit: string;
    answerType: string;
    typeofQuiz: string;
  }) => {
    setQuizConfig(config);
    fetchQuizData(config);
  };

  // use the total counts and the items per page to make sets , ex: if total is 102 and items per page is 10, we have 11 sets (10 full sets of 10 and 1 set of 2)
  // So what is returned is an array that looks like: ["1-10", "11-20", "21-30", ...]
  const returnDiviatedSets = () => {
    if (totalCount === 0 || itemsPerPage === 0) return [];

    const sets: string[] = [];
    const totalSets = Math.ceil(totalCount / itemsPerPage);

    for (let i = 0; i < totalSets; i++) {
      const start = i * itemsPerPage + 1;
      const end = Math.min((i + 1) * itemsPerPage, totalCount);
      sets.push(`${start}-${end}`);
    }

    return sets;
  };

  //   // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchTotalSize();
    fetchAllSets();
  }, [fetchDataSet]);

  // Use this effect to set the answer type to definition if language is japanese
  useEffect(() => {
    if (fetchDataSet === "japanese") {
      setAnswerType("word");
    }
  }, [fetchDataSet]);

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Configuration Step */}
      {currentStep === "Configuration" && (
        <Card className="w-full shadow-lg">
          <CardHeader className="pb-1">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <CardTitle className="text-3xl font-bold">Quiz Setup</CardTitle>
                <CardDescription>
                  Configure your quiz settings below
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push("/study")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Study
              </Button>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-2">
            <Tabs
              defaultValue={setupType.setUp}
              onValueChange={(val) =>
                setSetupType({ setUp: val as "Numerical" | "By Set" })
              }
              className="w-full"
            >
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
                <TabsTrigger value="Numerical">Numerical</TabsTrigger>
                <TabsTrigger value="By Set">By Set</TabsTrigger>
              </TabsList>

              <TabsContent value="By Set" className="space-y-6">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium min-w-[100px]">
                    Language:
                  </label>
                  <Select
                    value={fetchDataSet}
                    onValueChange={(val) => {
                      setFetchData(val as "spanish" | "japanese");
                      setSelectSetLang(null);
                      setSelectSetKey(null);
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spanish">Spanish</SelectItem>
                      <SelectItem value="japanese">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <ScrollArea className="h-[500px] rounded-md border p-4">
                  <div className="space-y-8">
                    {setsData
                      .filter(
                        (folderData) => folderData.langOfSet === fetchDataSet
                      )
                      .map((folderData) => (
                        <div key={folderData.folder}>
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-primary">
                            <Folder className="h-5 w-5" />
                            {folderData.folder.replace(/_/g, " ")}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {folderData.sets.map((set: any) => (
                              <Card
                                key={set.primaryid}
                                onClick={() => {
                                  setSelectSetLang(
                                    folderData.langOfSet as
                                      | "spanish"
                                      | "japanese"
                                  );
                                  setSelectSetKey(set.primaryid);
                                  setSelectedFolder(folderData.folder);
                                  setSelectedSetName(set.setName);
                                }}
                                className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50 ${
                                  selectSetLang === folderData.langOfSet &&
                                  selectSetKey === set.primaryid
                                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                                    : "bg-card"
                                }`}
                              >
                                <CardContent className="p-4">
                                  <div className="font-semibold mb-1">
                                    {set.setName}
                                  </div>
                                  {set.description && (
                                    <div className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                      {set.description}
                                    </div>
                                  )}
                                  <div className="text-xs text-muted-foreground/70">
                                    Created:{" "}
                                    {new Date(
                                      set.dateCreated
                                    ).toLocaleDateString()}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>

                {fetchDataSet !== "japanese" && (
                  <div className="flex items-center gap-4 pt-4 border-t">
                    <label className="text-sm font-medium min-w-[100px]">
                      Answer Type:
                    </label>
                    <Select
                      value={answerType}
                      onValueChange={(val) =>
                        setAnswerType(val as "definition" | "word")
                      }
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="definition">Definition</SelectItem>
                        <SelectItem value="word">Word</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="pt-4">
                  <Button
                    size="lg"
                    className="w-full md:w-auto gap-2"
                    onClick={() => {
                      if (selectSetKey && selectSetLang) {
                        const config = {
                          endpoint: selectSetLang,
                          page: "1",
                          limit: "999",
                          answerType,
                          typeofQuiz: `BySet-${selectSetKey}-${selectedFolder}-${selectedSetName}`,
                        };
                        startQuiz(config);
                      }
                    }}
                    disabled={!selectSetKey || !selectSetLang}
                  >
                    <Play className="h-4 w-4" />
                    Start Quiz
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="Numerical" className="space-y-6">
                <div className="grid gap-6 max-w-xl">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium min-w-[100px]">
                      Language:
                    </label>
                    <div className="flex items-center gap-4 flex-1">
                      <Select
                        value={fetchDataSet}
                        onValueChange={(val) =>
                          setFetchData(val as "spanish" | "japanese")
                        }
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spanish">Spanish</SelectItem>
                          <SelectItem value="japanese">Japanese</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-muted-foreground">
                        Total: {totalCount}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium min-w-[100px]">
                      Items per page:
                    </label>
                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={(val) => setItemsPerPage(Number(val))}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select Limit" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90,
                          100,
                        ].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium min-w-[100px]">
                      Set:
                    </label>
                    <Select
                      value={currentSet}
                      onValueChange={(val) => setCurrentSet(val)}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select Set" />
                      </SelectTrigger>
                      <SelectContent>
                        {returnDiviatedSets().map((num) => (
                          <SelectItem key={num} value={num}>
                            {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {fetchDataSet !== "japanese" && (
                    <div className="flex items-center gap-4">
                      <label className="text-sm font-medium min-w-[100px]">
                        Answer Type:
                      </label>
                      <Select
                        value={answerType}
                        onValueChange={(val) =>
                          setAnswerType(val as "definition" | "word")
                        }
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="definition">Definition</SelectItem>
                          <SelectItem value="word">Word</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="pt-4">
                    <Button
                      size="lg"
                      className="w-full md:w-auto gap-2"
                      onClick={async () => {
                        const endpoint =
                          fetchDataSet === "spanish" ? "spanish" : "japanese";
                        const [startStr, endStr] = currentSet.split("-");
                        const startIndex = Number(startStr);
                        const page =
                          Math.floor((startIndex - 1) / itemsPerPage) + 1;
                        const config = {
                          endpoint,
                          page: page.toString(),
                          limit: itemsPerPage.toString(),
                          answerType,
                          typeofQuiz: setupType.setUp || "Numerical",
                        };
                        startQuiz(config);
                      }}
                    >
                      <Play className="h-4 w-4" />
                      Start Quiz
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="flex justify-center items-center p-8">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-lg">Loading quiz data...</span>
          </div>
        </div>
      )}

      {/* Take Quiz Step */}
      {currentStep === "Take Quiz" && !isLoading && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 flex flex-col md:flex-row justify-between">
            <div className="flex flex-col gap-8 mb-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-900 flex flex-col">
                  {quizConfig?.typeofQuiz?.includes("BySet") &&
                  selectedFolder &&
                  selectedSetName ? (
                    <>
                      <span>
                        {selectedFolder.replace(/_/g, " ")} - {selectedSetName}
                      </span>
                      <span className="text-lg font-normal text-slate-900">
                        Set Quiz
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="capitalize">{quizConfig?.endpoint}</span>
                      <span className="text-lg font-normal text-slate-900">
                        Numerical Quiz
                      </span>
                    </>
                  )}
                </h2>
                <Separator className="my-1" />
                <p className="text-slate-900  ">
                  Answer with{" "}
                  {quizConfig?.answerType === "definition"
                    ? "definition"
                    : "word"}
                </p>
              </div>{" "}
              <Separator className="" />
              <div className="text-center">
                <p className="text-sm text-slate-900">
                  {tableData.length} Questions
                </p>
              </div>{" "}
              <button
                onClick={() => setCurrentStep("Configuration")}
                className="px-4 py-2 w-fit mx-auto bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <ArrowIcon direction="left" />
                <span>Back</span>
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onQuizSubmit)}
              className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full px-2 md:px-12"
            >
              {tableData.map((item, index) => (
                <div
                  key={index}
                  className="bg-white shadow-sm border border-gray-200 rounded-lg px-6 py-2"
                >
                  <div className="mb-3">
                    <p className="text-base   text-gray-900 mb-2">
                      Question {index + 1}:
                    </p>
                    {quizConfig?.endpoint !== "japanese" ? (
                      <p className="text-black text-xl font-semibold leading-relaxed">
                        {quizConfig?.answerType === "definition"
                          ? item.word
                          : item.definition}
                      </p>
                    ) : (
                      <JapaneseImage
                        value={String(item.definition)}
                        type={item.type || ""}
                        height="h-16"
                        width="w-16"
                        addBorder={true}
                        alt={`${item.word || "Character"} - ${item.value}`}
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      id={`question_${index}`}
                      placeholder={`Enter ${
                        quizConfig?.answerType === "definition"
                          ? "definition"
                          : "word"
                      }`}
                      className="w-full px-4 py-3 border bg-slate-50 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      {...register(`question_${index}`, {
                        required: "This field is required",
                      })}
                    />
                    {errors[`question_${index}`] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[`question_${index}`]?.message}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    "Submit Quiz"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quiz Results Step */}
      {currentStep === "Quiz Results" && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="text-center mb-8 flex flex-col md:flex-row  justify-center md:gap-12">
              <h2 className="text-3xl my-auto font-bold text-slate-900 ">
                Quiz Results
              </h2>

              <div className="flex flex-col  my-auto gap-3">
                {" "}
                <div className="text-4xl font-bold mb-4">
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
              </div>
              <div className="mt-6 font-semibold grid grid-cols-2 gap-1 h-1/2  ">
                <button
                  onClick={() => {
                    setQuizResults([]);
                    reset();
                    setCurrentStep("Take Quiz");
                  }}
                  className=" p-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Retake Quiz
                </button>
                <button
                  onClick={retestMistakes}
                  disabled={allCorrect()}
                  className={` p-1 rounded-lg transition-colors duration-200 ${
                    allCorrect()
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-orange-600 text-white hover:bg-orange-700"
                  }`}
                >
                  Retest Mistakes
                </button>
                <button
                  onClick={() => setCurrentStep("Configuration")}
                  className=" p-1 bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors duration-200"
                >
                  Back to Config
                </button>
                <button
                  onClick={createMistakeSet}
                  className=" p-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  Create Mistake Set
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8  ">
              {quizResults
                .slice()
                .sort((a, b) => {
                  // Sort incorrect answers first, then correct ones
                  // Within each group, maintain original order
                  const aIsIncorrect = !a.isCorrect && !a.isPartialCorrect;
                  const bIsIncorrect = !b.isCorrect && !b.isPartialCorrect;
                  
                  if (aIsIncorrect && !bIsIncorrect) return -1;
                  if (!aIsIncorrect && bIsIncorrect) return 1;
                  
                  // If both are in the same category, maintain original order
                  return a.questionIndex - b.questionIndex;
                })
                .map((result, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg ${
                    result.isCorrect
                      ? "bg-green-50 border-green-200"
                      : result.isPartialCorrect
                      ? "bg-yellow-50 border-yellow-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex flex-row justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold">
                      Question {index + 1}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        result.isCorrect
                          ? "bg-green-100 text-green-800"
                          : result.isPartialCorrect
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {result.isCorrect
                        ? "Correct"
                        : result.isPartialCorrect
                        ? "Partial"
                        : "Incorrect"}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">
                        Question:
                      </span>

                      {quizConfig?.endpoint !== "japanese" ? (
                        <p className="text-gray-900">{result.question}</p>
                      ) : (
                        <JapaneseImage
                          value={String(result.question)}
                          type={result.type || ""}
                          height="h-16"
                          width="w-16"
                          addBorder={true}
                          alt={`Alt image for ${result.question}`}
                        />
                      )}
                    </div>

                    <div>
                      <span className="font-medium text-gray-600">
                        Your Answer:
                      </span>
                      <p
                        className={`${
                          result.isCorrect
                            ? "text-green-700"
                            : result.isPartialCorrect
                            ? "text-yellow-700"
                            : "text-red-700"
                        }`}
                      >
                        {result.userAnswer || "No answer provided"}
                      </p>
                    </div>

                    {!result.isCorrect && (
                      <div>
                        <span className="font-medium text-gray-600">
                          Correct Answer:
                        </span>
                        <p className="text-green-700 font-medium">
                          {result.correctAnswer}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
