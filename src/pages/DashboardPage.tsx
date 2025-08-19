import React, { useState } from 'react';
import {
  Send, MapPin, Loader2, MessageSquare, Sprout,
  Map, TrendingUp, Cloud
} from 'lucide-react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import MapComponent from "../components/MapComponent";


interface QueryResponse {
  advice: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
    formatted_address: string;
  };
  dataCollected: {
    weather: boolean;
    cropPrice: boolean;
    maps: boolean;
  };
}

function DashboardPage() {
  const { user } = useUser();
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await axios.post('http://localhost:5000/api/query', {
        query: query.trim(),
        email: user?.email
      });

      setResponse(result.data);
      setQuery('');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to get agricultural advice');
      console.error('Query error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAdviceText = (advice: string) => {
    return advice.split('\n').map((line, index) => {
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <p key={index} className="mb-2">
            {parts.map((part, partIndex) =>
              partIndex % 2 === 1 ? (
                <strong key={partIndex} className="font-semibold text-green-800">{part}</strong>
              ) : (
                <span key={partIndex}>{part}</span>
              )
            )}
          </p>
        );
      }
      if (line.includes('🌾') || line.includes('📊') || line.includes('⚡')) {
        return <h3 key={index} className="text-lg font-bold text-green-700 mt-4 mb-2">{line}</h3>;
      }
      if (/^\d+\./.test(line.trim())) {
        return <p key={index} className="mb-1 ml-4 font-medium text-gray-800">{line}</p>;
      }
      if (line.trim().startsWith('-')) {
        return <p key={index} className="mb-1 ml-6 text-gray-700">{line}</p>;
      }
      if (line.trim()) {
        return <p key={index} className="mb-2 text-gray-700 leading-relaxed">{line}</p>;
      }
      return <br key={index} />;
    });
  };

  const clearResponse = () => {
    setResponse(null);
    setError('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Sprout className="h-8 w-8 text-green-600 mr-3" />
              Welcome, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-1 flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              Farm Location: {user?.location}
            </p>
          </div>
          {response && (
            <button
              onClick={clearResponse}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              New Query
            </button>
          )}
        </div>
      </div>

      {/* Query Input Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center mb-4">
          <MessageSquare className="h-5 w-5 text-green-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800">Ask Your Agricultural Question</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything about farming, crops, weather, market conditions, or agricultural best practices..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            disabled={isLoading}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="flex items-center space-x-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Getting Advice...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Get Agricultural Advice</span>
                </>
              )}
            </button>
          </div>
        </form>
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Results Section */}
      {response && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Advice Panel */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-green-50 px-6 py-4 border-b border-green-100">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-green-800">Agricultural Recommendations</h3>
              </div>
              <p className="text-sm text-green-600 mt-1">
                Based on current weather and market data for {response.location}
              </p>
            </div>
            <div className="p-6">
              <div className="prose prose-sm max-w-none">
                {formatAdviceText(response.advice)}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Data Sources:</p>
                <div className="flex space-x-4 text-xs">
                  <span className={`flex items-center ${response.dataCollected.weather ? 'text-green-600' : 'text-gray-400'}`}>
                    <Cloud className="h-3 w-3 mr-1" /> Weather Data
                  </span>
                  <span className={`flex items-center ${response.dataCollected.cropPrice ? 'text-green-600' : 'text-gray-400'}`}>
                    <TrendingUp className="h-3 w-3 mr-1" /> Market Prices
                  </span>
                  <span className={`flex items-center ${response.dataCollected.maps ? 'text-green-600' : 'text-gray-400'}`}>
                    <Map className="h-3 w-3 mr-1" /> Location Data
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Map Panel */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
              <div className="flex items-center">
                <Map className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-blue-800">Farm Map</h3>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                Interactive map of your farm location
              </p>
            </div>
            <div className="p-6">
              <MapComponent
                coords={{
                  lat: response.coordinates.lat,
                  lng: response.coordinates.lng,
                }}
                height="h-64"
              />

              <div className="space-y-2 text-sm text-gray-600 mt-4">
                <div className="flex justify-between">
                  <span className="font-medium">Location:</span>
                  <span>{response.coordinates.formatted_address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Coordinates:</span>
                  <span>{response.coordinates.lat.toFixed(4)}, {response.coordinates.lng.toFixed(4)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Message */}
      {!response && !isLoading && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 text-center">
          <Sprout className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your AI Agricultural Advisor</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Ask me anything about farming, crop management, weather conditions, market prices, or agricultural best practices.
            I'll analyze real-time data for your location and provide personalized recommendations with an interactive map of your farm.
          </p>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
