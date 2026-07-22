// Find our date picker inputs and button on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const button = document.querySelector('button');
const gallery = document.getElementById('gallery');

// Find our modal elements on the page
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');
const modalMedia = document.getElementById('modalMedia');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Your NASA API key comes from config.js (gitignored, for local development).
// If config.js isn't present -- like on the deployed site, since it's not
// committed to GitHub -- fall back to NASA's public DEMO_KEY so the site
// still works, just with a lower rate limit.
const apiKey = (typeof NASA_API_KEY !== 'undefined') ? NASA_API_KEY : 'DEMO_KEY'

// Some APOD video entries link straight to apod.nasa.gov instead of an
// embeddable YouTube/Vimeo player. Those sites block being shown in an
// iframe, so we only attempt to embed URLs we know will actually work.
function isEmbeddableVideo(url) {
  return url.includes('youtube.com/embed') || url.includes('player.vimeo.com');
}

// Opens the modal and fills it in with details for one gallery item
function openModal(item) {
  if (item.media_type === 'video' && isEmbeddableVideo(item.url)) {
    // Show an embedded video player
    modalMedia.innerHTML = `
      <div class="video-wrapper">
        <iframe src="${item.url}" title="${item.title}" allowfullscreen></iframe>
      </div>
    `;
  } else if (item.media_type === 'video') {
    // This video can't be embedded, so show its thumbnail with a link out to it instead
    const thumbnail = item.thumbnail_url || 'https://placehold.co/700x400/0b3d91/ffffff?text=Video';
    modalMedia.innerHTML = `
      <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="video-fallback">
        <img src="${thumbnail}" alt="${item.title}" />
        <span class="play-icon">▶</span>
        <span class="video-fallback-label">Watch on NASA's site</span>
      </a>
    `;
  } else {
    modalMedia.innerHTML = `<img src="${item.url}" alt="${item.title}" />`;
  }

  modalTitle.textContent = item.title;
  modalDate.textContent = item.date;
  modalExplanation.textContent = item.explanation;
  modal.classList.remove('hidden');
}

// Hides the modal
function closeModal() {
  modal.classList.add('hidden');
  // Clear the media container so a playing video stops once the modal closes
  modalMedia.innerHTML = '';
}

// Close the modal when the "X" button is clicked
modalClose.addEventListener('click', closeModal);

// Close the modal when clicking outside the modal content box
modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

// Listen for clicks on the "Get Space Images" button
button.addEventListener('click', () => {
  // Grab the dates the user picked
  const startDate = startInput.value;
  const endDate = endInput.value;

  // Show a loading message while we wait for the data
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">🚀</div>
      <p>Loading space photos...</p>
    </div>
  `;

  // Build the API URL using the selected date range
  // thumbs=True asks NASA to include a thumbnail image for video entries
  const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}&thumbs=True`;

  // Fetch the data from NASA's APOD API
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      // Clear the gallery before adding new items
      gallery.innerHTML = '';

      // Loop through each item NASA sent back and display it
      data.forEach((item) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';

        if (item.media_type === 'video') {
          // Some video entries include a thumbnail image; fall back to a
          // simple placeholder graphic if NASA didn't provide one
          const thumbnail = item.thumbnail_url || 'https://placehold.co/500x300/0b3d91/ffffff?text=Video';

          galleryItem.innerHTML = `
            <div class="video-thumb">
              <img src="${thumbnail}" alt="${item.title}" />
              <span class="video-badge">🎥 Video</span>
              <span class="play-icon">▶</span>
            </div>
            <p><strong>${item.title}</strong></p>
            <p>${item.date}</p>
          `;
        } else {
          // Regular image entries
          galleryItem.innerHTML = `
            <img src="${item.url}" alt="${item.title}" />
            <p><strong>${item.title}</strong></p>
            <p>${item.date}</p>
          `;
        }

        // When this item is clicked, open the modal with its full details
        // (the modal itself decides whether to show an image or an embedded video)
        galleryItem.addEventListener('click', () => {
          openModal(item);
        });

        gallery.appendChild(galleryItem);
      });
    })
    .catch((error) => {
      // If something goes wrong, let the user know
      gallery.innerHTML = `
        <div class="placeholder">
          <div class="placeholder-icon">⚠️</div>
          <p>Something went wrong. Please try again later.</p>
        </div>
      `;
      console.log(error);
    });
});