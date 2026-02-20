"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import apiService from "@/services/api";
import Select from "@/components/Select";
import Button from "@/components/Button";
import Card from "@/components/Card";
import InfiniteScrollSelect from "@/components/InfiniteScrollSelect";
import { HouseholdSurvey } from "@/types/householdSurvey";

export default function HHQCPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [slums, setSlums] = useState<any[]>([]);
  const [selectedSlum, setSelectedSlum] = useState<string>("");
  const [householdSurveys, setHouseholdSurveys] = useState<HouseholdSurvey[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load slums and assignments when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load slums
        const slumsResponse = await apiService.get("/admin/slums");
        // Sort slums alphabetically by name
        const sortedSlums = [...(slumsResponse.data || [])].sort((a, b) => {
          const nameA = a.slumName || '';
          const nameB = b.slumName || '';
          return nameA.localeCompare(nameB);
        });
        setSlums(sortedSlums);

        // Load all assignments for supervisor to find the correct assignment later
        const assignmentsResponse = await apiService.getAllAssignments();
        if (assignmentsResponse.success) {
          setAssignments(assignmentsResponse.data || []);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Load household surveys when slum is selected
  useEffect(() => {
    const fetchHouseholdSurveys = async () => {
      if (!selectedSlum) {
        setHouseholdSurveys([]);
        return;
      }

      try {
        setLoading(true);
        const response = await apiService.getHouseholdSurveysBySlum(selectedSlum);
        setHouseholdSurveys(Array.isArray(response.data) ? response.data : response.data.surveys || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching household surveys:", err);
        setError("Failed to load household surveys");
        setLoading(false);
      }
    };

    fetchHouseholdSurveys();
  }, [selectedSlum]);

  const handleEditRecord = (survey: HouseholdSurvey) => {
    // Navigate directly to the household survey ID to edit existing data
    router.push(`/surveyor/household-survey/${survey._id}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">HHQC - Household Quality Control</h1>
      </div>

      {error && (
        <Card className="bg-red-500/20 border-red-500 text-red-200">
          {error}
        </Card>
      )}

      <Card className="p-6">
        <div className="mb-6">
          <InfiniteScrollSelect
            label="Select Slum"
            value={selectedSlum}
            onChange={(value) => setSelectedSlum(value)}
            options={slums.map((slum) => ({
              value: slum._id,
              label: `${slum.slumName} (${slum.slumId})`,
            }))}
            placeholder="Select a slum..."
          />
        </div>

        {selectedSlum && (
          <div className="mt-8">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : householdSurveys.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 text-lg">
                  No records available. Survey may not have been started yet for this slum.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Household ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Door No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Family Members
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Submission Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-800/50 divide-y divide-slate-700">
                    {householdSurveys.map((survey) => (
                      <tr key={survey._id} className="hover:bg-slate-800/70">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                          {survey.householdId?.substring(0, 8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                          {survey.houseDoorNo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                          {survey.familyMembersTotal || 0} (M: {survey.familyMembersMale || 0}, F: {survey.familyMembersFemale || 0})
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                          {survey.submittedAt ? new Date(survey.submittedAt).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            survey.surveyStatus === 'SUBMITTED' 
                              ? 'bg-yellow-500/20 text-yellow-300' 
                              : survey.surveyStatus === 'COMPLETED'
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}>
                            {survey.surveyStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => handleEditRecord(survey)}
                            disabled={!survey._id}
                          >
                            Edit Record
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}