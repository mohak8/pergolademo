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

      const optionIndices = {};
      product.options.forEach((opt, i) => {
        const name = (typeof opt === 'string' ? opt : (opt.name || '')).toLowerCase().trim();
        optionIndices[name] = i;
      });

      console.log("🔍 DETECTED OPTIONS:", optionIndices);

      const newVariantPrices = {};
      const newVariantIds = {};
      const uniqueSizes = new Set();
      const uniqueColorsMap = new Map();

      product.variants.forEach(variant => {
        const sizeRaw = variant.options[optionIndices['size']] || variant.options[0] || 'Default';
        const sizeVal = sizeRaw.toLowerCase().replace(/m$/i, '').replace(/\s+/g, '').trim();
        
        // Dynamic key based on what options exist
        let keyParts = [sizeVal];
        
        ['a', 'b', 'c', 'd'].forEach(letter => {
          const idx = optionIndices[letter] ?? optionIndices[`side ${letter}`];
          if (idx !== undefined) {
             const val = variant.options[idx];
             keyParts.push(`${letter}:${val}`);
          }
        });

        const key = keyParts.join('_');
        
        newVariantPrices[key] = get().normalizePrice(variant.price);
        newVariantIds[key] = variant.id;
        uniqueSizes.add(sizeVal);
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
    
    // Construct the variant key based on current selections
    const sizeKey = state.currentSize.toLowerCase().replace(/m$/i, '').replace(/\s+/g, '').trim();
    const a = state.screenA_Left || state.screenA_Right ? 'Yes' : 'No';
    const b = state.screenB ? 'Yes' : 'No';
    const c = state.screenC_Left || state.screenC_Right ? 'Yes' : 'No';
    const d = state.screenD ? 'Yes' : 'No';

    const key = `${sizeKey}_A:${a}_B:${b}_C:${c}_D:${d}`;
    const baseVariantId = state.variantIds[key] || Object.values(state.variantIds)[0];

    console.log("🎯 TARGET VARIANT KEY:", key);
    console.log("🆔 FOUND VARIANT ID:", baseVariantId);

    if (!baseVariantId) {
      console.error("❌ Add to Cart: No base variant ID found for selection", key);
      return;
    }

    // Create a unique ID for this bundle session
    const bundleId = `bundle_${Date.now()}`;

    // Create a list of selected accessories for the summary
    const includedList = [];
    if (state.screenA_Left) includedList.push("Side A (Left)");
    if (state.screenA_Right) includedList.push("Side A (Right)");
    if (state.screenB) includedList.push("Side B");
    if (state.screenC_Left) includedList.push("Side C (Left)");
    if (state.screenC_Right) includedList.push("Side C (Right)");
    if (state.screenD) includedList.push("Side D");

    // Collect properties for the base product - Single Variant Bundle
    const properties = {
      'Package': includedList.length > 0 ? `Customized Bundle (${includedList.length + 1} items)` : 'Standard Pergola',
      'Included': includedList.length > 0 ? includedList.join(', ') : 'Base Frame only',
      '_configurator_data': JSON.stringify({
        size: state.currentSize,
        screens: {
          A: state.screenA_Left || state.screenA_Right,
          B: state.screenB,
          C: state.screenC_Left || state.screenC_Right,
          D: state.screenD
        }
      })
    };

    // ONLY add the main Pergola variant (Screens are now part of this variant)
    const items = [{ id: baseVariantId, quantity: 1, properties }];

    console.log("🛒 FINAL CART PAYLOAD (Single Variant):", items);

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
