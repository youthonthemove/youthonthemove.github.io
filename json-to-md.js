const fs = require('fs').promises;
const path = require('path');
const { parse } = require('node-html-parser');
const slugify = require('slugify');

function generateSlug(title) {
  return slugify(title, { lower: true, strict: true });
}

async function createMdFilesFromJson(jsonData, outputDir) {
  try {
    await fs.mkdir(outputDir, { recursive: true });

    const episodes = jsonData.episodes || [];
    const indexData = [];

    for (let i = 0; i < episodes.length; i++) {
      const episode = episodes[i];
      const pubDate = episode.pubDate;
      const enclosureUrl = episode.enclosureUrl;
      const description = episode.description || '';
      const title = episode.title || `Episode ${i + 1}`;

      const root = parse(description);
      const cleanedDescription = root.textContent;

      let formattedDate = null;
      try {
        const dateObject = new Date(pubDate);
        if (!isNaN(dateObject.getTime())) {
          const year = dateObject.getFullYear();
          const month = String(dateObject.getMonth() + 1).padStart(2, '0');
          const day = String(dateObject.getDate()).padStart(2, '0');
          formattedDate = `${year}-${month}-${day}`;
        }
      } catch (dateError) {
        console.warn(`Warning invalid date for episode ${i + 1}: ${pubDate}`, dateError);
      }

      const slug = generateSlug(title);
      const permalink = formattedDate ? `${formattedDate}-${slug}` : slug;
      const filename = formattedDate ? `${formattedDate}-${slug}.md` : `${slug}.md`;
      const filepath = path.join(outputDir, filename);

      const mdContent = `---
layout: post
type: podcast
title: "${title}"
date: "${formattedDate}"
enclosure: "${enclosureUrl}"
slug: "${slug}"
permalink: "${permalink}"
parent: "/"
published: true
---
${cleanedDescription}
`;

      await fs.writeFile(filepath, mdContent, 'utf-8');
      console.log(`Created: ${filepath}`);

      indexData.push({ title: title, slug: permalink });
    }

    return indexData;
  } catch (error) {
    console.error('Error in createMdFilesFromJson:', error);
    throw error;
  }
}

async function updatePodcastMd(filePath, episodesData) {
  try {
    const data = await fs.readFile(filePath, 'utf8');

    // Remove existing frontmatter (very basic removal, assumes it starts and ends with '---')
    const contentWithoutFrontmatter = data.split('---').slice(2).join('---');

    let newFrontmatter = '---\n';
    newFrontmatter += 'title: Podcasts\n';
    newFrontmatter += 'layout: podcasts\n'; // You might want to change this
    newFrontmatter += 'permalink: /podcasts\n'; // and this

    newFrontmatter += 'episodes:\n';
    episodesData.forEach(episode => {
      newFrontmatter += `  - data:\n`
      newFrontmatter += `     title: "${episode.title}"\n`;
      newFrontmatter += `     url: "/${episode.slug}"\n`;
    });
    newFrontmatter += '---\n';

    const newContent = newFrontmatter + contentWithoutFrontmatter;

    await fs.writeFile(filePath, newContent, 'utf8');
    console.log(`Updated: ${filePath}`);

  } catch (error) {
    console.error(`Error updating ${filePath}:`, error);
    throw error;
  }
}

// Example usage
const jsonFilePath = './_data/podcasts.json';
const outputDirectory = './_posts';
const podcastMdFilePath = './podcasts.md'; // Path to your podcast.md

(async () => {
  try {
    const data = await fs.readFile(jsonFilePath, 'utf8');
    const jsonData = JSON.parse(data);
    const episodeIndexData = await createMdFilesFromJson(jsonData, outputDirectory);
    await updatePodcastMd(podcastMdFilePath, episodeIndexData);
  } catch (error) {
    console.error('An error occurred:', error);
  }
})();