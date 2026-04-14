import { create } from 'zustand'

const useStore = create((set) => ({
  activeSide: 'A', // 'A', 'B', 'C', 'D'
  currentSize: '3x3', // '3x3', '4x3', '6x3'
  screenA_Left: false,
  screenA_Right: false,
  screenB: false,
  screenC_Left: false,
  screenC_Right: false,
  screenD: false,
  setActiveSide: (side) => set({ activeSide: side }),
  setSize: (newSize) => set((state) => {
    // If clicking the current size, do absolutely nothing (ignore)
    if (state.currentSize === newSize) return {}
    // If changing sizes, update size and firmly reset all screens
    return {
      currentSize: newSize,
      screenA_Left: false,
      screenA_Right: false,
      screenB: false,
      screenC_Left: false,
      screenC_Right: false,
      screenD: false,
    }
  }),
  toggleScreenA_Left: () => set((state) => ({ screenA_Left: !state.screenA_Left })),
  toggleScreenA_Right: () => set((state) => ({ screenA_Right: !state.screenA_Right })),
  toggleScreenB: () => set((state) => ({ screenB: !state.screenB })),
  toggleScreenC_Left: () => set((state) => ({ screenC_Left: !state.screenC_Left })),
  toggleScreenC_Right: () => set((state) => ({ screenC_Right: !state.screenC_Right })),
  toggleScreenD: () => set((state) => ({ screenD: !state.screenD })),
}))

export default useStore
