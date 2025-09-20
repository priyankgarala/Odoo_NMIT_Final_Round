export default class HttpError extends Error {
    constructor(status, message) {
      super(message);
      this.status = status || 500;
    }
    static badRequest(message = 'Bad Request') { return new HttpError(400, message); }
    static unauthorized(message = 'Unauthorized') { return new HttpError(401, message); }
    static forbidden(message = 'Forbidden') { return new HttpError(403, message); }
    static notFound(message = 'Not Found') { return new HttpError(404, message); }
    static conflict(message = 'Conflict') { return new HttpError(409, message); }
    static internal(message = 'Internal Server Error') { return new HttpError(500, message); }
  }
  
  
  