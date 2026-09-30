import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction): void => {
  console.error('[CropPilot Error]:', err.message || err);

  // Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'Image size exceeds 10MB limit. Please upload a smaller photo.' });
      return;
    }
    res.status(400).json({ error: `Upload error: ${err.message}` });
    return;
  }

  // Handle custom or standard errors
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error occurred';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};
