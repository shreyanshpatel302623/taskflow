import API from './axios';

export const getTasks = (params) => API.get('/tasks', { params });
export const getMyTasks = () => API.get('/tasks/my-tasks');
export const getTaskStats = () => API.get('/tasks/stats');
export const getTaskById = (id) => API.get(`/tasks/${id}`);
export const createTask = (data) => API.post('/tasks', data);
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);
