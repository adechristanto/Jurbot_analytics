# Chat Dashboard

A modern, responsive dashboard for managing and analyzing chat conversations. Built with Next.js 14, TypeScript, and SQLite.

## Features

### Authentication & User Management
- Secure login system with role-based access control (Admin/User roles)
- User management interface for administrators
- Password hashing using bcrypt
- Cookie-based authentication with middleware protection

### Chat Management
- Real-time chat session viewing
- Message history with timestamps
- Conversation grouping by session ID
- Support for both AI and human messages

### Analytics Dashboard
- Message distribution visualization (AI vs Human messages)
- Timeline analysis of chat activity
- Message volume trends
- Interactive filters and sorting options

### Admin Features
- User management (Create, Delete, Reset Password)
- Role assignment (Admin/User)
- System settings configuration
- Webhook URL management for data integration

### Modern UI/UX
- Clean, responsive design using Tailwind CSS
- Dark/Light theme support
- Loading states and error handling
- Mobile-friendly interface

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, DaisyUI
- **Database**: SQLite
- **Authentication**: Custom auth with bcrypt
- **State Management**: React Context
- **Data Visualization**: Chart.js, react-chartjs-2
- **API**: Next.js API Routes
- **Cookie Management**: js-cookie

## Getting Started

### Prerequisites

- Node.js 18+ 
- Yarn package manager
- SQLite3

## Installation

### Option 1: Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/chat-dashboard.git
   cd chat-dashboard
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Create the database and admin user:
   ```bash
   mkdir -p data
   node scripts/create-admin.js
   ```

4. Start the development server:
   ```bash
   yarn dev
   ```

### Option 2: Docker Deployment

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/chat-dashboard.git
   cd chat-dashboard
   ```

2. Create a `.env` file for Docker:
   ```bash
   cp .env.local .env
   ```

3. Build and start the container:
   ```bash
   docker-compose up -d
   ```

4. View logs (optional):
   ```bash
   docker-compose logs -f
   ```

The application will be available at http://localhost:3000

### Docker Commands

- Start the application: `docker-compose up -d`
- Stop the application: `docker-compose down`
- View logs: `docker-compose logs -f`
- Rebuild the container: `docker-compose up -d --build`
- Remove volumes: `docker-compose down -v`

### Production Deployment

For production deployment, make sure to:

1. Set a strong `NEXTAUTH_SECRET` in your environment
2. Configure your webhook URL through `NEXT_PUBLIC_DEFAULT_WEBHOOK_URL`
3. Update `NEXTAUTH_URL` to match your domain
4. Use proper SSL/TLS termination
5. Consider using a reverse proxy (e.g., Nginx)

Example production docker-compose command:
```bash
NEXTAUTH_URL=https://your-domain.com \
NEXTAUTH_SECRET=your-secure-secret \
NEXT_PUBLIC_DEFAULT_WEBHOOK_URL=https://your-webhook-url \
docker-compose up -d
```

## Project Structure

```
chat-dashboard/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── contexts/         # React contexts
│   ├── lib/             # Utility functions and database
│   └── types/           # TypeScript type definitions
├── public/              # Static assets
├── scripts/            # Utility scripts
└── data/              # SQLite database
```

## API Routes

- `POST /api/auth/login` - User authentication
- `GET /api/users` - List all users (admin only)
- `POST /api/users` - Create new user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)
- `POST /api/users/:id/reset-password` - Reset user password (admin only)
- `GET /api/chat-sessions` - Get chat sessions
- `GET /api/settings` - Get system settings
- `POST /api/settings` - Update system settings (admin only)

## Security

- All passwords are hashed using bcrypt
- Protected routes using Next.js middleware
- Role-based access control
- Cookie-based authentication
- SQL injection protection through parameterized queries

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the styling system
- DaisyUI for the component library
- Chart.js for data visualization

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.
