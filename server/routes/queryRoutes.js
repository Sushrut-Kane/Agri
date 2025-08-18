const express = require('express');
const axios = require('axios');
const User = require('../models/User');
const opencage = require('opencage-api-client'); // Use OpenCage for geocoding
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// =================================================================
// MAIN QUERY ENDPOINT
// =================================================================
router.post('/query', async (req, res) => {
  try {
    const { query, email } = req.body;

    if (!query || !email) {
      return res.status(400).json({ error: 'Query and email are required' });
    }

    // 1. Find user by email to get their saved location
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    console.log(`Processing query for user: ${user.name} at location: ${user.location}`);

    // 2. Get precise coordinates from the location string using OpenCage
    const coordinates = await getCoordinatesFromLocation(user.location);
    console.log('Coordinates obtained from OpenCage:', coordinates);

    // 3. Collect data from external APIs in parallel
    const [weatherData, cropPriceData] = await Promise.allSettled([
      getWeatherDataByCoordinates(coordinates.lat, coordinates.lng),
      getCropPriceData(user.location)
    ]);

    // 4. Construct a detailed prompt for the Gemini API
    const prompt = constructGeminiPrompt(
      query,
      user.location,
      weatherData.value, // Use .value to get the result from Promise.allSettled
      cropPriceData.value,
      coordinates
    );

    // 5. Get AI-powered advice from Gemini
    const aiAdvice = await getGeminiAdvice(prompt);

    // 6. Send the final response to the frontend
    res.json({
      advice: aiAdvice,
      location: user.location,
      coordinates: coordinates, // Send coordinates for Leaflet map
      dataCollected: {
        weather: weatherData.status === 'fulfilled',
        cropPrice: cropPriceData.status === 'fulfilled',
        maps: coordinates ? true : false
      }
    });

  } catch (error) {
    console.error('Query processing error:', error);
    res.status(500).json({ 
      error: 'Failed to process query',
      details: error.message 
    });
  }
});

// =================================================================
// HELPER FUNCTIONS
// =================================================================

/**
 * Gets latitude and longitude from a location string using OpenCage Geocoding API.
 * @param {string} location - The location name (e.g., "Jaipur, India").
 * @returns {object} An object containing lat, lng, and formatted_address.
 */
async function getCoordinatesFromLocation(location) {
  try {
    const data = await opencage.geocode({
      q: location,
      key: process.env.OPENCAGE_API_KEY,
      limit: 1
    });

    if (data.status.code === 200 && data.results.length > 0) {
      const place = data.results[0];
      return {
        lat: place.geometry.lat,
        lng: place.geometry.lng,
        formatted_address: place.formatted
      };
    } else {
      throw new Error("OpenCage could not find results for the location.");
    }
  } catch (error) {
    console.error('OpenCage API error:', error.message);
    // Provide fallback coordinates if the API fails
    return {
      lat: 26.9124, // Fallback to Jaipur, India
      lng: 75.7873,
      formatted_address: location
    };
  }
}

/**
 * Fetches weather data from WeatherAPI.com using coordinates.
 * @param {number} lat - Latitude.
 * @param {number} lng - Longitude.
 * @returns {object} An object with formatted weather data.
 */
async function getWeatherDataByCoordinates(lat, lng) {
  try {
    const response = await axios.get(`http://api.weatherapi.com/v1/current.json`, {
      params: {
        key: process.env.WEATHER_API_KEY, // The key from WeatherAPI.com
        q: `${lat},${lng}`,               // The location coordinates
        aqi: 'no'                         // Don't include air quality data
      }
    });

    // The response structure from WeatherAPI.com is different, so we parse it here
    const current = response.data.current;
    return {
      temperature: `${current.temp_c}°C`,
      humidity: `${current.humidity}%`,
      description: current.condition.text,
      wind_speed: `${current.wind_kph} kph`,
    };
  } catch (error) {
    console.log('Weather API unavailable, using mock data');
    // Log the actual error for debugging
    if (error.response) {
      console.error('Weather API Error Response:', error.response.data);
    }
    return {
      temperature: '25°C',
      humidity: '70%',
      description: 'Clear sky',
      wind_speed: '10 kph',
    };
  }
}

/**
 * Fetches crop price data from an API. (Placeholder)
 * @param {string} location - The region to get prices for.
 * @returns {object} An object with mock crop price data.
 */
async function getCropPriceData(location) {
  try {
    // This is a placeholder. Replace with a real crop price API call if you find one.
    // const response = await axios.get(`https://api.example-cropprices.com/prices`, { params: ... });
    // return response.data;
    throw new Error("Crop price API is a placeholder.");
  } catch (error) {
    console.log('Crop Price API unavailable, using mock data');
    return {
      wheat: '$280/ton',
      corn: '$220/ton',
      soybeans: '$480/ton',
    };
  }
}

/**
 * Constructs the prompt to be sent to the Gemini API.
 * @returns {string} A detailed prompt including all collected data.
 */
function constructGeminiPrompt(query, location, weather, prices, coordinates) {
  return `You are an expert agricultural advisor. A farmer from ${location} (coordinates: ${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}) asked: "${query}"

Current Environmental Conditions:
- Temperature: ${weather.temperature}
- Humidity: ${weather.humidity} 
- Weather: ${weather.description}
- Wind Speed: ${weather.wind_speed}

Current Market Prices (example data):
- Wheat: ${prices.wheat}
- Corn: ${prices.corn}
- Soybeans: ${prices.soybeans}

Please provide a concise, actionable recommendation based on this data. Focus on what the farmer should do today or this week.`;
}

/**
 * Gets advice from the Google Gemini API.
 * @param {string} prompt - The prompt to send to the API.
 * @returns {string} The text response from the Gemini model.
 */
/**
 * Gets advice from the Google Gemini API using the official SDK.
 * @param {string} prompt - The prompt to send to the API.
 * @returns {string} The text response from the Gemini model.
 */
async function getGeminiAdvice(prompt) {
  try {
    // Initialize the Google AI client with your API key
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Specify the model to use (gemini-1.5-flash is fast and powerful)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;

    // Return the text from the response
    return response.text();

  } catch (error) {
    console.log('Gemini API unavailable, using mock advice');
    console.error("Gemini API Error:", error); // Log the actual error
    return `Based on the current weather, today is a good day for fieldwork. Market prices for soybeans are strong. Consider scouting your fields for pests and planning your harvest schedule accordingly.`;
  }
}
module.exports = router;