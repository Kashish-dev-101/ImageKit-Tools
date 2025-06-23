'use strict';

const folderInput = document.querySelector("#folderInput");
console.log(folderInput);

const deleteBtn = document.querySelector("#deleteButton");
console.log(deleteBtn);

const outPut = document.querySelector("#output");
console.log(outPut);

const filePathInput = document.querySelector("#filePathInput");
console.log(filePathInput);

const deleteVersionBtn = document.querySelector("#deleteVersionButton");
console.log(deleteVersionBtn);

const versionOutput = document.querySelector("#versionOutput");
console.log(versionOutput);

const countFilesBtn = document.querySelector("#countFilesButton");
console.log(countFilesBtn);

const countFolderBtn = document.querySelector("#countFoldersButton");
console.log(countFolderBtn);

const countFolderInput = document.querySelector("#countFolderInput");
console.log(countFolderInput);

const privateKey = document.querySelector("#globalPrivateKey");
console.log(privateKey);

const countOutput = document.querySelector("#countOutput");
console.log(countOutput);



const baseURL = "https://api.imagekit.io/v1";

// Delete File
deleteBtn.addEventListener("click", async () => {
  console.log("button was clicked");

  const folderPath = folderInput.value.trim();
  console.log(folderPath);

  const privateKeyValue = privateKey.value.trim();
  console.log(privateKeyValue);

  if (!folderPath || !privateKeyValue) {
    outPut.innerHTML = `<span style="color:red;"> Folder Path and Private Key are required </span>`;
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
      console.log(listUrl);

      const options = {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Basic ${btoa(`${privateKeyValue}:`)}`
        }
      };

      const data = await fetch(listUrl, options);
      console.log(data);
      const response = await data.json();

      if (response.length === 0) {
        console.log("no more asset to list");
        hasMore = false;
        break;
      }

      console.log(response);
      for (let data1 of response) {
        console.log(data1);
        console.log(data1.url);
        console.log(data1.fileId);
        const deleteURL = `${baseURL}/files/${data1.fileId}`;
        console.log(deleteURL);

        const deleteOptions = {
          method: 'DELETE',
          headers: {
            Accept: 'application/json',
            Authorization: `Basic ${btoa(`${privateKeyValue}:`)}`
          }
        };

        const data2 = await fetch(deleteURL, deleteOptions);
        deleteCount++;
        console.log("file deleted successfully");
      }

      skip += limit;
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }

  outPut.innerHTML = `<span style="color:green;">✅ ${deleteCount} files deleted successfully from <code>${folderPath}</code>.</span>`;
});


// Delete File Versions
deleteVersionBtn.addEventListener("click", async () => {
  console.log("delte file version button was clicked");

  const privateKeyValue = privateKey.value.trim();
  console.log(privateKeyValue);

  const filePath = filePathInput.value.trim();
  console.log(filePath);

  const listURL = `${baseURL}/files?searchQuery= name = "${filePath}"`;
  console.log(listURL);

  try {
    const listOptions = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${btoa(`${privateKeyValue}:`)}`
      }
    };

    const listResponse = await fetch(listURL, listOptions);
    console.log(listResponse);
    const fileList = await listResponse.json();
    console.log(fileList);

    for (let file of fileList) {
      console.log(file.versionInfo.id);
      console.log(file.versionInfo.name);
      console.log(file.fileId);
      const versionInfoURL = `${baseURL}/files/${file.fileId}/versions`;
      console.log(versionInfoURL);

      const versionOptions = {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Basic ${btoa(`${privateKeyValue}:`)}`
        }
      };

      const versionResponse = await fetch(versionInfoURL, versionOptions);
      console.log(versionResponse);
      const versionList = await versionResponse.json();
      console.log(versionList);

      for (let version of versionList) {
        console.log(version.type);
        console.log(version.versionInfo.id);

        if (version.type != "file") {
          const deleteVersionURL = `${baseURL}/files/${file.fileId}/versions/${version.versionInfo.id}`;
          console.log(deleteVersionURL);

          const deleteVersionOptions = {
            method: 'DELETE',
            headers: {
              Accept: 'application/json',
              Authorization: `Basic ${btoa(`${privateKeyValue}:`)}`
            }
          };

          const deleteVersionOptionsResponse = await fetch(deleteVersionURL, deleteVersionOptions);
          console.log(deleteVersionOptionsResponse);
        }
      }
    }

    versionOutput.innerHTML = `<span style="color:green;">🧹 All <strong>non-current</strong> file versions deleted successfully.</span>`;

  } catch (err) {
    console.log("Error during fetch:", err);

  }
});




// Count file Asset

countFilesBtn.addEventListener("click", async() => {
  console.log("count button was clicked");

  const countFolderInputValue = countFolderInput.value.trim();
  console.log(countFolderInputValue);

  const privateKeyValue = privateKey.value.trim();
  console.log(privateKeyValue);

  if (!countFolderInputValue|| !privateKeyValue) {
    countOutput.innerHTML = `<span style="color:red;"> Folder Path and Private Key are required </span>`;
    return;
  }

  let skip = 0;
  const limit = 1000;
  let hasMore = true;
  let totatCount = 0;

  try{
    while (hasMore) {
    const listUrl = `${baseURL}/files?path=${countFolderInputValue}&fileType=all&skip=${skip}&limit=${limit}`;
    console.log(listUrl);

      const options = {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Basic ${btoa(`${privateKeyValue}:`)}`
        }
      };

      const data = await fetch(listUrl, options);
      console.log(data);
      const response = await data.json();

      if (response.length === 0) {
        console.log("no more asset to list");
        hasMore = false;
        break;
      }

      console.log(response);
      totatCount += response.length ;

      skip += limit;

    } 
    console.log(totatCount);
    countOutput.innerHTML = `<span style="color:green;">📦 <code>${countFolderInputValue}</code> has <strong>${totatCount}</strong> assets stored.</span>`;
  } 
    catch (err) {
    console.log("Error during fetch:", err);
    }

});


// count subfolders

countFolderBtn.addEventListener("click", async() => {
  console.log("count button was clicked");

  const countFolderInputValue = countFolderInput.value.trim();
  console.log(countFolderInputValue);

  const privateKeyValue = privateKey.value.trim();
  console.log(privateKeyValue);

  if (!countFolderInputValue|| !privateKeyValue) {
    countOutput.innerHTML = `<span style="color:red;"> Folder Path and Private Key are required </span>`;
    return;
  }

  let skip = 0;
  const limit = 1000;
  let hasMore = true;
  let totatCount = 0;

  while (hasMore) {
    const listUrl = `${baseURL}/files?path=${countFolderInputValue}&fileType=all&skip=${skip}&limit=${limit}&type=folder`;
    console.log(listUrl);
   
    try {
      const options = {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Basic ${btoa(`${privateKeyValue}:`)}`
        }
      };

      const data = await fetch(listUrl, options);
      console.log(data);
      const response = await data.json();

      if (response.length === 0) {
        console.log("no more asset to list");
        hasMore = false;
        break;
      }

      console.log(response);
      totatCount += response.length ;

      skip += limit;

    } catch (err) {
      console.log("Error during fetch:", err);
    }
  } 
  console.log(totatCount);
  countOutput.innerHTML = `<span style="color:green;">📁 <code>${countFolderInputValue}</code> has <strong>${totatCount}</strong> subfolders.</span>`;

    
});







