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
mvn spring-boot:run or .\gradlew.bat bootRun
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
- makestripe work
- mange account: change name and phone
- delete account
- remove hard-coded exchange rates
- update render env variable names
- make sure emails and phone used once
- change email and reset password
- Token timoeout-say logged in after page refresh
- transaction history
- transaction tracking
- mode for hardcoded rates
- restrict unnecessary "permitAll()" endpoints