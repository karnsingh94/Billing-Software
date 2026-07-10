export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      const validatedData =
        await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        });

      if (validatedData.body) {
        req.body =
          validatedData.body;
      }

      if (validatedData.query) {
        Object.assign(
          req.query,
          validatedData.query
        );
      }

      if (validatedData.params) {
        Object.assign(
          req.params,
          validatedData.params
        );
      }

      return next();
    } catch (error) {
      const errors =
        error?.issues?.map(
          (issue) => ({
            field:
              issue.path.join("."),
            message:
              issue.message,
            code: issue.code,
          })
        ) || [];

      return res.status(400).json({
        success: false,
        message:
          "Validation failed",
        errors,
      });
    }
  };
};