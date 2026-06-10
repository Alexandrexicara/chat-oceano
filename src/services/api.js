import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Criar instancia do axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===== USUÁRIOS =====

export const loginUser = async (userData) => {
  const response = await api.post('/auth/login', userData);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};

export const getUserByUsername = async (username) => {
  const response = await api.get(`/users/${username}`);
  return response.data;
};

// ===== MENSAGENS =====

export const sendMessage = async (messageData) => {
  const response = await api.post('/messages', messageData);
  return response.data;
};

export const getMessages = async (userId1, userId2) => {
  const response = await api.get(`/messages/${userId1}/${userId2}`);
  return response.data;
};

export const getOceanoMessages = async () => {
  const response = await api.get('/messages/oceano');
  return response.data;
};

// ===== CONTATOS =====

export const addContact = async (userId, contactId) => {
  const response = await api.post('/contacts', { user_id: userId, contact_id: contactId });
  return response.data;
};

export const getContacts = async (userId) => {
  const response = await api.get(`/contacts/${userId}`);
  return response.data;
};

// ===== UPLOAD =====

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// ===== HEALTH CHECK =====

export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
