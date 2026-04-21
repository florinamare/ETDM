import axios from 'axios';
import { Platform } from 'react-native';

// Change this to your computer's local IP when testing on a physical device via Expo Go.
// Example: 'http://192.168.1.42:5001'
// On Android emulator use 'http://10.0.2.2:5001'
const BASE_URL = Platform.select({
  ios: 'http://localhost:5001',
  android: 'http://10.0.2.2:5001',
  default: 'http://localhost:5001',
});

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

export const getBuildings = () => api.get('/buildings');

export const recognizeBuilding = (imageBase64, lat, lng) =>
  api.post('/recognize', { image: imageBase64, lat, lng });

export const askQuestion = (buildingId, question) =>
  api.post('/voice/ask', { buildingId, question });

export default api;
