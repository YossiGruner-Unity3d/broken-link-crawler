# Asset Store Broken Link crawler

## Overview

This Node.js script checks a given website for broken links by recursively scanning its HTML content. It reports broken links and ignores certain errors to improve the user experience.

## Prerequisites

- Node.js installed
- npm (Node Package Manager) installed

## How to Use

1. Clone the repository:

```bash
    git clone <repository_url>
```

2. Navigate to the project directory:

```bash
    cd assetstore_web_crawler
```

3. Install dependencies:

```bash
    npm install
```

4. Run the script:

``` bash
node index.js <main_url>
```

Replace <main_url> with the URL of the website you want to scan.

## Output

The script generates two files in the project directory:

- `visitedUrls.txt`: Contains a list of all visited URLs during the scan.
- `brokenLinks.txt`: Contains a list of URLs with broken links.
