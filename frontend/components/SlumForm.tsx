"use client";

import { useState, useEffect, useCallback } from "react";
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
  const [userDetails, setUserDetails] = useState<any>(null); // To store user details for auto-fill

  // Auto-fill state and district based on user preference
  const autoFillLocation = useCallback(() => {
    if (userDetails && states.length > 0) {
      // Example: auto-fill based on user's assigned region or last used values
      // You can customize this logic based on your specific requirements
      const lastUsedState = localStorage.getItem('lastSelectedState');
      const lastUsedDistrict = localStorage.getItem('lastSelectedDistrict');
      
      if (lastUsedState) {
        const stateExists = states.some((state: any) => state._id === lastUsedState);
        if (stateExists) {
          setFormData(prev => ({ ...prev, state: lastUsedState }));
          
          // Auto-fill district if it was used with this state
          if (lastUsedDistrict) {
            setTimeout(() => {
              const districtExists = districts.some((district: any) => district._id === lastUsedDistrict);
              if (districtExists) {
                setFormData(prev => ({ ...prev, district: lastUsedDistrict }));
              }
            }, 300); // Wait for districts to load
          }
        }
      }
    }
  }, [userDetails, states]); // Removed districts to prevent circular updates

  // Load user details for auto-fill
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await apiService.getMe();
        if (response.success) {
          setUserDetails(response.user);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    if (isOpen && !slum) { // Only fetch for new slums, not editing
      fetchUserDetails();
    }
  }, [isOpen, slum]); // This dependency array is correct

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
    } else if (userDetails && !slum) {
      // Auto-fill based on user details when creating a new slum
      // You can customize this logic based on your user data structure
      setFormData(prev => ({
        ...prev,
        state: prev.state || "", // Will be set after state selection
        district: prev.district || "",
        city: prev.city || "",
      }));
    }
  }, [slum]); // Only depend on slum to prevent auto-fill from triggering unnecessary updates

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await apiService.getStates();
        if (response.success) {
          setStates(response.data || []);
          
          // Auto-fill after states are loaded
          if (isOpen && !slum) {
            setTimeout(() => {
              autoFillLocation();
            }, 100);
          }
        }
      } catch (error) {
        console.error("Error fetching states:", error);
      }
    };

    if (isOpen) {
      fetchStates();
    }
  }, [isOpen, slum]); // Removed autoFillLocation from dependencies to prevent circular updates

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
  }, [formData.state]); // This is correct as it should update when state changes

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "totalHouseholds" ? parseInt(value) || 0 : value,
    }));
    
    // Save to localStorage for auto-fill
    if (name === 'state') {
      localStorage.setItem('lastSelectedState', value);
    } else if (name === 'district') {
      localStorage.setItem('lastSelectedDistrict', value);
    }
    
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('SlumForm: HandleSubmit called', { slum, formData });

    if (
      !formData.name ||
      !formData.location ||
      !formData.state ||
      !formData.district
    ) {
      console.log('SlumForm: Validation failed', {
        name: !!formData.name,
        location: !!formData.location,
        state: !!formData.state,
        district: !!formData.district
      });
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      console.log('SlumForm: Calling API service', { slumId: slum?._id, formData });
      let response;
      if (slum) {
        console.log('SlumForm: Updating existing slum', slum._id);
        response = await apiService.updateSlum(slum._id, formData);
      } else {
        console.log('SlumForm: Creating new slum');
        response = await apiService.createSlum(formData);
      }
      
      console.log('SlumForm: API response received', response);

      if (response.success) {
        console.log('SlumForm: Operation successful, calling callbacks');
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
        console.log('SlumForm: Operation failed', response.message);
        setError(response.message || "Failed to save slum");
      }
    } catch (err) {
      console.error('SlumForm: handleSubmit error caught', err);
      setError("Error saving slum");
      console.error(err);
    } finally {
      setLoading(false);
      console.log('SlumForm: Loading state set to false');
    }
  };

  const handleButtonClick = () => {
    // Create a synthetic form event for the button click
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
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
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
                label="Slum Name *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Shantinagar"
                required
              />
              <Input
                label="Location *"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Sector 4, North Block"
                required
              />
            </div>

            {/* Auto-fill hint */}
            {!slum && (
              <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-3 rounded-lg text-sm flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2" />
                <span>Fields may be auto-filled based on your previous selections</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="City/Town"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city name"
              />
              <Input
                label="Ward Number"
                name="ward"
                value={formData.ward}
                onChange={handleChange}
                placeholder="Enter ward number"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                label="Land Ownership Status"
                name="landOwnership"
                value={formData.landOwnership}
                onChange={handleChange}
                placeholder="e.g. Private / Government"
              />
            </div>

             <div className="max-w-md">
                <Input
                  label="Total Households (Approx)"
                  name="totalHouseholds"
                  type="number"
                  value={formData.totalHouseholds}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
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
