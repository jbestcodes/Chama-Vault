# Chama Vault

Chama Vault is a secure, web-based savings tracker built for table banking groups (Chamas). It allows members to view their weekly savings, see group rankings anonymously in a visual bar graph, set personal milestones/goals and request their saving status via SMS.

## Features

- Secure member sign up and login
- Admin can add, edit, and delete members
- Admin can add, edit, and delete savings for any member
- Members can view their savings history and milestones
- Anonymous group leaderboard with masked names
- Visual savings progress with line graphs
- Admin-only dashboard with savings matrix and member management
- Member approval workflow (pending/approved/denied)
- Contact Us form (messages sent to admin email)

## coming soon
- Mpesa API intergration
- SMS-based self-service updates on savings (optional)
- Support for multiple groups and group management

## Technologies Used

### Backend
- Node.js
- Express
- MySQL (with mysql2)
- Dotenv for config
- Bcrypt for password hashing
- Nodemailer for email notifications

### Frontend
- React (with hooks)
- Axios for API requests
- Recharts for visual savings progress

## Getting Started

1. **Clone the repository**
2. **Install dependencies**  
   - Backend: `npm install` in the `Server` folder  
   - Frontend: `npm install` in the `frontend` folder
3. **Configure environment variables**  
   - Create a `.env` file in the backend with your DB and email credentials
4. **Run the backend**  
   - In the `Server` folder, run:  
     ```
     node index.js
     ```
5. **Run the frontend**  
   - In the `frontend` folder, run:  
     ```
     npm run dev
     ```

## Contact

For support, please reach out via the Contact Us form on the website or email the admin directly.
