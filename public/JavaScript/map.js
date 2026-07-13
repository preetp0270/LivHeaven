// Defensive init: ensure mapToken and coordinates are present and valid before creating the map
(() => {
  const mapContainer = document.getElementById('map');
  if (!mapContainer) {
    console.error('Map container #map not found in DOM.');
    return;
  }

  if (typeof mapToken === 'undefined' || !mapToken) {
    console.error('Mapbox token is missing (mapToken). Map will not initialize.');
    mapContainer.innerHTML = '<div style="padding:24px; text-align:center; color:#666;">Map is unavailable - missing Mapbox token.</div>';
    return;
  }

  if (!Array.isArray(coordinates) || coordinates.length !== 2 || isNaN(Number(coordinates[0])) || isNaN(Number(coordinates[1]))) {
    console.error('Invalid coordinates provided to map:', coordinates);
    mapContainer.innerHTML = '<div style="padding:24px; text-align:center; color:#666;">Map is unavailable - invalid coordinates.</div>';
    return;
  }

  // Safe to initialize
  try {
    mapboxgl.accessToken = mapToken;
    const map = new mapboxgl.Map({
      container: 'map', // container ID
      center: coordinates, // starting position [lng, lat]
      zoom: 9
    });

    // Create a custom marker element
    const markerEl = document.createElement('div');
    markerEl.style.backgroundImage = 'url("https://res.cloudinary.com/debxc1fio/image/upload/v1762281419/location_on_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24_dseffr.png")';
    markerEl.style.backgroundSize = 'contain';
    markerEl.style.width = '30px';
    markerEl.style.height = '30px';
    markerEl.style.borderRadius = '50%';
    markerEl.style.cursor = 'pointer';
    markerEl.style.transition = 'all 0.2s ease';

    // Add hover effect — show logo image on hover
    markerEl.addEventListener('mouseenter', () => {
      markerEl.style.backgroundImage = 'url("https://res.cloudinary.com/debxc1fio/image/upload/v1762274359/family_home_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24_yqy9tt.png")';
      markerEl.style.backgroundRepeat = 'no-repeat';
      markerEl.style.backgroundPosition = 'center';
    });

    markerEl.addEventListener('mouseleave', () => {
      markerEl.style.backgroundImage = 'url("https://res.cloudinary.com/debxc1fio/image/upload/v1762281419/location_on_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24_dseffr.png")';
    });

    // Add the marker with popup
    new mapboxgl.Marker({ element: markerEl })
      .setLngLat(coordinates)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML(`<p>Welcome to LivHaven and ${locationName}</p>`)
          .setMaxWidth('300px')
      )
      .addTo(map);
  } catch (err) {
    console.error('Failed to initialize Mapbox map:', err);
    mapContainer.innerHTML = '<div style="padding:24px; text-align:center; color:#666;">Map failed to load. See console for details.</div>';
  }
})();
