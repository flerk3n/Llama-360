# Llama 360 Banking Data Product Builder


live at : https://llama-360.vercel.app/

Llama 360 is a modern web application featuring a dark theme with glassmorphism effects, designed for retail banking data product generation. It provides an intuitive interface for:

1. Describing banking business use cases in natural language
2. Generating synthetic banking data
3. Processing customer data through AI-powered pipelines
4. Generating reports and exports

## Key Features

- **Dark Theme UI with Glassmorphism**: Modern, visually appealing interface with glass-like effects
- **KYC Integration**: Support for Know Your Customer (KYC) use cases and compliance workflows
- **Input Validation**: Smart validation of banking-related use cases with helpful suggestions
- **Dual LLM Architecture**: 
  - **Gemma 2B**: Powers use case interpretation and analysis
  - **Phi-3 Mini**: Handles field mapping and data processing tasks
- **Multi-step workflow**: Intuitive step-by-step process for data product generation
- **Google Authentication**: Secure sign-in with profile integration

## Architecture

The application consists of two main components:

### 1. React Frontend (llama-web)
- Modern UI built with React and Tailwind CSS
- Glassmorphism design elements throughout
- User authentication with Firebase Google Sign-in
- Interactive multi-step workflow
- Responsive design for desktop and mobile

### 2. Flask Backend
- API endpoints for data product operations
- Integration with Gemma 2B for LLM capabilities
- Validation and processing of banking-specific data

## Prerequisites

- Node.js 14+
- Python 3.8+
- Firebase account (for authentication)
- Ollama (for LLM integration)

## Setup Instructions

### 1. Install Dependencies

```bash
# Install Python dependencies
pip install flask flask-cors requests firebase-admin

# Install frontend dependencies
cd llama-web
npm install
cd ..
```

### 2. Configure Firebase

1. Create a project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Google Authentication
3. Update the Firebase configuration in `src/auth/firebaseConfig.js`

### 3. Set Up Ollama

Ensure Ollama is installed and the required models are available:

```bash
# Install Ollama from https://ollama.com/
# Pull both required models
ollama pull gemma2:2b    # Used for use case interpretation
ollama pull phi3:mini    # Used for data mapping and processing
```

### 4. Start the Backend Server

```bash
python web.py
```

The Flask server will run on http://localhost:5000.

### 5. Start the Frontend Development Server

```bash
cd llama-web
npm run dev
```

The React app will run on http://localhost:3000.

## Usage Guide

1. Sign in with Google credentials
2. From the home screen, click "Launch the Data Builder"
3. Follow the intuitive workflow:

### Step 1: Describe Your Banking Use Case
- Enter your banking scenario using industry-specific terminology
- Choose from predefined examples like KYC Onboarding, Personalized Loans, or Fraud Detection
- System validates input for banking-specific keywords
- AI interprets your use case and identifies the appropriate data product

### Step 2: Generate Test Data
- Review generated synthetic data
- Select a customer ID for further processing

### Step 3: Process Data
- Review data processing results including field mapping and ingestion status
- Check compliance and certification reports
- Choose to generate detailed reports

### Step 4: Access Reports
- Download reports in JSON or CSV format
- Start a new analysis or close the builder

## Project Structure

The project follows a clean, modular structure with clear separation between frontend and backend components:

```
/
├── llama-web/                        # React frontend
│   ├── public/                       # Static assets
│   │   ├── images/                   # Logo and image assets
│   │   │   ├── lamalogo.png          # Application logo (navbar)
│   │   │   └── logohome.png          # Home page logo
│   │   └── favicon.svg               # Browser tab icon
│   ├── src/                          # Source code
│   │   ├── components/               # Reusable UI components
│   │   │   ├── BlogGrid.jsx          # Blog content display
│   │   │   ├── ContactCard.jsx       # Contact information component
│   │   │   ├── DataBuilder.jsx       # Main data product builder interface
│   │   │   ├── Navbar.jsx            # Navigation header with authentication
│   │   │   ├── TestimonialCarousel.jsx # User testimonials slider
│   │   │   └── VideoGrid.jsx         # Video content display
│   │   ├── pages/                    # Main application pages
│   │   │   ├── Login.jsx             # Google authentication page
│   │   │   └── Welcome.jsx           # Home page with main components
│   │   ├── services/                 # API and service integrations
│   │   │   └── DataBuilderService.js # Backend API communication
│   │   ├── auth/                     # Authentication
│   │   │   └── firebaseConfig.js     # Firebase configuration for Google auth
│   │   ├── App.jsx                   # Main application component
│   │   ├── main.jsx                  # Application entry point
│   │   └── index.css                 # Global styles and Tailwind imports
│   ├── index.html                    # HTML entry point
│   ├── package.json                  # Frontend dependencies
│   ├── tailwind.config.js            # Tailwind CSS configuration
│   └── vite.config.js                # Vite bundler configuration
├── reports/                          # Generated reports
│   ├── customer_360_*.csv            # Customer 360 reports (CSV format)
│   ├── customer_360_*.json           # Customer 360 reports (JSON format)
│   ├── loan_eligibility_*.csv        # Loan eligibility reports (CSV)
│   ├── loan_eligibility_*.json       # Loan eligibility reports (JSON)
│   ├── fraud_detection_*.csv         # Fraud detection reports (CSV)
│   └── fraud_detection_*.json        # Fraud detection reports (JSON)
├── web.py                            # Flask backend server
├── ollama_client.py                  # Ollama LLM integration
├── setup_ollama.py                   # Ollama setup utilities
└── README.md                         # Project documentation
```

### Frontend Architecture

The React frontend is built with a component-based architecture using modern practices:

- **Component Structure**: 
  - `Navbar.jsx`: Provides authentication status and navigation
  - `DataBuilder.jsx`: Multi-step wizard for data product creation
  - `BlogGrid.jsx`, `TestimonialCarousel.jsx`: Content display components
  - `ContactCard.jsx`: Contact information with social links

- **Page Structure**:
  - `Login.jsx`: Google authentication implementation
  - `Welcome.jsx`: Main dashboard with content and DataBuilder access

- **State Management**:
  - React hooks for local component state
  - Props for component communication
  - Service pattern for API communication

- **Styling**:
  - Tailwind CSS for utility-first styling
  - Custom glassmorphism effects via CSS classes
  - Dark theme implementation

### Backend Architecture

The Python Flask backend provides API endpoints for data processing:

- **API Endpoints**:
  - `/api/health`: Backend health check
  - `/api/interpret`: Use case interpretation with Gemma 2B
  - `/api/generate`: Data generation for selected products
  - `/api/process`: Data processing for customer information
  - `/api/reports`: Report generation and export

- **Dual LLM Integration**:
  - **Gemma 2B**: Primary model for natural language understanding
    - Analyzes banking use cases to identify appropriate data products
    - Provides reasoning and confidence scores for decisions
    - Higher accuracy for domain-specific banking terminology
  - **Phi-3 Mini**: Specialized model for data operations
    - Maps source fields to target schemas
    - Processes structured data for banking analysis
    - Optimized for efficiency in data processing tasks

## Development Notes

- The application features a consistent dark theme with glassmorphism effects
- Input validation ensures banking-specific use cases
- Predefined use case examples help users get started quickly
- All client-server communication is handled asynchronously
- The UI provides clear feedback during processing steps

## Troubleshooting

### Authentication Issues
- Check Firebase Console for authentication errors
- Ensure proper scopes are requested for Google profile photos
- Verify Firebase configuration in the frontend

### Backend Connection Issues
- Make sure the Flask server is running on port 5000
- Check console for CORS or network-related errors
- Verify that required models are available in Ollama

### UI Display Issues
- Clear browser cache and reload
- Check console for any JavaScript errors
- Ensure all required assets are loading correctly 

## Environment Variables & Security

The project uses environment variables to securely manage sensitive configuration like API keys and secrets. This approach keeps private information out of version control.

### Frontend Environment Variables

For the React frontend, Vite uses the `.env` file format with the `VITE_` prefix for all environment variables that should be exposed to the client-side code.

1. Copy the example file to create your own:
```bash
cd llama-web
cp .env.example .env
```

2. Edit the `.env` file to add your own Firebase and Google API credentials.

3. Variables used in the frontend (`llama-web/.env`):
```bash
# Required for Firebase Authentication
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Required for Google API integration
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_API_KEY=your_google_api_key

# Backend API URL
VITE_API_URL=http://localhost:5000/api
```

### Backend Environment Variables

For the Flask backend, create a `.env` file in the root directory:

1. Copy the example file:
```bash
cp .env.example .env
```

2. Edit with your own values:
```
# Flask configuration
FLASK_SECRET_KEY=your_random_secure_key
FLASK_ENV=development

# Ollama configuration
OLLAMA_API_URL=http://localhost:11434/api

# LLM Models configuration 
GEMMA_MODEL=gemma2:2b
PHI_MODEL=phi3:mini

# Additional Backend Security
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Environment Variable Usage

The project accesses these environment variables in the following ways:

1. **Frontend (React/Vite)**: 
   - Environment variables are accessed via `import.meta.env.VITE_VARIABLE_NAME`
   - Located in `src/auth/firebaseConfig.js` for Firebase configuration

2. **Backend (Flask)**:
   - Environment variables are loaded using python-dotenv
   - Accessed via `os.getenv('VARIABLE_NAME', 'default_value')`
   - Located in `web.py` for Flask configuration

### Security Best Practices

1. **Never commit `.env` files to version control**
   - The `.gitignore` file is configured to exclude `.env` files
   - Only commit `.env.example` files with placeholder values

2. **Use environment-specific variables**
   - Development: `.env.development` 
   - Production: `.env.production`

3. **Rotate API keys regularly**
   - Update keys if you suspect they've been compromised
   - Avoid using production keys in development environments

4. **Restrict API key usage**
   - Set up proper API restrictions in Google Cloud Console
   - Configure Firebase Security Rules
   - Use API key restrictions by HTTP referrer 
