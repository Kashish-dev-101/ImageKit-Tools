'use strict';

const express = require('express');
const app = express();
const PORT = 3000;

const baseURL = 'https://api.imagekit.io/v1';
const uploadURL = 'https://upload.imagekit.io/api/v2/files/upload';

app.use(express.json());

// Helper function to create auth headers
function getAuthHeaders(privateKey) {
  return {
    'Accept': 'application/json',
    'Authorization': `Basic ${Buffer.from(`${privateKey}:`).toString('base64')}`
  };
}

// Delete all assets in a folder
app.post('/delete-assets', async (req, res) => {
  const { folderPath, privateKey } = req.body;

  if (!folderPath || !privateKey) {
    return res.status(400).json({ error: 'folderPath and privateKey are required' });
  }

  let skip = 0;
  const limit = 1000;
  let hasMore = true;
  let deleteCount = 0;

  try {
    while (hasMore) {
      const listUrl = `${baseURL}/files?path=${folderPath}&fileType=all&skip=${skip}&limit=${limit}`;
      const listResponse = await fetch(listUrl, {
        method: 'GET',
        headers: getAuthHeaders(privateKey)
      });
      const files = await listResponse.json();

      if (files.length === 0) {
        hasMore = false;
        break;
      }

      for (let file of files) {
        await fetch(`${baseURL}/files/${file.fileId}`, {
          method: 'DELETE',
          headers: getAuthHeaders(privateKey)
        });
        deleteCount++;
      }

      skip += limit;
    }

    res.json({ success: true, deletedCount: deleteCount, folderPath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete file versions
app.post('/delete-versions', async (req, res) => {
  const { fileName, privateKey } = req.body;

  if (!fileName || !privateKey) {
    return res.status(400).json({ error: 'fileName and privateKey are required' });
  }

  try {
    const listURL = `${baseURL}/files?searchQuery=name="${fileName}"`;
    const listResponse = await fetch(listURL, {
      method: 'GET',
      headers: getAuthHeaders(privateKey)
    });
    const fileList = await listResponse.json();

    let deletedCount = 0;

    for (let file of fileList) {
      const versionResponse = await fetch(`${baseURL}/files/${file.fileId}/versions`, {
        method: 'GET',
        headers: getAuthHeaders(privateKey)
      });
      const versionList = await versionResponse.json();

      for (let version of versionList) {
        if (version.type !== 'file') {
          await fetch(`${baseURL}/files/${file.fileId}/versions/${version.versionInfo.id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(privateKey)
          });
          deletedCount++;
        }
      }
    }

    res.json({ success: true, deletedCount, fileName });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Count files in folder
app.post('/count-files', async (req, res) => {
  const { folderPath, privateKey } = req.body;

  if (!folderPath || !privateKey) {
    return res.status(400).json({ error: 'folderPath and privateKey are required' });
  }

  let skip = 0;
  const limit = 1000;
  let hasMore = true;
  let totalCount = 0;

  try {
    while (hasMore) {
      const listUrl = `${baseURL}/files?path=${folderPath}&fileType=all&skip=${skip}&limit=${limit}`;
      const response = await fetch(listUrl, {
        method: 'GET',
        headers: getAuthHeaders(privateKey)
      });
      const files = await response.json();

      if (files.length === 0) {
        hasMore = false;
        break;
      }

      totalCount += files.length;
      skip += limit;
    }

    res.json({ success: true, fileCount: totalCount, folderPath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Count folders in path
app.post('/count-folders', async (req, res) => {
  const { folderPath, privateKey } = req.body;

  if (!folderPath || !privateKey) {
    return res.status(400).json({ error: 'folderPath and privateKey are required' });
  }

  let skip = 0;
  const limit = 1000;
  let hasMore = true;
  let totalCount = 0;

  try {
    while (hasMore) {
      const listUrl = `${baseURL}/files?path=${folderPath}&fileType=all&skip=${skip}&limit=${limit}&type=folder`;
      const response = await fetch(listUrl, {
        method: 'GET',
        headers: getAuthHeaders(privateKey)
      });
      const folders = await response.json();

      if (folders.length === 0) {
        hasMore = false;
        break;
      }

      totalCount += folders.length;
      skip += limit;
    }

    res.json({ success: true, folderCount: totalCount, folderPath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload files from URLs
app.post('/upload-from-urls', async (req, res) => {
  const { files, privateKey } = req.body;

  if (!files || !Array.isArray(files) || !privateKey) {
    return res.status(400).json({ error: 'files array and privateKey are required' });
  }

  let successCount = 0;
  let errorCount = 0;

  for (let fileData of files) {
    if (!fileData.url || !fileData.fileName) {
      errorCount++;
      continue;
    }

    const formData = new FormData();
    formData.append('file', fileData.url);
    formData.append('fileName', fileData.fileName);
    if (fileData.folder) {
      formData.append('folder', fileData.folder);
    }

    try {
      const response = await fetch(uploadURL, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${privateKey}:`).toString('base64')}`
        },
        body: formData
      });

      if (response.ok) {
        successCount++;
      } else {
        errorCount++;
      }
    } catch (err) {
      errorCount++;
    }
  }

  res.json({ success: true, successCount, errorCount });
});

app.listen(PORT, () => {
  console.log(`ImageKit Tools API running on http://localhost:${PORT}`);
});
