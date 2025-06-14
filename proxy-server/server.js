const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Enable CORS for your frontend
app.use(cors({
  origin: ['http://localhost:8080', 'http://192.168.29.63:8080', 'http://192.168.80.1:8080'] // Allow multiple origins
}));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Proxy endpoint for lyrics
app.get('/api/lyrics', async (req, res) => {
  try {
    const query = req.query.q;
    console.log('Fetching lyrics for query:', query);
    
    // Add error handling for missing query
    if (!query) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    // Check cache first
    const cacheKey = query.toLowerCase();
    const cachedData = cache.get(cacheKey);
    if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
      console.log('Serving from cache:', cacheKey);
      return res.json(cachedData.data);
    }

    // Add delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = await axios.get(`https://lyrist.vercel.app/api/lyrics?q=${query}`, {
      timeout: 10000, // 10 second timeout
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    console.log('Lyrist API response status:', response.status);
    
    if (!response.data) {
      throw new Error('No data received from Lyrist API');
    }

    // Cache the successful response
    cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now()
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      stack: error.stack
    });

    // Handle rate limiting specifically
    if (error.response?.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        details: 'Too many requests to the lyrics service. Please try again in a few minutes.',
        retryAfter: error.response.headers['retry-after'] || 60
      });
    }

    // Send appropriate error response
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      res.status(error.response.status).json({
        error: 'Lyrist API error',
        details: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      res.status(504).json({
        error: 'No response from Lyrist API',
        details: 'The request timed out or the server is not responding'
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      res.status(500).json({
        error: 'Internal server error',
        details: error.message
      });
    }
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: err.message
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log('CORS enabled for:', ['http://localhost:8080', 'http://192.168.29.63:8080', 'http://192.168.80.1:8080']);
}); 