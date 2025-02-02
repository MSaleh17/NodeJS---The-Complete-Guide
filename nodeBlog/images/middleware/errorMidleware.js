const appError = require("../util/appError");

module.exports = (err, req, res, next) => {
  const er = {
    name: err.name || "Internal Server Error"
  };

  if (err instanceof appError) {
    er.message = err.message;
  }

  return res.status(err.httpStatusCode || 500).json(er);
};
