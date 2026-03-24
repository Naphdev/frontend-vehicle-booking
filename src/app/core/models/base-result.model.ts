export interface IBaseSingleResult<T> {
  data: T;
  message?: string;
  success?: boolean;
  error?: any;
}