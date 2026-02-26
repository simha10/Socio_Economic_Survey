"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import SurveyorLayout from "@/components/SurveyorLayout";
import DashboardStats from "@/components/DashboardStats";
import apiService from "@/services/api";
import { MapPin, Users, CheckCircle, CircleEllipsis, ListTodo } from "lucide-react";
import SurveyConfirmationDialog from "@/components/SurveyConfirmationDialog";
import EditConfirmationDialog from "@/components/EditConfirmationDialog";
import HHSCompletionWarningModal from "@/components/HHSCompletionWarningModal";
import { HouseholdSurveySelector } from "@/components/HouseholdSurveySelector";

interface User {
  _id: string;
  name: string;
  username: string;
  role: string;
}

interface Assignment {
  _id: string;
  slum: {
    _id: string;
    slumName: string;
    village: string;
    slumId: string;
    ward: {
      _id: string;
      number: string;
      name: string;
      zone: string;
    } | string;
    totalHouseholds?: number;
  };
  surveyor: {
    _id: string;
    name: string;
    username: string;
  };
  status: string;
  createdAt: string;
  slumSurveyStatus?: string;
  slumSurveyCompletion?: number;
  householdSurveyProgress?: {
    completed: number;
    total: number;
  };
}

export default function SurveyorDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingSurvey, setPendingSurvey] = useState<{
    type: 'slum' | 'household';
    assignmentId: string;
    slumName: string;
    slumId?: string;
    surveyStatus?: "DRAFT" | "IN PROGRESS" | "SUBMITTED" | "COMPLETED";
    progressCompleted?: number;
    progressTotal?: number;
  } | null>(null);
  const [surveyData, setSurveyData] = useState<Record<string, { surveyStatus?: string }>>({});
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [showCompletionWarning, setShowCompletionWarning] = useState(false);
  const [showHouseholdSelector, setShowHouseholdSelector] = useState(false);
  const [householdSelectorMode, setHouseholdSelectorMode] = useState<'search' | 'new'>('search');
  const [householdSelectorParams, setHouseholdSelectorParams] = useState<{
    assignmentId: string;
    slumId: string;
    slumName: string;
  } | null>(null);

  useEffect(() => {
    // Verify user is surveyor
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(userStr);
    if (userData?.role !== "SURVEYOR") {
      router.push(`/${userData?.role?.toLowerCase()}/dashboard`);
      return;
    }

    setUser(userData);
    loadAssignments();
  }, [router]);

  // Re-fetch assignments when page becomes visible again (tab switching on mobile, returning from background)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadAssignments();
      }
    };

    const handleFocus = () => {
      loadAssignments();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Re-fetch assignments when the user navigates back to the dashboard via client-side routing
  // This is the key fix for Next.js SPA navigation (no hard refresh needed)
  useEffect(() => {
    if (pathname === '/surveyor/dashboard') {
      loadAssignments();
    }
  }, [pathname]);

  // Handle URL parameters for opening HouseholdSurveySelector
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const openSelector = params.get('openSelector');
    
    if (openSelector === 'true') {
      const slumId = params.get('slumId');
      const assignmentId = params.get('assignmentId');
      const mode = params.get('mode') as 'search' | 'new' || 'search';
      
      if (slumId && assignmentId) {
        // Find the assignment to get slum name
        const assignment = assignments.find(a => a._id === assignmentId);
        if (assignment) {
          setHouseholdSelectorParams({
            assignmentId,
            slumId,
            slumName: assignment.slum?.slumName || 'Unknown Slum'
          });
          setHouseholdSelectorMode(mode);
          setShowHouseholdSelector(true);
          
          // Remove the parameters from URL
          router.replace('/surveyor/dashboard');
        }
      }
    }
  }, [assignments, pathname, router]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      // Fetch surveyor's assignments from the API
      const response = await apiService.getMyAssignments();
      if (response.success) {
        console.log("Assignments loaded:", response.data);
        const assignmentsData = response.data || [];
        setAssignments(assignmentsData);

        // Load survey data for each assignment
        const surveyDataMap: Record<string, { surveyStatus?: string }> = {};
        for (const assignment of assignmentsData) {
          if (assignment.slum?._id) {
            try {
              const surveyResponse = await apiService.createOrGetSlumSurvey(assignment.slum._id);
              if (surveyResponse.success) {
                surveyDataMap[assignment._id] = surveyResponse.data;
              }
            } catch (error) {
              console.error(`Failed to load survey for assignment ${assignment._id}:`, error);
            }
          }
        }
        setSurveyData(surveyDataMap);
      } else {
        console.error("Failed to load assignments:", response.error);
        setAssignments([]);
      }
    } catch (error) {
      console.error("Failed to load assignments:", error);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSlumSurveyClick = (assignmentId: string, slumName: string) => {
    const survey = surveyData[assignmentId];
    const surveyStatus = survey?.surveyStatus || "DRAFT";

    setPendingSurvey({
      type: 'slum',
      assignmentId,
      slumName,
      surveyStatus: surveyStatus as "DRAFT" | "IN PROGRESS" | "SUBMITTED" | "COMPLETED"
    });
    setShowConfirmation(true);
  };

  const handleHouseholdSurveyClick = (assignmentId: string, slumName: string) => {
    // Check if all households are completed
    const assignment = assignments.find(a => a._id === assignmentId);
    const progress = assignment?.householdSurveyProgress;

    setPendingSurvey({
      type: 'household',
      assignmentId,
      slumName,
      slumId: assignment?.slum?._id,
      progressCompleted: progress?.completed,
      progressTotal: progress?.total
    });

    if (progress) {
      const { completed, total } = progress;
      if (total > 0 && completed >= total) {
        setShowCompletionWarning(true);
        return;
      }
    }

    setHouseholdSelectorMode('search');
    setShowHouseholdSelector(true);
  };

  const handleAddNewHousehold = async () => {
    // We already have the pendingSurvey state containing assignmentId and slumId since handleHouseholdSurveyClick was called first
    // Just open the selector in 'new' mode
    setHouseholdSelectorMode('new');
    setShowCompletionWarning(false);
    setShowHouseholdSelector(true);
  };

  const confirmSurvey = () => {
    if (!pendingSurvey) return;

    if (pendingSurvey.type === 'slum') {
      router.push(`/surveyor/slum-survey/${pendingSurvey.assignmentId}`);
    } else {
      router.push(`/surveyor/household-survey/${pendingSurvey.assignmentId}`);
    }

    // Reset confirmation state
    setShowConfirmation(false);
    setPendingSurvey(null);
  };

  const previewSurvey = () => {
    if (!pendingSurvey) return;

    if (pendingSurvey.type === 'slum') {
      router.push(`/surveyor/slum-survey/${pendingSurvey.assignmentId}`);
    } else {
      // For household surveys, we might want to show a list of households
      router.push(`/surveyor/slums/${pendingSurvey.assignmentId}`);
    }

    // Reset confirmation state
    setShowConfirmation(false);
    setPendingSurvey(null);
  };

  const editSurvey = () => {
    if (!pendingSurvey) return;

    // Show edit confirmation dialog
    setShowEditConfirm(true);
  };

  const confirmEditSurvey = () => {
    if (!pendingSurvey) return;

    if (pendingSurvey.type === 'slum') {
      router.push(`/surveyor/slum-survey/${pendingSurvey.assignmentId}?edit=true`);
    } else {
      router.push(`/surveyor/household-survey/${pendingSurvey.assignmentId}`);
    }

    // Reset confirmation states
    setShowConfirmation(false);
    setShowEditConfirm(false);
    setPendingSurvey(null);
  };

  const cancelEditSurvey = () => {
    setShowEditConfirm(false);
  };

  const cancelSurvey = () => {
    setShowConfirmation(false);
    setPendingSurvey(null);
  };

  // Calculate stats based on assignment status
  const totalAssignments = assignments.length;
  const completedSurveys = assignments.filter(
    (a) => a.status === "COMPLETED",
  ).length;
  const pendingSurveys = assignments.filter(
    (a) => a.status === "PENDING",
  ).length;
  const inProgressSurveys = assignments.filter(
    (a) => a.status === "IN PROGRESS",
  ).length;
  return (
    <SurveyorLayout username={user?.name || user?.username}>
      {/* Dashboard Stats Only - No header or refresh button */}

      <DashboardStats
        stats={[
          {
            label: "Total Assignments",
            value: totalAssignments,
            icon: <Users className="w-5 h-5" />,
            colorClass: "text-blue-500 bg-blue-500/20",
          },
          {
            label: "Pending",
            value: pendingSurveys,
            icon: <CircleEllipsis className="w-5 h-5" />,
            colorClass: "text-red-500 bg-red-500/20",
          },
          {
            label: "In Progress",
            value: inProgressSurveys,
            icon: <ListTodo className="w-5 h-5" />,
            colorClass: "text-amber-500 bg-amber-500/20",
          },
          {
            label: "Completed",
            value: completedSurveys,
            icon: <CheckCircle className="w-5 h-5" />,
            colorClass: "text-green-500 bg-green-500/20",
          },
        ]}
      />
      <div className="mb-6"></div>

      {/* Content Area */}
      {assignments.length === 0 ? (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 md:p-8 text-center relative overflow-hidden group">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 p-10 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 p-10 bg-purple-500/5 blur-[80px] rounded-full pointer-events-none transform -translate-x-1/2 translate-y-1/2"></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="text-4xl md:text-5xl mb-4 opacity-80">
              🏘️
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
              No Assignments Now
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-md leading-relaxed mb-6">
              You don&#39;t have any slums assigned right now. Your supervisor will assign
              you slums to survey. Check back soon.
            </p>

            <div className="absolute bottom-4 right-4 text-slate-700 animate-pulse">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
              </svg>
            </div>
          </div>
        </div>
      ) : (
        /* Assignments List */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-lg font-bold text-white">Active Assignments</h3>
            <button
              onClick={() => router.push("/surveyor/slums")}
              className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium self-start sm:self-auto cursor-pointer"
            >
              View all Assignments →
            </button>
          </div>

          {assignments.filter(assignment => assignment.status !== "COMPLETED").map((assignment) => (
            <div
              key={assignment._id}
              className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden hover:border-slate-600 transition-all hover:shadow-xl hover:shadow-blue-900/10 group"
            >
              {/* Card Header */}
              <div className="bg-slate-800/80 px-6 py-4 border-b border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                    {`${assignment.slum?.slumName}, (${assignment.slum?.slumId})` || "Unknown Slum"}
                  </h3>
                  <div className="flex flex-col gap-1 text-slate-400 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {assignment.slum?.village || "Unknown Village"}
                      </span>
                    </div>
                    {assignment.slum?.ward && typeof assignment.slum.ward === 'object' && (
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 flex items-center justify-center">🏘️</span>
                        <span>{assignment.slum.ward.zone} : Ward {assignment.slum.ward.number} ({assignment.slum.ward.name})</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${assignment.status === "COMPLETED"
                      ? "bg-green-500/10 text-green-400 border-green-500/20"
                      : assignment.status === "IN PROGRESS"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-slate-700/50 text-slate-400 border-slate-600"
                      }`}
                  >
                    {assignment.status?.replace("_", " ") || "PENDING"}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Info Section */}
                <div className="space-y-4">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">
                      <span className="font-medium text-white">
                        Total Households:
                      </span>{" "}
                      {assignment.slum?.totalHouseholds || "N/A"}
                    </p>
                    <p className="text-slate-400 text-sm">
                      <span className="font-medium text-white">
                        Assigned On:
                      </span>{" "}
                      {new Date(assignment.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Survey Status Section */}
                  <div className="border-t border-slate-700 pt-4 mt-4">
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">
                          Slum Survey
                        </span>
                        <span
                          className={`text-xs font-medium $ {
                            (assignment.slumSurveyCompletion || 0) === 0 ? 'text-red-400' :
                            (assignment.slumSurveyCompletion || 0) < 100 ? 'text-amber-400' :
                            'text-green-400'
                          }`}
                        >
                          {(assignment.slumSurveyCompletion || 0) === 0
                            ? "Not Started"
                            : (assignment.slumSurveyCompletion || 0) < 100
                              ? `${assignment.slumSurveyCompletion || 0}%`
                              : "✓ Completed"}
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all $ {
                            (assignment.slumSurveyCompletion || 0) === 0 ? 'bg-red-500' :
                            (assignment.slumSurveyCompletion || 0) < 100 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${assignment.slumSurveyCompletion || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">
                          Household Survey
                        </span>
                        <span className="text-xs font-medium text-slate-400">
                          {assignment.householdSurveyProgress?.completed || 0} /{" "}
                          {assignment.householdSurveyProgress?.total || 0}
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${assignment.householdSurveyProgress?.total
                              ? (
                                (assignment.householdSurveyProgress
                                  .completed /
                                  assignment.householdSurveyProgress
                                    .total) *
                                100
                              ).toFixed(0)
                              : 0
                              }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() =>
                      handleSlumSurveyClick(assignment._id, assignment.slum?.slumName || "Unknown Slum")
                    }
                    className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition-all cursor-pointer"
                  >
                    Slum Survey
                  </button>
                  <button
                    onClick={() =>
                      handleHouseholdSurveyClick(assignment._id, assignment.slum?.slumName || "Unknown Slum")
                    }
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-900/20 cursor-pointer"
                  >
                    Household Survey
                  </button>
                </div>

                {/* Completion Status Message */}
                {assignment.householdSurveyProgress &&
                  assignment.householdSurveyProgress.total > 0 &&
                  assignment.householdSurveyProgress.completed >= assignment.householdSurveyProgress.total && (
                    <div className="mt-4 col-span-1 md:col-span-2 text-xs text-center text-amber-300 font-medium p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                      {assignment.householdSurveyProgress.completed} of {assignment.householdSurveyProgress.total} Household Surveys are done.
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Survey Confirmation Dialog */}
      <SurveyConfirmationDialog
        isOpen={showConfirmation}
        surveyType={pendingSurvey?.type || 'slum'}
        slumName={pendingSurvey?.slumName || ''}
        surveyStatus={pendingSurvey?.surveyStatus}
        progressCompleted={pendingSurvey?.progressCompleted}
        progressTotal={pendingSurvey?.progressTotal}
        onConfirm={confirmSurvey}
        onCancel={cancelSurvey}
        onPreview={previewSurvey}
        onEdit={editSurvey}
      />

      <EditConfirmationDialog
        isOpen={showEditConfirm}
        surveyType={pendingSurvey?.type || 'slum'}
        slumName={pendingSurvey?.slumName || ''}
        onConfirm={confirmEditSurvey}
        onCancel={cancelEditSurvey}
      />

      <HHSCompletionWarningModal
        isOpen={showCompletionWarning}
        onClose={() => setShowCompletionWarning(false)}
        onAddNew={handleAddNewHousehold}
        slumId={pendingSurvey?.slumId || ''}
        assignmentId={pendingSurvey?.assignmentId || ''}
      />

      <HouseholdSurveySelector
        isOpen={showHouseholdSelector}
        onClose={() => {
          setShowHouseholdSelector(false);
          setHouseholdSelectorParams(null);
        }}
        assignmentId={householdSelectorParams?.assignmentId || pendingSurvey?.assignmentId || ''}
        slumId={householdSelectorParams?.slumId || pendingSurvey?.slumId || ''}
        slumName={householdSelectorParams?.slumName || pendingSurvey?.slumName || ''}
        initialMode={householdSelectorMode}
      />
    </SurveyorLayout>
  );
}
