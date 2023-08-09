export const asyncHandler = (fn) => {
  return async (request, response, next) => {
    try {
      await fn(request, response, next);
    } catch (err) {
      next(err);
    }
  };
};

export const golobalErrorHandler = (error, request, response, next) => {
  if (process.env.MOOD == "DEV") {
    return response
      .status(error.cause || 500)
      .json({ message: error.message, error, stack: error.stack });
  } else {
    return response
      .status(error.cause || 500)
      .json({ message: error.message, error });
  }
};
