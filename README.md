
---

# ✨ Features

## ⚡ Request Builder

- Send **GET, POST, PUT, PATCH, DELETE**
- Query Params editor
- Headers editor
- Request Body editor
- `Ctrl + Enter` shortcut

---

## 🧠 Response Viewer

- JSON syntax highlighting
- Response status badge
- Response time
- Response headers
- Copy response button

---

## 🧪 Smart API Testing

Automatically tests all HTTP methods.

Example:


GET 200 OK 112ms
POST 401 98ms
PUT 404 105ms
PATCH 404 101ms
DELETE 405 94ms


---

## 🔎 Endpoint Discovery

Scans common API endpoints like:


/users
/login
/admin
/products
/health


Shows:

- Status code
- Response time
- Working endpoints

---

## 💾 Collections & History

- Save requests
- Request history
- Reload saved requests
- Clear history

All data stored in **localStorage**.

---

# 🛠 Tech Stack

## Frontend

- React
- Vite
- TailwindCSS
- Axios

## Backend

- Node.js
- Express
- CORS
- Axios

---

# 📦 Installation

## Clone repository

```bash
git clone https://github.com/BahaaAlazawwy/bema-Lightweight-API-Testing-Tool.git
cd bema-Lightweight-API-Testing-Tool
Install backend
cd backend
npm install
Install frontend
cd ../frontend
npm install
Run backend
npm run dev

Backend:

http://localhost:3001
Run frontend

Open second terminal:

cd frontend
npm run dev

Frontend:

http://localhost:5173
🧪 Example Usage

Send request

GET https://jsonplaceholder.typicode.com/posts/1

Smart Test

https://jsonplaceholder.typicode.com/posts

Endpoint Discovery

https://jsonplaceholder.typicode.com
🏗 Project Structure
bema
│
├ backend
│ ├ server.js
│ └ routes
│
├ frontend
│ ├ src
│ ├ components
│ └ hooks
│
└ README.md
🗺 Roadmap

Planned features:

Authentication helpers
Environment variables
Request chaining
Postman collection import
GraphQL support
WebSocket testing
Code generation
CLI testing mode
🤝 Contributing

1 Fork repository

2 Clone fork

git clone https://github.com/your-username/bema-Lightweight-API-Testing-Tool.git

3 Create branch

git checkout -b feature/new-feature

4 Commit

git commit -m "feat: add new feature"

5 Push

git push origin feature/new-feature
