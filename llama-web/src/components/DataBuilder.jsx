import { useState, useEffect } from 'react';
import DataBuilderService from '../services/DataBuilderService';

function DataBuilder({ onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState({ connected: false, llmEnabled: false });
  
  // Step 1: Use Case Interpretation
  const [useCase, setUseCase] = useState('');
  const [useCaseResult, setUseCaseResult] = useState(null);
  
  // Step 2: Data Generation
  const [generatedData, setGeneratedData] = useState(null);
  const [customerId, setCustomerId] = useState('');
  
  // Step 3: Data Processing
  const [processingResult, setProcessingResult] = useState(null);
  
  // Step 4: Reports
  const [reports, setReports] = useState(null);
  
  const [showInvalidPopup, setShowInvalidPopup] = useState(false);
  
  const dataBuilderService = new DataBuilderService();
  
  // Add valid banking keywords for use case validation
  const validKeywords = [
    'credit card', 'loan', 'mortgage', 'banking', 'account', 'transaction', 'payment',
    'deposit', 'withdrawal', 'transfer', 'balance', 'customer', 'fraud', 'risk',
    'investment', 'savings', 'checking', 'debit', 'credit', 'score', 'approval',
    'application', 'interest', 'rate', 'financial', 'bank', 'lending', 'borrowing',
    'debt', 'income', 'statement', 'portfolio', 'asset', 'liability', 'kyc', 'know your customer',
    'identity', 'verification', 'onboarding', 'compliance', 'regulation', 'aml', 'due diligence'
  ];

  const validateUseCase = (text) => {
    const lowercaseText = text.toLowerCase();
    return validKeywords.some(keyword => lowercaseText.includes(keyword));
  };
  
  // Check backend connectivity on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        setIsLoading(true);
        const healthStatus = await dataBuilderService.checkHealth();
        setBackendStatus({
          connected: true,
          llmEnabled: healthStatus.llm_enabled
        });
      } catch (error) {
        setError('Could not connect to the backend service. Please make sure the Flask server is running on port 5000.');
        setBackendStatus({ connected: false, llmEnabled: false });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkBackend();
  }, []);
  
  const handleUseCaseSubmit = async (e) => {
    e.preventDefault();
    const trimmedUseCase = useCase.trim();
    if (!trimmedUseCase) return;
    
    if (!validateUseCase(trimmedUseCase)) {
      setShowInvalidPopup(true);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      const result = await dataBuilderService.interpretUseCase(trimmedUseCase);
      setUseCaseResult(result);
    } catch (error) {
      setError('Failed to interpret use case: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateData = async () => {
    if (!useCaseResult) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const result = await dataBuilderService.generateData(useCaseResult.data_product);
      setGeneratedData(result);
      if (result.customer_ids && result.customer_ids.length > 0) {
        setCustomerId(result.customer_ids[0]);
      }
      setCurrentStep(2);
    } catch (error) {
      setError('Failed to generate data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleProcessCustomer = async () => {
    if (!useCaseResult || !customerId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const result = await dataBuilderService.processCustomer(useCaseResult.data_product, customerId);
      setProcessingResult(result);
      setCurrentStep(3);
    } catch (error) {
      setError('Failed to process customer data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateReports = async () => {
    if (!useCaseResult || !customerId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const result = await dataBuilderService.generateReports(useCaseResult.data_product, customerId);
      setReports(result);
      setCurrentStep(4);
    } catch (error) {
      setError('Failed to generate reports: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm z-50 flex items-center justify-center overflow-y-auto">
      <div className="glass w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative rounded-2xl">
        {/* Header with close button */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <img 
              src="/images/lamalogo.png" 
              alt="Llama 360 Logo" 
              className="h-8 w-8 object-contain"
            />
            <h2 className="text-2xl font-bold font-poppins text-white">Banking Data Product Builder</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Backend status */}
        <div className="mb-4 text-sm">
          <span className="text-gray-300">
            Backend Status: 
            <span className={`ml-2 px-2 py-1 rounded-full ${backendStatus.connected ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
              {backendStatus.connected ? 'Connected' : 'Disconnected'}
            </span>
          </span>
          {backendStatus.connected && (
            <span className="ml-4 text-gray-300">
              LLM Integration: 
              <span className={`ml-2 px-2 py-1 rounded-full ${backendStatus.llmEnabled ? 'bg-blue-500/20 text-blue-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                {backendStatus.llmEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </span>
          )}
        </div>
        
        {/* Error message with improved styling */}
        {error && (
          <div className="mb-4 p-4 glass rounded-lg border border-red-500/30 bg-red-500/20">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-300 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-200">{error}</p>
            </div>
          </div>
        )}
        
        {/* Step progress */}
        <div className="mb-6">
          <div className="flex mb-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex-1">
                <div 
                  className={`h-2 ${
                    step < currentStep ? 'bg-blue-500' : 
                    step === currentStep ? 'bg-blue-400' : 'bg-gray-700'
                  }`}
                />
              </div>
            ))}
          </div>
          <div className="flex text-xs text-gray-400">
            <div className="flex-1 text-center">Interpret Use Case</div>
            <div className="flex-1 text-center">Generate Data</div>
            <div className="flex-1 text-center">Process Data</div>
            <div className="flex-1 text-center">Reports</div>
          </div>
        </div>
        
        {/* Step 1: Use Case Interpretation */}
        <div className={`transition-opacity duration-300 ${currentStep === 1 ? 'opacity-100' : 'opacity-0 hidden'}`}>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-white">Step 1: Describe Your Business Use Case</h3>
            <p className="text-gray-300 mb-4">
              Enter a banking use case to interpret and find the best matching data product.
              Use relevant banking terms like credit cards, loans, transactions, etc.
            </p>
            
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setUseCase("We need to implement a comprehensive KYC solution for new customer onboarding that verifies customer identity and performs risk assessment for compliance with regulations.")}
                  className="px-3 py-1.5 text-xs rounded-full bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                >
                  KYC Onboarding
                </button>
                <button
                  type="button"
                  onClick={() => setUseCase("We need to offer personalized loan options to our customers based on their credit score and financial history.")}
                  className="px-3 py-1.5 text-xs rounded-full bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                >
                  Personalized Loans
                </button>
                <button
                  type="button"
                  onClick={() => setUseCase("We need to detect fraudulent transactions in real-time to protect our customers from unauthorized charges.")}
                  className="px-3 py-1.5 text-xs rounded-full bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                >
                  Fraud Detection
                </button>
              </div>
            </div>
            
            <form onSubmit={handleUseCaseSubmit}>
              <div className="mb-4">
                <label htmlFor="usecase" className="block mb-2 font-medium text-gray-200">Business Use Case:</label>
                <textarea 
                  id="usecase" 
                  rows="4" 
                  className="glass-input w-full p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  value={useCase}
                  onChange={(e) => {
                    setUseCase(e.target.value);
                    if (error) setError(null); // Clear error when user starts typing
                  }}
                  placeholder="e.g., We need to offer personalized loan options to our customers based on their credit score"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="glass-button px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50"
                disabled={isLoading || !useCase.trim()}
              >
                {isLoading ? 'Interpreting...' : 'Interpret Use Case'}
              </button>
            </form>
          </div>
          
          {useCaseResult && (
            <div className="mt-6 p-4 glass rounded-lg">
              <h4 className="font-semibold mb-2 text-white">Identified Data Product</h4>
              <div className="mb-2">
                <span className="font-medium text-gray-200">Data Product:</span> {useCaseResult.data_product}
                <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300">
                  Using Gemma 2B
                </span>
              </div>
              <div className="mb-2">
                <span className="font-medium text-gray-200">Confidence:</span> {(useCaseResult.confidence * 100).toFixed(1)}%
              </div>
              <div className="mb-4">
                <span className="font-medium text-gray-200">Reasoning:</span> {useCaseResult.reasoning}
              </div>
              
              <button 
                onClick={handleGenerateData}
                className="glass-button px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Generate Synthetic Data'}
              </button>
            </div>
          )}
        </div>
        
        {/* Step 2: Data Generation */}
        <div className={`transition-opacity duration-300 ${currentStep === 2 ? 'opacity-100' : 'opacity-0 hidden'}`}>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-white">Step 2: Data Generation</h3>
            <p className="text-gray-300 mb-4">Review generated synthetic data and select a customer ID to process.</p>
            
            {generatedData && (
              <div className="mb-4">
                <div className="mb-4 p-4 glass rounded-lg">
                  <p className="text-gray-200"><span className="font-medium text-white">Generated Records:</span> {generatedData.records_generated}</p>
                  <p className="mt-2 font-medium text-white">Available Customer IDs:</p>
                  <div className="mt-1 max-h-32 overflow-y-auto">
                    <ul className="list-disc list-inside text-gray-300">
                      {generatedData.customer_ids.map((id) => (
                        <li key={id} className="mb-1">
                          <button
                            onClick={() => setCustomerId(id)}
                            className={`text-left ${customerId === id ? 'text-blue-400' : 'text-gray-300 hover:text-blue-400'}`}
                          >
                            {id}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <button
                    onClick={handleProcessCustomer}
                    className="glass-button mt-4 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    disabled={!customerId || isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Process Selected Customer'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Step 3: Data Processing */}
        <div className={`transition-opacity duration-300 ${currentStep === 3 ? 'opacity-100' : 'opacity-0 hidden'}`}>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-white">Step 3: Data Processing</h3>
            <p className="text-gray-300 mb-4">Review the data processing results.</p>
            
            {processingResult && (
              <div className="mb-4 p-4 glass rounded-lg">
                <div className="mb-4">
                  <p className="mb-2">
                    <span className="font-medium text-white">Mapping Status:</span> Mapped {processingResult.mapping_report.mapped_fields} fields
                    <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300">
                      Using Gemma 2B
                    </span>
                  </p>
                  <p className="mb-2">
                    <span className="font-medium text-white">Ingestion Status:</span> {processingResult.ingestion_report.status}
                  </p>
                </div>
                
                {processingResult.certification_report && (
                  <div className="mt-4">
                    <p className="font-medium mb-2 text-white">Certification Status: {processingResult.certification_report.certification_status}</p>
                    <ul className="list-disc list-inside text-gray-300">
                      {Object.entries(processingResult.certification_report.checks).map(([name, check]) => (
                        <li key={name} className="text-sm">
                          {name}: {check.passed ? '✓' : '✗'} (Score: {check.score.toFixed(2)})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={handleGenerateReports}
                  className="glass-button mt-6 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                  disabled={isLoading}
                >
                  {isLoading ? 'Generating Reports...' : 'Generate Reports'}
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Step 4: Reports */}
        <div className={`transition-opacity duration-300 ${currentStep === 4 ? 'opacity-100' : 'opacity-0 hidden'}`}>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-white">Step 4: Report Generation</h3>
            <p className="text-gray-300 mb-4">Download reports and exports.</p>
            
            {reports && (
              <div className="mb-4 p-4 glass rounded-lg">
                <p className="mb-4 font-medium text-white">Reports Generated Successfully</p>
                
                <div className="flex flex-col space-y-4">
                  <a 
                    href={dataBuilderService.getFullReportUrl(reports.json_report_url)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="glass-button px-4 py-2 rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                  >
                    Download JSON Report
                  </a>
                  <a 
                    href={dataBuilderService.getFullReportUrl(reports.csv_export_url)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="glass-button px-4 py-2 rounded-md text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                  >
                    Download CSV Export
                  </a>
                </div>
              </div>
            )}
            
            <div className="mt-6 flex items-center justify-between">
              <button 
                onClick={() => {
                  setCurrentStep(1);
                  setUseCase('');
                  setUseCaseResult(null);
                  setGeneratedData(null);
                  setCustomerId('');
                  setProcessingResult(null);
                  setReports(null);
                }}
                className="glass-button px-4 py-2 rounded-md text-gray-300 bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Start New Analysis
              </button>
              <button 
                onClick={onClose}
                className="glass-button px-4 py-2 rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
        
        {/* Invalid Use Case Popup */}
        {showInvalidPopup && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center">
            <div className="glass w-full max-w-md p-6 rounded-2xl">
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-white mb-2">Invalid Use Case</h3>
                  <p className="text-gray-300 mb-4">
                    Your use case must include banking-related terms. Please include one or more of the following:
                  </p>
                  <div className="max-h-40 overflow-y-auto mb-4">
                    <div className="flex flex-wrap gap-2">
                      {validKeywords.map((keyword, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowInvalidPopup(false)}
                  className="glass-button px-4 py-2 rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-blue-600">Processing...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DataBuilder; 