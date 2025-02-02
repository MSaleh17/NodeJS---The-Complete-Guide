class appError extends Error {
  constructor(name, httpStatusCode, description) {
    super(description);
    this.name = name;
    this.httpStatusCode = httpStatusCode;

    Error.captureStackTrace(this);
  }
}

module.exports = appError;
