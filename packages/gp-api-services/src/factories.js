import ApiServiceFactory from '@gostgroup/gp-api/lib/ApiServiceFactory';
import { getApiUrl } from './config';

export const REST_API_FACTORY = new ApiServiceFactory({
  apiUrl: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
});

export const DADATA_API_FACTORY = new ApiServiceFactory({
  apiUrl: 'https://dadata.ru/api/v2/', // suggest/address
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: 'Token 6b2631ecf83e420e2d9ac9d27a4a456d943cef3a',
  },
});
