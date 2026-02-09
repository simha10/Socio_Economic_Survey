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

interface SlumFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  slum?: any;
}

export default function SlumForm({
  isOpen,
  onClose,
  onSuccess,
  slum,
}: SlumFormProps) {
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
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Removed unused state and district loading logic since we're using Input components for display

  useEffect(() => {
    if (slum) {
      // Handle ward field - it can be an object or a number/string
      let wardValue: string | number = "";
      if (typeof slum.ward === 'object' && slum.ward !== null) {
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
      });
    } else {
      setFormData({
        name: "",
        slumId: 0,
        stateCode: "",
        distCode: "",
        cityTownCode: "",
        ward: "",
        slumType: "NOTIFIED",
        village: "",
        landOwnership: "",
        totalHouseholds: 0,
        area: 0,
      });
    }
  }, [slum, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const isNumberField = ['slumId', 'ward', 'totalHouseholds', 'area'].includes(name);
    
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
      if (slum) {
        response = await apiService.updateSlum(slum._id, formData);
      } else {
        response = await apiService.createSlum(formData);
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
          ward: 0,
          slumType: "NOTIFIED",
          village: "",
          landOwnership: "",
          totalHouseholds: 0,
          area: 0,
        });
      } else {
        setError(response.message || "Failed to save slum");
      }
    } catch (err) {
      setError("Error saving slum");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSubmit(fakeEvent);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-fade-in">
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {slum ? "Edit Slum Details" : "Register New Slum"}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {slum ? "Update the details below" : "Enter the required information to add a new slum"}
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
                readOnly
                className="bg-slate-800/50 cursor-not-allowed opacity-75"
              />
              <Input
                label="Slum ID"
                name="slumId"
                type="number"
                value={formData.slumId || ''}
                onChange={handleChange}
                placeholder="Enter unique slum ID"
                required
                disabled
                className="bg-slate-800/50 cursor-not-allowed opacity-75"
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
                readOnly
                className="bg-slate-800/50 cursor-not-allowed opacity-75"
              />
              <Input
                label="District Code"
                name="distCode"
                value={formData.distCode}
                onChange={handleChange}
                placeholder="District code"
                required
                readOnly
                className="bg-slate-800/50 cursor-not-allowed opacity-75"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="City/Town Code"
                name="cityTownCode"
                value={formData.cityTownCode}
                onChange={handleChange}
                placeholder="Enter City/Town Code"
                required
                disabled
                className="bg-slate-800/50 cursor-not-allowed opacity-75"
              />
              <Input
                label="Ward Number"
                name="ward"
                type="number"
                value={formData.ward || ''}
                onChange={handleChange}
                placeholder="Enter ward number"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Slum Type"
                name="slumType"
                value={formData.slumType}
                onChange={handleChange}
                required
                readOnly
                className="bg-slate-800/50 cursor-not-allowed opacity-75"
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
                value={formData.totalHouseholds || ''}
                onChange={handleChange}
                placeholder="0"
                min="0"
                disabled
                className="bg-slate-800/50 cursor-not-allowed opacity-75"
              />
            </div>
            
            <div className="max-w-md">
              <Input
                label="Area (sq.m)"
                name="area"
                type="number"
                value={formData.area || ''}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
                disabled
                className="bg-slate-800/50 cursor-not-allowed opacity-75"
              />
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
