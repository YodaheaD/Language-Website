"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { getLanguageFlag } from "@/lib/utilsReact";
import { FolderIcon, ArrowIcon } from "./icons";
import { useRouter } from "next/navigation";

// Zod schema for form validation
const createSetFormSchema = (existingSets: string[]) => z.object({
  langOfSet: z.enum(["spanish", "japanese"], {
    message: "Please select a language",
  }),
  setName: z
    .string()
    .min(3, "Set name must be at least 3 characters long"),
    // .refine(
    //   (name) => !existingSets.includes(name),
    //   "A set with this name already exists"
    // ),
  setFolder: z
    .string()
    .min(1, "Set folder is required")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Folder name can only contain letters, numbers, and underscores"
    ),
  description: z
    .string()
 
});

type SetFormData = z.infer<ReturnType<typeof createSetFormSchema>>;

export default function SetForm() {
  const router = useRouter();
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState<string>("");
  const [allSetsData, setAllSetsData] = useState<any[]>([]);
  const [existingSets, setExistingSets] = useState<string[]>([]);
  const [useExistingFolder, setUseExistingFolder] = useState<boolean>(true);

  const fetchAllSetsData = async () => {
    const response = await fetch(`/api/sets`);
    const data = await response.json();
    console.log("Fetched Sets Data:", data);
    setAllSetsData(data);
    /**
     * [
    {
        "folder": "newFolder3",
        "langOfSet": "japanese",
        "sets": [
            {
                "setName": "setName1",
                "description": "setDescription1",
                "dateCreated": "2023-10-01",
                "dateModified": "2023-10-05"
            }
        ]
    },
    {
        "folder": "newFolder",
        "langOfSet": "spanish",
        "sets": [
            {
                "setName": "setName2",
                "description": "setDescription2",
                "dateCreated": "2023-11-15",
                "dateModified": "2023-10-20"
            },
            {
                "setName": "SetName 24",
                "description": "the latest description",
                "dateCreated": "2025-10-25",
                "dateModified": "2025-10-25"
            }
        ]
    }
]
     */

 
  //make a string array pf all exisitng setName values
    const setsSet: string[] = [];
    data.forEach((folder: any) => {
      folder.sets.forEach((set: any) => {
        setsSet.push(set.setName + "-" + folder.langOfSet);
      });
    });
    setExistingSets(setsSet);
    console.log("Existing Sets:", setsSet);
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<SetFormData>({
    resolver: zodResolver(createSetFormSchema(existingSets)),
  });

  const selectedLanguage = watch("langOfSet");

  const onFormSubmit: SubmitHandler<SetFormData> = async (data) => {
    try {
      setSubmitStatus("idle");
      setSubmitMessage("");

      // // Make sure the setName entered does not already exist in the existingSets array
      if (existingSets.includes(data.setName+"-"+data.langOfSet)) {
        setSubmitStatus("error");
        setSubmitMessage(` Set with name "${data.setName}" of language "${data.langOfSet}" already exists.`);
        return;
      }

      const response = await fetch(`/api/sets/createSet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setSubmitStatus("success");
      setSubmitMessage("Set created successfully!");
      reset();
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitStatus("error");
      setSubmitMessage(
        error instanceof Error
          ? error.message
          : "Failed to create set. Please try again."
      );
    }
  };

  // Use Effect
  useEffect(() => {
    fetchAllSetsData();
  }, []);
  return (
    <div className="flex flex-col gap-4 sm:flex-row  sm:gap-8 w-full p-3 px-8 ">
       <div className="space-y-2 sm:py-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 border-2 border-slate-300"
              aria-label="Go back"
            >
              <ArrowIcon direction="left" width={24} height={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">
              Create  Set
            </h2>
          </div>
          <p className="text-sm text-gray-600 ml-12">
            Fill in the details for your new language learning set.
          </p>
        </div>
      <form
        onSubmit={handleSubmit(onFormSubmit)}
        className="w-full h-fit max-w-xl mx-auto space-y-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm"
      >
      
        {/* Status Messages */}
        {submitStatus === "success" && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">{submitMessage}</p>
          </div>
        )}

        {submitStatus === "error" && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{submitMessage}</p>
          </div>
        )}

        {/* Language of Set - Radio Input */}
        <div className="space-y-3">
          <label className="block text-base font-medium text-black">
            Language of Set
          </label>
          <div className="flex space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                value="spanish"
                {...register("langOfSet")}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-base text-black inline-flex gap-2">Spanish {getLanguageFlag("spanish")}</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                value="japanese"
                {...register("langOfSet")}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-base text-black inline-flex gap-2">Japanese {getLanguageFlag("japanese")}</span>
            </label>
          </div>
          {errors.langOfSet && (
            <p className="text-base text-red-600">{errors.langOfSet.message}</p>
          )}
        </div>

        {/* Set Name Input */}
        <div className="space-y-2">
          <label
            htmlFor="setName"
            className="block text-sm font-medium text-black"
          >
            Set Name
          </label>
          <input
            id="setName"
            type="text"
            {...register("setName")}
            className={cn(
              "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              "disabled:bg-gray-50 disabled:text-gray-500",
              errors.setName &&
                "border-red-300 focus:ring-red-500 focus:border-red-500"
            )}
            placeholder="Enter set name (e.g., Basic Vocabulary)"
            disabled={isSubmitting}
          />
          {errors.setName && (
            <p className="text-sm text-red-600">{errors.setName.message}</p>
          )}
        </div>

        {/* Set Folder Input */}
        <div className="space-y-2">
          <label
            htmlFor="setFolder"
            className="block text-sm font-medium text-black"
          >
            Set Folder
          </label>
          <div className="flex space-x-3">
            {/* Input - Half width */}
            {!useExistingFolder ? (
              <input
                id="setFolder"
                type="text"
                {...register("setFolder")}
                className={cn(
                  "flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                  "disabled:bg-gray-50 disabled:text-gray-500",
                  errors.setFolder &&
                    "border-red-300 focus:ring-red-500 focus:border-red-500"
                )}
                placeholder="Enter folder name (e.g., basic-vocab)"
                disabled={isSubmitting}
              />
            ) : (
              <select
                {...register("setFolder")}
                className={cn(
                  "flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                  "disabled:bg-gray-50 disabled:text-gray-500",
                  errors.setFolder &&
                    "border-red-300 focus:ring-red-500 focus:border-red-500"
                )}
                disabled={isSubmitting}
              >
                <option value="">Select existing folder</option>
                {allSetsData
                  .filter(folder => folder.langOfSet === selectedLanguage)
                  .map((folder, index) => (
                    <option key={index} value={folder.folder}>
                      {folder.folder}
                    </option>
                  ))}
              </select>
            )}
            
            {/* Toggle Button - Half width */}
            <button
              type="button"
              onClick={() => setUseExistingFolder(!useExistingFolder)}
              className={cn(
                "flex-1 px-3 py-2 text-sm font-medium rounded-md border transition-colors duration-200",
                useExistingFolder
                  ? "bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100"
                  : "bg-gray-50 text-black border-gray-300 hover:bg-gray-100"
              )}
              disabled={isSubmitting}
            >
              {useExistingFolder ? "Create New Folder" : "Use Existing Folder"}
            </button>
          </div>
          {errors.setFolder && (
            <p className="text-sm text-red-600">{errors.setFolder.message}</p>
          )}
        </div>

        {/* Description Input */}
        <div className="space-y-2">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-black"
          >
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            {...register("description")}
            className={cn(
              "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              "disabled:bg-gray-50 disabled:text-gray-500 resize-vertical",
              errors.description &&
                "border-red-300 focus:ring-red-500 focus:border-red-500"
            )}
            placeholder="Describe what this language set contains..."
            disabled={isSubmitting}
          />
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "w-full px-4 py-2 text-white font-medium rounded-md shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
          )}
        >
          {isSubmitting ? "Creating Set..." : "Create Set"}
        </button>
      </form>
      <div className="  min-w-xs max-h-[90vh] h-fit overflow-y-auto space-y-2 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h1 className="text-xl font-bold text-gray-900">
        Existing Sets
      </h1>
        {allSetsData ? (
          <div className="">
            {allSetsData.map((set, index) => (
              <div
                key={`${set.folder}-${index}`}
                className="border-b border-gray-200 py-3 "
              >
                <h3 className="text-lg font-semibold inline-flex gap-4 ">
             <FolderIcon className="m-auto" /> {set.folder} {getLanguageFlag(set.langOfSet,"medium")} 
                </h3>
                {set.sets.map((individualSet: any, idx: number) => (
                  <div
                    key={`${individualSet.id}-${idx}`}
                    className="pl-2 py-1 w-full grid grid-cols-2"
                  >
                    <p className="text-md font-medium">
                      {individualSet.setName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {individualSet.dateCreated}
                    </p>
                  </div>
                ))}
              </div>
            ))}
            {/* {JSON.stringify(existingSets)} */}
           </div>
        ) : (
          <p>No sets available.</p>
        )}
      </div>
    </div>
  );
}
