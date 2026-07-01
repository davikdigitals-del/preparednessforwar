// Temporary file to calculate proper coordinates
// Your coordinates seem to be based on a ~2048x1024 image
// Converting to percentages: x/2048*100, y/1024*100

const countries = [
  // From your first batch
  { name: "Canada", code: "CA", x: (303/2048*100).toFixed(1), y: (259/1024*100).toFixed(1) },
  { name: "United States of America", code: "US", x: (315/2048*100).toFixed(1), y: (377/1024*100).toFixed(1) },
  { name: "Mexico", code: "MX", x: (274/2048*100).toFixed(1), y: (445/1024*100).toFixed(1) },
  { name: "Greenland", code: "GL", x: (507/2048*100).toFixed(1), y: (130/1024*100).toFixed(1) },
  { name: "Brazil", code: "BR", x: (496/2048*100).toFixed(1), y: (620/1024*100).toFixed(1) },
];

console.log("Calculated coordinates:");
countries.forEach(c => {
  console.log(`{ name: "${c.name}", code: "${c.code}", x: ${c.x}, y: ${c.y} },`);
});