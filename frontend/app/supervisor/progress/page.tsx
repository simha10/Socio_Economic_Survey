'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiService from '@/services/api';
import SupervisorAdminLayout from '@/components/SupervisorAdminLayout';
import Card from '@/components/Card';
import Button from '@/components/Button';

interface ProgressData {
  _id: string;
  surveyor: {
    _id: string;
    username: string;
    name: string;
  };
  slum: {
    _id: string;
    name: string;
    location: string;
  };
  completedHouseholds: number;
  totalHouseholds: number;
  progressPercentage: number;
  lastUpdated: string;
}

export default function SupervisorProgressPage() {
  const router = useRouter();
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        // For now, we'll simulate progress data since we don't have a specific endpoint
        // In a real implementation, this would be an actual API call
        const mockData: ProgressData[] = [
          {
            _id: '1',
            surveyor: {
              _id: 's1',
              username: 'surveyor1',
              name: 'John Doe',
            },
            slum: {
              _id: 'sl1',
              name: 'ABC Nagar',
              location: 'Mumbai',
            },
            completedHouseholds: 45,
            totalHouseholds: 60,
            progressPercentage: 75,
            lastUpdated: '2023-06-15T10:30:00Z',
          },
          {
            _id: '2',
            surveyor: {
              _id: 's2',
              username: 'surveyor2',
              name: 'Jane Smith',
            },
            slum: {
              _id: 'sl2',
              name: 'XYZ Colony',
              location: 'Delhi',
            },
            completedHouseholds: 30,
            totalHouseholds: 50,
            progressPercentage: 60,
            lastUpdated: '2023-06-15T09:15:00Z',
          },
          {
            _id: '3',
            surveyor: {
              _id: 's3',
              username: 'surveyor3',
              name: 'Robert Johnson',
            },
            slum: {
              _id: 'sl3',
              name: 'PQR Basti',
              location: 'Bangalore',
            },
            completedHouseholds: 20,
            totalHouseholds: 80,
            progressPercentage: 25,
            lastUpdated: '2023-06-15T11:45:00Z',
          },
        ];
        
        setProgressData(mockData);
      } catch (error) {
        console.error('Error fetching progress data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, []);

  if (loading) {
    return (
      <SupervisorAdminLayout role="SUPERVISOR">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-2xl font-semibold">Loading progress data...</div>
        </div>
      </SupervisorAdminLayout>
    );
  }

  return (
    <SupervisorAdminLayout role="SUPERVISOR">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Progress Tracking</h1>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Refresh Data
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {progressData.reduce((sum, item) => sum + item.completedHouseholds, 0)}
            </div>
            <div className="text-text-muted">Total Completed</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {Math.round(progressData.reduce((sum, item) => sum + item.progressPercentage, 0) / progressData.length) || 0}%
            </div>
            <div className="text-text-muted">Avg. Progress</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {progressData.length}
            </div>
            <div className="text-text-muted">Active Assignments</div>
          </Card>
        </div>

        <Card>
          <h2 className="text-lg font-bold text-primary mb-4">Detailed Progress</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4">Surveyor</th>
                  <th className="text-left py-3 px-4">Slum</th>
                  <th className="text-left py-3 px-4">Progress</th>
                  <th className="text-left py-3 px-4">Households</th>
                  <th className="text-left py-3 px-4">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {progressData.map((item) => (
                  <tr key={item._id} className="border-b border-slate-800 last:border-b-0">
                    <td className="py-3 px-4">{item.surveyor.name}</td>
                    <td className="py-3 px-4">{item.slum.name}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-24 bg-slate-700 rounded-full h-2.5 mr-2">
                          <div 
                            className="bg-gradient-primary h-2.5 rounded-full" 
                            style={{ width: `${item.progressPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{item.progressPercentage}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {item.completedHouseholds}/{item.totalHouseholds}
                    </td>
                    <td className="py-3 px-4">
                      {new Date(item.lastUpdated).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </SupervisorAdminLayout>
  );
}