import { createClient, dedupExchange, cacheExchange, errorExchange } from '@urql/vue';
import { retryExchange } from '@urql/exchange-retry';
import { devtoolsExchange } from '@urql/devtools';
import { multipartFetchExchange } from '@urql/exchange-multipart-fetch';

// API
import { setToken } from './user';

const optionsRetryExchange = {
  initialDelayMs: 1000,
  maxDelayMs: 15000,
  randomDelay: true,
  maxNumberAttempts: 2,
  retryIf: err => err && err.networkError,
};

const optionsErrorExchange = {
  onError(error) {
    const isNetworkError = error.message.includes('[Network]');
    const responseStatus = error.response.status;

    if (isNetworkError && responseStatus === 401) {
      localStorage.removeItem('token');
      setToken();
    }
  },
}

export function createClientURQL(url) {
  return createClient({
    url,
    exchanges: [
      dedupExchange,
      cacheExchange,
      devtoolsExchange,
      retryExchange(optionsRetryExchange),
      errorExchange(optionsErrorExchange),
      multipartFetchExchange,
    ],
    fetchOptions: () => {
      const token = localStorage.getItem('token');

      return {
        headers: {
          authorization: token ? token : '',
        }
      }
    },
  });
}
