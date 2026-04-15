"use client";

import { useState, useEffect, useCallback } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Select from "@/components/Select";
import apiService from "@/services/api";

interface State {
  _id: string;
  name: string;
  code: string;
}

interface District {
  _id: string;
  name: string;
  code: string;
  state: string;
}

interface Slum {
  _id?: string;
  slumName?: string;
  slumId?: number;
  stateCode?: string;
  distCode?: string;
  cityTownCode?: string;
  city?: string;
  location?: string;
  ward?:
    | string
    | number
    | {
        _id?: string;
        number?: string;
        name?: string;
        zone?: string;
      }; // Can be object or number
  slumType?: string;
  village?: string;
  landOwnership?: string;
  totalHouseholds?: number;
  area?: number;
  surveyStatus?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  name?: string;
}

interface SlumFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  slum?: Slum | null; // Allow null for creating new slums
  role?: string; // Add role prop to determine permissions
}

export default function SlumForm({
  isOpen,
  onClose,
  onSuccess,
  slum,
  role = "SUPERVISOR", // Default to supervisor permissions
}: SlumFormProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slumId: 0,
    stateCode: "",
    distCode: "",
    cityTownCode: "",
    ward: "" as string | number,
    slumType: "NOTIFIED",
    village: "",
    landOwnership: "",
    totalHouseholds: 0,
    area: 0,
    location: "",
    surveyStatus: "PENDING" as string,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Removed unused state and district loading logic since we're using Input components for display

  useEffect(() => {
    // Set edit mode based on whether slum prop exists
    setIsEditMode(!!slum);

    if (slum) {
      // Handle ward field - it can be an object or a number/string
      let wardValue: string | number = "";
      if (typeof slum.ward === "object" && slum.ward !== null) {
        wardValue = slum.ward.number || "";
      } else {
        wardValue = slum.ward || "";
      }

      setFormData({
        name: slum.slumName || slum.name || "",
        slumId: slum.slumId || 0,
        stateCode: slum.stateCode || "",
        distCode: slum.distCode || "",
        cityTownCode: slum.cityTownCode || slum.city || "",
        ward: wardValue,
        slumType: slum.slumType || "NOTIFIED",
        village: slum.village || "",
        landOwnership: slum.landOwnership || "",
        totalHouseholds: slum.totalHouseholds || 0,
        area: slum.area || 0,
        location: slum.location || "",
        surveyStatus: slum.surveyStatus || "PENDING",
      });
    } else {
      setFormData({
        name: "",
        slumId: 0,
        stateCode: "",
        distCode: "",
        cityTownCode: "",
        location: "",
        ward: "",
        slumType: "NOTIFIED",
        village: "",
        landOwnership: "",
        totalHouseholds: 0,
        area: 0,
        surveyStatus: "PENDING",
      });
    }
  }, [slum, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const isNumberField = [
      "slumId",
      "ward",
      "totalHouseholds",
      "area",
    ].includes(name);

    setFormData((prev) => ({
      ...prev,
      [name]: isNumberField ? parseFloat(value) || 0 : value,
    }));

    // Removed district loading logic since we're using Input components for display

    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.slumId ||
      !formData.stateCode ||
      !formData.distCode ||
      !formData.cityTownCode ||
      !formData.ward
    ) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      let response;
      if (slum && slum._id) {
        // Edit mode: Prepare update data
        const updateData: Record<string, unknown> = {
          name: formData.name,
          slumId: formData.slumId,
          stateCode: formData.stateCode,
          distCode: formData.distCode,
          cityTownCode: formData.cityTownCode,
          ward: formData.ward,
          slumType: formData.slumType,
          village: formData.village,
          landOwnership: formData.landOwnership,
          totalHouseholds: formData.totalHouseholds,
          area: formData.area,
          location: formData.location,
        };

        // Only include surveyStatus in edit mode
        if (isEditMode && formData.surveyStatus) {
          updateData.surveyStatus = formData.surveyStatus;
        }

        response = await apiService.updateSlum(slum._id, updateData);
      } else {
        // Create mode: Don't include surveyStatus (will default to PENDING)
        const createData: Record<string, unknown> = {
          name: formData.name,
          slumId: formData.slumId,
          stateCode: formData.stateCode,
          distCode: formData.distCode,
          cityTownCode: formData.cityTownCode,
          ward: formData.ward,
          slumType: formData.slumType,
          village: formData.village,
          landOwnership: formData.landOwnership,
          totalHouseholds: formData.totalHouseholds,
          area: formData.area,
          location: formData.location,
        };
        response = await apiService.createSlum(createData);
      }

      if (response.success) {
        onSuccess();
        onClose();
        setFormData({
          name: "",
          slumId: 0,
          stateCode: "",
          distCode: "",
          cityTownCode: "",
          location: "",
          ward: 0,
          slumType: "NOTIFIED",
          village: "",
          landOwnership: "",
          totalHouseholds: 0,
          area: 0,
          surveyStatus: "PENDING",
        });
      } else {
        setError(response.error || "Failed to save slum");
      }
    } catch (err) {
      setError("Error saving slum");
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSubmit(fakeEvent);
  };

  if (!isOpen) return null;

  // Determine if the user has admin permissions
  const isAdmin = role === "ADMIN";

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-fade-in">
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {slum ? "Edit Slum Details" : "Register New Slum"}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {slum
                ? "Update the details below"
                : "Enter the required information to add a new slum"}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Slum Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter Slum Name"
                required
                readOnly={isEditMode}
                className={
                  isEditMode
                    ? "bg-slate-800/50 cursor-not-allowed opacity-75"
                    : ""
                }
              />
              <Input
                label="Slum ID"
                name="slumId"
                type="number"
                value={formData.slumId || ""}
                onChange={handleChange}
                placeholder="Enter unique slum ID"
                required
                disabled={isEditMode}
                className={
                  isEditMode
                    ? "bg-slate-800/50 cursor-not-allowed opacity-75"
                    : ""
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter location"
              />
              <Input
                label="City/Town Code"
                name="cityTownCode"
                value={formData.cityTownCode}
                onChange={handleChange}
                placeholder="Enter City/Town Code"
                required
                disabled={isEditMode}
                className={
                  isEditMode
                    ? "bg-slate-800/50 cursor-not-allowed opacity-75"
                    : ""
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="State Code"
                name="stateCode"
                value={formData.stateCode}
                onChange={handleChange}
                placeholder="State code"
                required
                readOnly={isEditMode}
                className={
                  isEditMode
                    ? "bg-slate-800/50 cursor-not-allowed opacity-75"
                    : ""
                }
              />
              <Input
                label="District Code"
                name="distCode"
                value={formData.distCode}
                onChange={handleChange}
                placeholder="District code"
                required
                readOnly={isEditMode}
                className={
                  isEditMode
                    ? "bg-slate-800/50 cursor-not-allowed opacity-75"
                    : ""
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="City/Town Name"
                name="cityTownCode"
                value={formData.cityTownCode}
                onChange={handleChange}
                placeholder="Enter City/Town Name"
                required
                disabled={isEditMode}
                className={
                  isEditMode
                    ? "bg-slate-800/50 cursor-not-allowed opacity-75"
                    : ""
                }
              />
              <Input
                label="Ward Number"
                name="ward"
                type="number"
                value={formData.ward || ""}
                onChange={handleChange}
                placeholder="Enter ward number"
                required
                disabled={isEditMode}
                className={
                  isEditMode
                    ? "bg-slate-800/50 cursor-not-allowed opacity-75"
                    : ""
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Slum Type"
                name="slumType"
                value={formData.slumType}
                onChange={handleChange}
                required
                readOnly={isEditMode && !isAdmin}
                className={
                  isEditMode && !isAdmin
                    ? "bg-slate-800/50 cursor-not-allowed opacity-75"
                    : ""
                }
              />
              <Input
                label="Village"
                name="village"
                value={formData.village}
                onChange={handleChange}
                placeholder="Enter village name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Land Ownership Status"
                name="landOwnership"
                value={formData.landOwnership}
                onChange={handleChange}
                placeholder="e.g. Private / Government"
              />
              <Input
                label="Total Households (Approx)"
                name="totalHouseholds"
                type="number"
                value={formData.totalHouseholds || ""}
                onChange={handleChange}
                placeholder="0"
                min="0"
                disabled={isEditMode && !isAdmin}
                className={
                  isEditMode && !isAdmin
                    ? "bg-slate-800/50 cursor-not-allowed opacity-75"
                    : ""
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Area (sq.m)"
                name="area"
                type="number"
                value={formData.area || ""}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
                disabled={isEditMode && !isAdmin}
                className={
                  isEditMode && !isAdmin
                    ? "bg-slate-800/50 cursor-not-allowed opacity-75"
                    : ""
                }
              />

              {/* Survey Status Field - Only in Edit Mode */}
              {isEditMode ? (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Slum Survey Status
                  </label>
                  <select
                    name="surveyStatus"
                    value={formData.surveyStatus}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-800/50 disabled:cursor-not-allowed disabled:opacity-75"
                    disabled={isEditMode && !isAdmin}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="IN PROGRESS">IN PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                  {!isAdmin && (
                    <p className="text-xs text-slate-500 mt-1">
                      Only admins can change the slum survey status
                    </p>
                  )}
                </div>
              ) : (
                <div></div>
              )}
            </div>

            {/* Hidden submit for Enter key support */}
            <button type="submit" className="hidden" />
          </form>
        </div>

        <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleButtonClick}
            disabled={loading}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white"
          >
            {loading ? "Saving..." : slum ? "Update Details" : "Create Record"}
          </Button>
        </div>
      </div>
    </div>
  );
}
