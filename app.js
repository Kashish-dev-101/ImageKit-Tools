'use strict';

// DOM Elements
const folderInput = document.querySelector("#folderInput");
const deleteBtn = document.querySelector("#deleteButton");
const outPut = document.querySelector("#output");
const filePathInput = document.querySelector("#filePathInput");
const deleteVersionBtn = document.querySelector("#deleteVersionButton");
const versionOutput = document.querySelector("#versionOutput");
const countFilesBtn = document.querySelector("#countFilesButton");
const countFolderBtn = document.querySelector("#countFoldersButton");
const countFolderInput = document.querySelector("#countFolderInput");
const privateKey = document.querySelector("#globalPrivateKey");
const countOutput = document.querySelector("#countOutput");
const uploadCSVBtn = document.querySelector("#uploadCSVButton");
const csvUploadOutput = document.querySelector("#csvUploadOutput");
const fileCSVInput = document.querySelector("#csvInput");

const baseURL = "https://api.imagekit.io/v1";

// Helper function to create auth headers
function getAuthHeaders(privateKeyValue) {
  return {
    Accept: 'application/json',
    Authorization: `Basic ${btoa(`${privateKeyValue}:`)}`
  };
}

// Delete Assets in Folder
deleteBtn.addEventListener("click", async () => {
  const folderPath = folderInput.value.trim();
  const privateKeyValue = privateKey.value.trim();

  if (!folderPath || !privateKeyValue) {
    outPut.innerHTML = `<span style="color:red;">❌ Folder Path and Private Key are required</span>`;
    return;
  }

  let skip = 0;
  const limit = 1000;
  let hasMore = true;
  let deleteCount = 0;

  outPut.innerHTML = "⏳ Deleting files, please wait...";

  try {
    while (hasMore) {
      const listUrl = `${baseURL}/files?path=${folderPath}&fileType=all&skip=${skip}&limit=${limit}`;

      const response = await fetch(listUrl, {
        method: 'GET',
        headers: getAuthHeaders(privateKeyValue)
      });
      const files = await response.json();

      if (files.length === 0) {
        hasMore = false;
        break;
      }

      for (let file of files) {
        const deleteURL = `${baseURL}/files/${file.fileId}`;
        await fetch(deleteURL, {
          method: 'DELETE',
          headers: getAuthHeaders(privateKeyValue)
        });
        deleteCount++;
      }

      skip += limit;
    }

    outPut.innerHTML = `<span style="color:green;">✅ ${deleteCount} files deleted successfully from <code>${folderPath}</code></span>`;
  } catch (err) {
    outPut.innerHTML = `<span style="color:red;">❌ Error: ${err.message}</span>`;
  }
});

// Delete File Versions
deleteVersionBtn.addEventListener("click", async () => {
  const privateKeyValue = privateKey.value.trim();
  const filePath = filePathInput.value.trim();

  if (!filePath || !privateKeyValue) {
    versionOutput.innerHTML = `<span style="color:red;">❌ File Path and Private Key are required</span>`;
    return;
  }

  versionOutput.innerHTML = "⏳ Deleting file versions, please wait...";

  try {
    const listURL = `${baseURL}/files?searchQuery= name = "${filePath}"`;
    const listResponse = await fetch(listURL, {
      method: 'GET',
      headers: getAuthHeaders(privateKeyValue)
    });
    const fileList = await listResponse.json();

    let deletedCount = 0;

    for (let file of fileList) {
      const versionInfoURL = `${baseURL}/files/${file.fileId}/versions`;
      const versionResponse = await fetch(versionInfoURL, {
        method: 'GET',
        headers: getAuthHeaders(privateKeyValue)
      });
      const versionList = await versionResponse.json();

      for (let version of versionList) {
        if (version.type !== "file") {
          const deleteVersionURL = `${baseURL}/files/${file.fileId}/versions/${version.versionInfo.id}`;
          await fetch(deleteVersionURL, {
            method: 'DELETE',
            headers: getAuthHeaders(privateKeyValue)
          });
          deletedCount++;
        }
      }
    }

    versionOutput.innerHTML = `<span style="color:green;">🧹 ${deletedCount} non-current file versions deleted successfully</span>`;
  } catch (err) {
    versionOutput.innerHTML = `<span style="color:red;">❌ Error: ${err.message}</span>`;
  }
});

// Count Files
countFilesBtn.addEventListener("click", async () => {
  const countFolderInputValue = countFolderInput.value.trim();
  const privateKeyValue = privateKey.value.trim();

  if (!countFolderInputValue || !privateKeyValue) {
    countOutput.innerHTML = `<span style="color:red;">❌ Folder Path and Private Key are required</span>`;
    return;
  }

  countOutput.innerHTML = "⏳ Counting files...";

  let skip = 0;
  const limit = 1000;
  let hasMore = true;
  let totalCount = 0;

  try {
    while (hasMore) {
      const listUrl = `${baseURL}/files?path=${countFolderInputValue}&fileType=all&skip=${skip}&limit=${limit}`;
      const response = await fetch(listUrl, {
        method: 'GET',
        headers: getAuthHeaders(privateKeyValue)
      });
      const files = await response.json();

      if (files.length === 0) {
        hasMore = false;
        break;
      }

      totalCount += files.length;
      skip += limit;
    }

    countOutput.innerHTML = `<span style="color:green;">📦 <code>${countFolderInputValue}</code> has <strong>${totalCount}</strong> files</span>`;
  } catch (err) {
    countOutput.innerHTML = `<span style="color:red;">❌ Error: ${err.message}</span>`;
  }
});

// Count Subfolders
countFolderBtn.addEventListener("click", async () => {
  const countFolderInputValue = countFolderInput.value.trim();
  const privateKeyValue = privateKey.value.trim();

  if (!countFolderInputValue || !privateKeyValue) {
    countOutput.innerHTML = `<span style="color:red;">❌ Folder Path and Private Key are required</span>`;
    return;
  }

  countOutput.innerHTML = "⏳ Counting subfolders...";

  let skip = 0;
  const limit = 1000;
  let hasMore = true;
  let totalCount = 0;

  try {
    while (hasMore) {
      const listUrl = `${baseURL}/files?path=${countFolderInputValue}&fileType=all&skip=${skip}&limit=${limit}&type=folder`;
      const response = await fetch(listUrl, {
        method: 'GET',
        headers: getAuthHeaders(privateKeyValue)
      });
      const folders = await response.json();

      if (folders.length === 0) {
        hasMore = false;
        break;
      }

      totalCount += folders.length;
      skip += limit;
    }

    countOutput.innerHTML = `<span style="color:green;">📁 <code>${countFolderInputValue}</code> has <strong>${totalCount}</strong> subfolders</span>`;
  } catch (err) {
    countOutput.innerHTML = `<span style="color:red;">❌ Error: ${err.message}</span>`;
  }
});

// Upload from CSV
uploadCSVBtn.addEventListener("click", () => {
  const privateKeyValue = privateKey.value.trim();
  const file = fileCSVInput.files[0];

  if (!file) {
    csvUploadOutput.innerHTML = `<span style="color:red;">❌ Please select a CSV file</span>`;
    return;
  }

  if (!privateKeyValue) {
    csvUploadOutput.innerHTML = `<span style="color:red;">❌ Private Key is required</span>`;
    return;
  }

  csvUploadOutput.innerHTML = "⏳ Uploading images from CSV...";

  const reader = new FileReader();

  reader.addEventListener("load", async (event) => {
    const csvText = event.target.result;
    const lines = csvText.trim().split("\n");

    const imageDataArray = lines
      .filter(line => line.trim() !== "")
      .map(line => {
        const values = line.split(",");
        return {
          url: values[0]?.trim(),
          fileName: values[1]?.trim(),
          folderName: values[2]?.trim()
        };
      });

    let successCount = 0;
    let errorCount = 0;

    for (let imageData of imageDataArray) {
      if (!imageData.url || !imageData.fileName) {
        errorCount++;
        continue;
      }

      const form = new FormData();
      form.append('file', imageData.url);
      form.append('fileName', imageData.fileName);
      if (imageData.folderName) {
        form.append('folder', imageData.folderName);
      }

      try {
        const response = await fetch('https://upload.imagekit.io/api/v2/files/upload', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            Authorization: `Basic ${btoa(`${privateKeyValue}:`)}`
          },
          body: form
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

    csvUploadOutput.innerHTML = `<span style="color:green;">✅ Upload complete: ${successCount} succeeded, ${errorCount} failed</span>`;
  });

  reader.readAsText(file);
});
