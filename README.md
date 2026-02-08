# Skipli Coding Challenge - Employee Management App

This is a Full-stack Realtime Application built with **React, Node.js, Express, Firebase, and Socket.io**.

## Features
- **Authentication:** Login with Phone Number & OTP (Mocked).
- **Employee Management:** View, Add, Delete employees.
- **Realtime Chat:** Owner can chat with employees instantly using Socket.io.
- **Mock Services:** Simulates SMS OTP and Email Invites via Server Console.

## 🛠 Tech Stack
- **Frontend:** React (Vite), CSS.
- **Backend:** Node.js, Express.
- **Database:** Firebase Firestore.
- **Realtime:** Socket.io.

## Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/teo8877/Skipli_Chalenge
cd Skipli_Challenge
2. Setup Backend
Bash

cd server
npm install
# Note: You need 'serviceAccountKey.json' from Firebase to run this.
# Please place your own key or contact me for the key if needed.
node index.js
Server will run at: http://localhost:5000

3. Setup Frontend
Open a new terminal:

Bash

cd client
npm install
npm run dev
Client will run at: http://localhost:5173

How to Test (IMPORTANT)
Since I don't use paid services like Twilio, I have mocked the OTP and Email features:

Login:

Enter any Phone Number.

Check the Server Terminal/Console. You will see the OTP code (e.g., ⚠️ OTP CODE: 123456).

Enter that code to login.

Add Employee:

Fill in the form and click "Add".

Check the Server Terminal. You will see the "Mock Email Invite Link".
Screenshots
\screenshots\image_2.png
\screenshots\image.png
\screenshots\imagg_1.png