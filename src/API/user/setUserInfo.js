import axios from '../axios.config.js';

export default async function setUserInfo() {
  const API_URL = `${import.meta.env.VITE_API_URL}/users/me/`;

  const response = await axios({
    method: 'GET',
    url: API_URL,
  });

  localStorage.setItem('user_id', response.data.id);
}
