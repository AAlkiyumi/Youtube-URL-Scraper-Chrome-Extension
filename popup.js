let videoData = [];

// Load video titles and URLs from the content script
document.addEventListener("DOMContentLoaded", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;

    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        files: ["content.js"]
      },
      (result) => {
        if (result && result[0].result) {
          videoData = result[0].result;
          displayVideoList(videoData);
        } else {
          document.getElementById("video-list").innerText = "No videos found.";
        }
      }
    );
  });
});

// Display video list with checkboxes and titles
function displayVideoList(videos) {
  const videoList = document.getElementById("video-list");
  videoList.innerHTML = "";

  videos.forEach((video, index) => {
    const label = document.createElement("label");
    label.innerHTML = `
      <input type="checkbox" class="video-checkbox" value="${video.url}" />
      ${index + 1}. ${video.title}
    `;
    videoList.appendChild(label);
  });
}

// Select all videos
document.getElementById("select-all").addEventListener("click", () => {
  document.querySelectorAll(".video-checkbox").forEach((checkbox) => {
    checkbox.checked = true;
  });
  document.getElementById("status").textContent = "All videos selected.";
});

// Unselect all videos
document.getElementById("unselect-all").addEventListener("click", () => {
  document.querySelectorAll(".video-checkbox").forEach((checkbox) => {
    checkbox.checked = false;
  });
  document.getElementById("status").textContent = "All videos unselected.";
});

// Add more range inputs, set default start to 1 only for the first range
let rangeCount = 0;
document.getElementById("add-range").addEventListener("click", () => {
  const rangeContainer = document.getElementById("range-container");
  const rangeInput = document.createElement("div");
  rangeInput.className = "range-input";

  // Only set the default start value to 1 for the first range, subsequent ranges will have empty start value
  rangeInput.innerHTML = `
    <input type="number" class="range-start" min="1" placeholder="Start" />
    <input type="number" class="range-end" min="1" placeholder="End" />
    <button class="delete-range">X</button>
  `;

  rangeContainer.appendChild(rangeInput);
  rangeCount++;

  // Attach delete button functionality
  rangeInput.querySelector(".delete-range").addEventListener("click", () => {
    rangeInput.remove();
    rangeCount--;
  });
});

// Select multiple ranges
document.getElementById("select-ranges").addEventListener("click", () => {
  const ranges = document.querySelectorAll(".range-input");
  let validRange = false;

  document.querySelectorAll(".video-checkbox").forEach((checkbox) => {
    checkbox.checked = false;
  });

  ranges.forEach((range) => {
    const start = parseInt(range.querySelector(".range-start").value, 10);
    const end = parseInt(range.querySelector(".range-end").value, 10);

    if (!isNaN(start) && !isNaN(end) && start >= 1 && end >= start && end <= videoData.length) {
      validRange = true;
      document.querySelectorAll(".video-checkbox").forEach((checkbox, index) => {
        if (index + 1 >= start && index + 1 <= end) {
          checkbox.checked = true;
        }
      });
    }
  });

  if (validRange) {
    document.getElementById("status").textContent = "Ranges selected successfully.";
  } else {
    document.getElementById("status").textContent = "Invalid ranges!";
  }
});

// Handle download button click
document.getElementById("download").addEventListener("click", () => {
  const selectedUrls = Array.from(
    document.querySelectorAll(".video-checkbox:checked")
  ).map((checkbox) => {
    // Clean the URL by removing &list= and anything after it
    const originalUrl = checkbox.value;
    return originalUrl.split('&list=')[0];
  });

  if (selectedUrls.length === 0) {
    document.getElementById("status").textContent = "No videos selected!";
    return;
  }

  // Create and download url.txt with cleaned URLs
  const blob = new Blob([selectedUrls.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  chrome.downloads.download({
    url: url,
    filename: "url.txt",
    saveAs: false
  });

  document.getElementById("status").textContent = "Downloading url.txt!";
});