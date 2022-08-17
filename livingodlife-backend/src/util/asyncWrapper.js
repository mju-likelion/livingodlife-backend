const asyncWrapper = (asyncFn) => {
  return async (req, res, next) => {
    try {
      return await asyncFn(req, res, next);
    } catch (error) {
      return next(error);
    }
  };
};

export default asyncWrapper;
