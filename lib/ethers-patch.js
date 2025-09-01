// Patch for ethers.js to prevent api.etherjs.pro errors
// This file overrides the default provider behavior that causes 404 errors

if (typeof window !== 'undefined' && window.fetch) {
  const originalFetch = window.fetch;
  
  window.fetch = function(...args) {
    const url = args[0];
    
    // Block requests to the deprecated api.etherjs.pro
    if (typeof url === 'string' && url.includes('api.etherjs.pro')) {
      console.warn('Blocked request to deprecated api.etherjs.pro:', url);
      return Promise.reject(new Error('Blocked deprecated API call'));
    }
    
    return originalFetch.apply(this, args);
  };
}

// For Node.js environment (server-side)
if (typeof global !== 'undefined' && global.fetch) {
  const originalFetch = global.fetch;
  
  global.fetch = function(...args) {
    const url = args[0];
    
    // Block requests to the deprecated api.etherjs.pro
    if (typeof url === 'string' && url.includes('api.etherjs.pro')) {
      console.warn('Blocked request to deprecated api.etherjs.pro:', url);
      return Promise.reject(new Error('Blocked deprecated API call'));
    }
    
    return originalFetch.apply(this, args);
  };
}

// Also patch axios if it's being used
if (typeof require !== 'undefined') {
  try {
    const axios = require('axios');
    const originalRequest = axios.request;
    
    axios.request = function(config) {
      if (config && config.url && config.url.includes('api.etherjs.pro')) {
        console.warn('Blocked axios request to deprecated api.etherjs.pro:', config.url);
        return Promise.reject(new Error('Blocked deprecated API call'));
      }
      return originalRequest.call(this, config);
    };
    
    // Patch axios.get specifically
    const originalGet = axios.get;
    axios.get = function(url, config) {
      if (url && url.includes('api.etherjs.pro')) {
        console.warn('Blocked axios.get request to deprecated api.etherjs.pro:', url);
        return Promise.reject(new Error('Blocked deprecated API call'));
      }
      return originalGet.call(this, url, config);
    };
  } catch (e) {
    // axios might not be available
  }
}

export default {};
