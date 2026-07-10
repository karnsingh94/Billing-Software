// 


export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      const validatedData = await schema.parseAsync({
        body: req.body || {},
        query: req.query || {},
        params: req.params || {},
      });

      if (validatedData.body !== undefined) {
        req.body = validatedData.body;
      }

      // Avoid changing req.query directly
      // because some Express versions expose it as read-only
      if (validatedData.query !== undefined) {
        req.validatedQuery = validatedData.query;
      }

      if (validatedData.params !== undefined) {
        Object.assign(req.params, validatedData.params);
      }

      return next();
    } catch (error) {
  
      const errors =
        error?.issues?.map((issue) => ({
          field: issue.path
            .filter((item) => item !== "body")
            .join("."),
          message: issue.message,
          code: issue.code,
        })) || [];

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }
  };
};