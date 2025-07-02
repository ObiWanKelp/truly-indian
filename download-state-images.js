const axios = require("axios");
const fs = require("fs");
const path = require("path");

// 🧠 Add your Unsplash access key here
const ACCESS_KEY = "n4njuLgAzaABa0Hn89gyy-SXAaWoqJtkp9yh3OK2gXo";

const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

async function downloadImage(url, filepath) {
  const response = await axios.get(url, { responseType: "stream" });
  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

async function fetchAndDownloadImages() {
  for (const state of STATES) {
    const query = `${state} India`;
    const safeName = state.replace(/\s+/g, "_");
    const filepath = path.join(
      __dirname,
      "public",
      "uploads",
      `${safeName}.jpg`
    );

    try {
      const res = await axios.get("https://api.unsplash.com/search/photos", {
        params: {
          query,
          per_page: 1,
        },
        headers: {
          Authorization: `Client-ID ${ACCESS_KEY}`,
        },
      });

      const imageUrl = res.data.results[0]?.urls?.regular;

      if (imageUrl) {
        console.log(`Downloading image for ${state}...`);
        await downloadImage(imageUrl, filepath);
        console.log(`Saved: ${filepath}`);
      } else {
        console.warn(`No image found for ${state}`);
      }
    } catch (error) {
      console.error(`Error for ${state}:`, error.message);
    }
  }
}

fetchAndDownloadImages();
