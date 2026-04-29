import { create } from 'zustand'

const COLOR_DICTIONARY = {
  'charcoal': '#333333',
  'white': '#FFFFFF',
  'wood finish': '#8B5A2B',
  'anthracite': '#2F4F4F',
  'grey': '#808080'
};

const useStore = create((set, get) => ({
  // Core Selection State
  currentModel: 'Pergola',
  currentSize: '3x3',
  frameColor: '#333333',
  frameColorName: 'Charcoal',
  activeHandle: '',
  
  // Dynamic Catalog Data
  availableSizes: ['3x3', '4x3', '6x3'],
  availableColors: [
    { name: 'Charcoal', hex: '#333333' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Wood Finish', hex: '#8B5A2B' }
  ],
  variantPrices: {},
  sizesConfig: {},
  addonProducts: [],

  // UI State
  activeSide: 'A',
  activeTab: 'Size',
  isLoading: false,
  error: null,
  
  // Screen Toggles
  screenA_Left: false,
  screenA_Right: false,
  screenB: false,
  screenC_Left: false,
  screenC_Right: false,
  screenD: false,
  
  isBreakdownVisible: false,
  showDimensions: false,

  // Actions
  setModel: (model) => set({ currentModel: model }),
  setFrameColor: (hex, name) => set({ frameColor: hex, frameColorName: name || 'Custom' }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveSide: (side) => set({ activeSide: side }),
  toggleBreakdown: () => set((state) => ({ isBreakdownVisible: !state.isBreakdownVisible })),
  toggleDimensions: () => set((state) => ({ showDimensions: !state.showDimensions })),

  setSize: (newSize) => set((state) => {
    if (state.currentSize === newSize) return {};
    return {
      currentSize: newSize,
      activeSide: 'A',
      activeTab: 'Size',
      screenA_Left: false,
      screenA_Right: false,
      screenB: false,
      screenC_Left: false,
      screenC_Right: false,
      screenD: false,
    }
  }),

  // Toggle Handlers
  toggleScreenA_Left: () => set((state) => ({ screenA_Left: !state.screenA_Left })),
  toggleScreenA_Right: () => set((state) => ({ screenA_Right: !state.screenA_Right })),
  toggleScreenB: () => set((state) => ({ screenB: !state.screenB })),
  toggleScreenC_Left: () => set((state) => ({ screenC_Left: !state.screenC_Left })),
  toggleScreenC_Right: () => set((state) => ({ screenC_Right: !state.screenC_Right })),
  toggleScreenD: () => set((state) => ({ screenD: !state.screenD })),
  
  setFrameColor: (hex, name) => set({ 
    frameColor: hex, 
    frameColorName: name 
  }),

  /**
   * Processes incoming data from Shopify and normalizes strings for GLB compatibility.
   */
  initializeFromPayload: (data) => {
    if (!data || !data.product) return;

    const { product, variantMetafields, addonProducts, sizesConfig } = data;
    
    try {
      let sizeIdx = -1;
      let colorIdx = -1;
      
      // Identify index of Size and Color options dynamically
      product.options.forEach((opt, i) => {
        const optName = (typeof opt === 'string' ? opt : (opt.name || '')).toLowerCase();
        if (optName.includes('size')) sizeIdx = i;
        if (optName.includes('color') || optName.includes('finish')) colorIdx = i;
      });

      // Default to first option if not found
      if (sizeIdx === -1) sizeIdx = 0;
      if (colorIdx === -1 && product.options.length > 1) colorIdx = 1;

      const newVariantPrices = {};
      const uniqueSizes = new Set();
      const uniqueColorsMap = new Map();

      product.variants.forEach(variant => {
        const rawSize = variant.options[sizeIdx] || 'Default';
        
        // AGGRESSIVE NORMALIZATION: remove 'm', spaces, and lowercase
        const sizeVal = rawSize.toLowerCase().replace(/m$/i, '').replace(/\s+/g, '').trim();
        const colorVal = variant.options[colorIdx] || 'Default';

        const key = `${sizeVal}_${colorVal}`;
        newVariantPrices[key] = variant.price > 1000 ? variant.price / 100 : variant.price;

        uniqueSizes.add(sizeVal);
        if (colorIdx !== -1 && !uniqueColorsMap.has(colorVal)) {
          uniqueColorsMap.set(colorVal, {
            name: colorVal,
            hex: COLOR_DICTIONARY[colorVal.toLowerCase()] || '#808080'
          });
        }
      });

      const availableSizes = Array.from(uniqueSizes);
      const availableColors = Array.from(uniqueColorsMap.values());
      
      const firstSize = availableSizes[0] || '3x3';
      const firstColor = availableColors[0] || { name: 'Charcoal', hex: '#333333' };

      // Deep Normalization for sizesConfig keys
      const normalizedSizesConfig = {};
      if (sizesConfig) {
        Object.keys(sizesConfig).forEach(key => {
          const rawData = sizesConfig[key];
          // Aggressive normalization: remove 'm', remove spaces, lowercase
          const cleanKey = key.toLowerCase().replace(/m$/i, '').replace(/\s+/g, '').trim();
          normalizedSizesConfig[cleanKey] = rawData;
          
          // Also keep original key as fallback
          normalizedSizesConfig[key] = rawData;
        });
      }

      set({
        variantPrices: newVariantPrices,
        sizesConfig: normalizedSizesConfig,
        addonProducts: addonProducts || [],
        availableSizes,
        availableColors,
        currentModel: product.title,
        activeHandle: product.handle,
        currentSize: firstSize,
        frameColor: firstColor.hex,
        frameColorName: firstColor.name,
        isLoading: false
      });

    } catch (err) {
      console.error("Store initialization failed:", err);
    }
  },

  /**
   * Helper to calculate the live total price based on e-commerce logic
   */
  getTotalPrice: () => {
    const state = get();
    const key = `${state.currentSize.replace(/\s/g, '')}_${state.frameColorName}`;
    const base = state.variantPrices[key] || Object.values(state.variantPrices)[0] || 0;

    let total = base;
    const slidesData = state.sizesConfig[state.currentSize] || {}; 
    
    // Safely get price for specific blind products from Shopify config
    const getPrice = (side, index) => {
       const p = slidesData[`slide${side}`]?.[index]?.price || 0;
       return p > 1000 ? p / 100 : p;
    };

    if (state.screenA_Left) total += getPrice('A', 0);
    if (state.screenA_Right) total += getPrice('A', 1);
    if (state.screenB) total += getPrice('B', 0);
    if (state.screenC_Left) total += getPrice('C', 0);
    if (state.screenC_Right) total += getPrice('C', 1);
    if (state.screenD) total += getPrice('D', 0);
    
    return total;
  },

  getBasePrice: () => {
    const state = get();
    const key = `${state.currentSize.replace(/\s/g, '')}_${state.frameColorName}`;
    return state.variantPrices[key] || 0;
  },
  
  getScreenPrice: () => 300 // Fallback estimate for UI display before selection
}));

export default useStore;
