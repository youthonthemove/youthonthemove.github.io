const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

async function xmlVersJsonData(xmlUrl, jsonDataPath, dataFilename) {
  try {
    const outputFilePath = path.join(jsonDataPath, `${dataFilename}.json`);

    // 1. Supprimer le fichier JSON existant s'il existe
    if (fs.existsSync(outputFilePath)) {
      fs.unlinkSync(outputFilePath);
      console.log(`Fichier JSON existant supprimé : ${outputFilePath}`);
    }

    const response = await fetch(xmlUrl);
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération du XML: ${response.status} ${response.statusText}`);
    }
    const xmlText = await response.text();

    const parser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: false,
      mergeAttrs: true,
    });

    const result = await parser.parseStringPromise(xmlText);

    // 2. Créer le fichier JSON à partir du flux et extraire les données
    let jsonData = result;
    for (const key in jsonData) {
      if (typeof jsonData[key] === 'object' && jsonData[key] !== null) {
        jsonData = jsonData[key];
        break;
      }
    }

    // Function to extract enclosure URLs, pubDate, and description
    function extractEpisodeData(items) {
      if (!Array.isArray(items)) {
        return [];
      }

      return items.map(item => {
        let episodeData = {
          pubDate: item.pubDate || null,
          description: item.description || null,
          title: item.title
        };

        if (item.enclosure && item.enclosure.url) {
          episodeData.enclosureUrl = item.enclosure.url;
        }

        return episodeData;
      }).filter(Boolean);
    }

    let episodeData = [];
    if (jsonData.channel && jsonData.channel.item) {
      episodeData = extractEpisodeData(Array.isArray(jsonData.channel.item) ? jsonData.channel.item : [jsonData.channel.item]);
    }

    // Créez le dossier _data s'il n'existe pas
    const dataDir = path.dirname(jsonDataPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(outputFilePath, JSON.stringify({ episodes: episodeData }, null, 2), 'utf-8');

    console.log(`Flux XML converti et enregistré dans : ${outputFilePath}`);

  } catch (error) {
    console.error(`Erreur lors de la conversion XML en JSON : ${error}`);
  }
}

// Exemple d'utilisation
const xmlUrl = 'https://anchor.fm/s/f48553a0/podcast/rss';
const jsonDataPath = './_data';
const dataFilename = 'podcasts';

xmlVersJsonData(xmlUrl, jsonDataPath, dataFilename);