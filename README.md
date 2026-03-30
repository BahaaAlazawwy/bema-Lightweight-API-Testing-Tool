⚡ Bema

A fast and lightweight alternative to Postman for testing APIs.

[License: MIT] [React] [Vite] [TailwindCSS] [Node.js]

Bema is a modern, developer-focused API testing tool that runs entirely
in your browser.
Send requests, inspect responses, run automated multi-method tests, and
discover hidden endpoints — all without the bloat of heavy desktop
applications.

------------------------------------------------------------------------

🚀 Why Bema?

Most API tools today are heavy and slow.

Bema focuses on:

-   ⚡ Speed
-   🧠 Smart testing
-   🧩 Simplicity
-   🪶 Lightweight architecture

                       Bema      Postman
  -------------------- --------- --------------
  Startup time         Instant   5–15 seconds
  Install size         ~5 MB     ~250 MB
  Smart API Test       ✅        ❌
  Endpoint Discovery   ✅        ❌
  Open Source          ✅        ❌

------------------------------------------------------------------------

✨ Features

⚡ Request Builder

-   Send GET, POST, PUT, PATCH, DELETE
-   Query params editor
-   Headers editor
-   Request body editor
-   Keyboard shortcut Ctrl + Enter

------------------------------------------------------------------------

🧠 Response Viewer

-   JSON syntax highlighting
-   Response status badge
-   Response time
-   Response headers
-   Copy response button

------------------------------------------------------------------------

🧪 Smart API Testing

Automatically tests multiple HTTP methods at once.

Example result:

GET 200 OK 112ms POST 401 98ms PUT 404 105ms PATCH 404 101ms DELETE 405
94ms

------------------------------------------------------------------------

🔎 Endpoint Discovery

Automatically scans common API endpoints like:

/users /login /admin /products /health /status

Shows: - Status code - Response time - Working endpoints

------------------------------------------------------------------------

💾 Collections & History

-   Save requests
-   Request history
-   Reload saved requests
-   Clear history

All data saved in localStorage.

------------------------------------------------------------------------

🛠 Tech Stack

Frontend - React - Vite - TailwindCSS - Axios

Backend - Node.js - Express - Axios - CORS

------------------------------------------------------------------------

📦 Installation

1 Clone repository

git clone
https://github.com/BahaaAlazawwy/bema-Lightweight-API-Testing-Tool.git
cd bema-Lightweight-API-Testing-Tool

2 Install backend

cd backend npm install

3 Install frontend

cd ../frontend npm install

4 Start backend

cd backend npm run dev

Backend runs on: http://localhost:3001

5 Start frontend

cd frontend npm run dev

Frontend runs on: http://localhost:5173

6 Open the app in browser http://localhost:5173

------------------------------------------------------------------------

🧪 Example Usage

Send request: GET https://jsonplaceholder.typicode.com/posts/1

Smart Test: https://jsonplaceholder.typicode.com/posts

Endpoint Discovery: https://jsonplaceholder.typicode.com

------------------------------------------------------------------------

🏗 Project Structure

bema │ ├ backend │ ├ server.js │ └ routes │ ├ frontend │ ├ src │ ├
components │ └ hooks │ └ README.md

------------------------------------------------------------------------

🗺 Roadmap

Planned features:

-   Authentication helpers
-   Environment variables
-   Request chaining
-   Postman collection import
-   GraphQL support
-   WebSocket testing
-   Code generation
-   CLI testing mode

------------------------------------------------------------------------

🤝 Contributing

1 Fork the repository

2 Clone your fork git clone
https://github.com/your-username/bema-Lightweight-API-Testing-Tool.git

3 Create branch git checkout -b feature/new-feature

4 Commit changes git commit -m “feat: add new feature”

5 Push git push origin feature/new-feature

6 Open Pull Request

------------------------------------------------------------------------

📄 License

MIT License

------------------------------------------------------------------------

Built with ❤️ by developers.

⭐ Star the project if you like it.
