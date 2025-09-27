export enum ErrorType {
  NOT_FOUND = "not-found",
  BAD_REQUEST = "bad-request",
  FORBIDDEN = "forbidden",
  UNAUTHORIZED = "unauthorized",
  INTERNAL_ERROR = "internal-error",
  VALIDATION = "validation-error",
}

export class AppError extends Error {
  status: number;
  errorType: ErrorType;
  message: string;

  constructor({
    status,
    errorType,
    message,
  }: {
    status: number;
    errorType: ErrorType;
    message: string;
  }) {
    super(message), (this.status = status);
    this.errorType = errorType;
    this.message = message;
  }

  static badRequest(message: string): AppError {
    return new AppError({
      status: 400,
      errorType: ErrorType.BAD_REQUEST,
      message,
    });
  }
  static validationError(message: string): AppError {
    return new AppError({
      status: 400,
      errorType: ErrorType.VALIDATION,
      message,
    });
  }
  static forbidden(message: string): AppError {
    return new AppError({
      status: 403,
      errorType: ErrorType.FORBIDDEN,
      message,
    });
  }
  static notFound(message: string): AppError {
    return new AppError({
      status: 404,
      errorType: ErrorType.NOT_FOUND,
      message,
    });
  }
  static internalError(message: string): AppError {
    return new AppError({
      status: 500,
      errorType: ErrorType.INTERNAL_ERROR,
      message,
    });
  }
  static unauthorized(message: string): AppError {
    return new AppError({
      status: 401,
      errorType: ErrorType.UNAUTHORIZED,
      message,
    });
  }

  toObject(): { status: number; errorType: string; message: string } {
    return {
      status: this.status,
      errorType: this.errorType,
      message: this.message,
    };
  }
}
