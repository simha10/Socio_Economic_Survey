'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/services/api';
import { HouseholdSurvey } from '@/types/householdSurvey';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import Card from './Card';

interface HouseholdSurveySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: string;
  slumId: string;
  slumName: string;
  initialMode?: 'search' | 'new';
}

export const HouseholdSurveySelector = ({
  isOpen,
  onClose,
  assignmentId,
  slumId,
  slumName,
  initialMode = 'search'
}: HouseholdSurveySelectorProps) => {
  const router = useRouter();
  const [mode, setMode] = useState<'search' | 'new'>(initialMode);

  // Update mode when initialMode changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  const [parcelId, setParcelId] = useState<string>('');
  const [propertyNo, setPropertyNo] = useState<string>('');
  const [properties, setProperties] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefetchedData, setPrefetchedData] = useState<HouseholdSurvey | null>(null);
  const [showPrefetchPreview, setShowPrefetchPreview] = useState(false);

  const loadProperties = async (parcelIdStr: string) => {
    if (!slumId) return;

    setLoadingProperties(true);
    setProperties([]);

    try {
      const response = await apiService.getPropertiesBySlumAndParcel(slumId, parcelIdStr);

      if (response.success) {
        const propertyList = response.data || [];
        setProperties(propertyList);

        // Auto-select property if there's only one
        if (propertyList.length === 1) {
          setPropertyNo(propertyList[0].toString());
        } else {
          setPropertyNo('');
        }
      } else {
        console.error('Failed to load properties:', response.error);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoadingProperties(false);
    }
  };

  const validateInputs = (): boolean => {
    if (!parcelId.trim()) {
      setError('Parcel ID is required');
      return false;
    }
    if (!propertyNo.trim()) {
      setError('Property Number is required');
      return false;
    }
    if (isNaN(Number(propertyNo)) || Number(propertyNo) <= 0) {
      setError('Property Number must be a positive number');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSearch = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    setError(null);
    setPrefetchedData(null);
    setShowPrefetchPreview(false);

    try {
      const response = await apiService.getHouseholdSurveyByParcel(
        slumId,
        parcelId,
        parseInt(propertyNo)
      );

      if (response.success && response.data) {
        // Found existing household survey - show pre-fetch preview
        const surveyData = response.data;
        setPrefetchedData(surveyData);
        setShowPrefetchPreview(true);

        // Don't redirect immediately, let user see the pre-fetched data first
      } else {
        setError('No household survey found for this Parcel ID and Property Number combination');
      }
    } catch (err) {
      setError('Failed to search for household survey');
      console.error('Error searching household survey:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.createOrGetHouseholdSurvey(
        slumId,
        `${parcelId}-${propertyNo}`,
        parcelId,
        parseInt(propertyNo)
      );

      if (response.success && response.data) {
        // Successfully created new household survey - redirect to it
        const surveyData = response.data as any;
        // Use the survey ID for the URL, but ensure we're using the assignment ID from the survey if available
        const targetAssignmentId = (surveyData as any).assignment?._id || assignmentId;
        router.push(`/surveyor/household-survey/${targetAssignmentId}?surveyId=${(response.data as any)._id}`);
      } else {
        setError(response.error || 'Failed to create new household survey');
      }
    } catch (err) {
      setError('Failed to create new household survey');
      console.error('Error creating household survey:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (mode === 'search') {
      handleSearch();
    } else {
      handleCreateNew();
    }
  };

  const handleContinueToSurvey = () => {
    if (prefetchedData) {
      // Use the survey ID for the URL, but ensure we're using the assignment ID from the survey if available
      const targetAssignmentId = prefetchedData.assignment?._id || assignmentId;
      router.push(`/surveyor/household-survey/${targetAssignmentId}?surveyId=${prefetchedData._id}`);
    }
  };

  const handleBackToSearch = () => {
    setShowPrefetchPreview(false);
    setPrefetchedData(null);
    setError(null);
  };

  useEffect(() => {
    if (parcelId && mode === 'search') {
      loadProperties(parcelId);
    }
  }, [parcelId, mode, slumId]);

  // Reset form when mode changes
  useEffect(() => {
    setParcelId('');
    setPropertyNo('');
    setProperties([]);
    setError(null);
    setPrefetchedData(null);
    setShowPrefetchPreview(false);
    // Removed automatic parcel ID generation on new mode
  }, [mode]);

  const handleParcelIdChange = (value: string) => {
    // Allow manual editing of parcel ID in both modes
    setParcelId(value);
  };

  if (!isOpen) return null;

  // Show pre-fetch preview if available and in search mode
  if (showPrefetchPreview && prefetchedData && mode === 'search') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-lg bg-slate-800 border border-slate-700">
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-2">
                Household Found
              </h2>
              <p className="text-slate-300 text-sm mt-1">
                Slum: {slumName}
              </p>
            </div>

            {/* Pre-fetched Data Preview */}
            <div className="space-y-4 mb-6">
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-3">Household Details</h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      House/Flat/Door No.
                    </label>
                    <div className="text-white font-medium">
                      {prefetchedData.houseDoorNo || `${prefetchedData.parcelId}-${prefetchedData.propertyNo}`}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Head of Household Name
                    </label>
                    <div className="text-white">
                      {prefetchedData.headName || 'Not available'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Father/ Husband/ Guardian&apos;s Name
                    </label>
                    <div className="text-white">
                      {prefetchedData.fatherName || 'Not available'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Land Tenure Status
                    </label>
                    <div className="text-white">
                      {prefetchedData.landTenureStatus || 'Not available'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      House Structure/Type
                    </label>
                    <div className="text-white">
                      {prefetchedData.houseStructure || 'Not available'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handleBackToSearch}
                className="flex-1"
              >
                Back to Search
              </Button>
              <Button
                onClick={handleContinueToSurvey}
                className="flex-1"
              >
                Continue to Survey
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-slate-800 border border-slate-700">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-2">
              {mode === 'search' ? 'Search Household' : 'Create New Household'}
            </h2>
            <p className="text-slate-400 text-sm">
              {mode === 'search'
                ? 'Find an existing household to continue surveying'
                : 'Create a new household record for surveying'}
            </p>
            <p className="text-slate-300 text-sm mt-1">
              Slum: {slumName}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="mb-6">
            <div className="flex bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setMode('search')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${mode === 'search'
                  ? 'bg-slate-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-300'
                  }`}
              >
                Search Existing
              </button>
              <button
                onClick={() => setMode('new')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${mode === 'new'
                  ? 'bg-slate-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-300'
                  }`}
              >
                Create New
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Parcel ID
                {mode === 'new' && (
                  <span className="text-xs text-slate-400 ml-2">
                    (Manual entry)
                  </span>
                )}
              </label>
              <Input
                type="text"
                value={parcelId}
                onChange={(e) => handleParcelIdChange(e.target.value)}
                placeholder="Enter Parcel ID (e.g., 101, 102)"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Property Number
              </label>
              {properties.length > 0 ? (
                <Select
                  value={propertyNo}
                  onChange={(e) => setPropertyNo(e.target.value)}
                  disabled={loadingProperties}
                  options={[
                    ...properties.map(property => ({ value: property.toString(), label: property.toString() }))
                  ]}
                />
              ) : (
                <Input
                  type="number"
                  value={propertyNo}
                  onChange={(e) => setPropertyNo(e.target.value)}
                  placeholder={
                    loadingProperties
                      ? "Loading properties..."
                      : properties.length === 0 && parcelId
                        ? "Enter new property number"
                        : "Enter Property Number"
                  }
                  min="1"
                  className="w-full"
                />
              )}
              {loadingProperties && (
                <p className="text-xs text-slate-400 mt-1">Loading properties...</p>
              )}
              {properties.length === 0 && parcelId && !loadingProperties && (
                <p className="text-xs text-blue-600 mt-1">
                  No existing properties found. You can enter a new property number.
                </p>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Back to Dashboard
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !parcelId.trim() || !propertyNo.trim()}
              className="flex-1"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {mode === 'search' ? 'Searching...' : 'Creating...'}
                </div>
              ) : mode === 'search' ? (
                'Search Household'
              ) : (
                'Create Household'
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};