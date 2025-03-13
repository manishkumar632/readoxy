# Readoxy

Readoxy is a comprehensive quiz and blog management platform with multiple user roles and features. The platform is built using the MERN stack (MongoDB, Express.js, React.js, Node.js) with a focus on security and user experience.

## Features

### User Management

- **Multi-level User System**
  - Super Admin: Highest level of access with complete system control
  - Admin: Manages quizzes and content
  - Regular Users: Access to quizzes and blog content

### Authentication & Security

- JWT-based authentication
- Password encryption using bcrypt
- Secure password reset system
- Email verification system
- Protected routes and middleware

### Quiz System

- **Daily Quiz Features**
  - Automated quiz generation
  - Random question selection
  - Quiz code generation system (changes hourly)
  - Score tracking and management
  - Restricted email access for specific quizzes

### Blog Management

- Blog creation and management
- Category-based organization
- Reading interface for users
- Rich text content support

### Profile Management

- Profile image upload using Cloudinary
- User information management
- Admin profile customization

### Email Integration

- Welcome emails for new users
- Password reset emails
- Quiz code distribution
- Email verification system

### File Management

- Image upload system with Multer
- Profile picture management
- File size and type restrictions
- Cloudinary integration for cloud storage

## Technical Stack

### Backend

- Node.js & Express.js
- MongoDB for database
- JWT for authentication
- Multer for file uploads
- Nodemailer for email services
- Cloudinary for image storage

### Frontend

- Next.js framework
- React.js components
- Responsive design
- Protected client-side routes

### Security Features

- CORS configuration
- Input validation
- File upload restrictions
- Secure password handling
- Token-based authentication

## Screenshots

# Super admin Login Page

![Msocio](https://github.com/manishkumar632/readoxy/blob/main/images/Screenshot1.png)

# Super admin Forget-Password page

![Msocio](https://github.com/manishkumar632/readoxy/blob/main/images/Screenshot2.png)

# Super admin Password Reset Email

![Msocio](https://github.com/manishkumar632/readoxy/blob/main/images/Screenshot3.png)

# Super admin Password Reset page

![Msocio](https://github.com/manishkumar632/readoxy/blob/main/images/Screenshot4.png)

# Super admin Dashboard

![Msocio](https://github.com/manishkumar632/readoxy/blob/main/images/Screenshot5.png)

# Super admin Admin Management.

![Msocio](https://github.com/manishkumar632/readoxy/blob/main/images/Screenshot6.png)

# Super admin Profile.

![Msocio](https://github.com/manishkumar632/readoxy/blob/main/images/Screenshot7.png)

# Admin Login Page

![Msocio](https://github.com/manishkumar632/readoxy/blob/main/images/Screenshot8.png)

# Admin Dashboard

![Msocio](https://github.com/manishkumar632/readoxy/blob/main/images/Screenshot9.png)

# Quiz Management Page

![Msocio](https://github.com/manishkumar632/readoxy/blob/main/images/Screenshot10.png)

# Daily Quiz Management

![Msocio](https://github.com/manishkumar632/readoxy/blob/main/images/Screenshot11.png)

# Restricted Email

This is designed to let access the daily set quiz to only those user who are in the restricted email list.
<br />
<br />
![Msocio](https://github.com/manishkumar632/readoxy/blob/main/images/Screenshot11.png)

# Landing Page

![Msocio](https://github.com/manishkumar632/readoxy/blob/main/images/Homepage.png)

# User Sign Up page

![Msocio](https://github.com/manishkumar632/readoxy/blob/main/images/Screenshot13.png)

# User Login page

![Msocio](https://github.com/manishkumar632/readoxy/blob/main/images/Screenshot14.png)

# Welcome Email

When user signup to "Readoxy" for the first time, user will receive a welcome email from readoxy.
<br /> <br />
![Msocio](https://github.com/manishkumar632/readoxy/blob/main/images/Screenshot15.png)

# Categories page

![Msocio](https://github.com/manishkumar632/readoxy/blob/main/images/CategoriesPage.png)

# Blog Reading Page

![Msocio](https://github.com/manishkumar632/readoxy/blob/main/images/blogpage.png)

## Getting Started

### Prerequisites

- Node.js
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies for backend:
   ```bash
   cd backend
   npm install
   ```
3. Install dependencies for frontend:
   ```bash
   cd frontend/readoxy
   npm install
   ```
4. Set up environment variables:
   - Create .env file in backend directory
   - Configure MongoDB connection
   - Set up JWT secret
   - Configure email service
   - Set up Cloudinary credentials

### Running the Application

1. Start backend server:
   ```bash
   cd backend
   npm start
   ```
2. Start frontend development server:
   ```bash
   cd frontend/readoxy
   npm run dev
   ```

## Configuration

### Environment Variables

- `PORT`: Server port number
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT token generation
- `EMAIL_SERVICE`: Email service configuration
- `CLOUDINARY_*`: Cloudinary credentials


