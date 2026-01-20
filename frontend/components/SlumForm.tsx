"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Select from "@/components/Select";
import apiService from "@/services/api";

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
    location: "",
    state: "",
    district: "",
    city: "",
    ward: "",
    slumType: "NOTIFIED",
    landOwnership: "",
    totalHouseholds: 0,
  });

  const [states, setStates] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (slum) {
      setFormData({
        name: slum.name || "",
        location: slum.location || "",
        state: slum.state?._id || slum.state || "",
        district: slum.district?._id || slum.district || "",
        city: slum.city || "",
        ward: slum.ward || "",
        slumType: slum.slumType || "NOTIFIED",
        landOwnership: slum.landOwnership || "",
        totalHouseholds: slum.totalHouseholds || 0,
      });
    }
  }, [slum]);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await apiService.getStates();
        if (response.success) {
          setStates(response.data || []);
        }
      } catch (error) {
        console.error("Error fetching states:", error);
      }
    };

    if (isOpen) {
      fetchStates();
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (formData.state) {
        try {
          const response = await apiService.getDistrictsByState(formData.state);
          if (response.success) {
            setDistricts(response.data || []);
          }
        } catch (error) {
          console.error("Error fetching districts:", error);
        }
      }
    };

    fetchDistricts();
  }, [formData.state]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "totalHouseholds" ? parseInt(value) || 0 : value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.location ||
      !formData.state ||
      !formData.district
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
          location: "",
          state: "",
          district: "",
          city: "",
          ward: "",
          slumType: "NOTIFIED",
          landOwnership: "",
          totalHouseholds: 0,
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#111827] border border-slate-700 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {slum ? "Edit Slum" : "Create New Slum"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Slum Name *"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter slum name"
              required
            />
            <Input
              label="Location *"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter location"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="State *"
              name="state"
              value={formData.state}
              onChange={handleChange}
              options={[
                { value: "", label: "Select State" },
                ...states.map((state: any) => ({
                  value: state._id,
                  label: state.name,
                })),
              ]}
              required
            />
            <Select
              label="District *"
              name="district"
              value={formData.district}
              onChange={handleChange}
              options={[
                { value: "", label: "Select District" },
                ...districts.map((district: any) => ({
                  value: district._id,
                  label: district.name,
                })),
              ]}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Enter city"
            />
            <Input
              label="Ward"
              name="ward"
              value={formData.ward}
              onChange={handleChange}
              placeholder="Enter ward"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Slum Type"
              name="slumType"
              value={formData.slumType}
              onChange={handleChange}
              options={[
                { value: "NOTIFIED", label: "Notified" },
                { value: "NON_NOTIFIED", label: "Non-Notified" },
              ]}
            />
            <Input
              label="Land Ownership"
              name="landOwnership"
              value={formData.landOwnership}
              onChange={handleChange}
              placeholder="Enter land ownership"
            />
          </div>

          <Input
            label="Total Households"
            name="totalHouseholds"
            type="number"
            value={formData.totalHouseholds}
            onChange={handleChange}
            placeholder="Enter total households"
            min="0"
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : slum ? "Update Slum" : "Create Slum"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
