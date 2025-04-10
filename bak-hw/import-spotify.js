const axios = require('axios');
const cheerio = require('cheerio');
const TurndownService = require('turndown');
const { XMLParser } = require('fast-xml-parser');
const fs = require('fs').promises;
const path = require('path');
const slugify = require('slugify');
const { format } = require('date-fns');

const FEED_URL = 'https://anchor.fm/s/f48553a0/podcast/rss';
const POSTS_DIR = '_posts';

const turndownService = new TurndownService();
const xmlParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

async function fetchFeed() {
    try {
        const response = await axios.get(FEED_URL);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération du flux:', error);
        throw error;
    }
}

async function parseFeed(xmlData) {
    const jsonData = xmlParser.parse(xmlData);
    return jsonData.rss.channel.item;
}

async function processItem(item) {
    const title = item.title;
    const pubDate = new Date(item.pubDate);
    const slug = slugify(title, { lower: true, remove: /[*+~.()'"!:@]/g });
    const date = pubDate.toISOString().split('T')[0];
    const filename = path.join(POSTS_DIR, `${date}-${slug}.md`);

    // Safely extract the enclosure URL
    let enclosureUrl = null;
    if (item.enclosure && item.enclosure['@_url']) {
        enclosureUrl = item.enclosure['@_url'];
    }

   let contentHtml = '';
       if (item['content:encoded']) {
           if (typeof item['content:encoded'] === 'string') {
               contentHtml = item['content:encoded'];
           } else if (item['content:encoded']['#text']) {
               contentHtml = item['content:encoded']['#text'];
           } else {
               console.warn(`content:encoded existe mais n'est pas une chaîne et n'a pas de #text pour l'article: ${title}`);
               console.log("Contenu de item['content:encoded']:", item['content:encoded']);
           }
       } else if (item.description) {
           contentHtml = item.description;
       }
   
       if (!contentHtml) {
           console.warn(`Aucun contenu valide trouvé pour l'article: ${title}. Article ignoré.`);
           console.log("Objet item complet:", item);
           return;
       }
   
       const $ = cheerio.load(contentHtml);
       const firstImage = $('img').first().attr('src');
   
       const markdownContent = turndownService.turndown($.html());
   
       const categories = Array.isArray(item.category)
           ? item.category.map(cat => typeof cat === 'object' ? cat['#text'] : cat)
           : (item.category ? [typeof item.category === 'object' ? item.category['#text'] : item.category] : []);
   
       const frontmatter = `---
layout: post
type: story
title: "${title.replace(/"/g, '\\"')}"
date: ${pubDate.toISOString()}
categories: ["temoignage","podcast","replay"]
enclosure: ${enclosureUrl}
---`;
   
       const fileContent = `${frontmatter}\n\n${markdownContent}`;
   
       try {
           await fs.writeFile(filename, fileContent, 'utf-8');
           console.log(`Article sauvegardé: ${filename}`);
       } catch (error) {
           console.error(`Erreur lors de la sauvegarde de ${filename}:`, error);
       }
   }

async function main() {
    try {
        await fs.mkdir(POSTS_DIR, { recursive: true });
        const feedData = await fetchFeed();
        const items = await parseFeed(feedData);

        for (const item of items) {
            await processItem(item);
        }

        console.log('Importation terminée.');
    } catch (error) {
        console.error('Erreur lors de l\'importation:', error);
    }
}

main();