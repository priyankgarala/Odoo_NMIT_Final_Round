export const notFound = (req, res, next) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
  };
  
  export const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    if (process.env.NODE_ENV !== 'test') {
      console.error(`[${new Date().toISOString()}]`, err.stack || err);
    }
    res.status(status).json({ message });
  };
  
  