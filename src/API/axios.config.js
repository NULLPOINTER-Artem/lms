import axios from 'axios';

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  config.headers['authorization'] = token ? token : '';

  return config;
});

export default axiosInstance;
