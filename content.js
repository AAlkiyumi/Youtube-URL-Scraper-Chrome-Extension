// Extract video titles and URLs from the YouTube page
function getVideoData() {
  const videoData = Array.from(document.querySelectorAll("a#video-title"))
    .map(link => ({
      title: link.innerText.trim(),
      url: link.href
    }))
    .filter(video => video.url.includes("watch?v="));

  return videoData;
}

// Return extracted data to popup.js
getVideoData();