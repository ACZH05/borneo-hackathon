export const requestUserLocation = (silent: boolean = false): Promise<{ lat: number; lng: number } | null> => {
  return new Promise((resolve) => {
    // 1. Check if the browser even supports geolocation.
    if (!("geolocation" in navigator)) {
      if (!silent) alert("Geolocation is not supported by your browser. Please use a compatible browser if possible.");
      resolve(null);
      return;
    }

    // 2. Ask for the location. (This triggers the browser's permission popup.)
    navigator.geolocation.getCurrentPosition(
      // --- Success Callback (User Clicked "Allow") ---
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },

      // --- Error Callback (User Clicked "Block" or Something Failed) ---
      (error) => {
        if (!silent) {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              alert("You denied the request for Geolocation. Please enable it in your browser settings to ensure the website work well.");
              break;
            case error.POSITION_UNAVAILABLE:
              alert("Location information is unavailable.");
              break;
            case error.TIMEOUT:
              alert("The request to get user location timed out.");
              break;
            default:
              alert("An unknown error occurred.");
              break;
          }
        }
        resolve(null);
      }
    );
  });
};