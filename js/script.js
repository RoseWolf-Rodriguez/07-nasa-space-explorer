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
// setupDateInputs(startInput, endInput); // <-- Remove or comment out this line

// Make sure the date inputs start blank
startInput.value = '';
endInput.value = '';

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
      const items = Array.isArray(data) ? data : [data];

      // If there are no items, show a message
      if (!items.length) {
        gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">😢</div><p>No results found for this date range.</p></div>`;
        return;
      }

      // Build HTML for each item (image or video) and add it to the gallery
      gallery.innerHTML = items.map((item, idx) => {
        if (item.media_type === 'image') {
          // Show image
          return `
            <div class="gallery-item" data-index="${idx}" style="cursor:pointer;">
              <img src="${item.url}" alt="${item.title}" />
              <p>${item.date}</p>
            </div>
          `;
        } else if (item.media_type === 'video') {
          // Show video thumbnail if YouTube, otherwise show a link
          let videoContent = '';
          if (item.url.includes('youtube.com') || item.url.includes('youtu.be')) {
            // Get YouTube video ID for thumbnail
            let videoId = '';
            const ytMatch = item.url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^&?/]+)/);
            if (ytMatch) {
              videoId = ytMatch[1];
            }
            const thumbUrl = videoId
              ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
              : '';
            videoContent = thumbUrl
              ? `<img src="${thumbUrl}" alt="YouTube Video" style="width:100%;border-radius:4px;" />`
              : '';
          }
          return `
            <div class="gallery-item" data-index="${idx}" data-media="video" style="cursor:pointer;">
              ${videoContent}
              <p>${item.date}</p>
              <p style="margin-top:5px;">
                <a href="${item.url}" target="_blank" style="color:#fff;text-decoration:underline;font-family:'DM Mono',monospace;">Watch Video</a>
              </p>
            </div>
          `;
        } else {
          // Unknown media type
          return `
            <div class="gallery-item">
              <p>Unsupported media type.</p>
              <p>${item.date}</p>
            </div>
          `;
        }
      }).join('');

      // Add click event listeners to each gallery item to show the modal
      const galleryItems = document.querySelectorAll('.gallery-item');
      galleryItems.forEach((itemDiv) => {
        itemDiv.addEventListener('click', () => {
          // Get the index of the clicked item
          const index = itemDiv.getAttribute('data-index');
          const mediaType = itemDiv.getAttribute('data-media');
          const entry = items[index];

          // Set modal content for images
          if (entry.media_type === 'image') {
            document.getElementById('modalTitle').textContent = entry.title;
            document.getElementById('modalImage').src = entry.url;
            document.getElementById('modalImage').alt = entry.title;
            document.getElementById('modalImage').style.display = 'block';
            document.getElementById('modalDate').textContent = `Date: ${entry.date}`;
            document.getElementById('modalDescription').textContent = entry.explanation;
            document.getElementById('modalCopyright').textContent = entry.copyright ? `© ${entry.copyright}` : '';
            // Hide video if previously shown
            let modalVideo = document.getElementById('modalVideo');
            if (modalVideo) modalVideo.remove();
          } else if (entry.media_type === 'video') {
            // For video, show embedded video if YouTube, otherwise show a link
            document.getElementById('modalTitle').textContent = entry.title;
            document.getElementById('modalImage').style.display = 'none';
            document.getElementById('modalDate').textContent = `Date: ${entry.date}`;
            document.getElementById('modalDescription').textContent = entry.explanation;
            document.getElementById('modalCopyright').textContent = entry.copyright ? `© ${entry.copyright}` : '';

            // Remove previous video if any
            let oldVideo = document.getElementById('modalVideo');
            if (oldVideo) oldVideo.remove();

            let videoElem;
            if (entry.url.includes('youtube.com') || entry.url.includes('youtu.be')) {
              // Get YouTube video ID
              let videoId = '';
              const ytMatch = entry.url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^&?/]+)/);
              if (ytMatch) {
                videoId = ytMatch[1];
              }
              if (videoId) {
                videoElem = document.createElement('iframe');
                videoElem.id = 'modalVideo';
                videoElem.width = '100%';
                videoElem.height = '315';
                videoElem.style = 'max-width:760px;max-height:70vh;margin-bottom:10px;border-radius:4px;';
                videoElem.src = `https://www.youtube.com/embed/${videoId}`;
                videoElem.title = entry.title;
                videoElem.frameBorder = '0';
                videoElem.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                videoElem.allowFullscreen = true;
              }
            }
            if (!videoElem) {
              // Not YouTube, show a link
              videoElem = document.createElement('a');
              videoElem.id = 'modalVideo';
              videoElem.href = entry.url;
              videoElem.target = '_blank';
              videoElem.style = 'display:block;margin-bottom:10px;font-size:18px;color:#0032A0;text-decoration:underline;font-family:DM Mono,monospace;';
              videoElem.textContent = 'Watch Video';
            }
            // Insert video element before the modalDate
            const modalContent = document.querySelector('.modal-content');
            const modalImage = document.getElementById('modalImage');
            modalContent.insertBefore(videoElem, modalImage.nextSibling);
          }

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

// Fun "Did You Know?" space facts
const spaceFacts = [
  "Did you know? One million Earths could fit inside the Sun!",
  "Did you know? A day on Venus is longer than a year on Venus.",
  "Did you know? Neutron stars can spin at a rate of 600 rotations per second.",
  "Did you know? There are more trees on Earth than stars in the Milky Way.",
  "Did you know? Space is completely silent—there's no air to carry sound.",
  "Did you know? The footprints on the Moon will be there for millions of years.",
  "Did you know? Jupiter has 95 known moons as of 2023.",
  "Did you know? The hottest planet in our solar system is Venus.",
  "Did you know? Saturn could float in water because it’s mostly gas.",
  "Did you know? The International Space Station travels at 28,000 km/h."
];

// Pick a random fact
const randomFact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];

// Find the container above the gallery and display the fact
const container = document.querySelector('.container');
const factDiv = document.createElement('div');
factDiv.className = 'space-fact';
factDiv.textContent = randomFact;
// Insert the fact section before the gallery
const galleryDiv = document.getElementById('gallery');
container.insertBefore(factDiv, galleryDiv);

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
