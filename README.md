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

- Push the `main` branch to the remote Git repository  
- The application will be automatically deployed a few minutes later. Check status on https://dashboard.render.com/

## Build and Deployment

### Frontend

- `cd frontend`  
- `ng build --configuration production`  
- Upload `fronted/dist` files to https://app.netlify.com/projects/rungika/overview

TO-DO: 

- update render env variable names
- order history
- test emails
- still need orderTrackingBaseUrl?
- create flag for hardcoded rates
- modular stragegy to manage currencies/countries and transfer methods
- restrict unnecessary "permitAll()" endpoints
- remove unnecessary space above "Sender details"
- create an admin page with a special route where admins can update manually orders. a newly created order in "PENDING" state, then after that it can be marked as COMPLETED OR FAILED. In each the admin can optioanlly add text to explain and a photo. When an order is upded, the send and recipeints should be receive emails
- Unit test