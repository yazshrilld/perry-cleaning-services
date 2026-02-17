import { fetcher, logger } from "netwrap";
import axios, { AxiosRequestConfig } from "axios";
import { Helpers } from "../types";
import https from "https";
import { getters } from "../config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const agent = new https.Agent({
  rejectUnauthorized:  getters.getAppSecrets().REJECT_UNAUTHORIZED, // 🚨 Ignore SSL validation temporarily
});

const serializeQueryParams = (params: { [key: string]: any }): string => {
  return Object.keys(params)
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`,
    )
    .join("&");
};
const DEFAULT_TIMEOUT = 60 * 3 * 1000;
const createFetcher = ({
  method,
  url,
  params = {},
  data = {},
  query = {},
  headers = {},
  timeout = DEFAULT_TIMEOUT,
  onError,
}: Helpers.FetcherConfig) => {
  return fetcher({
    queryFn: async () => {
      let fullUrl = url;
      // Replace params in the URL string
      if (Object.keys(params).length > 0) {
        Object.keys(params).forEach((key) => {
          logger(`Key: ${key}, Value: ${params[key]}`);
          logger(`Before replace: ${fullUrl}`);
          // Replace :id with the corresponding value
          fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(params[key]));
          logger(`After replace: ${fullUrl}`);
        });
      }

      // Append query parameters to the URL string
      if (Object.keys(query).length > 0) {
        const queryString = serializeQueryParams(query);
        fullUrl = `${url}?${queryString}`;
      }

      const config: AxiosRequestConfig = {
        method,
        url: fullUrl,
        headers,
        timeout,
        httpsAgent: agent,
      };

      if (method.toLowerCase() !== "get" && method.toLowerCase() !== "delete") {
        config.data = data;
      }
      logger(config);
      try {
        const response = await axios(config);
        return response.data;
      } catch (error) {
        // logger(error);[]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = (error as any).response?.status;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const statusCode = (error as any).code;

        // If status is 500 or higher, call onError and throw the error
        if (status > 500) {
          if (statusCode) {
            if (onError) {
              onError(error); // Call the onError callback if provided
            }
            // eslint-disable-next-line max-len
            throw error; // Throw the error to be caught by the fetcher's onError handler
          }

          if (onError) {
            onError(error); // Call the onError callback if provided
          }
          // eslint-disable-next-line max-len
          throw error; // Throw the error to be caught by the fetcher's onError handler
        }

        return (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (error as any).response?.data || {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            error: (error as any).message + " An error occurred",
          }
        );
      }
    },
    onStartQuery: () => logger(`${method.toUpperCase()} query started`),
    onSuccess: (data) => {
      logger(`${method.toUpperCase()} query successful`, data);
    },
    onError: (error) => {
      logger(`${method.toUpperCase()} query failed - ${error}`);
      if (onError) {
        onError(error); // Call the onError callback if provided
      }
    },
    onFinal: () => logger(`${method.toUpperCase()} query completed`),
  });
};

// const { trigger: submitRegisterData, isLoading } = useFetcher({
//   queryFn: async () => {
//     const url = `${entry.path}${register.path}`;
//     return loudinsightAxios["post"](url, {
//       email,
//       password,
//       role,
//       ipAddress,
//       username,
//       referralCode: token,
//       isAffiliate: isAffiliate === "true" ? true : false,
//     });
//   },
//   onSuccess({ data }) {
//     successHandler(data);
//   },
//   onError(error) {
//     errorHandler(error as defaultError);
//   },
// });

//   // Usage examples

// // GET request
// const getFetcher = createFetcher({
//     method: 'get',
//     url: 'https://api.example.com/data',
//     data: { param1: 'value1' },
//   });

//   (async () => {
//     const result = await getFetcher.trigger();
//    logger(result);
//   })();

//   // POST request
//   const postFetcher = createFetcher({
//     method: 'post',
//     url: 'https://api.example.com/data',
//     data: { key: 'value' },
//   });

//   (async () => {
//     const result = await postFetcher.trigger();
//    logger(result);
//   })();

//   // PUT request
//   const putFetcher = createFetcher({
//     method: 'put',
//     url: 'https://api.example.com/data/1',
//     data: { key: 'updatedValue' },
//   });

//   (async () => {
//     const result = await putFetcher.trigger();
//    logger(result);
//   })();

//   // DELETE request
//   const deleteFetcher = createFetcher({
//     method: 'delete',
//     url: 'https://api.example.com/data/1',
//   });

//   (async () => {
//     const result = await deleteFetcher.trigger();
//    logger(result);
//   })();

export { createFetcher };
