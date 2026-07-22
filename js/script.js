// Find our date picker inputs and button on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const button = document.querySelector('button');
const gallery = document.getElementById('gallery');

// Find our modal elements on the page
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Your NASA API key
// DEMO_KEY works for testing, but has a low rate limit
// Get your own free key at https://api.nasa.gov/ for more requests per hour
const apiKey = 'DEMO_KEY';

// Opens the modal and fills it in with details for one gallery item
function openModal(item) {
  modalImg.src = item.url;
  modalImg.alt = item.title;
  modalTitle.textContent = item.title;
  modalDate.textContent = item.date;
  modalExplanation.textContent = item.explanation;
  modal.classList.remove('hidden');
}

// Hides the modal
function closeModal() {
  modal.classList.add('hidden');
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
  const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`;

  // Fetch the data from NASA's APOD API
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      // Clear the gallery before adding new images
      gallery.innerHTML = '';

      // Loop through each item NASA sent back and display it
      data.forEach((item) => {
        // Some entries are videos instead of images, so we check the media_type
        if (item.media_type === 'image') {
          const galleryItem = document.createElement('div');
          galleryItem.className = 'gallery-item';
          galleryItem.innerHTML = `
            <img src="${item.url}" alt="${item.title}" />
            <p><strong>${item.title}</strong></p>
            <p>${item.date}</p>
          `;

          // When this item is clicked, open the modal with its full details
          galleryItem.addEventListener('click', () => {
            openModal(item);
          });

          gallery.appendChild(galleryItem);
        }
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