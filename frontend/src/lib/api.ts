import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ??
        error.response?.data?.error ??
        error.message;
      return Promise.reject(new Error(typeof message === 'string' ? message : JSON.stringify(message)));
    }
    return Promise.reject(error);
  },
);

// Auth
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  googleUrl: `${API_URL}/auth/google`,
};

// Data Rooms
export const dataRoomsApi = {
  list: () => api.get('/data-rooms'),
  create: (name: string) => api.post('/data-rooms', { name }),
  update: (id: string, name: string) => api.patch(`/data-rooms/${id}`, { name }),
  delete: (id: string) => api.delete(`/data-rooms/${id}`),
};

// Folders
export const foldersApi = {
  getContents: (dataRoomId: string, folderId?: string | null) =>
    api.get('/folders', { params: { dataRoomId, ...(folderId ? { folderId } : {}) } }),
  getStats: (folderId: string) => api.get(`/folders/${folderId}/stats`),
  create: (data: { name: string; dataRoomId: string; parentId?: string | null }) =>
    api.post('/folders', data),
  update: (id: string, name: string) => api.patch(`/folders/${id}`, { name }),
  delete: (id: string) => api.delete(`/folders/${id}`),
};

// Files
export const filesApi = {
  presign: (data: { fileName: string; contentType: string; dataRoomId: string; folderId?: string | null }) =>
    api.post<{ uploadUrl: string; storageKey: string }>('/files/presign', data),
  register: (data: { name: string; storageKey: string; sizeBytes: number; mimeType: string; dataRoomId: string; folderId?: string | null }) =>
    api.post('/files', data),
  getDownloadUrl: (id: string) => api.get<{ url: string }>(`/files/${id}/download-url`),
  rename: (id: string, name: string) => api.patch(`/files/${id}/rename`, { name }),
  move: (id: string, folderId: string | null) => api.patch(`/files/${id}/move`, { folderId }),
  delete: (id: string) => api.delete(`/files/${id}`),
  search: (dataRoomId: string, q: string) => api.get('/files/search', { params: { dataRoomId, q } }),
};

// Sharing
export const sharingApi = {
  createPermission: (data: object) => api.post('/sharing/permissions', data),
  listPermissions: (resourceType: string, resourceId: string) =>
    api.get('/sharing/permissions', { params: { resourceType, resourceId } }),
  deletePermission: (id: string) => api.delete(`/sharing/permissions/${id}`),
  createLink: (data: object) => api.post('/sharing/links', data),
  listLinks: (resourceType: string, resourceId: string) =>
    api.get('/sharing/links', { params: { resourceType, resourceId } }),
  revokeLink: (id: string) => api.delete(`/sharing/links/${id}`),
  getPublic: (token: string, folderId?: string) =>
    axios.get(`${API_URL}/share/${token}`, { params: folderId ? { folderId } : {} }),
};
