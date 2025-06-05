# LeadGenie Frontend

A modern React application for AI-powered lead qualification.

## Features

- 🎨 Modern UI with dark/light mode
- 📱 Responsive design
- 🚀 Fast performance with Vite
- 🎯 Form validation with React Hook Form
- 📊 Real-time lead scoring
- 🔒 Secure authentication
- 📈 Analytics dashboard

## Tech Stack

- React 18+
- Vite
- Tailwind CSS
- Zustand
- React Router v6
- React Hook Form + Zod
- Axios
- Framer Motion
- Lucide Icons

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/leadgenie.git
cd leadgenie/frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:8000
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run storybook` - Start Storybook

### Project Structure

```
src/
├── components/     # Reusable components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── services/      # API services
├── stores/        # Zustand stores
├── utils/         # Utility functions
└── types/         # TypeScript definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 