import axios, { AxiosInstance } from 'axios';

// Swagger 상단에 적힌 Base URL을 여기에 넣으세요!
const BASE_URL = 'https://ngoc-wiggliest-brian.ngrok-free.dev/docs'; 

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default client;