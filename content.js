// Extract video titles and URLs from the YouTube page
function getVideoData() {
  const videoLinks = document.querySelectorAll(
    'a#video-title, a#video-title-link, a[href*="/watch?v="]'
  );

  const seen = new Set();

  function normalizeTitle(rawTitle) {
    return rawTitle
      .replace(/\s*\|\s*YouTube\s*$/i, "")
      .replace(/\s*\b\d{1,2}:\d{2}(?::\d{2})?\b\s*$/i, "")
      .replace(/\s*\b\d+\s*(?:hours?|minutes?|secs?|seconds?)\s*(?:,\s*\d+\s*(?:minutes?|secs?|seconds?))?\s*$/i, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  const videoData = Array.from(videoLinks)
    .map((link) => {
      const url = new URL(link.href, window.location.href);
      if (!url.pathname.includes("watch") || !url.searchParams.has("v")) {
        return null;
      }

      const title =
        link.getAttribute("title") ||
        link.getAttribute("aria-label") ||
        link.textContent ||
        "";

      const cleanedTitle = normalizeTitle(title);

      if (
        !cleanedTitle ||
        /^play all$/i.test(cleanedTitle) ||
        /^shuffle(?: play)?$/i.test(cleanedTitle) ||
        /^liked videos$/i.test(cleanedTitle)
      ) {
        return null;
      }

      return {
        title: cleanedTitle,
        url: url.toString()
      };
    })
    .filter((video) => video && video.title && !seen.has(video.url))
    .filter((video) => {
      seen.add(video.url);
      return true;
    });

  return videoData;
}

// Return extracted data to popup.js
getVideoData();