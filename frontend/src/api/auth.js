import API from './axios';

export const signup = (data) => API.post('/auth/signup', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/me', data);
export const changePassword = (data) => API.put('/auth/change-password', data);
