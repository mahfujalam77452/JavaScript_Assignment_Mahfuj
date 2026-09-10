# Golf Club Booking App

A simple golf club booking page built with HTML, CSS, JavaScript, and Express.js.

## Requirements

- Node.js and npm
- A Google Maps JavaScript API key

## Run the Project

1. Clone or download this repository.

2. Open a terminal in the project folder:

```bash
cd JavaScript_Assignment
```

3. Install the dependencies:

```bash
npm install
```

4. Create a file named `.env` in the project root. Add your Google Maps API key:

```env
GOOGLE_MAP_API_KEY=your_google_maps_api_key_here
```

Do not add your real API key to GitHub. The `.env` file is already included in `.gitignore`.

5. Start the server:

```bash
npm start OR  npm run dev
```

6. Open this address in your browser:

```text
http://localhost:3000
```

## Development Mode

To restart the server automatically after code changes, run:

```bash
npm run dev
```

## Google Maps API Key

In Google Cloud Console, enable the **Maps JavaScript API** and restrict the key to your allowed website or `localhost:3000` while testing.

The application loads the key through the backend route `/api/maps-key`. The key is not written directly in the frontend HTML or JavaScript files.
