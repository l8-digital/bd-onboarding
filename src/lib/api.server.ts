import axios from 'axios';
import { authApi } from '@/lib/urlApi';

const apiServer = axios.create({
    baseURL: authApi,
});

export default apiServer;
