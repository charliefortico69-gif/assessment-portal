const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // Production: use relative path
  : 'http://localhost:5000';  // Development: use localhost

export default API_BASE_URL;