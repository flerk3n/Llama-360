from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import random
import os
import time
import logging
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("flask_app.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("web")

# Import agents (assuming these files exist)
try:
    from use_case_interpreter import UseCaseInterpreter
    from data_product_designer import DataProductDesigner
    from mapper_agent import MapperAgent
    from ingress_egress_agent import IngressEgressAgent
    from certifier_agent import CertifierAgent
    import ollama_client
    have_agents = True
    logger.info("Successfully imported agent modules")
except ImportError as e:
    have_agents = False
    logger.warning(f"Agent modules not found. Running in mock mode. Error: {e}")

# Initialize Flask app
app = Flask(__name__)

# Get configuration from environment variables
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'development_secret_key')
app.config['ENV'] = os.getenv('FLASK_ENV', 'development')
OLLAMA_API_URL = os.getenv('OLLAMA_API_URL', 'http://localhost:11434/api')

# Configure CORS with allowed origins from environment
allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
CORS(app, origins=allowed_origins)  # Enable CORS only for specified origins

logger.info(f"Initialized Flask app with CORS support for {allowed_origins} in {app.config['ENV']} mode")

# Define Ollama models to use
REQUIRED_MODELS = ["gemma:2b", "phi3:mini"]

# Business rules for specific use cases
BUSINESS_RULES = {
    "kyc": {
        "data_product": "customer_360",
        "confidence": 0.95,
        "reasoning": "KYC (Know Your Customer) is part of customer identity verification and profiling, making customer_360 the most appropriate choice."
    },
    "fraud": {
        "data_product": "fraud_detection",
        "confidence": 0.90,
        "reasoning": "Use cases mentioning fraud, suspicious activity, or security threats are best handled by the fraud_detection data product."
    },
    "loan": {
        "data_product": "loan_eligibility",
        "confidence": 0.85,
        "reasoning": "Loan-related use cases including approvals, terms, risk assessment, and lending decisions align with the loan_eligibility data product."
    },
    "churn": {
        "data_product": "churn_prediction",
        "confidence": 0.85,
        "reasoning": "Customer retention, attrition, and loyalty use cases are best addressed by the churn_prediction data product."
    }
}

# Initialize agents if available
if have_agents:
    logger.info("Initializing agents and Ollama client")
    try:
        use_case_interpreter = UseCaseInterpreter()
        data_product_designer = DataProductDesigner()
        mapper_agent = MapperAgent()
        ingress_egress_agent = IngressEgressAgent()
        certifier_agent = CertifierAgent()
        ollama = ollama_client.OllamaClient()
        
        # Check if the required models are available
        AVAILABLE_MODELS = []
        for model in REQUIRED_MODELS:
            if ollama.is_available(model):
                AVAILABLE_MODELS.append(model)
        
        logger.info(f"Available Ollama models: {AVAILABLE_MODELS}")
    except Exception as e:
        logger.error(f"Error initializing agents: {e}")
        have_agents = False
        AVAILABLE_MODELS = []
else:
    # Create a basic Ollama client implementation for mock mode
    logger.info("Creating mock Ollama client")
    class MockOllamaClient:
        def is_available(self, model_name=None):
            return True
        
        def get_model_name(self):
            return REQUIRED_MODELS[0]
        
        def generate_response(self, prompt, model_name=None):
            return f"Mock response for prompt: {prompt[:30]}..."
        
        def interpret_banking_use_case(self, use_case):
            use_case_lower = use_case.lower()
            
            # Apply business rules first
            for keyword, rule in BUSINESS_RULES.items():
                if keyword in use_case_lower:
                    logger.info(f"Applied business rule for '{keyword}' in use case: {use_case}")
                    return rule.copy()
            
            # Random fallback if no business rule matched
            data_products = ['customer_360', 'loan_eligibility', 'fraud_detection', 'churn_prediction']
            return {
                'data_product': random.choice(data_products),
                'confidence': random.uniform(0.7, 0.95),
                'reasoning': f"Mock reasoning for: {use_case[:30]}...",
            }
        
        def suggest_field_mappings(self, source_fields, target_schema):
            return {field: f"target_{field}" for field in source_fields}
    
    ollama = MockOllamaClient()
    AVAILABLE_MODELS = REQUIRED_MODELS  # Pretend all models are available in mock mode
    logger.info("Running with mock Ollama client - simulating available models")

# Create reports directory
REPORTS_DIR = 'reports'
os.makedirs(REPORTS_DIR, exist_ok=True)
logger.info(f"Created reports directory: {REPORTS_DIR}")

@app.route('/api/health', methods=['GET'])
def health_check():
    """Return the health status of the API and LLM availability"""
    logger.info("Health check requested")
    return jsonify({
        'status': 'ok',
        'llm_enabled': len(AVAILABLE_MODELS) > 0,
        'available_models': AVAILABLE_MODELS,
        'timestamp': datetime.now().isoformat(),
        'agent_modules_loaded': have_agents
    })

@app.route('/api/interpret-usecase', methods=['POST'])
def interpret_usecase():
    """Interpret a business use case and match to data product"""
    try:
        data = request.json
        usecase = data.get('usecase', '').strip()
        logger.info(f"Interpreting use case: {usecase}")
        
        if not usecase:
            logger.warning("Empty use case provided")
            return jsonify({'error': 'No use case provided'}), 400
        
        # Apply business rules first for certain keywords
        usecase_lower = usecase.lower()
        for keyword, rule in BUSINESS_RULES.items():
            if keyword in usecase_lower:
                logger.info(f"Applied business rule for '{keyword}' in use case: {usecase}")
                result = rule.copy()
                result['used_llm'] = "business_rule"  # Mark that we used a business rule, not LLM
                return jsonify(result)
        
        try:
            if have_agents:
                # Use the actual agent
                logger.info("Using agent for interpretation")
                result = use_case_interpreter.interpret(usecase)
                llm_used = ollama.get_model_name()
            else:
                # Use mock Ollama client
                logger.info("Using mock client for interpretation")
                result = ollama.interpret_banking_use_case(usecase)
                llm_used = REQUIRED_MODELS[0]
                
            # Add LLM info
            result['used_llm'] = llm_used
            
            logger.info(f"Interpretation result: Data product={result['data_product']}, Confidence={result['confidence']}, LLM={llm_used}")
            return jsonify(result)
        except Exception as e:
            logger.error(f"Error in use case interpretation: {e}")
            
            # Fallback to business rules for specific keywords
            usecase_lower = usecase.lower()
            for keyword, rule in BUSINESS_RULES.items():
                if keyword in usecase_lower:
                    logger.info(f"Fallback to business rule for '{keyword}' after error")
                    result = rule.copy()
                    result['used_llm'] = "fallback_rule"
                    return jsonify(result)
            
            # Last resort fallback
            logger.info("Using random fallback for interpretation")
            data_products = ['customer_360', 'loan_eligibility', 'fraud_detection', 'churn_prediction']
            fallback_result = {
                'data_product': random.choice(data_products),
                'confidence': random.uniform(0.7, 0.8),
                'reasoning': f"Failed to process use case due to an error. Providing best guess.",
                'used_llm': 'error_fallback'
            }
            return jsonify(fallback_result)
    except Exception as e:
        logger.error(f"Unexpected error in interpret_usecase endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-data', methods=['POST'])
def generate_data():
    """Generate synthetic data for a data product"""
    try:
        data = request.json
        data_product = data.get('data_product', '')
        sample_size = data.get('sample_size', 10)
        
        logger.info(f"Generating data for {data_product}, sample size: {sample_size}")
        
        if not data_product:
            logger.warning("No data product specified")
            return jsonify({'error': 'No data product specified'}), 400
        
        try:
            # Simulate data generation delay
            time.sleep(1)
            
            if have_agents:
                # Use the actual agent
                logger.info("Using agent for data generation")
                result = data_product_designer.generate_data(data_product, sample_size)
            else:
                # Mock response
                logger.info("Using mock data generation")
                customer_ids = [f"CUST_{random.randint(10000, 99999)}" for _ in range(sample_size)]
                result = {
                    'data_product': data_product,
                    'records_generated': sample_size,
                    'customer_ids': customer_ids,
                    'timestamp': datetime.now().isoformat()
                }
                
            logger.info(f"Generated {result['records_generated']} records")
            return jsonify(result)
        except Exception as e:
            logger.error(f"Error in data generation: {e}")
            return jsonify({'error': str(e)}), 500
    except Exception as e:
        logger.error(f"Unexpected error in generate_data endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/process-customer', methods=['POST'])
def process_customer():
    """Process a customer through the data pipeline"""
    try:
        data = request.json
        data_product = data.get('data_product', '')
        customer_id = data.get('customer_id', '')
        
        logger.info(f"Processing customer {customer_id} for data product {data_product}")
        
        if not data_product or not customer_id:
            logger.warning("Missing data_product or customer_id")
            return jsonify({'error': 'Missing data_product or customer_id'}), 400
        
        try:
            # Simulate processing delay
            time.sleep(2)
            
            if have_agents:
                # Use actual agents
                logger.info("Using agents for customer processing")
                mapping_result = mapper_agent.map_source_to_target(data_product, customer_id)
                ingestion_result = ingress_egress_agent.process_customer(data_product, customer_id)
                certification_result = certifier_agent.certify_data_product(data_product, customer_id)
                
                result = {
                    'mapping_report': mapping_result,
                    'ingestion_report': ingestion_result,
                    'certification_report': certification_result
                }
            else:
                # Mock response with LLM info
                logger.info("Using mock customer processing")
                model_used = REQUIRED_MODELS[1]  # Use phi3:mini for mapping
                result = {
                    'mapping_report': {
                        'mapped_fields': random.randint(5, 15),
                        'mapping_confidence': random.uniform(0.8, 0.99),
                        'used_llm': model_used
                    },
                    'ingestion_report': {
                        'status': 'success',
                        'records_processed': random.randint(1, 5),
                        'timestamp': datetime.now().isoformat()
                    },
                    'certification_report': {
                        'certification_status': random.choice(['passed', 'conditional_pass', 'failed']),
                        'overall_score': random.uniform(0.7, 0.98),
                        'checks': {
                            'completeness': {'passed': True, 'score': random.uniform(0.8, 1.0)},
                            'consistency': {'passed': True, 'score': random.uniform(0.8, 1.0)},
                            'privacy': {'passed': random.choice([True, False]), 'score': random.uniform(0.6, 1.0)},
                            'timeliness': {'passed': True, 'score': random.uniform(0.8, 1.0)}
                        }
                    }
                }
                
            logger.info(f"Customer processing completed successfully for {customer_id}")
            return jsonify(result)
        except Exception as e:
            logger.error(f"Error in customer processing: {e}")
            return jsonify({'error': str(e)}), 500
    except Exception as e:
        logger.error(f"Unexpected error in process_customer endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-reports', methods=['POST'])
def generate_reports():
    """Generate reports for processed data"""
    try:
        data = request.json
        data_product = data.get('data_product', '')
        customer_id = data.get('customer_id', '')
        
        logger.info(f"Generating reports for customer {customer_id}, data product {data_product}")
        
        if not data_product or not customer_id:
            logger.warning("Missing data_product or customer_id")
            return jsonify({'error': 'Missing data_product or customer_id'}), 400
        
        try:
            # Simulate report generation delay
            time.sleep(1.5)
            
            # Create timestamp for filename
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            
            # Generate filenames
            json_filename = f"{data_product}_{customer_id}_{timestamp}.json"
            csv_filename = f"{data_product}_{customer_id}_{timestamp}.csv"
            
            json_path = os.path.join(REPORTS_DIR, json_filename)
            csv_path = os.path.join(REPORTS_DIR, csv_filename)
            
            if have_agents:
                # Use actual agent to generate reports
                logger.info("Using agent for report generation")
                report_data = ingress_egress_agent.generate_reports(data_product, customer_id)
                
                # Save reports
                with open(json_path, 'w') as f:
                    json.dump(report_data, f, indent=2)
                    
                # Create a simple CSV for download
                with open(csv_path, 'w') as f:
                    f.write("field,value\n")
                    for key, value in report_data.items():
                        if not isinstance(value, (dict, list)):
                            f.write(f"{key},{value}\n")
            else:
                # Generate mock report data
                logger.info("Using mock report generation")
                mock_report = {
                    'data_product': data_product,
                    'customer_id': customer_id,
                    'generated_at': datetime.now().isoformat(),
                    'score': random.uniform(0, 1),
                    'status': random.choice(['approved', 'rejected', 'pending']),
                    'expiration': (datetime.now() + timedelta(days=30)).isoformat(),
                    'model_used': REQUIRED_MODELS[0]
                }
                
                # Add specific KYC fields if the data product is customer_360
                if data_product == 'customer_360':
                    mock_report.update({
                        'kyc_status': 'verified',
                        'risk_level': random.choice(['low', 'medium', 'high']),
                        'verification_method': random.choice(['document', 'biometric', 'two-factor'])
                    })
                
                # Save mock reports
                with open(json_path, 'w') as f:
                    json.dump(mock_report, f, indent=2)
                    
                # Create a simple CSV for download
                with open(csv_path, 'w') as f:
                    f.write("field,value\n")
                    for key, value in mock_report.items():
                        f.write(f"{key},{value}\n")
            
            # Return the report paths for download
            result = {
                'json_report_url': f"/reports/{json_filename}",
                'csv_export_url': f"/reports/{csv_filename}",
                'generated_at': datetime.now().isoformat()
            }
            
            logger.info(f"Reports generated successfully: {json_filename}, {csv_filename}")
            return jsonify(result)
        except Exception as e:
            logger.error(f"Error in report generation: {e}")
            return jsonify({'error': str(e)}), 500
    except Exception as e:
        logger.error(f"Unexpected error in generate_reports endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/reports/<path:filename>', methods=['GET'])
def download_report(filename):
    """Serve the generated reports"""
    logger.info(f"Serving report file: {filename}")
    return send_from_directory(REPORTS_DIR, filename, as_attachment=True)

@app.errorhandler(404)
def not_found(error):
    logger.warning(f"404 error: {request.path}")
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def server_error(error):
    logger.error(f"500 error: {error}")
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    logger.info("Starting Flask server on port 5000")
    app.run(debug=True, host='0.0.0.0', port=5000) 