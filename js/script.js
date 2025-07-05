// NASA API key - replace the value below with your own API key from https://api.nasa.gov
const NASA_API_KEY = 'iuJ2L9DzHRzFfqZVKmALlR1eSrEh4Q8gno8Mutl7';

// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Find the button and gallery elements
const getImagesButton = document.querySelector('.filters button');
const gallery = document.getElementById('gallery');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Listen for button clicks to fetch and display images
getImagesButton.addEventListener('click', () => {
  // Get the selected start and end dates
  const startDate = startInput.value;
  const endDate = endInput.value;

  // Check if both dates are selected
  if (!startDate || !endDate) {
    alert('Please select both a start and end date.');
    return;
  }

  // Show a loading message
  gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">🚀</div><p>Loading images...</p></div>`;

  // Build the NASA APOD API URL with the date range and API key
  const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&start_date=${startDate}&end_date=${endDate}`;

  // Fetch the images from NASA's API
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      // If the API returns a single object, put it in an array
      const images = Array.isArray(data) ? data : [data];

      // Filter out any items that are not images (e.g., videos)
      const photoItems = images.filter(item => item.media_type === 'image');

      // If there are no images, show a message
      if (photoItems.length === 0) {
        gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">😢</div><p>No images found for this date range.</p></div>`;
        return;
      }

      // Build HTML for each image and add it to the gallery
      gallery.innerHTML = photoItems.map((item, idx) => `
        <div class="gallery-item" data-index="${idx}" style="cursor:pointer;">
          <img src="${item.url}" alt="${item.title}" />
          <p>${item.date}</p>
        </div>
      `).join('');

      // Add click event listeners to each gallery item to show the modal
      const galleryItems = document.querySelectorAll('.gallery-item');
      galleryItems.forEach((itemDiv) => {
        itemDiv.addEventListener('click', () => {
          // Get the index of the clicked item
          const index = itemDiv.getAttribute('data-index');
          const photo = photoItems[index];

          // Set modal content
          document.getElementById('modalTitle').textContent = photo.title;
          document.getElementById('modalImage').src = photo.url;
          document.getElementById('modalImage').alt = photo.title;
          document.getElementById('modalDate').textContent = `Date: ${photo.date}`;
          document.getElementById('modalDescription').textContent = photo.explanation;
          document.getElementById('modalCopyright').textContent = photo.copyright ? `© ${photo.copyright}` : '';

          // Show the modal
          document.getElementById('photoModal').style.display = 'flex';
        });
      });
    })
    .catch(error => {
      // Show an error message if something goes wrong
      gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">⚠️</div><p>Could not load images. Please try again later.</p></div>`;
      console.error('Error fetching NASA images:', error);
    });
});

// Modal close functionality
document.addEventListener('DOMContentLoaded', () => {
  // Get modal and close button elements
  const modal = document.getElementById('photoModal');
  const closeModal = document.getElementById('closeModal');

  // Check if modal and close button exist
  if (modal && closeModal) {
    // When the user clicks the close button, hide the modal
    closeModal.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    // When the user clicks outside the modal content, hide the modal
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
});
