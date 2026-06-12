// src/api/config.ts

//2025.10.27
//어... 대충 API함수들을 추가하는 곳. 뭐 그렇다. 일단 
import axios from 'axios';

export const API_BASE_URL = 'http://YOUR_SERVER_IP:8000'; //고정아이피!

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 테스트 API 호출
export const testConnection = async () => {
  try {
    const response = await api.get('/api/accounts/test/');
    return response.data;
  } catch (error) {
    console.error('API Connection Error:', error);
    throw error;
  }
};