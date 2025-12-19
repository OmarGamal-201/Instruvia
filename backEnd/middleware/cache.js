const { cache } = require('../config/redis');

// Cache middleware factory
const cacheMiddleware = (keyPrefix, ttl = 300) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key based on URL and query params
    const cacheKey = `${keyPrefix}:${req.originalUrl}`;

    try {
      // Try to get cached response
      const cachedResponse = await cache.get(cacheKey);
      
      if (cachedResponse) {
        console.log(` Cache hit: ${cacheKey}`);
        return res.status(200).json(cachedResponse);
      }

      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = function(data) {
        // Only cache successful responses
        if (res.statusCode === 200 && data.success !== false) {
          cache.set(cacheKey, data, ttl).catch(err => {
            console.error('Cache set error:', err);
          });
          console.log(`💾 Cache set: ${cacheKey}`);
        }
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next(); // Continue without caching if there's an error
    }
  };
};

// Cache invalidation middleware
const invalidateCache = (keyPattern) => {
  return async (req, res, next) => {
    // This would need Redis pattern matching or key tracking
    // For now, we'll implement simple invalidation
    next();
  };
};

const invalidateUserCache = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await Promise.all([
      cache.del(`users:${userId}`),
      cache.del(`instructors:${userId}`),
      cache.del(`admin:users:${userId}`)
    ]);

    console.log(`🗑️ Invalidated user cache for: ${userId}`);
    next();
  } catch (error) {
    console.error('Cache invalidation error:', error);
    next(error); 
  }
};


const invalidateInstructorCache = async (req, res, next) => {
  try {
    await Promise.all([
      cache.del('instructors:list'),
      cache.del('admin:instructors:pending'),
    ]);
    console.log('🗑️ Invalidated instructor caches');
    next(); // <-- MUST call next()
  } catch (error) {
    console.error('Cache invalidation error:', error);
    next(error); // or next() if you want to continue
  }
};


const invalidateAdminCache = async (req, res, next) => {
  try {
    await Promise.all([
      cache.del('admin:stats'),
      cache.del('admin:users'),
      cache.del('admin:instructors'),
    ]);
    console.log('🗑️ Invalidated admin caches');
    next();
  } catch (error) {
    console.error('Cache invalidation error:', error);
    next(error);
  }
};


module.exports = {
  cacheMiddleware,
  invalidateCache,
  invalidateUserCache,
  invalidateInstructorCache,
  invalidateAdminCache
};
