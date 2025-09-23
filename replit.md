# Overview

Omi AI is a Flask-based web application that serves as an intelligent AI assistant specializing in government contracting insights and general inquiries. The application combines AI-powered chat functionality with SAM.gov integration, document processing capabilities, and a curated AI tool hub. It features a tiered subscription model with free, pro, and premium plans, along with comprehensive user management and admin dashboard functionality.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Backend Architecture
- **Framework**: Flask with SQLAlchemy ORM using DeclarativeBase pattern
- **Database**: Configurable with SQLite fallback (designed for PostgreSQL deployment)
- **Authentication**: Flask-Login with session management and role-based access control
- **Application Factory Pattern**: Uses `create_app()` function for flexible configuration

## Frontend Architecture
- **Template Engine**: Jinja2 with Bootstrap 5 for responsive design
- **Theme System**: Dark/light theme support with CSS custom properties
- **JavaScript**: Vanilla JS with modular dashboard implementations
- **UI Components**: Custom dashboard cards, chat interface, and admin panels

## Data Storage Solutions
- **Primary Models**: User, Query, Document, AITool with comprehensive relationship mapping
- **User Management**: Activity tracking, subscription tiers, rate limiting, and admin privileges
- **Document Storage**: File upload handling with text extraction capabilities
- **Session Management**: Flask sessions with admin status tracking

## Authentication and Authorization
- **User Authentication**: Email/password with password hashing using Werkzeug
- **Role-Based Access**: Admin detection via email matching (andregreengp@gmail.com)
- **Rate Limiting**: Query count tracking with time-based resets for free tier users
- **Session Security**: Secret key configuration with environment variable support

## Service Layer Architecture
- **AI Service**: OpenAI integration with error handling and client initialization
- **SAM Service**: Government contracting data integration with caching and rate limiting
- **Document Service**: PDF/DOCX text extraction with secure file handling
- **Web Service**: URL processing and content extraction using trafilatura
- **Stripe Service**: Payment processing for subscription upgrades

## Database Schema Design
- **User Table**: Comprehensive user data with subscription tracking and activity metrics
- **Extensible Schema**: Migration scripts for adding columns without data loss
- **Relationship Management**: Proper foreign key relationships between users, queries, and documents

# External Dependencies

## Core Framework Dependencies
- **Flask**: Web framework with SQLAlchemy, Login, and core extensions
- **Database**: SQLAlchemy with PostgreSQL/SQLite compatibility
- **Authentication**: Werkzeug for password hashing and security utilities

## AI and Content Processing
- **OpenAI API**: GPT integration for chat functionality and AI responses
- **Document Processing**: PyPDF2 for PDF extraction, python-docx for Word documents
- **Web Scraping**: trafilatura and BeautifulSoup for content extraction
- **Content Rendering**: marked.js for markdown parsing in frontend

## Government Data Integration
- **SAM.gov API**: Federal contracting opportunities and solicitation data
- **Rate Limiting**: Custom caching implementation with LRU cache for API efficiency

## Payment Processing
- **Stripe**: Subscription management, payment intents, and webhook handling
- **Plan Management**: Three-tier system (free, pro, premium) with usage tracking

## Frontend Libraries
- **Bootstrap 5**: Responsive design framework with dark theme support
- **Font Awesome**: Icon library for UI components
- **Custom CSS**: Theme system with CSS custom properties for light/dark modes

## Development and Deployment
- **Environment Configuration**: Environment variable management for API keys and secrets
- **File Upload**: Secure file handling with magic library for type detection
- **Logging**: Comprehensive logging system for debugging and monitoring
- **Error Handling**: Graceful error handling with user-friendly error pages