// success: true => message, data
// success: false => errorMessage, error

export interface IResponse<T> {
  success?: boolean;
  message?: string;
  errorMessage?: string;
  data?: T;
  error?: any;
}
