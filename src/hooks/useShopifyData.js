import { useState, useEffect } from 'react'
import useStore from '../store'

/**
 * useShopifyData Hook
 * 
 * Listens for SHOPIFY_PRODUCT_DATA messages from the parent window (Shopify Liquid)
 * and initializes the Zustand store with dynamic product configuration.
 */
export const useShopifyData = () => {
  const initializeFromPayload = useStore(state => state.initializeFromPayload)
  const availableSizes = useStore(state => state.availableSizes || [])
  
  const [payloadReceived, setPayloadReceived] = useState(false)

  useEffect(() => {
    const handleMessage = (event) => {
      // Process only messages of type SHOPIFY_PRODUCT_DATA
      if (event.data?.type === 'SHOPIFY_PRODUCT_DATA') {
        // Initialize store data if function is available
        if (typeof initializeFromPayload === 'function') {
           initializeFromPayload(event.data)
        }
        
        setPayloadReceived(true)
      }
    }

    window.addEventListener('message', handleMessage)

    // Notify Shopify parent that the React app is ready to receive data
    if (window.parent !== window) {
      console.log("Configurator Hook: Sending READY signal to Shopify...");
      window.parent.postMessage({ type: 'CONFIGURATOR_READY' }, '*');
    }

    return () => window.removeEventListener('message', handleMessage)
  }, [initializeFromPayload])

  // Component is considered loaded if payload is received or store already has data
  const isLoaded = payloadReceived || availableSizes.length > 0

  return { isLoaded }
}
