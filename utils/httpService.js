const axios = require("axios");

const instance = axios.create({
  baseURL: process.env.BASE_URL,
  timeout: 5000,
  headers: { Accept: "application/json" }
});

// Add a request interceptor
instance.interceptors.request.use(
  function(config) {
    config.params = {
      api_key: process.env.API_KEY
    };
    return config;
  },
  function(error) {
    return Promise.reject(error);
  }
);

module.exports = instance.get;
