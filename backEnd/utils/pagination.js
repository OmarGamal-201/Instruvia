// Pagination utility functions

/**
 * Creates pagination metadata
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 * @returns {Object} Pagination metadata
 */
const createPagination = (page, limit, total) => {
  const pages = Math.ceil(total / limit);
  
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1,
    nextPage: page < pages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
  };
};

/**
 * Validates and sanitizes pagination parameters
 * @param {Object} query - Request query object
 * @returns {Object} Sanitized pagination parameters
 */
const getPaginationParams = (query) => {
  let page = parseInt(query.page) || 1;
  let limit = parseInt(query.limit) || 10;
  
  // Validate and sanitize
  if (page < 1) page = 1;
  if (limit < 1) limit = 10;
  if (limit > 100) limit = 100; // Max limit to prevent excessive data retrieval
  
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};

/**
 * Adds pagination to a Mongoose query
 * @param {Object} query - Request query object
 * @param {Object} mongooseQuery - Mongoose query object
 * @returns {Object} Query with pagination applied
 */
const applyPagination = async (query, mongooseQuery) => {
  const { page, limit, skip } = getPaginationParams(query);
  
  // Get total count
  const total = await mongooseQuery.model.countDocuments(mongooseQuery.getQuery());
  
  // Apply pagination
  const results = await mongooseQuery.skip(skip).limit(limit);
  
  // Create pagination metadata
  const pagination = createPagination(page, limit, total);
  
  return {
    success: true,
    data: results,
    pagination,
  };
};

/**
 * Formats paginated response
 * @param {Array} data - The data array
 * @param {Object} pagination - Pagination metadata
 * @param {Object} additional - Additional response data
 * @returns {Object} Formatted response
 */
const formatPaginatedResponse = (data, pagination, additional = {}) => {
  return {
    success: true,
    data,
    pagination,
    ...additional,
  };
};

module.exports = {
  createPagination,
  getPaginationParams,
  applyPagination,
  formatPaginatedResponse,
};
