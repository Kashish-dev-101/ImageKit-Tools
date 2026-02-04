# ImageKit Tools

A lightweight web utility for managing assets in your ImageKit account — built for internal operations and productivity automation.

**[Live Demo](https://kashish-dev-101.github.io/ImageKit-Tools/)**

---

## Features

### Delete Assets in Folder
Delete all assets inside a folder with a single click.
- Handles pagination (supports folders with 1000+ assets)
- Uses [Delete File API](https://imagekit.io/docs/api-reference/media-api/delete-file)

### Delete File Versions
Remove non-current versions of any specific file using its name.
- Lists all versions and deletes non-current ones
- Uses [List File Versions API](https://imagekit.io/docs/api-reference/media-api/list-file-versions) and [Delete File Version API](https://imagekit.io/docs/api-reference/media-api/delete-file-version)

### Count Assets
Quickly count contents inside a folder:
- Files count
- Subfolders count
- Uses [List Files API](https://imagekit.io/docs/api-reference/media-api/list-files)

### Upload from CSV
Bulk upload images from URLs using a CSV file.
- CSV format: `url,fileName,folderName`
- Uses [Upload File API](https://imagekit.io/docs/api-reference/upload-api/server-side-upload)

---

## Tech Stack

- HTML + CSS + JavaScript (Vanilla)
- [ImageKit Media API](https://imagekit.io/docs/api-reference/media-api)
- [ImageKit Upload API](https://imagekit.io/docs/api-reference/upload-api)

---

## Project Structure

```
ImageKit-Tools/
├── index.html      # Web UI
├── style.css       # Styling
├── app.js          # Browser-based logic
├── index.js        # Node.js API server
├── package.json    # Dependencies
└── README.md       # Documentation
```

---

## Web UI Usage

1. Open `index.html` in your browser
2. Enter your **ImageKit Private API Key**
3. Use any tool:
   - **Delete Assets**: Enter folder path → Click Delete
   - **Delete Versions**: Enter file name → Click Delete Versions
   - **Count Assets**: Enter folder path → Click Count Files or Count Folders
   - **Upload CSV**: Select CSV file → Click Upload

---

## CSV Format for Bulk Upload

```csv
https://example.com/image1.jpg,image1.jpg,/uploads
https://example.com/image2.png,image2.png,/uploads/2024
https://example.com/image3.webp,image3.webp,
```

Each row: `imageURL,fileName,folderPath` (folder is optional)

---

## Node.js API Usage

### Setup

```bash
npm install
npm start
```

Server runs on `http://localhost:3000`

### Endpoints

**Delete Assets in Folder**
```bash
curl -X POST http://localhost:3000/delete-assets \
  -H "Content-Type: application/json" \
  -d '{"folderPath": "/your-folder", "privateKey": "your_private_key"}'
```

**Delete File Versions**
```bash
curl -X POST http://localhost:3000/delete-versions \
  -H "Content-Type: application/json" \
  -d '{"fileName": "image.jpg", "privateKey": "your_private_key"}'
```

**Count Files**
```bash
curl -X POST http://localhost:3000/count-files \
  -H "Content-Type: application/json" \
  -d '{"folderPath": "/your-folder", "privateKey": "your_private_key"}'
```

**Count Folders**
```bash
curl -X POST http://localhost:3000/count-folders \
  -H "Content-Type: application/json" \
  -d '{"folderPath": "/your-folder", "privateKey": "your_private_key"}'
```

**Upload from URLs**
```bash
curl -X POST http://localhost:3000/upload-from-urls \
  -H "Content-Type: application/json" \
  -d '{
    "privateKey": "your_private_key",
    "files": [
      {"url": "https://example.com/image1.jpg", "fileName": "image1.jpg", "folder": "/uploads"},
      {"url": "https://example.com/image2.png", "fileName": "image2.png"}
    ]
  }'
```

### Example Responses

```javascript
// count-files
{ "success": true, "fileCount": 150, "folderPath": "/products" }

// count-folders
{ "success": true, "folderCount": 12, "folderPath": "/products" }

// delete-assets
{ "success": true, "deletedCount": 45, "folderPath": "/test-folder" }

// delete-versions
{ "success": true, "deletedCount": 3, "fileName": "image.jpg" }

// upload-from-urls
{ "success": true, "successCount": 8, "errorCount": 2 }

// error response
{ "error": "folderPath and privateKey are required" }
```

### Using JavaScript (fetch)

```javascript
// Example: Count files in a folder
const response = await fetch('http://localhost:3000/count-files', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    folderPath: '/products',
    privateKey: 'private_xxxx'
  })
});

const data = await response.json();
console.log(data); // { success: true, fileCount: 150, folderPath: "/products" }
```

---

## Security Note

- Your private key is used only within your browser
- Keys are not stored or sent anywhere except ImageKit APIs
- Use with caution: deletion actions are permanent

---

## API Reference

| Feature | API Used |
|---------|----------|
| List Files | [List Files API](https://imagekit.io/docs/api-reference/media-api/list-files) |
| Delete File | [Delete File API](https://imagekit.io/docs/api-reference/media-api/delete-file) |
| List Versions | [List File Versions API](https://imagekit.io/docs/api-reference/media-api/list-file-versions) |
| Delete Version | [Delete File Version API](https://imagekit.io/docs/api-reference/media-api/delete-file-version) |
| Upload File | [Server-side Upload API](https://imagekit.io/docs/api-reference/upload-api/server-side-upload) |

---

## License

MIT License

---

Developed by **Ashish**
