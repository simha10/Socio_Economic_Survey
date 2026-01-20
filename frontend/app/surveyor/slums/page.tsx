"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import SurveyorLayout from "@/components/SurveyorLayout";
import Card from "@/components/Card";
import Input from "@/components/Input";
import apiService from "@/services/api";
import { useToast } from "@/components/Toast";

interface Slum {
  _id: string;
  name: string;
  location: string;
  population?: number;
  area?: string;
}

export default function SlumsPage() {
  const { showToast } = useToast();
  const [slums, setSlums] = useState<Slum[]>([]);
  const [filteredSlums, setFilteredSlums] = useState<Slum[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Load user data
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
    }

    const loadSlums = async () => {
      try {
        setLoading(true);
        const response = await apiService.getSlums();
        if (response.success) {
          setSlums(response.data || []);
          setFilteredSlums(response.data || []);
        } else {
          showToast("Failed to load slums", "error");
        }
      } catch (error) {
        console.error("Error loading slums:", error);
        showToast("Error loading slums", "error");
      } finally {
        setLoading(false);
      }
    };

    loadSlums();
  }, []);

  useEffect(() => {
    const filtered = slums.filter(
      (slum) =>
        slum.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        slum.location.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredSlums(filtered);
  }, [searchTerm, slums]);

  if (loading) {
    return (
      <SurveyorLayout username={user?.name || user?.username}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-muted">Loading slums...</p>
          </div>
        </div>
      </SurveyorLayout>
    );
  }

  return (
    <SurveyorLayout username={user?.name || user?.username}>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary mb-4">
          Available Slums
        </h2>
        <Input
          type="search"
          placeholder="Search by name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredSlums.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-text-muted">
            {slums.length === 0
              ? "No slums available"
              : "No slums match your search"}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredSlums.map((slum) => (
            <Link key={slum._id} href={`/surveyor/slums/${slum._id}`}>
              <Card hover>
                <h3 className="font-bold text-text-primary mb-1">
                  {slum.name}
                </h3>
                <p className="text-xs text-text-muted mb-3">{slum.location}</p>
                <div className="flex justify-between text-xs text-text-muted">
                  {slum.population && (
                    <span>Population: {slum.population.toLocaleString()}</span>
                  )}
                  {slum.area && <span>Area: {slum.area}</span>}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </SurveyorLayout>
  );
}
