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
  location: string;
  district: string;
  state: string;
  slumType: string;
  totalHouseholds: number;
  description?: string;
}

export default function SupervisorSlumDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [slum, setSlum] = useState<Slum | null>(null);
  const [loading, setLoading] = useState(true);

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
          } else {
            console.error('Failed to fetch slum:', response.error);
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
      <SupervisorAdminLayout role="SUPERVISOR">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-2xl font-semibold">Loading slum details...</div>
        </div>
      </SupervisorAdminLayout>
    );
  }

  if (!slum) {
    return (
      <SupervisorAdminLayout role="SUPERVISOR">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-2xl font-semibold">Slum not found</div>
        </div>
      </SupervisorAdminLayout>
    );
  }

  return (
    <SupervisorAdminLayout role="SUPERVISOR">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">{slum.slumName}</h1>
          <Button variant="secondary" onClick={() => router.back()}>
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-lg font-bold text-primary mb-4">Basic Information</h2>
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-text-muted">Location</h3>
                <p className="text-text-primary">{slum.location}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-muted">District</h3>
                <p className="text-text-primary">{slum.district}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-muted">State</h3>
                <p className="text-text-primary">{slum.state}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-muted">Type</h3>
                <p className="text-text-primary">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    slum.slumType === 'NOTIFIED' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {slum.slumType}
                  </span>
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-primary mb-4">Statistics</h2>
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-text-muted">Total Households</h3>
                <p className="text-2xl font-bold text-primary">{slum.totalHouseholds}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-muted">Assigned Surveyor</h3>
                <p className="text-text-primary">Not assigned</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-muted">Status</h3>
                <p className="text-text-primary">
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">
                    Pending
                  </span>
                </p>
              </div>
            </div>
          </Card>
        </div>

        {slum.description && (
          <Card>
            <h2 className="text-lg font-bold text-primary mb-4">Description</h2>
            <p className="text-text-primary">{slum.description}</p>
          </Card>
        )}

        <Card>
          <h2 className="text-lg font-bold text-primary mb-4">Actions</h2>
          <div className="flex gap-3">
            <Button 
              variant="primary"
              onClick={() => router.push(`/supervisor/assignments?slumId=${slum._id}`)}
            >
              Assign Surveyor
            </Button>
            <Button variant="secondary">
              View Survey Reports
            </Button>
          </div>
        </Card>
      </div>
    </SupervisorAdminLayout>
  );
}