import { create } from 'zustand'

const useStore = create((set) => ({
  activeSide: 'A', // 'A', 'B', 'C', 'D'
  size: '3x3', // '3x3', '4x3'
  screenA: false,
  screenB: false,
  screenC: false,
  screenD: false,
  setActiveSide: (side) => set({ activeSide: side }),
  setSize: (newSize) => set((state) => {
    // If clicking the current size, do absolutely nothing (ignore)
    if (state.size === newSize) return {}
    // If changing sizes, update size and firmly reset all screens
    return {
      size: newSize,
      screenA: false,
      screenB: false,
      screenC: false,
      screenD: false,
    }
  }),
  toggleScreenA: () => set((state) => ({ screenA: !state.screenA })),
  toggleScreenB: () => set((state) => ({ screenB: !state.screenB })),
  toggleScreenC: () => set((state) => ({ screenC: !state.screenC })),
  toggleScreenD: () => set((state) => ({ screenD: !state.screenD })),
}))

export default useStore
