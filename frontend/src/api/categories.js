import client from './client';

export const listCategories = () => client.get('/categories');
export const createCategory = (data) => client.post('/categories', data);
export const listDistricts = () => client.get('/districts');
export const createDistrict = (data) => client.post('/districts', data);
export const listComments = (articleId) => client.get(`/comments/${articleId}`);
export const createComment = (data) => client.post('/comments', data);
