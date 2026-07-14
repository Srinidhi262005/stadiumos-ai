import { create } from 'zustand';

interface UiStoreState {
  sidebarCollapsed: boolean;
  searchOpen: boolean;
  detailsDrawerOpen: boolean;
  selectedDetailId: string | null;
  isMobileMenuOpen: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setDetailsDrawerOpen: (open: boolean, id?: string | null) => void;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useUiStore = create<UiStoreState>((set) => ({
  sidebarCollapsed: false,
  searchOpen: false,
  detailsDrawerOpen: false,
  selectedDetailId: null,
  isMobileMenuOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setSearchOpen: (open) => set({ searchOpen: open }),
  setDetailsDrawerOpen: (open, id = null) => set({ detailsDrawerOpen: open, selectedDetailId: id }),
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open })
}));
export default useUiStore;
