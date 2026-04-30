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
  variantIds: {}, // Added to store mapping for Add to Cart
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
  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveSide: (side) => set({ activeSide: side }),
  toggleBreakdown: () => set((state) => ({ isBreakdownVisible: !state.isBreakdownVisible })),
  toggleDimensions: () => set((state) => ({ showDimensions: !state.showDimensions })),

  // Helper for consistent price normalization across the app
  normalizePrice: (price) => {
    if (!price) return 0;
    const p = parseFloat(price);
    return p > 1000 ? p / 100 : p;
  },

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
    frameColorName: name || 'Custom'
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
      const newVariantIds = {};
      const uniqueSizes = new Set();
      const uniqueColorsMap = new Map();

      product.variants.forEach(variant => {
        const rawSize = variant.options[sizeIdx] || 'Default';
        
        // AGGRESSIVE NORMALIZATION: remove 'm', spaces, and lowercase
        const sizeVal = rawSize.toLowerCase().replace(/m$/i, '').replace(/\s+/g, '').trim();
        const colorVal = variant.options[colorIdx] || 'Default';

        const key = `${sizeVal}_${colorVal}`;
        newVariantPrices[key] = get().normalizePrice(variant.price);
        newVariantIds[key] = variant.id;

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

      console.log("🛠️ NORMALIZED CONFIG:", {
        availableSizes,
        availableColors,
        variantIds: newVariantIds,
        normalizedSizesConfig
      });

      set({
        variantPrices: newVariantPrices,
        variantIds: newVariantIds,
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
       return state.normalizePrice(p);
    };

    if (state.screenA_Left) total += getPrice('A', 0);
    if (state.screenA_Right) total += getPrice('A', 1);
    if (state.screenB) total += getPrice('B', 0);
    if (state.screenC_Left) total += getPrice('C', 0);
    if (state.screenC_Right) total += getPrice('C', 1);
    if (state.screenD) total += getPrice('D', 0);
    
    return total;
  },

  /**
   * Add to Cart logic: Collects selected variant IDs and properties 
   * then sends a postMessage to the Shopify parent window.
   */
  addToCart: () => {
    const state = get();
    const key = `${state.currentSize.replace(/\s/g, '')}_${state.frameColorName}`;
    const baseVariantId = state.variantIds[key] || Object.values(state.variantIds)[0];

    if (!baseVariantId) {
      console.error("❌ Add to Cart: No base variant ID found for selection", key);
      return;
    }

    // Collect properties for the base product
    const properties = {
      'Size': state.currentSize,
      'Color': state.frameColorName,
      '_configurator_data': JSON.stringify({
         size: state.currentSize,
         color: state.frameColorName,
         screens: {
           A_Left: state.screenA_Left,
           A_Right: state.screenA_Right,
           B: state.screenB,
           C_Left: state.screenC_Left,
           C_Right: state.screenC_Right,
           D: state.screenD
         }
      })
    };

    // Collect variant IDs for selected screens/addons
    const items = [{ id: baseVariantId, quantity: 1, properties }];
    
    const addScreen = (side, index) => {
       const screen = state.sizesConfig[state.currentSize]?.[`slide${side}`]?.[index];
       if (screen) {
         // Smart ID detection: 
         // 1. If it's a product reference, use .variants[0].id
         // 2. If it's a variant reference or has direct id, use .id
         let variantId = null;
         if (screen.variants && screen.variants.length > 0) {
            variantId = screen.variants[0].id;
         } else if (screen.id) {
            variantId = screen.id;
         }

         if (variantId) {
           items.push({ id: variantId, quantity: 1, properties: { 'Parent Product': state.currentModel } });
         } else {
           console.warn(`⚠️ No variant ID found for screen on Side ${side}, index ${index}`);
         }
       }
    };

    if (state.screenA_Left) addScreen('A', 0);
    if (state.screenA_Right) addScreen('A', 1);
    if (state.screenB) addScreen('B', 0);
    if (state.screenC_Left) addScreen('C', 0);
    if (state.screenC_Right) addScreen('C', 1);
    if (state.screenD) addScreen('D', 0);

    console.log("🛒 FINAL CART PAYLOAD:", items);
    
    if (items.length === 1 && (state.screenA_Left || state.screenA_Right || state.screenB || state.screenC_Left || state.screenC_Right || state.screenD)) {
       console.warn("⚠️ WARNING: Screens are selected but none were added to cart because they lack 'id' (Variant ID). Check your metafields.");
    }
    
    // Notify parent window
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'ADD_TO_CART',
        items: items
      }, '*');
    }
  },

  getBasePrice: () => {
    const state = get();
    const key = `${state.currentSize.replace(/\s/g, '')}_${state.frameColorName}`;
    return state.variantPrices[key] || 0;
  },
  
  getScreenPrice: () => 300 // Fallback estimate for UI display before selection
}));

export default useStore;
