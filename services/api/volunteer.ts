import apiClient from './client';
import { Volunteer, VolunteerShift, VolunteerStaffing } from '../../types/volunteer';
import { ApiResponse } from '../../types/api';

export const VolunteerService = {
  getStaffingStatus: async (): Promise<ApiResponse<VolunteerStaffing>> => {
    const response = await apiClient.get<ApiResponse<VolunteerStaffing>>('/volunteers/staffing');
    return response.data;
  },
  getVolunteers: async (): Promise<ApiResponse<Volunteer[]>> => {
    const response = await apiClient.get<ApiResponse<Volunteer[]>>('/volunteers');
    return response.data;
  },
  updateShiftStatus: async (shiftId: string, status: VolunteerShift['status']): Promise<ApiResponse<VolunteerShift>> => {
    const response = await apiClient.patch<ApiResponse<VolunteerShift>>(`/volunteers/shifts/${shiftId}/status`, { status });
    return response.data;
  }
};

export default VolunteerService;
