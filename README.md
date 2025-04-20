# Birthday Reminder App

A professional Node.js/Express backend application that automatically sends birthday emails to your customers. This application helps businesses automate their customer engagement by sending personalized birthday wishes via email, without the need to manually check spreadsheets or databases.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Node Version](https://img.shields.io/badge/node-18.x-green.svg)
![MongoDB](https://img.shields.io/badge/mongodb-5.x-green.svg)
![Express](https://img.shields.io/badge/express-4.18.x-green.svg)

## Features

- **Customer Management**: Easily add, update, and remove customer information
- **Automated Birthday Emails**: Sends personalized emails automatically on customer birthdays
- **Scheduled Processing**: Cron job runs daily at 7am to check for birthdays
- **Configurable Email Templates**: Customize birthday email content and styling
- **Test Functionality**: Test endpoints to verify email sending without waiting for actual birthdays
- **RESTful API**: Full API for integration with any frontend framework
- **MongoDB Integration**: Reliable database storage for customer information

## Tech Stack

- **Node.js**: JavaScript runtime for the backend
- **Express.js**: Web application framework for REST API
- **MongoDB**: NoSQL database for storing customer data
- **Mongoose**: ODM library for MongoDB and Node.js
- **Resend**: Email service for sending birthday emails
- **Node-cron**: Cron job scheduler for automated checks
- **ESM Modules**: Modern JavaScript modules (.mjs)

## Installation

1. Clone this repository

   ```bash
   git clone https://github.com/muhammadui/birthday-reminder.git
   cd birthday-reminder
   ```

2. Install dependencies

   ```bash
   pnpm install
   ```

3. Create a `.env` file in the root directory with the following variables:

   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/birthday-reminder
   RESEND_API_KEY=your_resend_api_key
   EMAIL_FROM=birthday@yourbusiness.com
   CRON_TIMEZONE=Africa/Lagos
   CRON_SCHEDULE=0 7 * * *
   CRON_BATCH_SIZE=50
   CRON_DELAY=1000
   ```

   > **Note**: You'll need to sign up for a Resend account to obtain an API key.  
   > If you're located in Nigeria, you'll need to change your location using a VPN or use Starlink.  
   > I recommend **Windscribe VPN**, as it offers a solid, no-nonsense free tier.

   > **🚨 🚔 ⚠️ Warning**: Using a VPN is illegal in some countries. Proceed at your own risk—I'm not responsible for any consequences.

4. Start the development server
   ```bash
   npm run dev
   ```

## API Endpoints

### User Management

| Method | Endpoint         | Description         |
| ------ | ---------------- | ------------------- |
| POST   | `/api/users`     | Add a new user      |
| GET    | `/api/users`     | Get all users       |
| GET    | `/api/users/:id` | Get a specific user |
| PUT    | `/api/users/:id` | Update a user       |
| DELETE | `/api/users/:id` | Delete a user       |

### Birthday Endpoints

| Method | Endpoint                         | Description                                       |
| ------ | -------------------------------- | ------------------------------------------------- |
| GET    | `/api/users/birthdays/today`     | Get users with birthdays today                    |
| POST   | `/api/users/test/email/:userId`  | Send test birthday email to a specific user       |
| POST   | `/api/users/test/simulate-today` | Simulate sending birthday emails to up to 5 users |

## Cron Job Configuration

The application uses a cron job to check for birthdays and send emails automatically.

- **Default Schedule**: Every day at 7:00 AM (`0 7 * * *`)
- **Timezone**: Configurable via `CRON_TIMEZONE` environment variable
- **Batch Processing**: Processes emails in batches to avoid overwhelming the mail server
- **Rate Limiting**: Adds configurable delays between emails

You can customize these settings in the `.env` file:

```
CRON_TIMEZONE=America/New_York  # Set your local timezone
CRON_SCHEDULE=0 7 * * *         # Standard cron format
CRON_BATCH_SIZE=50              # Number of emails per batch
CRON_DELAY=1000                 # Milliseconds between emails
```

## Frontend Integration

This application provides a REST API that can be easily integrated with any frontend framework. Here's a basic example using React:

```javascript
// Example: Fetch users with birthdays today
const fetchTodaysBirthdays = async () => {
  try {
    const response = await fetch(
      "http://localhost:5001/api/users/birthdays/today"
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching today's birthdays:", error);
    throw error;
  }
};

// Example: Add a new user
const addUser = async (userData) => {
  try {
    const response = await fetch("http://localhost:5001/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
};
```

## Testing

You can test the email functionality without waiting for actual birthdays:

1. Add a test user to the database
2. Send a test email using the `/api/users/test/email/:userId` endpoint
3. Verify that the email is received correctly

Alternatively, use the `/api/users/test/simulate-today` endpoint to simulate sending birthday emails to multiple users.

## Deployment

This application can be deployed to any Node.js hosting platform. Here are some recommendations:

- [Render](https://render.com)

Remember to set up the required environment variables in your production environment.

## Future Improvements

- Add authentication and authorization
- Implement email template customization via admin panel
- Add logging and monitoring for email delivery
- Create custom email templates for different occasions
- Add SMS integration for alternative notification methods

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
