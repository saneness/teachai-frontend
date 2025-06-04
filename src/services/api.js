import axios from 'axios';
import router from '../router'; 

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('teacherId');
      if (router.currentRoute.value.name !== 'Login') { 
        router.push({ name: 'Login' }).catch(err => {
          if (err.name !== 'NavigationDuplicated') { 
            console.error('Redirect to login failed:', err);
          }
        });
      }
      console.error("Authorization Error (401). You might need to log in again."); // Translated
    }
    return Promise.reject(error);
  }
);


export default apiClient;