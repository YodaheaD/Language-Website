"use client";

import { useEffect, useState } from "react";
import { getLanguageFlag } from "@/lib/utilsReact";
import { ArrowIcon, FolderIcon } from "./low-level/icons";

import { useRouter } from "next/navigation";

interface SelectedSet {
  setName: string;
  langOfSet: string;
  folder: string;
}

export default function DeleteForm() {
  // router
  const router = useRouter();
  const [allSetsData, setAllSetsData] = useState<any[]>([]);
  const [selectedSets, setSelectedSets] = useState<SelectedSet[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [deleteMessage, setDeleteMessage] = useState<string>("");

  const fetchAllSetsData = async () => {
    const response = await fetch(`/api/sets`);
    const data = await response.json();
    console.log("Fetched Sets Data:", data);
    setAllSetsData(data);
  }; 

  const sendDeleteRequest = async (setName: string, langOfSet: string) => {
    // Construct the set identifier based on the naming convention
    const setIdentifier = `${setName}-${langOfSet}`;
    try {
      const response = await fetch(
        `/api/sets/delete/${setIdentifier}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        console.log(`Set ${setIdentifier} deleted successfully.`);
        return true;
      } else {
        console.error(`Failed to delete set ${setIdentifier}.`);
        return false;
      }
    } catch (error) {
      console.error("Error deleting set:", error);
      return false;
    }
  };

  // Handle checkbox selection
  const handleSetSelection = (
    setName: string,
    langOfSet: string,
    folder: string,
    isChecked: boolean
  ) => {
    if (isChecked) {
      setSelectedSets((prev) => [...prev, { setName, langOfSet, folder }]);
    } else {
      setSelectedSets((prev) =>
        prev.filter(
          (set) => !(set.setName === setName && set.langOfSet === langOfSet)
        )
      );
    }
  };

  // Check if a set is selected
  const isSetSelected = (setName: string, langOfSet: string) => {
    return selectedSets.some(
      (set) => set.setName === setName && set.langOfSet === langOfSet
    );
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedSets.length === 0) return;

    setIsDeleting(true);
    setDeleteStatus("idle");
    setDeleteMessage("");

    const deletePromises = selectedSets.map((set) =>
      sendDeleteRequest(set.setName, set.langOfSet)
    );

    try {
      const results = await Promise.all(deletePromises);
      const successCount = results.filter((result) => result).length;
      const failedCount = results.length - successCount;

      if (failedCount === 0) {
        setDeleteStatus("success");
        setDeleteMessage(`Successfully deleted ${successCount} set(s)`);
      } else {
        setDeleteStatus("error");
        setDeleteMessage(
          `Deleted ${successCount} set(s), failed to delete ${failedCount} set(s)`
        );
      }

      // Clear selection and refresh data
      setSelectedSets([]);
      await fetchAllSetsData();
    } catch (error) {
      setDeleteStatus("error");
      setDeleteMessage("An error occurred while deleting sets");
    } finally {
      setIsDeleting(false);
    }
  };

  // Use Effect
  useEffect(() => {
    fetchAllSetsData();
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full p-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 border-2 border-slate-300"
            aria-label="Go back"
          >
            <ArrowIcon direction="left" width={24} height={24} />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Delete Set</h2>
        </div>
        <p className="text-gray-600">
          Select the sets you want to delete from the list below. This action
          cannot be undone.
        </p>
      </div>

      {/* Status Messages */}
      {deleteStatus === "success" && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 font-medium">{deleteMessage}</p>
        </div>
      )}

      {deleteStatus === "error" && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-medium">{deleteMessage}</p>
        </div>
      )}

      {/* Selection Summary */}
      {selectedSets.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-700">
            <span className="font-medium">{selectedSets.length}</span> set(s)
            selected for deletion
          </p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sets List */}
        <div className="flex-1 max-h-[60vh] overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="sticky top-0 bg-gray-50 p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Available Sets
            </h3>
          </div>

          {allSetsData.length > 0 ? (
            <div className="p-4">
              {allSetsData.map((folder, folderIndex) => (
                <div
                  key={`${folder.folder}-${folderIndex}`}
                  className="mb-6 last:mb-0"
                >
                  {/* Folder Header */}
                  <div className="flex items-center gap-3 mb-3 pb-2 border-b border-gray-200">
                    <FolderIcon className="text-gray-600" />
                    <h4 className="text-lg font-semibold text-gray-900">
                      {folder.folder}
                    </h4>
                    <span className="px-2 py-1 bg-gray-800 text-white text-sm rounded">
                      {getLanguageFlag(folder.langOfSet, "medium")}
                      {/* <span className="ml-1 capitalize">{folder.langOfSet}</span> */}
                    </span>
                  </div>

                  {/* Sets in Folder */}
                  <div className="space-y-2 ml-6">
                    {folder.sets.map((set: any, setIndex: number) => (
                      <label
                        key={`${set.setName}-${setIndex}`}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition-all duration-200"
                      >
                        <input
                          type="checkbox"
                          checked={isSetSelected(set.setName, folder.langOfSet)}
                          onChange={(e) =>
                            handleSetSelection(
                              set.setName,
                              folder.langOfSet,
                              folder.folder,
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {set.setName}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {set.description}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Created:{" "}
                            {new Date(set.dateCreated).toLocaleDateString()}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No sets available to delete.</p>
            </div>
          )}
        </div>

        {/* Action Panel */}
        <div className="lg:w-80">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sticky top-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Actions
            </h3>

            {selectedSets.length > 0 ? (
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Selected for deletion:</p>
                  <ul className="mt-2 space-y-1">
                    {selectedSets.map((set, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        <span className="truncate">{set.setName}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleBulkDelete}
                    disabled={isDeleting}
                    className="w-full px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isDeleting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Deleting...
                      </span>
                    ) : (
                      `Delete ${selectedSets.length} Set(s)`
                    )}
                  </button>
                </div>

                <div className="text-xs text-gray-500 text-center">
                  ⚠️ This action cannot be undone
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p className="text-sm">Select sets to delete</p>
                <p className="text-xs mt-2">
                  Use the checkboxes to select sets you want to remove
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
