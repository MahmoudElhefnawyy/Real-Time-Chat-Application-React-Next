# Real-Time Chat Application

A modern, feature-rich chat application built with **React**, **Next.js**, **TypeScript**, and **Tailwind CSS**, featuring real-time messaging capabilities and an enhanced user experience.

---

## **Features**

- **💬 Real-Time Messaging**: Instant messaging powered by WebSocket for seamless communication.
- **👥 Group Chat Management**: Create, join, and manage group chats with ease.
- **📎 File Sharing**: Share images, documents, and other files directly in the chat.
- **🎤 Voice Messages**: Record and send voice messages with playback functionality.
- **🔍 Advanced Message Search**: Quickly find messages with powerful search capabilities.
- **🎨 Modern UI**: Beautiful and intuitive interface built with **Shadcn UI** components.
- **🌙 Dark/Light Theme**: Switch between dark and light themes for a personalized experience.
- **📱 Mobile-Responsive Design**: Fully responsive design for seamless use on all devices.
- **💡 Intelligent Message Suggestions**: AI-powered suggestions for faster and smarter messaging.
- **🔒 Secure Authentication**: Modern authentication system for secure user access.

---

## **Tech Stack**

- **Frontend**: React with TypeScript
- **UI Components**: Shadcn UI
- **Styling**: Tailwind CSS
- **Real-Time Communication**: WebSocket
- **State Management**: Zustand
- **Form Handling**: React Hook Form
- **API Client**: TanStack Query

---

## **Getting Started**

1. **Clone the repository**:
   ```bash
   git clone https://github.com/MahmoudElhefnawyy/Real-Time-Chat-Application--React-Next-.git
   cd Real-Time-Chat-Application--React-Next-
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and add the following:
   ```env
   # Required for WebSocket connection
   VITE_WEBSOCKET_API_KEY=your_websocket_api_key
   VITE_API_URL=your_api_url

   # Optional - Override WebSocket URL (development only)
   VITE_WEBSOCKET_URL=ws://0.0.0.0:5000/ws
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open the application**:
   Visit `http://localhost:5000` in your browser.

---

## **Environment Setup**

The application requires the following environment variables:

- **`VITE_WEBSOCKET_API_KEY`**: API key for WebSocket authentication in production.
- **`VITE_API_URL`**: Backend API URL for WebSocket connection in production.
- **`VITE_WEBSOCKET_URL`**: (Optional) Override WebSocket URL for development.

---

## **Deployment**

1. **Build the application**:
   ```bash
   npm run build
   ```
   The built files will be in the `dist` directory, ready for deployment.

2. **Deploy**:
   Ensure the required environment variables are set in your hosting platform (e.g., Vercel, Netlify).

---

## **Project Structure**

```
├── src/
│   ├── components/       # Reusable UI components
│   ├── contexts/         # React Context providers
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and helpers
│   ├── pages/            # Application pages
│   ├── services/         # API and WebSocket services
│   ├── store/            # Zustand state management
│   └── styles/           # Tailwind CSS and custom styles
├── public/               # Static assets
└── .env                  # Environment variables
```

---

## **Key Components**

- **Real-Time Chat**: WebSocket-powered messaging for instant communication.
- **Group Chat Management**: Create and manage group chats with ease.
- **File Sharing**: Upload and share files directly in the chat.
- **Voice Messages**: Record and send voice messages with playback functionality.
- **Advanced Search**: Search through chat history with ease.
- **Modern UI**: Sleek and intuitive interface built with **Shadcn UI**.
- **Dark/Light Theme**: Toggle between themes for a personalized experience.

---

## **API Routes**

- **`GET /api/messages`**: Fetch chat messages.
- **`POST /api/messages`**: Send a new message.
- **`POST /api/upload`**: Upload files for sharing.
- **`GET /api/groups`**: Fetch group chat details.
- **`POST /api/groups`**: Create a new group chat.

---

## **Contributing**

Contributions are welcome! Please follow these steps:

1. **Fork the repository**.
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/my-feature
   ```
3. **Commit your changes**:
   ```bash
   git commit -am 'Add new feature'
   ```
4. **Push to the branch**:
   ```bash
   git push origin feature/my-feature
   ```
5. **Create a Pull Request**.

---

## **License**

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
