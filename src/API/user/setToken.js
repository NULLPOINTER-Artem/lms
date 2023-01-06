import axios from '../axios.config.js';

export default async function setToken() {
  const API_URL = `${import.meta.env.VITE_API_URL}/token`;
  const userFormData = new FormData();

  userFormData.append('grant_type', `${import.meta.env.VITE_CRED_GRANT_TYPE}`);
  userFormData.append('username', `${import.meta.env.VITE_CRED_USERNAME}`);
  userFormData.append('password', `${import.meta.env.VITE_CRED_PASSWORD}`);

  const response = await axios({
    method: 'POST',
    url: API_URL,
    data: userFormData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
  });
  const capitalizedTokenType = response.data.token_type.split(' ')
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase())
    .join(' ');

  localStorage.setItem('token', capitalizedTokenType + " " + response.data.access_token);
}
