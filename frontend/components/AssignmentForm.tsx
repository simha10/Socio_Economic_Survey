"use client";

import { useState, useEffect, useRef } from "react";
import Button from "@/components/Button";
import Select from "@/components/Select";
import apiService from "@/services/api";

interface Surveyor {
  _id: string;
  username: string;
  name: string;
}

interface Slum {
  _id: string;
  slumName: string;
  slumId: number;
}

interface Assignment {
  _id?: string;
  surveyor?: {
    _id: string;
    name: string;
  } | null;
  slum?: {
    _id: string;
    slumName: string;
    slumId: number;
  } | null;
  status?: string;
}

interface AssignmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assignment?: Assignment | null;
}

export default function AssignmentForm({
  isOpen,
  onClose,
  onSuccess,
  assignment,
}: AssignmentFormProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    surveyors: [] as string[],
    slum: "",
    status: "PENDING" as "PENDING" | "IN PROGRESS" | "COMPLETED",
  });

  const [surveyors, setSurveyors] = useState<Surveyor[]>([]);
  const [slums, setSlums] = useState<Slum[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showSurveyorDropdown, setShowSurveyorDropdown] = useState(false);
  const surveyorDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsEditMode(!!assignment);

    if (assignment) {
      setFormData({
        surveyors: assignment.surveyor?._id ? [assignment.surveyor._id] : [],
        slum: assignment.slum?._id || "",
        status:
          (assignment.status as "PENDING" | "IN PROGRESS" | "COMPLETED") ||
          "PENDING",
      });
    } else {
      setFormData({
        surveyors: [],
        slum: "",
        status: "PENDING",
      });
    }
  }, [assignment, isOpen]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        surveyorDropdownRef.current &&
        !surveyorDropdownRef.current.contains(event.target as Node)
      ) {
        setShowSurveyorDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [surveyorsRes, slumsRes] = await Promise.all([
        apiService.getUsers("SURVEYOR"),
        apiService.getAllSlums(1, 1000, undefined, true),
      ]);

      if (surveyorsRes.success) {
        setSurveyors((surveyorsRes.data as Surveyor[]) || []);
      }
      if (slumsRes.success) {
        const sortedSlums = [...((slumsRes.data as Slum[]) || [])].sort(
          (a, b) => (a.slumName || "").localeCompare(b.slumName || ""),
        );
        setSlums(sortedSlums);
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load surveyors and slums");
    } finally {
      setLoading(false);
    }
  };

  const handleSlumChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      slum: e.target.value,
      surveyors: [], // Reset surveyors when slum changes
    }));
    setError("");
  };

  const toggleSurveyorSelection = (surveyorId: string) => {
    setFormData((prev) => {
      if (prev.surveyors.includes(surveyorId)) {
        return {
          ...prev,
          surveyors: prev.surveyors.filter((id) => id !== surveyorId),
        };
      } else {
        return {
          ...prev,
          surveyors: [...prev.surveyors, surveyorId],
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.slum) {
      setError("Please select a slum");
      return;
    }

    if (formData.surveyors.length === 0) {
      setError("Please select at least one surveyor");
      return;
    }

    setSubmitting(true);
    try {
      let allSuccess = true;

      // Create assignments for each selected surveyor
      for (const surveyorId of formData.surveyors) {
        const response = await apiService.assignSlumToSurveyor(
          surveyorId,
          formData.slum,
        );

        if (!response.success) {
          console.error(
            `Failed to assign slum to surveyor ${surveyorId}:`,
            response.error,
          );
          allSuccess = false;
        }
      }

      if (allSuccess) {
        onSuccess();
        onClose();
      } else {
        setError("Some assignments failed to create");
      }
    } catch (err) {
      setError("Error saving assignments");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleButtonClick = () => {
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSubmit(fakeEvent);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-fade-in">
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {assignment ? "Edit Assignment" : "Create New Assignment"}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {assignment
                ? "Update the assignment details below"
                : "Select a slum and one or more surveyors to create assignments"}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2" />
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-slate-400">Loading form data...</div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6">
                  <Select
                    label="Slum"
                    name="slum"
                    value={formData.slum}
                    onChange={handleSlumChange}
                    required
                    disabled={isEditMode}
                    className={
                      isEditMode
                        ? "bg-slate-800/50 cursor-not-allowed opacity-75"
                        : ""
                    }
                    options={[
                      { value: "", label: "Select a slum" },
                      ...slums.map((slum) => ({
                        value: slum._id,
                        label: `${slum.slumName} (${slum.slumId})`,
                      })),
                    ]}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">
                      Surveyors <span className="text-red-400">*</span>
                    </label>
                    <div className="relative" ref={surveyorDropdownRef}>
                      <div
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer min-h-10.5 flex items-center transition-all duration-200"
                        onClick={() =>
                          setShowSurveyorDropdown(!showSurveyorDropdown)
                        }
                      >
                        {formData.surveyors.length > 0 ? (
                          <span className="text-slate-300">
                            {formData.surveyors.length} surveyor
                            {formData.surveyors.length !== 1 ? "s" : ""}{" "}
                            selected
                          </span>
                        ) : (
                          <span className="text-slate-500">
                            Select surveyors...
                          </span>
                        )}
                        <svg
                          className={`ml-auto w-4 h-4 text-slate-400 transition-transform ${showSurveyorDropdown ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>

                      {showSurveyorDropdown && (
                        <div
                          className="fixed inset-0 z-60 flex items-center justify-center p-4"
                          onClick={() => setShowSurveyorDropdown(false)}
                        >
                          <div
                            className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
                              <h3 className="text-base font-semibold text-white">
                                Select Surveyors
                              </h3>
                              <button
                                onClick={() => setShowSurveyorDropdown(false)}
                                className="text-slate-400 hover:text-white transition-colors p-1"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-2">
                              {surveyors.length > 0 ? (
                                surveyors.map((surveyor) => (
                                  <div
                                    key={surveyor._id}
                                    className="flex items-center p-3 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSurveyorSelection(surveyor._id);
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={formData.surveyors.includes(
                                        surveyor._id,
                                      )}
                                      onChange={() =>
                                        toggleSurveyorSelection(surveyor._id)
                                      }
                                      className="mr-3 h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-slate-600"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <label className="text-slate-300 cursor-pointer grow">
                                      {surveyor.name} ({surveyor.username})
                                    </label>
                                  </div>
                                ))
                              ) : (
                                <div className="p-8 text-center text-slate-400">
                                  No surveyors available
                                </div>
                              )}
                            </div>

                            {surveyors.length > 0 && (
                              <div className="px-6 py-4 border-t border-slate-800 flex justify-between items-center">
                                <span className="text-sm text-slate-400">
                                  {formData.surveyors.length} selected
                                </span>
                                <button
                                  onClick={() => setShowSurveyorDropdown(false)}
                                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                  Done
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            <button type="submit" className="hidden" />
          </form>
        </div>

        <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleButtonClick}
            disabled={submitting || loading}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white"
          >
            {submitting
              ? "Creating..."
              : assignment
                ? "Update Assignment"
                : "Create Assignments"}
          </Button>
        </div>
      </div>
    </div>
  );
}
