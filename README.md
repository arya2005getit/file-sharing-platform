# Secure File Sharing Application

A web application built with Node.js and Express.js that demonstrates server-side input validation, file upload handling, password-protected file access, MongoDB storage, and success/error feedback.

## Assignment Scope

This application demonstrates:

- Express.js routes for upload and download requests
- Server-side validation before processing form data
- Validation of required files, password length, file type, and file size
- Validation of MongoDB file IDs
- Password validation using bcrypt
- Appropriate success and error messages
- Testing using valid and invalid browser inputs

## Requirements

- Node.js 18 or newer
- MongoDB running locally or MongoDB Atlas
- npm

## Run Locally

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Copy `.env.example` to `.env`.

3. Configure MongoDB:

   ```env
   PORT=3000
   MONGO=mongodb://127.0.0.1:27017/file-sharing
   ```

   For MongoDB Atlas, replace the local URI with the Atlas connection string and keep the `file-sharing` database name.

4. Start the application:

   ```powershell
   npm start
   ```

5. Open:

   ```text
   http://localhost:3000
   ```

## Validations

| Input | Validation |
| --- | --- |
| Selected file | File must be selected |
| File type | PDF, ZIP, DOCX, XLSX, PPTX, JPEG, PNG, or text |
| File size | Maximum 10 MB |
| Password | Required, between 4 and 64 characters |
| Download password | Required and must match the stored bcrypt hash |
| File ID | Must be a valid MongoDB Object ID |
| Missing file | File must exist in the database |

## Test Cases

### Valid Inputs

1. Upload a valid PDF file with a password of at least 4 characters.
2. Confirm a success message and generated download URL are displayed.
3. Open the URL and enter the correct password.
4. Confirm the file downloads and the download count increments.

### Invalid Inputs

1. Submit without selecting a file.
2. Submit without entering a password.
3. Enter a password shorter than 4 characters.
4. Upload an unsupported file type.
5. Upload a file larger than 10 MB.
6. Enter an incorrect download password.
7. Open a download URL containing an invalid ID.

Expected results include:

- A red server-generated error message
- HTTP status 400 for invalid form inputs or IDs
- HTTP status 401 for an incorrect password
- HTTP status 404 for a missing file
- A green success message after a valid upload

## Deployment

**Deployed application URL:** `https://file-sharing-platform-oua6.onrender.com/`

Deploy to Render, Railway, or another Node.js hosting platform.

### Environment Variables

```text
MONGO=<MongoDB Atlas connection string>/file-sharing?retryWrites=true&w=majority
PORT=<provided automatically by the host>
NODE_ENV=production
```

### Render Settings

```text
Build Command: npm install
Start Command: npm start
Root Directory: leave blank
```
