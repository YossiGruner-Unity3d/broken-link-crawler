const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');
const fs = require('fs');

// Set to keep track of visited URLs
const visitedUrls = new Set();
// Set to keep track of URLs with broken links
const urlsWithBrokenLinks = new Set();

// Function to check a single URL
async function checkLink(urlString, baseUrl) {
  try {
    if (visitedUrls.has(urlString)) {
      //console.log(`Skipping already visited URL: ${urlString}`);
      return [];
    }

    const response = await axios.get(urlString);
    const $ = cheerio.load(response.data);
    const foundUrls = [];

    // Extract all URLs from the HTML content
    $('a').each((index, element) => {
      const href = $(element).attr('href');
      if (href) {
        const absoluteUrl = new URL(href, baseUrl).toString();
        foundUrls.push(absoluteUrl);
      }
    });

    // Mark the URL as visited
    visitedUrls.add(urlString);

    // Write all visited URLs to a file
    fs.appendFileSync('visitedUrls.txt', urlString + '\n');

    return foundUrls;
  } catch (error) {
    console.log(`Error for URL: ${urlString} - ${error.message}. Retrying in 5 seconds...`);
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Log the URL with a broken link to the file
    if (
        !error.message.includes('404') ||
        !error.message.includes('403') 
    ) {
    //   console.log(`Ignoring error for URL: ${urlString} - ${error.message}`);
      return [];
    }
    fs.appendFileSync('brokenLinks.txt', `${urlString} - Error: ${error.message}\n`);
    urlsWithBrokenLinks.add(urlString);
    return checkLink(urlString, baseUrl); // Retry the request
  }
}

// Recursive function to check links starting from a URL
async function checkLinksRecursively(urlString, baseUrl) {
  try {
    const foundUrls = await checkLink(urlString, baseUrl);
    const promises = foundUrls
      .filter((foundUrl) => url.parse(foundUrl).hostname === url.parse(baseUrl).hostname) // Filter out irrelevant URLs
      .map((foundUrl) => checkLinksRecursively(foundUrl, baseUrl));
    return Promise.all(promises).then((results) => results.flat());
  } catch (error) {
    return [];
  }
}

// Get the main URL from command-line arguments
const mainUrl = process.argv[2];

// Check if the main URL is provided
if (!mainUrl) {
  console.error('Error: Please provide the main URL as a command-line argument.');
  process.exit(1);
}

// Example usage with a main URL passed as a command-line argument
checkLinksRecursively(mainUrl, mainUrl)
  .then((foundUrls) => {
    console.log('Found URLs in HTML content:');
    console.log(foundUrls.length ? foundUrls.join('\n') : 'No URLs found.');

    console.log('URLs with Broken Links:');
    console.log(
      urlsWithBrokenLinks.size ? [...urlsWithBrokenLinks].join('\n') : 'No URLs with broken links.'
    );
  })
  .catch((error) => console.error('Error:', error.message));
