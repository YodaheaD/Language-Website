"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { ListIcon, WebsiteIcon } from "./low-level/icons";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { getLanguageFlag } from "@/lib/utilsReact";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  List,
  Settings2,
} from "lucide-react";
import JapaneseImage from "./Japanese-Image";

interface FlashcardData {
  word: string;
  definition: string;
  type: string;
}

export default function FlashDashboard() {
  const [fetchDataSet, setFetchData] = useState<"spanish" | "japanese">(
    "spanish"
  );

  // Flashcard states
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [displayMode, setDisplayMode] = useState<"word" | "definition">("word");
  const [isWordListVisible, setIsWordListVisible] = useState(true);
  const [hideForStudy, setHideForStudy] = useState(false);

  // React Query for fetching flashcard data
  const {
    data: tableData = [],
    isLoading,
    error,
    refetch,
  } = useQuery<FlashcardData[]>({
    queryKey: ["flashcards", fetchDataSet],
    queryFn: async () => {
      const endpoint = fetchDataSet === "spanish" ? "spanish" : "japanese";
      const response = await axios.get(
        `/api/data/fetch/${endpoint}?page=1&limit=1000`
      );
      return response.data.data || response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  useEffect(() => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
  }, [fetchDataSet]);

  // Flashcard navigation functions
  const selectCard = (index: number) => {
    setCurrentCardIndex(index);
    setIsFlipped(false);
  };

  const nextCard = () => {
    if (currentCardIndex < tableData.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const currentCard = tableData[currentCardIndex];

  // Helper function to render definition content (text or image)
  const renderDefinition = (
    definition: string,
    size: "small" | "large" = "large",
    type: string
  ) => {
    if (fetchDataSet === "japanese") {
      const heightClass = size === "small" ? "h-12" : "h-32";
      const widthClass = size === "small" ? "w-12" : "w-32";
      return (
        <div className="flex flex-col items-center">
          <JapaneseImage
            value={definition}
            type={type}
            height={heightClass}
            width={widthClass}
            addBorder={false}
            alt={definition}
          />
        </div>
      );
    }
    return <span>{definition}</span>;
  };

  // Handle language selection
  const handleLanguageSelect = (language: "spanish" | "japanese") => {
    setFetchData(language);
  };

  return (
    <div className="flex w-full   bg-zinc-50 dark:bg-black">
      {/* Sidebar */}

      {/* Main Content */}
      <div className="flex-1 flex bg-background text-foreground">
        {/* Flashcard Section */}
        <div
          className={`${
            isWordListVisible ? "w-[78%]" : "w-full"
          } p-2 flex flex-col transition-all duration-300 ease-in-out`}
        >
          <div className="flex flex-row gap-12 w-full px-8 py-1">
            <button
              className={`inline-flex bg-slate-800 hover:bg-slate-600 text-white rounded-md p-1 gap-2${
                fetchDataSet === "spanish" ? " ring-2 ring-offset-2 ring-slate-500" : ""
              }`}
              onClick={() => handleLanguageSelect("spanish")}
            >
              <span className="my-auto">
                {getLanguageFlag("spanish", "medium", true)}
              </span>
              <span>Spanish</span>
            </button>
            <button
       className={`inline-flex bg-slate-800 hover:bg-slate-600 text-white rounded-md p-1 gap-2${
                fetchDataSet === "japanese" ? " ring-2 ring-offset-2 ring-slate-500" : ""
              }`}
              onClick={() => handleLanguageSelect("japanese")}
            >
              <span className="my-auto">
                {getLanguageFlag("japanese", "medium", true)}
              </span>
              <span>Japanese</span>
            </button>
          </div>
          <Separator className="mb-1" />
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight capitalize flex items-center gap-3">
                  Flashcards
                </h1>
                <p className="text-muted-foreground mt-1">
                  {tableData.length} cards in set
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Show:
                </span>
                <Select
                  value={displayMode}
                  onValueChange={(value) => {
                    setDisplayMode(value as "word" | "definition");
                    setIsFlipped(false);
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="word">Word</SelectItem>
                    <SelectItem value="definition">Definition</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsWordListVisible(!isWordListVisible)}
                className="ml-2"
              >
                {isWordListVisible ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col items-center   min-h-0">
            {/* Navigation & Progress */}
            <div className="flex items-center gap-6 mb-8">
              <Button
                variant="secondary"
                size="lg"
                onClick={prevCard}
                disabled={currentCardIndex === 0}
                className="h-12 w-12 rounded-full p-0"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>

              <div className="bg-secondary/50 px-6 py-2 rounded-full font-medium tabular-nums">
                {tableData.length > 0
                  ? `${currentCardIndex + 1} / ${tableData.length}`
                  : "0 / 0"}
              </div>

              <Button
                variant="secondary"
                size="lg"
                onClick={nextCard}
                disabled={currentCardIndex === tableData.length - 1}
                className="h-12 w-12 rounded-full p-0"
              >
                <ArrowRight className="h-6 w-6" />
              </Button>
            </div>

            {/* Flashcard */}
            <div className="w-full max-w-3xl aspect-[16/9]">
              {isLoading ? (
                <Card className="w-2/3 mx-auto h-2/3 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">
                      Loading flashcards...
                    </p>
                  </div>
                </Card>
              ) : error ? (
                <Card className="w-2/3 mx-auto h-2/3 flex items-center justify-center border-red-200">
                  <div className="text-center">
                    <p className="text-red-500 mb-4">
                      Error loading flashcards
                    </p>
                    <button
                      onClick={() => refetch()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Try again
                    </button>
                  </div>
                </Card>
              ) : currentCard ? (
                <Card
                  className={`w-2/3 mx-auto h-2/3 flex items-center justify-center hover:shadow-xl transition-shadow border-2 cursor-pointer ${
                    isFlipped ? "bg-primary/5 border-primary/20" : ""
                  }`}
                  onClick={toggleFlip}
                >
                  <CardContent className="flex flex-col items-center justify-center p-12 text-center h-full w-full">
                    <div
                      className={`font-bold mb-6 ${
                        isFlipped ? "text-4xl text-primary" : "text-5xl"
                      }`}
                    >
                      {!isFlipped
                        ? displayMode === "word"
                          ? currentCard.word
                          : renderDefinition(
                              currentCard.definition,
                              "large",
                              currentCard.type
                            )
                        : displayMode === "word"
                        ? renderDefinition(
                            currentCard.definition,
                            "large",
                            currentCard.type
                          )
                        : currentCard.word}
                    </div>
                    <p
                      className={`text-sm uppercase tracking-wider font-medium ${
                        isFlipped ? "text-primary/60" : "text-muted-foreground"
                      }`}
                    >
                      {isFlipped ? currentCard.type : "Click to flip"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="w-full h-full flex items-center justify-center bg-muted/20">
                  <p className="text-muted-foreground text-xl">
                    No flashcards available
                  </p>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Word List Sidebar */}
        {isWordListVisible && (
          <div className="w-[20%] border-l bg-card flex flex-col transition-all duration-300">
            <div className="p-4 border-b flex items-center justify-between bg-muted/30">
              <div>
                <h2 className="font-semibold text-lg">Word List</h2>
                <p className="text-xs text-muted-foreground">
                  {tableData.length} cards
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>View Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => setHideForStudy(!hideForStudy)}
                  >
                    {hideForStudy ? "Show Definitions" : "Hide Definitions"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="p-4 space-y-2 overflow-y-auto h-[81vh]">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p>Loading flashcards...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  <p>Error loading flashcards</p>
                  <button
                    onClick={() => refetch()}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Try again
                  </button>
                </div>
              ) : tableData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No flashcards available</p>
                </div>
              ) : (
                tableData.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => selectCard(index)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:bg-accent ${
                      index === currentCardIndex
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-transparent"
                    }`}
                  >
                    <div className="font-medium mb-1 flex justify-between items-start">
                      <span>
                        {displayMode === "word"
                          ? item.word
                          : renderDefinition(
                              item.definition,
                              "small",
                              item.type
                            )}
                      </span>
                      {index === currentCardIndex && (
                        <span className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {!hideForStudy &&
                        (displayMode === "word"
                          ? renderDefinition(
                              item.definition,
                              "small",
                              item.type
                            )
                          : item.word)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
