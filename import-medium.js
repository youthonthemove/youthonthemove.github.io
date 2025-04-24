const axios = require('axios');
const cheerio = require('cheerio'); // Remplacez html-parser par cheerio
const TurndownService = require('turndown');
const { XMLParser } = require('fast-xml-parser');
const fs = require('fs').promises;
const path = require('path');
const slugify = require('slugify');
const { format } = require('date-fns');

const FEED_URL = 'https://medium.com/feed/yotm/tagged/temoignages';
const POSTS_DIR = '_histoires';

const turndownService = new TurndownService();
const xmlParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

async function fetchFeed() {
    try {
        const response = await axios.get(FEED_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
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
    const filename = path.join(POSTS_DIR, `${format(pubDate, 'yyyy-MM-dd')}-${slug}.md`);

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
ss-type: histoire
icon: fa-solid fa-feather-pointed
title: "${title.replace(/"/g, '\\"')}"
date: ${pubDate.toISOString()}
categories: ${JSON.stringify(categories)}
${firstImage ? `image: ${firstImage}` : ''}
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