import { useState, useEffect } from 'react';
import apiService from '../services/api.js';

// Custom hook for API calls with loading and error states
export function useApi(apiCall, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall();
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'An error occurred');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { data, loading, error, refetch: () => fetchData() };
}

// Hook for authentication state
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = apiService.getToken();
    if (token) {
      // Verify token and get user profile
      apiService.getProfile()
        .then(userData => {
          setUser(userData);
          setIsAuthenticated(true);
        })
        .catch(() => {
          // Token is invalid, clear it
          apiService.clearToken();
          setIsAuthenticated(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const response = await apiService.login(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiService.register(userData);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout
  };
}

// Hook for donors
export function useDonors() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchDonors = async (searchParams) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.searchDonors(searchParams);
      setDonors(result.donors || []);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerAsDonor = async (donorData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.registerAsDonor(donorData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    donors,
    loading,
    error,
    searchDonors,
    registerAsDonor
  };
}

// Hook for blood requests
export function useBloodRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRequests = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getBloodRequests(filters);
      setRequests(result.requests || []);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createRequest = async (requestData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.createBloodRequest(requestData);
      // Refresh the requests list
      await fetchRequests();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const respondToRequest = async (requestId, response) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.respondToBloodRequest(requestId, response);
      // Refresh the requests list
      await fetchRequests();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    requests,
    loading,
    error,
    fetchRequests,
    createRequest,
    respondToRequest
  };
}
