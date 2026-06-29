const API_BASE = 'http://localhost:5000/api';

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('notesense_token', token);
  } else {
    localStorage.removeItem('notesense_token');
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('notesense_token');
};

const fetchWithAuth = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Only set Content-Type to JSON if it's not FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const auth = {
  login: (email, password) => fetchWithAuth('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  signup: (name, email, password) => fetchWithAuth('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  })
};

export const notes = {
  getAll: () => fetchWithAuth('/notes'),
  getById: (id) => fetchWithAuth(`/notes/${id}`),
  uploadText: (title, text) => fetchWithAuth('/notes', {
    method: 'POST',
    body: JSON.stringify({ title, text, sourceType: 'typed' })
  }),
  uploadFile: (title, file) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);
    return fetchWithAuth('/notes', {
      method: 'POST',
      body: formData
    });
  }
};

export const doubts = {
  ask: (question, topic) => fetchWithAuth('/doubts', {
    method: 'POST',
    body: JSON.stringify({ question, topic })
  }),
  getHistory: () => fetchWithAuth('/doubts')
};

export const flashcards = {
  getDue: () => fetchWithAuth('/flashcards/due'),
  review: (id, quality) => fetchWithAuth(`/flashcards/${id}/review`, {
    method: 'POST',
    body: JSON.stringify({ quality })
  })
};
