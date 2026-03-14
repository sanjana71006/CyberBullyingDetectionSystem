import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 60000,  // voice uploads can take a while
});

// Auto-attach the JWT token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function analyzeText(text) {
  const { data } = await api.post('/analyze', { text });
  return data;
}

export async function analyzeVoice(audioBlob, fileName) {
  const formData = new FormData();
  formData.append('audio', audioBlob, fileName || 'recording.webm');
  const { data } = await api.post('/analyzeVoice', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/** Called when browser Web Speech API already produced a transcript */
export async function analyzeVoiceText(transcription) {
  const { data } = await api.post('/analyzeVoiceText', { transcription });
  return data;
}

export async function saveAnalysis(payload) {
  const { data } = await api.post('/save', payload);
  return data;
}

export async function fetchAnalytics() {
  const { data } = await api.get('/analytics');
  return data;
}
