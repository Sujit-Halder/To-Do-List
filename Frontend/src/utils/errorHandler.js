/**
 * Handles server responses and errors in a consistent way.
 * @param {Object} error - The error object from Axios or other sources.
 * @returns {string} - A user-friendly error message.
 */
const handleError = (error) => {
  if (error.response) {
    // Server responded with a status code outside the 2xx range
    const status = error.response.status;
    const serverMessage = error.response.data.message || "An error occurred on the server.";

    switch (status) {
      case 400:
        return "Bad Request: Please check your input.";
      case 401:
        return "Unauthorized: Invalid credentials.";
      case 403:
        return "Forbidden: You do not have permission to access this resource.";
      case 404:
        return "Not Found: The requested resource could not be found.";
      case 409:
        return "Conflict: The request could not be completed due to a conflict.";
      case 422:
        return "Unprocessable Entity: The server could not process your request.";
      case 500:
        return "Internal Server Error: Please try again later.";
      case 503:
        return "Service Unavailable: The server is currently unavailable. Please try again later.";
      default:
        return serverMessage;
    }
  } else if (error.request) {
    // Request was made but no response was received
    return "No response from the server. Please check your internet connection or try again later.";
  } else {
    // Something else happened
    return `Unexpected Error: ${error.message}`;
  }
};

export default handleError;