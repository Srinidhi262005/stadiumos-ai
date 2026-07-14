import { create } from 'zustand';
import { Volunteer, VolunteerShift, ShiftStatus } from '../types/volunteer';

interface VolunteerStoreState {
  volunteers: Volunteer[];
  shifts: VolunteerShift[];
  selectedRoleFilter: string | 'all';
  selectedStatusFilter: ShiftStatus | 'all';
  setVolunteers: (volunteers: Volunteer[]) => void;
  setShifts: (shifts: VolunteerShift[]) => void;
  updateShiftStatus: (id: string, status: ShiftStatus) => void;
  setSelectedRoleFilter: (role: string | 'all') => void;
  setSelectedStatusFilter: (status: ShiftStatus | 'all') => void;
}

export const useVolunteerStore = create<VolunteerStoreState>((set) => ({
  volunteers: [],
  shifts: [],
  selectedRoleFilter: 'all',
  selectedStatusFilter: 'all',
  setVolunteers: (volunteers) => set({ volunteers }),
  setShifts: (shifts) => set({ shifts }),
  updateShiftStatus: (id, status) => set((state) => ({
    shifts: state.shifts.map(shift => shift.id === id ? { ...shift, status } : shift)
  })),
  setSelectedRoleFilter: (selectedRoleFilter) => set({ selectedRoleFilter }),
  setSelectedStatusFilter: (selectedStatusFilter) => set({ selectedStatusFilter })
}));
export default useVolunteerStore;
