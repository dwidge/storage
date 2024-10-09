import { AxiosError } from "axios";

export const catchAxios = (code: string) => (cause: unknown) => {
  if (cause instanceof AxiosError) {
    throw new Error(
      cause.response?.data ? code + ": " + cause.response.data : code,
      {
        cause: {
          message: cause.message,
          status: cause.response?.status,
          data: cause.response?.data,
          headers: cause.config?.headers,
        },
      }
    );
  } else throw cause;
};
