# Real-Time Chat Application

A modern, feature-rich chat application built with React and TypeScript, featuring real-time messaging capabilities and an enhanced user experience.

## Features

- 💬 Real-time messaging with WebSocket
- 👥 Group chat management
- 📎 File sharing support
- 🎤 Voice message recording and playback
- 🔍 Advanced message search
- 🎨 Modern UI with Shadcn components
- 🌙 Dark/Light theme support
- 📱 Mobile-responsive design
- 💡 Intelligent message suggestions
- 🔒 Modern authentication system

## Tech Stack

- **Frontend**: React with TypeScript
- **UI Components**: Shadcn UI
- **Styling**: Tailwind CSS
- **Real-time Communication**: WebSocket
- **State Management**: Zustand
- **Form Handling**: React Hook Form
- **API Client**: TanStack Query

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/MahmoudElhefnawyy/Real-Time-Chat-Application--React-Next-.git
   cd Real-Time-Chat-Application--React-Next-
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your environment variables:
   ```
   # Required for WebSocket connection
   VITE_WEBSOCKET_API_KEY=your_websocket_api_key
   VITE_API_URL=your_api_url

   # Optional - Override WebSocket URL (development only)
   VITE_WEBSOCKET_URL=ws://0.0.0.0:5000/ws
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5000](http://localhost:5000) in your browser.

## Environment Setup

The application requires the following environment variables:

- `VITE_WEBSOCKET_API_KEY`: API key for WebSocket authentication in production
- `VITE_API_URL`: Backend API URL for WebSocket connection in production
- `VITE_WEBSOCKET_URL`: (Optional) Override WebSocket URL for development

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. The built files will be in the `dist` directory, ready for deployment.

3. For deployment, ensure you set the required environment variables in your hosting platform.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.