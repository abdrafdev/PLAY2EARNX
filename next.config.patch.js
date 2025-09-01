// Server-side patch for ethers.js api.etherjs.pro errors
// This patches the Node.js environment

// Patch the axios module if it exists
try {
  const Module = require('module');
  const originalRequire = Module.prototype.require;

  Module.prototype.require = function(id) {
    const module = originalRequire.apply(this, arguments);
    
    if (id === 'axios' && module && module.create) {
      // Intercept axios instances
      const originalCreate = module.create;
      module.create = function(config) {
        const instance = originalCreate.call(this, config);
        
        // Patch the instance's request method
        const originalRequest = instance.request;
        instance.request = function(requestConfig) {
          if (requestConfig && requestConfig.url && requestConfig.url.includes('api.etherjs.pro')) {
            console.warn('Blocked server-side request to api.etherjs.pro');
            return Promise.reject(new Error('Blocked deprecated API call'));
          }
          return originalRequest.call(this, requestConfig);
        };
        
        return instance;
      };
      
      // Also patch the default axios instance
      const originalRequest = module.request;
      if (originalRequest) {
        module.request = function(config) {
          if (config && config.url && config.url.includes('api.etherjs.pro')) {
            console.warn('Blocked server-side request to api.etherjs.pro');
            return Promise.reject(new Error('Blocked deprecated API call'));
          }
          return originalRequest.call(this, config);
        };
      }
      
      const originalGet = module.get;
      if (originalGet) {
        module.get = function(url, config) {
          if (url && url.includes('api.etherjs.pro')) {
            console.warn('Blocked server-side GET request to api.etherjs.pro');
            return Promise.reject(new Error('Blocked deprecated API call'));
          }
          return originalGet.call(this, url, config);
        };
      }
    }
    
    return module;
  };
} catch (e) {
  console.log('Could not patch axios:', e.message);
}

// Patch global fetch if available (Node 18+)
if (global.fetch) {
  const originalFetch = global.fetch;
  global.fetch = function(...args) {
    const url = args[0];
    if (typeof url === 'string' && url.includes('api.etherjs.pro')) {
      console.warn('Blocked server-side fetch to api.etherjs.pro');
      return Promise.reject(new Error('Blocked deprecated API call'));
    }
    return originalFetch.apply(this, args);
  };
}

// Patch http/https modules
const http = require('http');
const https = require('https');

const originalHttpRequest = http.request;
const originalHttpsRequest = https.request;

http.request = function(options, callback) {
  if (options && ((typeof options === 'string' && options.includes('api.etherjs.pro')) ||
      (options.hostname && options.hostname.includes('api.etherjs.pro')) ||
      (options.host && options.host.includes('api.etherjs.pro')))) {
    console.warn('Blocked http request to api.etherjs.pro');
    const error = new Error('Blocked deprecated API call');
    if (callback) {
      process.nextTick(() => callback(error));
    }
    return {
      on: () => {},
      write: () => {},
      end: () => {},
      abort: () => {}
    };
  }
  return originalHttpRequest.call(this, options, callback);
};

https.request = function(options, callback) {
  if (options && ((typeof options === 'string' && options.includes('api.etherjs.pro')) ||
      (options.hostname && options.hostname.includes('api.etherjs.pro')) ||
      (options.host && options.host.includes('api.etherjs.pro')))) {
    console.warn('Blocked https request to api.etherjs.pro');
    const error = new Error('Blocked deprecated API call');
    if (callback) {
      process.nextTick(() => callback(error));
    }
    return {
      on: () => {},
      write: () => {},
      end: () => {},
      abort: () => {}
    };
  }
  return originalHttpsRequest.call(this, options, callback);
};

module.exports = {};
