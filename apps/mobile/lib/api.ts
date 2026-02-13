import axios from 'axios';

export const API_URL = 'http://127.0.0.1:8000';

export const api = axios.create({ baseURL: API_URL });

export type MenuItem = {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_active: boolean;
};
