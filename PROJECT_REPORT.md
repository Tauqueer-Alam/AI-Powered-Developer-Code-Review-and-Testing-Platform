# Project Report: CodeLens

## 1. Project Overview

CodeLens is an AI-assisted developer workspace designed to help programmers review code, generate tests, explain logic, detect bugs, estimate complexity, and measure code quality. The project combines a browser-based frontend with a Python FastAPI backend, creating a lightweight developer tooling experience that feels similar to an internal coding assistant.

The idea behind the project was to make AI-powered code analysis accessible to beginners and junior developers. Instead of making users interact with raw APIs or complicated tools, the app presents a clean interface where users can paste code, select an analysis action, and receive readable feedback.

## 2. Problem Statement

Developers often need help in several areas:

- understanding unfamiliar code
- spotting subtle logic errors
- writing test cases for new functions
- improving code quality and readability
- identifying complexity and performance issues

Many existing tools are either too technical, too expensive, or too complex for beginner-friendly workflows. CodeLens addresses this by creating a simple interface that provides practical and readable analysis without requiring deep setup knowledge.

## 3. Objectives

The main objectives of the project were:

- Build a frontend where users can write or paste code easily
- Create a backend API that handles analysis requests reliably
- Add support for review, explanation, test generation, and quality scoring
- Provide a fallback when external AI services are unavailable
- Implement a simple authentication flow for a real-world app feel
- Make the project ready for simple cloud deployment

## 4. Core Features

### Code review
The application can review a code snippet and provide feedback on:

- summary of the logic
- possible bugs and risks
- code quality concerns
- complexity and efficiency
- simple improvement suggestions

### Test generation
The backend can generate basic Python test cases for function-based snippets. This helps users understand how to validate their logic with assertions.

### Code explanation
The app explains code in beginner-friendly or technical style, turning complex logic into understandable language.

### Bug verification
This feature checks for common edge cases and likely logic issues, such as empty input, wrong initialization values, or risky assumptions.

### Static analysis
The system provides a lightweight analysis of structure, validation, and defensive coding patterns.

### Complexity analysis
The tool estimates time and space complexity based on the code structure and loops used.

### Optimization suggestions
The application identifies improvements such as better variable naming, better edge-case handling, or using more efficient patterns.

### Quality score
The project calculates a code quality score from 0 to 100 using a combination of structural clarity and defensive-programming signals.

### Authentication
The backend supports:

- user registration
- login
- standard JWT-based authentication using HS256
- token expiration through the JWT `exp` claim
- current user lookup

### Workspace experience
The frontend includes a project dashboard, review history, search filters, settings, and project navigation to simulate a real developer workspace.

## 5. Technical Architecture

The project uses a simple 2-layer architecture:

### Frontend
- HTML
- CSS
- JavaScript
- static browser experience
- interacts with backend APIs using fetch-based requests

### Backend
- Python
- FastAPI
- SQLAlchemy
- SQLite by default
- PostgreSQL support when configured
- environment-based configuration

### AI integration
- Gemini API is used when `GEMINI_API_KEY` is configured
- if the API is unavailable, the app falls back to local analysis logic

This fallback design is an important project strength because it keeps the app functional even without external services.

## 6. Project Workflow

The typical workflow is:

1. User opens the app in the browser
2. They paste or write Python code
3. They choose a feature like review, tests, explain, or bug check
4. The frontend sends a request to the FastAPI backend
5. The backend processes the request
6. The backend returns readable results to the frontend
7. The user reviews the feedback and improves the code

## 7. Data and Storage

The backend stores user information in a `users` table. The app supports both SQLite for local development and PostgreSQL for deployment.

Key user fields include:

- id
- name
- email
- password hash
- password salt
- created_at

Authentication uses hashed passwords and signed tokens to validate the user session.

## 8. Key Implementation Details

The backend is organized around route handlers in [backend/main.py](backend/main.py). Some of the main responsibilities include:

- database setup and migration checks
- password hashing and verification
- token creation and validation
- business logic for each analysis service
- CORS configuration for browser access
- structured API response models using Pydantic

The frontend in [index.html](index.html) and [script.js](script.js) manages:

- page views
- project navigation
- user session handling
- local storage for mock workspace data
- API requests to backend endpoints
- UI rendering of results

## 9. Technologies Used

### Backend stack
- Python
- FastAPI
- SQLAlchemy
- Pydantic
- Python-dotenv
- HTTPX
- Uvicorn
- PostgreSQL / SQLite support
- PyJWT for signed access tokens

### Frontend stack
- HTML
- CSS
- JavaScript
- local storage for state persistence

### Deployment stack
- Docker
- Render configuration
- static hosting setup via Vercel

## 10. Challenges Faced

A few important challenges during development were:

- making the app work without a third-party AI key
- balancing beginner usability with technical depth
- keeping local development simple while supporting cloud deployment
- designing safe authentication and token validation
- migrating from a custom signed token to a standard JWT format
- building useful fallback logic for cases where APIs fail

These challenges made the project a strong example of practical engineering thinking, not just a demo UI.

## 11. What I Learned

This project helped me strengthen several skills:

- backend API design with FastAPI
- handling authentication and secure password logic
- implementing JWT claims such as `sub`, `iat`, `exp`, and `jti`
- working with environment variables and configuration
- using SQLite and PostgreSQL patterns in a development workflow
- building a frontend that integrates with a backend service
- designing fallback logic for production-like applications
- creating a useful product from an AI-assisted workflow

## 12. Why This Project Is Strong for an Interview

This project demonstrates that I can build a full-stack application with:

- user-facing frontend work
- backend API design
- data handling and authentication
- integration with external AI services
- fallback logic and resilience
- deployment readiness
- practical product thinking

It is especially strong for interviews because it shows end-to-end product development from concept to deployment-conscious architecture.

## 13. Interview-Friendly Summary

I built CodeLens, an AI-powered developer code review platform that helps users review Python code, generate tests, explain logic, detect bugs, and measure code quality. The project uses a FastAPI backend for analysis logic and authentication, a static JavaScript frontend for the user experience, and a flexible architecture that supports both local development and cloud deployment. I focused on making the platform beginner-friendly while still showing real engineering value, including AI integration, secure auth, fallback logic, and deployment-ready configuration.

## 14. Future Improvements

Potential next steps include:

- support for multiple programming languages
- more advanced code analysis with better context awareness
- persistent user accounts on a production database
- rate limiting and security hardening
- code execution sandboxing for safer remote execution
- richer dashboards and analytics for review history

## Conclusion

CodeLens is a practical and well-rounded project that combines AI, backend engineering, frontend design, and product thinking. It is a strong portfolio project because it solves a meaningful developer problem while showing real implementation skills across the stack.
