"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowIcon,
  FolderIcon,
  FolderOpen,
  ChevronIcon,
  ListIcon,
} from "./low-level/icons";
import Link from "next/link";
import { getLanguageFlag } from "@/lib/utilsReact";
import JapaneseImage from "./Japanese-Image";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { returnImageforDefintion } from "@/lib/utils";
import axios from "axios";
import { useSetsData } from "@/hooks/useTableData";

export default function SetTable() {
  const [fetchDataSet, setFetchData] = useState<"spanish" | "japanese">(
    "spanish"
  );
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [expandedLanguages, setExpandedLanguages] = useState<Set<string>>(
    new Set(["spanish", "japanese"])
  );
  const [showSidebar, setShowSidebar] = useState<boolean>(true);

  // Selected set states
  const [selectedSet, setSelectedSet] = useState<{
    setName: string;
    folderName: string;
    setLanguage: string;
    primaryId: number;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState<string>("");

  type Term = {
    word: string;
    definition: string;
    primaryid: number;
    type?: string;
  };

  type termsHolder = {
    word: string;
    definition: string;
    primaryid: number;
  };
  const [addTermsHolder, setAddTermsHolder] = useState<termsHolder[]>([]);

  // React Query hook
  const { data: tableData = [], isLoading, error, isFetching } = useSetsData();
  const queryClient = useQueryClient();

  // Query for terms in selected set
  const {
    data: setTerms = [],
    isLoading: termsLoading,
    refetch: refetchTerms,
  } = useQuery<Term[]>({
    queryKey: ["setTerms", selectedSet?.primaryId, selectedSet?.setLanguage],
    queryFn: async () => {
      if (!selectedSet) return [];
      const response = await axios.get(
        `/api/sets/get-terms/${selectedSet.primaryId}/${selectedSet.setLanguage}`
      );
      return response.data || [];
    },
    enabled: !!selectedSet?.primaryId && !!selectedSet?.setLanguage,
  });

  // Query for terms available to add
  const {
    data: AddTermsData = [],
    isLoading: addTermsLoading,
    refetch: refetchAddTerms,
  } = useQuery<Term[]>({
    queryKey: ["availableTerms", selectedSet?.setLanguage],
    queryFn: async () => {
      if (!selectedSet) return [];
      const endpoint =
        selectedSet.setLanguage === "spanish" ? "spanish" : "japanese";
      const response = await axios.get(
        `/api/data/fetch/${endpoint}?page=1&limit=100`
      );
      return response.data.data || response.data;
    },
    enabled: false, // Only fetch when explicitly called
  });

  // Mutation for adding terms to set
  const addTermsMutation = useMutation({
    mutationFn: async (termIds: number[]) => {
      if (!selectedSet) throw new Error("No set selected");
      const response = await axios.post(`/api/sets/add-terms`, {
        setId: selectedSet.primaryId,
        termIds: termIds,
      });
      return response.data;
    },
    onSuccess: () => {
      setSubmitStatus("success");
      setSubmitMessage("Terms added to set successfully!");
      setAddTermsHolder([]);
      setSearchTerm("");
      // Refresh the terms list
      queryClient.invalidateQueries({
        queryKey: [
          "setTerms",
          selectedSet?.primaryId,
          selectedSet?.setLanguage,
        ],
      });
      // Close the sheet after a brief delay
      setTimeout(() => {
        const closeButton = document.querySelector(
          "[data-sheet-close]"
        ) as HTMLElement;
        if (closeButton) {
          closeButton.click();
        }
        setSubmitStatus("idle");
        setSubmitMessage("");
      }, 1500);
    },
    onError: (error) => {
      console.error("Error adding terms:", error);
      setSubmitStatus("error");
      setSubmitMessage("Error: Terms weren't added. Please try again.");
    },
  });

  // Filter data based on selected language using useMemo for performance
  const spanishData = useMemo(() => {
    if (tableData.length === 0) return [];
    return tableData.filter(
      (folder) => folder.langOfSet.toLowerCase() === "spanish"
    );
  }, [tableData]);

  const japaneseData = useMemo(() => {
    if (tableData.length === 0) return [];
    return tableData.filter(
      (folder) => folder.langOfSet.toLowerCase() === "japanese"
    );
  }, [tableData]);

  // Toggle folder expansion
  const toggleFolder = (folderName: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderName)) {
      newExpanded.delete(folderName);
    } else {
      newExpanded.add(folderName);
    }
    setExpandedFolders(newExpanded);
  };

  // Toggle language expansion
  const toggleLanguage = (language: string) => {
    const newExpanded = new Set(expandedLanguages);
    if (newExpanded.has(language)) {
      newExpanded.delete(language);
    } else {
      newExpanded.add(language);
    }
    setExpandedLanguages(newExpanded);
  };

  // Handle set selection
  const handleSetSelection = (
    setName: string,
    folderName: string,
    language: string,
    primaryid: number
  ) => {
    const newSelectedSet = {
      setName,
      folderName,
      setLanguage: language,
      primaryId: primaryid,
    };
    setSelectedSet(newSelectedSet);
  };

  // Fetch data for adding terms
  const fetchData = async () => {
    await refetchAddTerms();
  };

  // Handle checkbox change for adding/removing terms
  const handleTermSelection = (term: Term, isChecked: boolean) => {
    if (isChecked) {
      // Add term to holder array if not already present
      setAddTermsHolder((prev) => {
        const exists = prev.some(
          (item) =>
            item.word === term.word &&
            item.definition === term.definition &&
            item.primaryid === term.primaryid
        );
        if (!exists) {
          return [
            ...prev,
            {
              word: term.word,
              definition: term.definition,
              primaryid: term.primaryid,
            },
          ];
        }
        return prev;
      });
    } else {
      // Remove term from holder array
      setAddTermsHolder((prev) =>
        prev.filter(
          (item) =>
            !(
              item.word === term.word &&
              item.definition === term.definition &&
              item.primaryid === term.primaryid
            )
        )
      );
    }
  };

  // Check if a term is currently selected
  const isTermSelected = (term: Pick<Term, "word" | "definition">) => {
    return addTermsHolder.some(
      (item) => item.word === term.word && item.definition === term.definition
    );
  };

  // Filter terms based on search
  const filteredTerms: Term[] = AddTermsData.filter(
    (term: Term) =>
      term.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.primaryid.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle adding terms to the set
  const handleAddTerms = async () => {
    if (addTermsHolder.length === 0 || !selectedSet) return;

    setSubmitStatus("loading");
    setSubmitMessage("");

    // Extract primary IDs from selected terms
    const termIds = addTermsHolder
      .map((term) => {
        // Find the corresponding term in AddTermsData to get its primaryid
        const fullTerm = AddTermsData.find(
          (t: Term) => t.word === term.word && t.definition === term.definition
        );
        return fullTerm?.primaryid;
      })
      .filter((id) => id !== undefined);

    addTermsMutation.mutate(termIds);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Handle loading and error states
  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto p-3 sm:p-6 flex items-center justify-center min-h-[50vh]">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg
            className="w-12 h-12 text-red-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Error Loading Sets
          </h3>
          <p className="text-red-600">
            Failed to load sets data. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full h-[91vh] bg-zinc-50 dark:bg-black">
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-72  h-[85vh] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-row justify-between items-center">
            <h2 className="text-2xl font-bold xl:text-3xl inline-flex  gap-2   text-gray-900 dark:text-white">
              <button
                onClick={() => setShowSidebar((prev) => !prev)}
                className="my-auto"
              >
                <ListIcon className=" mt-2 m-auto" />{" "}
              </button>
              <span>Sets</span>
            </h2>
            <div className=" flex flex-row gap-3  ">
              <Link
                href="/createSet"
                className="inline-flex items-center justify-center p-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create
              </Link>
              <Link
                href="/deleteSet"
                className="inline-flex items-center justify-center p-1 border text-black text-sm font-medium rounded-md shadow-sm border-red-600 hover:border-red-700"
              >
                Delete
              </Link>
            </div>
          </div>

          <div className="p-4  ">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                <div className=" rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-sm mt-2">Loading sets...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <p className="text-sm">Error loading sets</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Spanish Section */}
                <div>
                  <div
                    onClick={() => toggleLanguage("spanish")}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-lg"
                  >
                    <ChevronIcon
                      direction="right"
                      width={16}
                      height={16}
                      className={`text-gray-400  duration-200 ${
                        expandedLanguages.has("spanish") ? " rotate-90" : ""
                      }`}
                    />
                    <div className="flex items-center space-x-2">
                      {getLanguageFlag("spanish", "medium")}
                      <span className="font-medium px-4 text-gray-900 dark:text-white">
                        Spanish
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                        {spanishData.reduce(
                          (acc, folder) => acc + folder.sets.length,
                          0
                        )}
                      </span>
                    </div>
                  </div>

                  {expandedLanguages.has("spanish") && (
                    <div className="ml-4 space-y-1">
                      {spanishData.map((folderData, index) => (
                        <div key={`spanish-${folderData.folder}-${index}`}>
                          <div
                            onClick={() =>
                              toggleFolder(`spanish-${folderData.folder}`)
                            }
                            className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-lg"
                          >
                            <ChevronIcon
                              direction="right"
                              width={14}
                              height={14}
                              className={`text-gray-400  duration-200 ${
                                expandedFolders.has(
                                  `spanish-${folderData.folder}`
                                )
                                  ? " rotate-90"
                                  : ""
                              }`}
                            />
                            <FolderIcon />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {folderData.folder}
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                              {folderData.sets.length}
                            </span>
                          </div>

                          {expandedFolders.has(
                            `spanish-${folderData.folder}`
                          ) && (
                            <div className="ml-4 space-y-1">
                              {folderData.sets.map((set, setIndex) => (
                                <div
                                  key={`spanish-set-${set.setName}-${setIndex}`}
                                  onClick={() =>
                                    handleSetSelection(
                                      set.setName,
                                      folderData.folder,
                                      folderData.langOfSet,
                                      set.primaryid
                                    )
                                  }
                                  className={`flex items-center space-x-2 p-2 hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer rounded-lg ${
                                    selectedSet?.primaryId === set.primaryid
                                      ? "bg-blue-100 dark:bg-blue-900"
                                      : ""
                                  }`}
                                >
                                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                  <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                    {set.setName}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Japanese Section */}
                <div>
                  <div
                    onClick={() => toggleLanguage("japanese")}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-lg"
                  >
                    <ChevronIcon
                      direction="right"
                      width={16}
                      height={16}
                      className={`text-gray-400  duration-200 ${
                        expandedLanguages.has("japanese") ? " rotate-90" : ""
                      }`}
                    />
                    <div className="flex items-center space-x-2">
                      {getLanguageFlag("japanese", "medium")}
                      <span className="font-medium px-4 text-gray-900 dark:text-white">
                        Japanese
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                        {japaneseData.reduce(
                          (acc, folder) => acc + folder.sets.length,
                          0
                        )}
                      </span>
                    </div>
                  </div>

                  {expandedLanguages.has("japanese") && (
                    <div className="ml-4 space-y-1">
                      {japaneseData.map((folderData, index) => (
                        <div key={`japanese-${folderData.folder}-${index}`}>
                          <div
                            onClick={() =>
                              toggleFolder(`japanese-${folderData.folder}`)
                            }
                            className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-lg"
                          >
                            <ChevronIcon
                              direction="right"
                              width={14}
                              height={14}
                              className={`text-gray-400  duration-200 ${
                                expandedFolders.has(
                                  `japanese-${folderData.folder}`
                                )
                                  ? " rotate-90"
                                  : ""
                              }`}
                            />
                            <FolderIcon />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {folderData.folder}
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                              {folderData.sets.length}
                            </span>
                          </div>

                          {expandedFolders.has(
                            `japanese-${folderData.folder}`
                          ) && (
                            <div className="ml-4 space-y-1">
                              {folderData.sets.map((set, setIndex) => (
                                <div
                                  key={`japanese-set-${set.setName}-${setIndex}`}
                                  onClick={() =>
                                    handleSetSelection(
                                      set.setName,
                                      folderData.folder,
                                      folderData.langOfSet,
                                      set.primaryid
                                    )
                                  }
                                  className={`flex items-center space-x-2 p-2 hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer rounded-lg ${
                                    selectedSet?.primaryId === set.primaryid
                                      ? "bg-blue-100 dark:bg-blue-900"
                                      : ""
                                  }`}
                                >
                                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                  <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                    {set.setName}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {!showSidebar && (
          <div className=" ">
            <button
              onClick={() => setShowSidebar(true)}
              className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ListIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        )}
        {selectedSet ? (
          <div className="container mx-auto p-4">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <div className="text-3xl text-start font-bold min-w-md text-gray-900 dark:text-white mb-2 flex justify-between items-center">
                  <h1 className="text-3xl text-start font-bold min-w-md text-gray-900 dark:text-white mb-2 inline-flex gap-2">
                    <span className="font-normal">set</span>{" "}
                    {selectedSet.setName}{" "}
                    {getLanguageFlag(selectedSet.setLanguage, "large")}
                  </h1>
                  <div className="flex flex-row gap-2">
                    <Link
                      href={`/study/Quiz/${selectedSet.setLanguage}+1+999+word+BySet-${selectedSet.primaryId}-${selectedSet.folderName}-${selectedSet.setName}`}
                      target="_blank"
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                    >
                      Quiz by word
                    </Link>
                    {selectedSet.setLanguage !== "japanese" && (
                      <Link
                        href={`/study/Quiz/${selectedSet.setLanguage}+1+999+definition+BySet-${selectedSet.primaryId}-${selectedSet.folderName}-${selectedSet.setName}`}
                        target="_blank"
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                      >
                        Quiz by definition
                      </Link>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 flex flex-row gap-2">
                  <FolderIcon />{" "}
                  <span className="font-bold">{selectedSet.folderName}</span>
                </p>
              </div>

              {/* Terms Display */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Current Terms ({setTerms.length})
                  </h3>

                  <Sheet>
                    <SheetTrigger asChild>
                      <button
                        onClick={async () => {
                          await fetchData();
                          setSearchTerm(""); // Clear search when opening
                        }}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-sm"
                      >
                        Add
                      </button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>
                          Add terms to Set: {selectedSet.setName}
                        </SheetTitle>
                        <SheetDescription>
                          Select the boxes to add new terms to this set and
                          select "Save changes" when you're done.
                        </SheetDescription>

                        {/* Search Input */}
                        <div className="mb-4">
                          <input
                            type="text"
                            placeholder="Search by word, definition, or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          {searchTerm && (
                            <button
                              onClick={() => setSearchTerm("")}
                              className="absolute right-3 top-1/2  -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              ×
                            </button>
                          )}
                        </div>

                        {/* Status Messages */}
                        {(submitStatus === "loading" ||
                          addTermsMutation.isPending) && (
                          <div className="mb-4 flex items-center justify-center p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <div className=" rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                            <span className="text-blue-800 text-sm">
                              Adding terms to set...
                            </span>
                          </div>
                        )}

                        {submitStatus === "success" && (
                          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                            <span className="text-green-800 text-sm font-medium">
                              {submitMessage}
                            </span>
                          </div>
                        )}

                        {submitStatus === "error" && (
                          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <span className="text-red-800 text-sm font-medium">
                              {submitMessage}
                            </span>
                          </div>
                        )}

                        {AddTermsData.length > 0 ? (
                          <div className="p-3 border-2 grid grid-cols-1 max-h-[55vh] overflow-y-auto">
                            {filteredTerms.length > 0 ? (
                              filteredTerms.map((term: Term, index: number) => (
                                <div
                                  key={`${term.word}-${term.primaryid}`}
                                  className="mb-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex items-start space-x-3">
                                    <input
                                      type="checkbox"
                                      id={`term-${term.primaryid}`}
                                      checked={isTermSelected(term)}
                                      onChange={(e) =>
                                        handleTermSelection(
                                          term,
                                          e.target.checked
                                        )
                                      }
                                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <p className="text-sm font-medium text-gray-900 mb-1">
                                            {term.word}
                                          </p>
                                          <p className="text-sm text-gray-600 mb-2">
                                            {term.definition}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            ID: {term.primaryid}
                                          </p>
                                        </div>
                                        {selectedSet.setLanguage ===
                                          "japanese" && (
                                          <div className="ml-4 flex-shrink-0">
                                            {/* {returnImageforDefintion(
                                              term.definition,
                                              term.type || ""
                                            ) && (
                                              <img
                                                src={returnImageforDefintion(
                                                  term.definition,
                                                  term.type || ""
                                                )}
                                                alt={term.definition}
                                                className="w-12 h-12 object-cover rounded border"
                                              />
                                            )} */}
                                            <JapaneseImage
                                              value={String(term.definition)}
                                              type={term.type || ""}
                                              height="h-16"
                                              width="w-16"
                                              addBorder={true}
                                              alt={`${
                                                term.word || "Character"
                                              } - ${term.definition}`}
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-500 text-center py-8">
                                No terms found matching "{searchTerm}"
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 mt-4">
                            No terms available to add.
                          </p>
                        )}
                      </SheetHeader>

                      <SheetFooter>
                        <button
                          onClick={handleAddTerms}
                          disabled={
                            addTermsHolder.length === 0 ||
                            submitStatus === "loading" ||
                            addTermsMutation.isPending
                          }
                          className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${
                            addTermsHolder.length === 0 ||
                            submitStatus === "loading" ||
                            addTermsMutation.isPending
                              ? "bg-gray-300 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700"
                          }`}
                          type="submit"
                        >
                          {submitStatus === "loading" ||
                          addTermsMutation.isPending
                            ? "Adding..."
                            : `Add ${addTermsHolder.length} Terms`}
                        </button>
                        <SheetClose asChild>
                          <button
                            data-sheet-close
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Close
                          </button>
                        </SheetClose>
                      </SheetFooter>
                    </SheetContent>
                  </Sheet>
                </div>

                {/* Display current terms in the set */}
                {setTerms.length > 0 ? (
                  <div className="space-y-4 border-t-2 pt-4">
                    <div className="grid grid-cols-2 gap-3">
                      {setTerms.map((term: Term, index: number) => (
                        <div
                          key={index}
                          className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                {term.word}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {term.definition}
                              </p>
                              <p className="text-xs text-gray-500">
                                ID: {term.primaryid}
                              </p>
                            </div>
                            {selectedSet.setLanguage === "japanese" && (
                              <div className="ml-4 flex-shrink-0">
                                {/* {returnImageforDefintion(
                                  term.definition,
                                  term.type || ""
                                ) && (
                                  <img
                                    src={returnImageforDefintion(
                                      term.definition,
                                      term.type || ""
                                    )}
                                    alt={term.definition}
                                    className="w-16 h-16 object-cover rounded border"
                                  />
                                )} */}
                                <JapaneseImage
                                  value={String(term.definition)}
                                  type={term.type || ""}
                                  height="h-16"
                                  width="w-16"
                                  addBorder={true}
                                  alt={`${term.word || "Character"} - ${
                                    term.definition
                                  }`}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      No terms in this set yet. Use the "Add" button to add some
                      terms.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Select a Set
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Choose a set from the sidebar to view and manage its terms.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
