import requests
import json
import time
import random
import logging
from typing import Dict, List, Optional, Union, Any

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("OllamaClient")

class OllamaClient:
    """Client for interacting with the Ollama API."""
    
    def __init__(self, base_url: str = "http://localhost:11434"):
        """Initialize the Ollama client with the base URL of the Ollama API server.
        
        Args:
            base_url: The base URL of the Ollama API server.
        """
        self.base_url = base_url
        self._cached_models = None
        self._cache_time = 0
        self.current_model = None
        logger.info(f"Initialized OllamaClient with base URL: {base_url}")
        
        # Verify connection on initialization
        try:
            self._refresh_models_cache()
            if self._cached_models:
                logger.info(f"Successfully connected to Ollama. Available models: {', '.join(self._cached_models)}")
            else:
                logger.warning("Connected to Ollama but no models found")
        except Exception as e:
            logger.error(f"Failed to connect to Ollama on initialization: {e}")
    
    def _refresh_models_cache(self) -> None:
        """Refresh the cache of available models."""
        try:
            logger.debug("Refreshing models cache")
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            if response.status_code == 200:
                data = response.json()
                if 'models' in data:
                    self._cached_models = [model['name'] for model in data['models']]
                    logger.debug(f"Models cache refreshed. Found models: {self._cached_models}")
                else:
                    logger.warning(f"Unexpected response structure from Ollama API: {data}")
                    self._cached_models = []
            else:
                logger.warning(f"Failed to get models from Ollama API: {response.status_code}")
                self._cached_models = []
                
            self._cache_time = time.time()
        except requests.exceptions.ConnectionError:
            logger.error("Connection error while refreshing models cache. Is Ollama running?")
            self._cached_models = []
        except Exception as e:
            logger.error(f"Failed to refresh models cache: {e}")
            self._cached_models = []
    
    def get_available_models(self) -> List[str]:
        """Get a list of available models.
        
        Returns:
            A list of available model names.
        """
        # Refresh cache if older than 60 seconds
        if self._cached_models is None or time.time() - self._cache_time > 60:
            self._refresh_models_cache()
        
        return self._cached_models or []
    
    def is_available(self, model_name: str = None) -> bool:
        """Check if a model is available.
        
        Args:
            model_name: The name of the model to check.
            
        Returns:
            True if the model is available, False otherwise.
        """
        try:
            available_models = self.get_available_models()
            if model_name:
                # Check if the exact model name is available
                if model_name in available_models:
                    self.current_model = model_name
                    logger.info(f"Model {model_name} is available")
                    return True
                
                # Check for model with different formatting (e.g., gemma:2b vs gemma2:2b)
                for available_model in available_models:
                    # Convert model name variations (removing colons, spaces, etc.)
                    normalized_available = available_model.replace(':', '').replace('-', '').lower()
                    normalized_requested = model_name.replace(':', '').replace('-', '').lower()
                    
                    if normalized_requested == normalized_available:
                        self.current_model = available_model  # Use the actual model name that's available
                        logger.info(f"Model {model_name} matched to available model {available_model}")
                        return True
                
                logger.warning(f"Model {model_name} is not available. Available models: {available_models}")
                return False
            
            # If no specific model requested, check if any models are available
            is_available = len(available_models) > 0
            logger.debug(f"Any model available: {is_available}")
            return is_available
        except Exception as e:
            logger.error(f"Failed to check model availability: {e}")
            return False
    
    def get_model_name(self) -> str:
        """Get the name of the currently selected model.
        
        Returns:
            The name of the current model or None if no model is selected.
        """
        return self.current_model or "none"
    
    def generate_response(self, prompt: str, model_name: Optional[str] = None) -> str:
        """Generate a response from the model.
        
        Args:
            prompt: The prompt to send to the model.
            model_name: The name of the model to use. If None, uses the current model.
            
        Returns:
            The generated response.
        """
        model = model_name or self.current_model
        if not model:
            raise ValueError("No model specified and no current model selected.")
        
        logger.info(f"Generating response using model: {model}")
        logger.debug(f"Prompt: {prompt[:100]}...")
        
        try:
            start_time = time.time()
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={"model": model, "prompt": prompt, "stream": False},
                timeout=30  # Increased timeout for larger models
            )
            
            elapsed = time.time() - start_time
            logger.debug(f"Response received in {elapsed:.2f} seconds")
            
            if response.status_code == 200:
                result = response.json()
                if 'response' in result:
                    response_text = result['response']
                    logger.debug(f"Response length: {len(response_text)} chars")
                    return response_text
                else:
                    error_msg = f"Unexpected response structure: {result}"
                    logger.error(error_msg)
                    return error_msg
            else:
                error_msg = f"Failed to generate response: {response.status_code}, {response.text}"
                logger.error(error_msg)
                return error_msg
        except requests.exceptions.Timeout:
            error_msg = f"Request timed out when generating response with model {model}"
            logger.error(error_msg)
            return error_msg
        except Exception as e:
            error_msg = f"Exception generating response: {str(e)}"
            logger.error(error_msg)
            return error_msg
    
    def interpret_banking_use_case(self, use_case: str) -> Dict[str, Any]:
        """Interpret a banking use case and map it to a data product.
        
        Args:
            use_case: The banking use case to interpret.
            
        Returns:
            A dictionary with the interpreted data product, confidence, and reasoning.
        """
        # Ensure we're using gemma:2b for interpreting use cases
        model = "gemma:2b"
        logger.info(f"Interpreting banking use case using model {model}")
        
        if not self.is_available(model):
            logger.warning(f"Primary model {model} not available")
            # Fall back to whatever's available
            available = self.get_available_models()
            if available:
                model = available[0]
                logger.info(f"Falling back to available model: {model}")
            else:
                # Mock response if no models available
                logger.error("No models available. Using mock response.")
                data_products = ['customer_360', 'loan_eligibility', 'fraud_detection', 'churn_prediction']
                
                # For KYC use case, we should always choose customer_360
                if "kyc" in use_case.lower() or "know your customer" in use_case.lower():
                    return {
                        'data_product': 'customer_360',
                        'confidence': 0.95,
                        'reasoning': f"KYC (Know Your Customer) is part of customer identity verification and profiling, which aligns with customer_360.",
                    }
                
                return {
                    'data_product': random.choice(data_products),
                    'confidence': random.uniform(0.7, 0.98),
                    'reasoning': f"No LLM available. Mock reasoning for: {use_case[:30]}...",
                }
        
        self.current_model = model
        
        prompt = f"""
        You are a banking data product specialist. Interpret the following banking use case 
        and identify the most appropriate data product from the following options:
        - customer_360: For comprehensive customer profiling, identity verification (including KYC), and personalization
        - loan_eligibility: For determining loan approval and terms based on customer financial data
        - fraud_detection: For identifying suspicious activity and preventing fraud
        - churn_prediction: For predicting and preventing customer attrition
        
        Use case: {use_case}
        
        Special rules:
        - If the use case mentions "KYC" or "Know Your Customer", always choose customer_360 as this is specifically for identity verification
        - If the use case is very short or ambiguous, choose the most logical option based on banking domain knowledge
        
        Respond in JSON format with the following structure:
        {{
            "data_product": "the_chosen_data_product",
            "confidence": confidence_score_between_0_and_1,
            "reasoning": "brief explanation of your choice"
        }}
        """
        
        try:
            response = self.generate_response(prompt, model)
            logger.debug(f"Raw LLM response: {response}")
            
            # Extract JSON from response (it might be surrounded by markdown code blocks or other text)
            # First try to extract from code blocks
            if "```json" in response:
                # Extract from markdown JSON code block
                start = response.find("```json") + 7
                end = response.find("```", start)
                if end > start:
                    json_str = response[start:end].strip()
                    logger.debug(f"Extracted JSON from code block: {json_str}")
                else:
                    # Try without the json specifier
                    start = response.find("```") + 3
                    end = response.find("```", start)
                    if end > start:
                        json_str = response[start:end].strip()
                        logger.debug(f"Extracted JSON from code block (without specifier): {json_str}")
                    else:
                        # Fall back to finding { and }
                        json_start = response.find('{')
                        json_end = response.rfind('}') + 1
                        json_str = response[json_start:json_end]
                        logger.debug(f"Extracted JSON by finding braces: {json_str}")
            else:
                # Find JSON by looking for { and }
                json_start = response.find('{')
                json_end = response.rfind('}') + 1
                
                if json_start >= 0 and json_end > json_start:
                    json_str = response[json_start:json_end]
                    logger.debug(f"Extracted JSON by finding braces: {json_str}")
                else:
                    raise ValueError("No JSON found in response")
            
            try:
                result = json.loads(json_str)
                logger.info(f"Successfully parsed JSON: {result}")
                
                # Validate the required fields
                if 'data_product' not in result or 'confidence' not in result or 'reasoning' not in result:
                    logger.error(f"Missing required fields in response JSON: {result}")
                    raise ValueError("Missing required fields in response")
                
                # Apply business logic rules as a final check
                if "kyc" in use_case.lower() or "know your customer" in use_case.lower():
                    # Override with correct product if KYC is mentioned
                    if result['data_product'] != 'customer_360':
                        logger.warning(f"Overriding LLM recommendation from {result['data_product']} to customer_360 for KYC use case")
                        result['data_product'] = 'customer_360'
                        result['confidence'] = 0.95
                        result['reasoning'] = "KYC (Know Your Customer) is specifically for customer identity verification and profiling, which aligns with customer_360."
                
                return result
            except json.JSONDecodeError as e:
                logger.error(f"JSON parsing error: {e}, JSON string: {json_str}")
                raise ValueError(f"Invalid JSON: {e}")
                
        except Exception as e:
            logger.error(f"Error interpreting use case: {e}")
            logger.error(f"Raw response: {response if 'response' in locals() else 'No response generated'}")
            
            # Business logic fallback for KYC
            if "kyc" in use_case.lower() or "know your customer" in use_case.lower():
                logger.info("Falling back to business logic for KYC use case")
                return {
                    'data_product': 'customer_360',
                    'confidence': 0.95,
                    'reasoning': "KYC (Know Your Customer) is part of customer identity verification and profiling, which aligns with customer_360.",
                }
            
            # Fallback to mock response
            logger.info("Falling back to random mock response")
            data_products = ['customer_360', 'loan_eligibility', 'fraud_detection', 'churn_prediction']
            return {
                'data_product': random.choice(data_products),
                'confidence': random.uniform(0.7, 0.98),
                'reasoning': f"Error processing with LLM. Mock reasoning for: {use_case[:30]}...",
            }
    
    def suggest_field_mappings(self, source_fields: List[str], target_schema: Dict[str, Any]) -> Dict[str, str]:
        """Suggest mappings from source fields to target schema.
        
        Args:
            source_fields: List of field names from the source system.
            target_schema: Dictionary describing the target schema.
            
        Returns:
            Dictionary mapping source fields to target fields.
        """
        # Use phi3:mini for mapping suggestions
        model = "phi3:mini"
        logger.info(f"Suggesting field mappings using model {model}")
        
        if not self.is_available(model):
            logger.warning(f"Primary model {model} not available")
            available = self.get_available_models()
            if available:
                model = available[0]
                logger.info(f"Falling back to available model: {model}")
            else:
                # Mock response if no models available
                logger.error("No models available. Using mock mappings.")
                return {field: f"target_{field.lower().replace(' ', '_')}" for field in source_fields}
        
        self.current_model = model
        
        # Format target schema for the prompt
        target_fields_str = "\n".join([f"- {field}: {details}" for field, details in target_schema.items()])
        source_fields_str = "\n".join([f"- {field}" for field in source_fields])
        
        prompt = f"""
        You are a data mapping expert. Suggest the best field mappings from source to target.
        
        Source fields:
        {source_fields_str}
        
        Target schema:
        {target_fields_str}
        
        For each source field, map it to the most appropriate target field based on semantic similarity.
        Respond in JSON format with source field names as keys and target field names as values.
        If a source field has no appropriate mapping, map it to null.
        
        Example response format:
        {{
            "source_field1": "target_field1",
            "source_field2": "target_field2",
            "source_field3": null
        }}
        """
        
        try:
            response = self.generate_response(prompt, model)
            logger.debug(f"Raw LLM response: {response}")
            
            # Extract JSON from response (similar approach as above)
            if "```json" in response:
                # Extract from markdown JSON code block
                start = response.find("```json") + 7
                end = response.find("```", start)
                if end > start:
                    json_str = response[start:end].strip()
                else:
                    # Try without the json specifier
                    start = response.find("```") + 3
                    end = response.find("```", start)
                    if end > start:
                        json_str = response[start:end].strip()
                    else:
                        # Fall back to finding { and }
                        json_start = response.find('{')
                        json_end = response.rfind('}') + 1
                        json_str = response[json_start:json_end]
            else:
                # Find JSON by looking for { and }
                json_start = response.find('{')
                json_end = response.rfind('}') + 1
                
                if json_start >= 0 and json_end > json_start:
                    json_str = response[json_start:json_end]
                else:
                    raise ValueError("No JSON found in response")
            
            try:
                mappings = json.loads(json_str)
                logger.info(f"Successfully parsed JSON mappings")
                
                # Ensure all source fields are included
                for field in source_fields:
                    if field not in mappings:
                        logger.warning(f"Field {field} missing from mappings, setting to null")
                        mappings[field] = None
                
                return mappings
            except json.JSONDecodeError as e:
                logger.error(f"JSON parsing error: {e}, JSON string: {json_str}")
                raise ValueError(f"Invalid JSON: {e}")
                
        except Exception as e:
            logger.error(f"Error suggesting field mappings: {e}")
            
            # Fallback to simple matching
            logger.info("Falling back to simple field name matching")
            return {field: field if field in target_schema else None for field in source_fields} 