export type ErrorHandler = (error: Error) => void;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface BaseEntity {
  id: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type HandleError = (_error: Error) => void;
