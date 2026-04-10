const fetch = require('node-fetch');

async function test() {
  const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': 'AIzaSyB7fzIcWl3d6A9kzPaoa0WoycerUD3oi4w',
      'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs',
    },
    body: JSON.stringify({
      origin: { address: "Chennai" },
      destination: { address: "Thoothukudi" },
      travelMode: 'DRIVE'
    })
  });
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

test();
