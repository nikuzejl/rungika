# Rungika - Remittance Application

## Description

This project consists of a frontend and backend application for a remittance platform.

## Running the Application

### Email configuration

Email sending uses Resend only.

Set this environment variable before running the backend:

```bash
export RESEND_API_KEY=your_resend_api_key
```

Optionally set the sender address used by the application:

```bash
export RESEND_FROM_EMAIL=hello@yourdomain.com
```

### Frontend

- Run the following commands:  

```bash
cd frontend  
ng build --configuration production  
```

- Upload `/docs`  to https://app.netlify.com/projects/rungika/overview

### Backend

- Run the following commands:  

```bash
cd backend
gradle bootRun
.\gradlew.bat bootRun
```

- Push the `main` branch to the remote Git repository  
- The application will be automatically deployed a few minutes later. Check status on [https://dashboard.render.com/](https://dashboard.render.com/)

## Used Thrid-party Tools
- netlify.com
- render.com
- resend.com

## TO-DO

- Fix 401 on Stripe checkout
- Expiration of account creation and login tokens
- More details in "Your orders"  
- Manual handling of orders, updating status and send notifications
- Modular stragegy to manage currencies/countries and transfer methods
- Manage recipients of a logged in user
- Unit tests  
