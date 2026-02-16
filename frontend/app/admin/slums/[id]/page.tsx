'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiService from '@/services/api';
import SupervisorAdminLayout from '@/components/SupervisorAdminLayout';
import Card from '@/components/Card';
import Button from '@/components/Button';

interface Slum {
  _id: string;
  slumName: string;
  slumId: number;
  stateCode: string;
  distCode: string;
  cityTownCode: string;
  ward: {
    _id: string;
    number: string;
    name: string;
    zone: string;
  } | string;
  slumType: string;
  village: string;
  landOwnership: string;
  totalHouseholds: number;
  area: number;
  surveyStatus?: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  _id: string;
  name: string;
  username: string;
  role: string;
}

export default function AdminSlumDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [slum, setSlum] = useState<Slum | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Minimal user verification
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      if (userData?.role !== "ADMIN") {
        router.push(`/${userData?.role?.toLowerCase()}/dashboard`);
        return;
      }
    } catch (error) {
      console.error('Error parsing user:', error);
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userStr));
  }, [router]);

  useEffect(() => {
    const fetchSlum = async () => {
      try {
        let slumId: string | undefined;
        if (Array.isArray(id) && id.length > 0) {
          slumId = id[0];
        } else if (typeof id === 'string') {
          slumId = id;
        }
        
        if (slumId) {
          const response = await apiService.getSlum(slumId);
          if (response.success) {
            setSlum(response.data?.slum || response.data);
          }
        }
      } catch (error) {
        console.error('Error fetching slum:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSlum();
    }
  }, [id]);

  if (loading) {
    return (
      <SupervisorAdminLayout role="ADMIN" username={user?.name || user?.username}>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-2xl font-semibold text-slate-400">
            Loading slum details...
          </div>
        </div>
      </SupervisorAdminLayout>
    );
  }

  if (!slum) {
    return (
      <SupervisorAdminLayout role="ADMIN" username={user?.name || user?.username}>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-2xl font-semibold text-slate-400">
            Slum not found
          </div>
        </div>
      </SupervisorAdminLayout>
    );
  }

  return (
    <SupervisorAdminLayout role="ADMIN" username={user?.name || user?.username}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">{slum.slumName}</h1>
          <Button variant="secondary" className="cursor-pointer" onClick={() => router.back()}>
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-lg font-bold text-white mb-4">Basic Information</h2>
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-slate-400">Slum ID</h3>
                <p className="text-white font-medium">#{slum.slumId}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-400">State Code</h3>
                <p className="text-white">{slum.stateCode}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-400">District Code</h3>
                <p className="text-white">{slum.distCode}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-400">City/Town Code</h3>
                <p className="text-white">{slum.cityTownCode || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-400">Ward</h3>
                <p className="text-white">
                  {typeof slum.ward === 'object' && slum.ward !== null
                    ? `${slum.ward.number} - ${slum.ward.name}`
                    : slum.ward?.toString() || 'N/A'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-400">Zone</h3>
                <p className="text-white">
                  {typeof slum.ward === 'object' && slum.ward !== null
                    ? `${slum.ward.zone}`
                    : slum.ward?.toString() || 'N/A'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-400">Village</h3>
                <p className="text-white">{slum.village || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-400">Land Ownership</h3>
                <p className="text-white">{slum.landOwnership || 'N/A'}</p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-white mb-4">Statistics & Status</h2>
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-slate-400">Slum Type</h3>
                <p className="text-white">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    slum.slumType === 'NOTIFIED' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {slum.slumType.replace('_', ' ')}
                  </span>
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-400">Total Households</h3>
                <p className="text-2xl font-bold text-white">{slum.totalHouseholds || 0}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-400">Area (sq.m)</h3>
                <p className="text-2xl font-bold text-white">{slum.area?.toFixed(2) || '0.00'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-400">Survey Status</h3>
                <p className="text-white">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    slum.surveyStatus === 'COMPLETED'
                      ? 'bg-green-500/20 text-green-400'
                      : slum.surveyStatus === 'IN PROGRESS'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {slum.surveyStatus || 'PENDING'}
                  </span>
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-400">Created At</h3>
                <p className="text-white">
                  {new Date(slum.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </SupervisorAdminLayout>
  );
}
