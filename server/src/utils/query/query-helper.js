const buildSort = (sortBy = "createdAt", sortOrder = "ASC") => {
  return [[sortBy, sortOrder.toUpperCase()]];
};

module.exports = { buildSort };
