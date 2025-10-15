You are an expert teaching assistant and developer. Your task is to produce a single, authoritative instruction file named instruction.md that precisely defines what must be implemented for CPAN 212 — Modern Web Technologies, Lab 3 (Express + React image handling). Use a structured “divide and conquer” approach with clear headings and actionable steps. After creating instruction.md, you must always refer to it in future interactions to avoid confusion or memory gaps.

Requirements for this prompt execution
- Create a file named instruction.md containing the full instructions described below. The content must be written in clear Markdown with headings, subheadings, checklists, and example snippets where useful.
- Structure the file using a divide-and-conquer approach so a student or developer can follow step-by-step, implement, test, and package the deliverable.
- Include explicit acceptance criteria and mapping to the rubric so each required feature is testable and graded.
- Provide sample endpoint signatures, expected responses, example React/Express code sketches, commands to run and debug, and exact screenshot requirements.
- After producing instruction.md, every subsequent response in this conversation must begin with a one-line reference: "REFERENCE: instruction.md" and then continue. This ensures the system always consults the file.

instruction.md: Required Content and Structure
(Produce all of the items below inside instruction.md. Use headings and lists; be explicit.)

1) Title and Context
- Title: CPAN 212 — Lab 3: Express + React Image Handling
- Course and lab brief summary (one paragraph): purpose, what the lab demonstrates (server-client interaction, image endpoints, React fetching and upload).

2) Goals (clear, measurable)
- Build on the Week 5 Express app and React client.
- Add an Express route that returns multiple images.
- Implement React UI to fetch and display multiple images.
- Add a React control to fetch a random dog image from https://dog.ceo/api/breeds/image/random and show it.
- Add a button to upload that dog image to the Express server (server should store/record it).
- Package all code in a zip and include screenshots for each endpoint and UI states.
- Map each goal to rubric points (see Rubric Mapping section).

3) Project starting assumptions
- The repository already contains a Week 5 Express server and a React client in two folders (e.g., server/ and client/). If not, include one-sentence instructions to create minimal skeletons.
- Node >= 14, npm or yarn available.

4) File structure and naming conventions (required)
- Root/
  - server/ (Express app)
    - package.json
    - routes/images.js
    - data/images.json (or an images/ directory if storing files)
  - client/ (React app built with CRA or Vite)
    - package.json
    - src/components/ImageGallery.jsx
    - src/components/RandomDog.jsx
  - instruction.md (this file)
  - submission.zip (final zipped project)
- Zip content requirements: include entire server/ and client/ directories, plus screenshots and a README with run instructions.

5) Backend (Express) — actionable tasks
- Create a route GET /api/images
  - Purpose: return an array of images (each as an object)
  - Response format (JSON): [{ id: "1", url: "http://...", source: "seed or uploaded", uploadedAt: "ISO-8601" }, ...]
  - Example response:
    {
      "images": [
        { "id": "1", "url": "/uploads/dog1.jpg", "source": "seed", "uploadedAt": "2025-01-01T12:00:00Z" },
        ...
      ]
    }
- Create a route POST /api/images
  - Accept either:
    - multipart/form-data with a file field (e.g., "image") OR
    - JSON with an image URL field (e.g., { "url": "https://..." }) — decide and document which approach you use.
  - On receiving an image URL, the server may:
    - download and store the image in server/uploads/ (preferred), or
    - store the URL in data/images.json (acceptable if you document it).
  - Response: 201 Created with the stored image object as JSON.
- (Optional) GET /api/images/:id — return a single image metadata or file.
- Implementation notes:
  - Use multer if accepting multipart uploads.
  - Ensure CORS is enabled for requests from the React client origin.
  - Provide seed data: populate data/images.json with at least 3 images (URLs or local files).

6) Frontend (React) — actionable tasks
- Implement a component ImageGallery that:
  - Fetches GET /api/images on mount.
  - Displays images in a grid with alt text and metadata (source, uploadedAt).
  - Handles loading and error states.
- Implement a component RandomDog that:
  - Has a button "Get Random Dog" that fetches https://dog.ceo/api/breeds/image/random and displays the image when received.
  - Shows the fetched image and a "Upload to Server" button.
  - On clicking "Upload to Server", sends the fetched image to the backend POST /api/images.
    - If the server requires a file upload, fetch the dog image as blob and post as multipart/form-data.
    - If the server accepts a URL, post the URL in JSON.
  - After successful upload, call GET /api/images to refresh the gallery (or update local state).
- UX notes:
  - Provide clear success/error notifications (toast or inline messages).
  - Disable buttons while async operations are in-progress.

7) Testing and verification steps (step-by-step)
- Backend smoke test commands:
  - Start server: cd server && npm install && npm start
  - Test endpoints with curl or HTTP client:
    - curl http://localhost:5000/api/images
    - curl -X POST http://localhost:5000/api/images -F "image=@path/to/file.jpg"
    - Or: curl -X POST -H "Content-Type: application/json" -d '{"url":"https://..."}' http://localhost:5000/api/images
- Frontend smoke test commands:
  - Start client: cd client && npm install && npm start
  - Open http://localhost:3000 and verify the gallery loads, random dog fetch works, upload works and updates gallery.
- Automated/manual test checklist to capture screenshots:
  - Screenshot 1: Response body of GET /api/images in Postman/Insomnia or curl output (show JSON).
  - Screenshot 2: React page showing initial gallery with seed images.
  - Screenshot 3: React page after clicking "Get Random Dog" showing the external dog image.
  - Screenshot 4: React page after clicking "Upload to Server" showing the uploaded dog in the gallery (or server response).
  - Screenshot 5: Server folder listing showing stored uploads (if storing files).
  - Screenshot 6: POST /api/images response in terminal or HTTP client showing 201 Created.
- Include the commands you ran and their output in a small log file (commands.txt) in the zip.

8) Submission packaging and README
- Create submission.zip containing:
  - server/, client/, instruction.md, screenshots/ (as listed above), README.txt (run instructions), commands.txt.
- README must include:
  - How to install and run server and client.
  - Port numbers used.
  - Any environment variables required.
  - How image uploads are handled (store file vs store URL).

9) Rubric mapping and acceptance criteria (explicit)
- Completed Express and React app from Week 5: 30 points
  - Acceptance: Project builds and both server/client start without errors. Provide screenshot of both running.
- Multiple image endpoint in Express: 20 points
  - Acceptance: GET /api/images returns at least 3 images in the specified JSON format. Provide curl/Postman screenshot.
- Display multiple images in React: 20 points
  - Acceptance: Gallery displays images from GET /api/images; show screenshot.
- Get random dog image in React and upload to Express: 30 points
  - Acceptance: Random dog fetch works; upload action results in a new entry in GET /api/images; show before/after screenshots and server response.
- Define what constitutes partial credit (for example, server accepts upload but stores only URL = partial; UI fetch works but upload fails = partial).

10) Example code snippets (concise)
- Example Express route skeletons (pseudocode; ensure to include CORS and multer notes).
- Example React fetch snippets for GET /api/images and posting a blob as multipart/form-data when uploading the dog image.
- Example curl commands for testing.

11) Common pitfalls & troubleshooting tips
- CORS issues — how to enable CORS on the Express server.
- Mixed-content errors when client served from http and dog.ceo is https (note appropriate handling).
- Cross-origin blob fetch and sending to server — include fetch -> response.blob() -> new FormData() approach.
- File permissions or folder not existing — ensure server creates uploads/ directory.
