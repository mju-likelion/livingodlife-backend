class APIError extends Error {
  statusCode = 0;
  errorCode = "";
  errorMsg = "";

  constructor(statusCode, errorCode, errorMsg) {
    super();

    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errorMsg = errorMsg;
  }
}

export default APIError;
