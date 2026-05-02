import API from './axios';

export const getAllUsers = (params) => API.get('/users', { params });
export const getUserById = (id) => API.get(`/users/${id}`);
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const deleteUser = (id) => API.delete(`/users/${id}`);
export const getUserStats = () => API.get('/users/stats');
