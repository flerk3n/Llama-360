/**
 * Service for communicating with the Banking Data Product Builder API
 */
class DataBuilderService {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.apiVersion = '/api';
  }

  /**
   * Check if the backend is healthy and if LLM integration is available
   * @returns {Promise<Object>} Health status object
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}${this.apiVersion}/health`);
      
      if (!response.ok) {
        throw new Error(`Server returned status code ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  /**
   * Send a business use case to be interpreted
   * @param {string} usecase - The business use case description
   * @returns {Promise<Object>} Interpretation result
   */
  async interpretUseCase(usecase) {
    try {
      const response = await fetch(`${this.baseUrl}${this.apiVersion}/interpret-usecase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usecase }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server returned status code ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Use case interpretation failed:', error);
      throw error;
    }
  }

  /**
   * Generate synthetic data for a data product
   * @param {string} dataProduct - The data product identifier
   * @param {number} sampleSize - Number of samples to generate (optional)
   * @returns {Promise<Object>} Generated data info
   */
  async generateData(dataProduct, sampleSize = 10) {
    try {
      const response = await fetch(`${this.baseUrl}${this.apiVersion}/generate-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          data_product: dataProduct,
          sample_size: sampleSize
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server returned status code ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Data generation failed:', error);
      throw error;
    }
  }

  /**
   * Process a specific customer through the data pipeline
   * @param {string} dataProduct - The data product identifier
   * @param {string} customerId - The customer ID to process
   * @returns {Promise<Object>} Processing result
   */
  async processCustomer(dataProduct, customerId) {
    try {
      const response = await fetch(`${this.baseUrl}${this.apiVersion}/process-customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          data_product: dataProduct,
          customer_id: customerId
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server returned status code ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Customer processing failed:', error);
      throw error;
    }
  }

  /**
   * Generate reports for processed data
   * @param {string} dataProduct - The data product identifier
   * @param {string} customerId - The customer ID
   * @returns {Promise<Object>} Report URLs
   */
  async generateReports(dataProduct, customerId) {
    try {
      const response = await fetch(`${this.baseUrl}${this.apiVersion}/generate-reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          data_product: dataProduct,
          customer_id: customerId
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server returned status code ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Report generation failed:', error);
      throw error;
    }
  }

  /**
   * Get the full URL for downloading a report
   * @param {string} reportPath - The report path
   * @returns {string} Full URL
   */
  getFullReportUrl(reportPath) {
    return `${this.baseUrl}${reportPath}`;
  }
}

export default DataBuilderService; 