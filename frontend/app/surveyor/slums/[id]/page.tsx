"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import SurveyorLayout from "@/components/SurveyorLayout";
import Card from "@/components/Card";
import Button from "@/components/Button";
import apiService from "@/services/api";
import { useToast } from "@/components/Toast";
import SurveyConfirmationDialog from "@/components/SurveyConfirmationDialog";

interface Slum {
  _id: string;
  slumName: string;
  location: string;
  population?: number;
  area?: string;
  households?: any[];
}

interface SlumSurvey {
  _id: string;
  surveyStatus: string;
  completionPercentage?: number;
}

export default function SlumDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const slumId = params.id as string;
  const { showToast } = useToast();

  const [slum, setSlum] = useState<Slum | null>(null);
  const [households, setHouseholds] = useState<any[]>([]);
  const [slumSurvey, setSlumSurvey] = useState<SlumSurvey | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSlumSurveyConfirm, setShowSlumSurveyConfirm] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const slumResponse = await apiService.getSlum(slumId);
        if (slumResponse.success) {
          setSlum(slumResponse.data as Slum);
        }

        // Try to get existing slum survey
        try {
          const surveyResponse = await apiService.createOrGetSlumSurvey(slumId);
          if (surveyResponse.success) {
            setSlumSurvey(surveyResponse.data as SlumSurvey);
          }
        } catch (error) {
          console.warn("Could not load slum survey", error);
        }
      } catch (error) {
        console.error("Error loading slum:", error);
        showToast("Failed to load slum details", "error");
      } finally {
        setLoading(false);
      }
    };

    if (slumId) loadData();
  }, [slumId, showToast]);

  const handleSlumSurveyClick = () => {
    // Check the survey status to determine the message
    const surveyStatus = slumSurvey?.surveyStatus || "DRAFT";
    
    if (surveyStatus === "DRAFT" || surveyStatus === "IN PROGRESS") {
      // Show start/continue confirmation
      setShowSlumSurveyConfirm(true);
    } else if (surveyStatus === "SUBMITTED" || surveyStatus === "COMPLETED") {
      // Show submitted survey confirmation
      setShowSlumSurveyConfirm(true);
    }
  };

  const handleSlumSurveyConfirm = () => {
    setShowSlumSurveyConfirm(false);
    router.push(`/surveyor/slum-survey/${slumId}`);
  };

  const handleSlumSurveyCancel = () => {
    setShowSlumSurveyConfirm(false);
  };

  const handleSlumSurveyPreview = () => {
    setShowSlumSurveyConfirm(false);
    router.push(`/surveyor/slum-survey/${slumId}`);
  };

  const handleSlumSurveyEdit = () => {
    if (window.confirm(`Are you sure you want to edit the Slum Survey for ${slum?.slumName}?`)) {
      setShowSlumSurveyConfirm(false);
      router.push(`/surveyor/slum-survey/${slumId}`);
    }
  };

  if (loading) {
    return (
      <SurveyorLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-muted">Loading slum details...</p>
          </div>
        </div>
      </SurveyorLayout>
    );
  }

  if (!slum) {
    return (
      <SurveyorLayout>
        <Card className="text-center py-8">
          <p className="text-error mb-4">Slum not found</p>
          <Button size="md" onClick={() => router.back()} className="w-full sm:w-auto cursor-pointer">Go Back</Button>
        </Card>
      </SurveyorLayout>
    );
  }

  return (
    <SurveyorLayout>
      {/* Slum Header */}
      <Card className="mb-6 border-0 bg-gradient-primary text-white">
        <button
          onClick={() => router.back()}
          className="mb-3 text-sm hover:opacity-80 cursor-pointer"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold mb-2">{slum.slumName}</h1>
        <p className="text-sm opacity-90">{slum.location}</p>
      </Card>

      {/* Slum Info */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {slum.population && (
          <Card className="text-center">
            <p className="text-2xl font-bold text-primary">
              {slum.population.toLocaleString()}
            </p>
            <p className="text-xs text-text-muted">Population</p>
          </Card>
        )}
        {slum.area && (
          <Card className="text-center">
            <p className="text-xl font-bold text-primary">{slum.area}</p>
            <p className="text-xs text-text-muted">Area</p>
          </Card>
        )}
      </div>

      {/* Survey Options */}
      <div>
        <h2 className="text-lg font-bold text-text-primary mb-4">
          Survey Options
        </h2>

        {/* Slum Survey */}
        <Card hover className="mb-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-text-primary">Slum Survey</h3>
              <p className="text-xs text-text-muted">
                Comprehensive slum characteristics and demographics
              </p>
            </div>
            {slumSurvey && (
              <span
                className={`
                  px-2 py-1 rounded text-xs font-medium
                  ${
                    slumSurvey.surveyStatus === "SUBMITTED"
                      ? "bg-success/20 text-success"
                      : "bg-warning/20 text-warning"
                  }
                `}
              >
                {slumSurvey.surveyStatus}
              </span>
            )}
          </div>

          <Button 
            size="md"
            onClick={handleSlumSurveyClick}
            className="w-full sm:w-auto cursor-pointer"
          >
            {slumSurvey ? "Continue Survey" : "Start Survey"}
          </Button>
          
          <SurveyConfirmationDialog
            isOpen={showSlumSurveyConfirm}
            surveyType="slum"
            slumName={slum?.slumName || ""}
            surveyStatus={slumSurvey?.surveyStatus as "DRAFT" | "IN PROGRESS" | "SUBMITTED" | "COMPLETED" | undefined}
            onConfirm={handleSlumSurveyConfirm}
            onCancel={handleSlumSurveyCancel}
            onPreview={handleSlumSurveyPreview}
            onEdit={handleSlumSurveyEdit}
          />
        </Card>

        {/* Household Surveys */}
        <Card>
          <h3 className="font-bold text-text-primary mb-3">
            Household Surveys
          </h3>
          <p className="text-xs text-text-muted mb-4">
            Survey individual households in this slum
          </p>

          {households.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-6">
              No households available for this slum yet
            </p>
          ) : (
            <div className="space-y-2">
              {households.map((household) => (
                <Link
                  key={household._id}
                  href={`/surveyor/household-survey/${household._id}`}
                >
                  <div className="p-3 bg-slate-800 rounded hover:bg-slate-700 transition-colors cursor-pointer">
                    <p className="font-medium text-text-primary text-sm">
                      {household.doorNo || "House " + household._id.slice(-4)}
                    </p>
                    <p className="text-xs text-text-muted">
                      {household.headName || "No name"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {households.length === 0 && (
            <Button 
              variant="secondary" 
              size="md"
              className="w-full sm:w-auto cursor-pointer" 
              disabled
            >
              No Households Available
            </Button>
          )}
        </Card>
      </div>
    </SurveyorLayout>
  );
}
