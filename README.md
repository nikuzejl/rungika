# Rungika - Remittance Application

## Description

This project consists of a frontend and backend application for a remittance platform.

## Running the Application
### Frontend

```bash
cd frontend
ng serve
```

### Backend

```bash
cd backend
mvn spring-boot:run
```

## Build and Deployment
### Frontend
- `cd frontend`  
- `ng build --configuration production`  
- Upload `fronted/dist` files to https://app.netlify.com/projects/rungika/overview

### Backend
- Push the `main` branch to the remote Git repository  
- The application will be automatically deployed a few minutes later. Check status on https://dashboard.render.com/

TO-DO:
- make sure emails and phone used once
- mange account: change name and phone
- delete account
- change email and reset password
- Token timoeout-say logged in after page refresh
- transaction history
- transaction tracking


