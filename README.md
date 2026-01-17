# 🏆 Rishihood University Sports Fest Platform

A modern, full-stack sports event registration platform built with Next.js 14, featuring a Gen-Z focused dark UI, real-time slot management, and integrated Razorpay payments.

## ✨ Features

### For Participants
- 🎯 Browse and filter sports events
- 📝 Multi-step registration with team management
- 💳 Secure Razorpay payment integration
- 📊 Personal dashboard to track registrations

### For Admins
- 📈 Real-time analytics dashboard
- 🎮 Sport management (CRUD operations)
- 🏫 College management
- 📋 Registration management with status updates
- 📥 Export registrations to CSV
- 💰 Revenue tracking

### Technical Features
- 🌙 Dark theme with Gen-Z focused UI
- 🎬 Framer Motion & GSAP animations
- 📱 Fully responsive design
- 🔐 NextAuth authentication (Google + Credentials)
- 💾 PostgreSQL database with Prisma ORM

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or SQLite for development)
- Razorpay account (for payments)

### Installation

1. **Clone and install dependencies**
```bash
cd sports-fest
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your actual values
```

3. **Set up the database**
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

4. **Start the development server**
```bash
npm run dev
```

5. **Open http://localhost:3000**

## 🔧 Environment Variables

See `.env.example` for complete configuration. Key variables:

### Required
- `DATABASE_URL` - Database connection string
- `NEXTAUTH_SECRET` - Authentication secret (min 32 chars)
- `NEXTAUTH_URL` - Application URL
- `RAZORPAY_KEY_ID` - Razorpay API key
- `RAZORPAY_KEY_SECRET` - Razorpay secret key

### Google OAuth (Optional)
- `GOOGLE_CLIENT_ID` - Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth Client Secret

**Setup Guide:** See `GOOGLE_AUTH_SETUP.md` for detailed instructions

### Optional
- `SMTP_*` - Email configuration
- `AWS_*` / `CLOUDINARY_*` - File storage
- `SENTRY_DSN` - Error tracking

## 📁 Project Structure

```
sports-fest/
├── src/
│   ├── app/
│   │   ├── api/           # API routes (20+ endpoints)
│   │   │   ├── admin/     # Admin API
│   │   │   ├── auth/      # Auth API
│   │   │   ├── colleges/  # College API
│   │   │   ├── payments/  # Payment API
│   │   │   ├── registrations/  # Registration API
│   │   │   ├── sports/    # Sport API
│   │   │   └── webhooks/  # Webhook handlers
│   │   ├── admin/         # Admin dashboard
│   │   ├── auth/          # Auth pages
│   │   ├── dashboard/     # User dashboard
│   │   ├── register/      # Registration flow
│   │   ├── sports/        # Sports listing & details
│   │   └── page.tsx       # Landing page
│   ├── components/
│   │   ├── home/          # Landing page sections
│   │   ├── layout/        # Navbar, Footer
│   │   ├── providers/     # Context providers
│   │   └── ui/            # Reusable UI components
│   ├── lib/               # Utilities
│   │   ├── auth.ts        # NextAuth config
│   │   ├── db.ts          # Prisma client
│   │   ├── razorpay.ts    # Payment integration
│   │   ├── security.ts    # Validation & sanitization
│   │   └── utils.ts       # Helper functions
│   └── types/             # TypeScript definitions
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── public/
│   └── images/            # Static assets
└── scripts/
    └── verify.ts          # Verification script
```

## 🎨 Design System

### Colors
- **Accent Primary**: `#FF4500` (Orange Red)
- **Background**: `#0A0A0A`
- **Card Background**: `#1A1A1A`
- **Text Primary**: `#FFFFFF`
- **Text Secondary**: `#A0A0A0`

### Typography
- **Display Font**: Anton (headings)
- **Body Font**: Inter (UI text)

### Components
- Buttons, Cards, Inputs, Selects, Modals, Accordions, Badges, Progress bars

## 🔒 Test Accounts (after seeding)

### Admin User
- **Email**: admin@sportsfest.com
- **Password**: admin123
- **Role**: ADMIN

### Participant User
- **Email**: participant@test.com
- **Password**: test123
- **Role**: PARTICIPANT
- **Phone**: 9876543210

## 📊 Database Commands

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database with sample data
npm run db:seed

# Open Prisma Studio (GUI)
npm run db:studio

# Reset database (⚠️ deletes all data)
npx prisma db reset
```

## 🧪 Testing

### Automated Tests
```bash
# Run registration flow tests
node test_registration_flow.js
```

### Manual Testing Checklist
- [ ] User registration flow
- [ ] Sport detail page loads
- [ ] Team member management
- [ ] Form validation
- [ ] Payment integration (requires Razorpay)
- [ ] Admin dashboard access
- [ ] Export functionality
- [ ] Mobile responsiveness

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Docker (Optional)
```dockerfile
# See docker-compose.yml for example
```

## 📝 API Documentation

### Public Endpoints
- `GET /api/sports` - List all sports
- `GET /api/sports/[slug]` - Get sport details
- `GET /api/colleges` - List colleges

### Protected Endpoints
- `POST /api/registrations` - Create registration
- `GET /api/registrations` - Get user registrations
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment

### Admin Endpoints
- `GET /api/admin/sports` - List sports (admin)
- `POST /api/admin/sports` - Create sport (admin)
- `GET /api/admin/registrations` - List all registrations (admin)
- `GET /api/admin/stats` - Get statistics (admin)
- `GET /api/admin/export` - Export data (admin)

## 🔐 Security Features

- ✅ Input sanitization (XSS prevention)
- ✅ SQL injection prevention (Prisma)
- ✅ CSRF protection (NextAuth)
- ✅ Rate limiting (recommended)
- ✅ Password hashing (bcryptjs)
- ✅ Email validation
- ✅ Phone number validation (Indian format)
- ✅ Transaction safety (optimistic locking)

## 🎯 Registration Flow

1. **Browse Sports** → User views available sports
2. **Select Sport** → View sport details and rules
3. **Sign In** → Authentication required
4. **Fill Form** → Personal info + team details (if team sport)
5. **Review** → Verify all information
6. **Payment** → Razorpay checkout
7. **Confirmation** → Registration confirmed, slot reserved

## 💰 Payment Integration

### Razorpay Setup
1. Create account at [razorpay.com](https://razorpay.com)
2. Get API keys from Dashboard → Settings → API Keys
3. Configure webhooks for payment verification
4. Add keys to `.env` file

### Payment Flow
1. Registration creates pending status
2. Razorpay order generated
3. User completes payment
4. Webhook verifies payment
5. Registration status updated to CONFIRMED

## 📈 Analytics & Monitoring

### Built-in Features
- Registration counts by sport
- Revenue tracking
- Slot utilization
- User activity

### Recommended Tools
- **Sentry** - Error tracking
- **Vercel Analytics** - Performance monitoring
- **Google Analytics** - User behavior

## 🛠️ Troubleshooting

### Common Issues

**Database connection failed**
```bash
# Check DATABASE_URL format
# For SQLite: file:./prisma/dev.db
# For PostgreSQL: postgresql://user:pass@host:port/db
```

**Authentication errors**
```bash
# Ensure NEXTAUTH_SECRET is set (min 32 chars)
# Verify NEXTAUTH_URL matches your domain
```

**Payment failures**
```bash
# Check Razorpay credentials
# Ensure account is activated
# Verify amount is in paise (₹1 = 100 paise)
```

**Build errors**
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth Documentation](https://next-auth.js.org)
- [Razorpay Documentation](https://razorpay.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Built with Next.js 14
- Styled with Tailwind CSS
- Animations by Framer Motion & GSAP
- Icons by Lucide React
- Database by Prisma

---

**Built with ❤️ for Rishihood University Sports Fest 2026**
