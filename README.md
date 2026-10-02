# Rungika - Remittance Application

## Description

This project consists of a frontend and backend application for a remittance platform.

## Running the Application

### Email configuration

Set this environment variable before running the backend:

```bash
export RESEND_API_KEY=your_resend_api_key
```

Optionally set the sender address used by the application:

```bash
export RESEND_FROM_EMAIL=hello@yourdomain.com
```

### Frontend

```bash
cd frontend
npm ci
npm start
```

### Backend

```bash
cd backend
gradle bootRun
.\gradlew.bat bootRun
```

## Used Third-party Tools

- Stripe
- exchangerate-api.com
- resend.com
