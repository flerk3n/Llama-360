# Llama 360 Banking Data Product Builder

Llama 360 is a modern web application featuring a dark theme with glassmorphism effects, designed for retail banking data product generation. It provides an intuitive interface for:

1. Describing banking business use cases in natural language
2. Generating synthetic banking data
3. Processing customer data through AI-powered pipelines
4. Generating reports and exports

## Key Features

- **Dark Theme UI with Glassmorphism**: Modern, visually appealing interface with glass-like effects
- **KYC Integration**: Support for Know Your Customer (KYC) use cases and compliance workflows
- **Input Validation**: Smart validation of banking-related use cases with helpful suggestions
- **Gemma 2B Integration**: AI-powered interpretation of banking use cases
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
# Pull the required models
ollama pull gemma2:2b
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

- **Integration**:
  - Gemma 2B integration via Ollama for NLP tasks
  - Report generation for various banking use cases

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
