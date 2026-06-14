import api from './api';

export const socialAccountService = {
  list: async () => {
    const response = await api.get('/social-accounts');
    return response.data;
  },
};