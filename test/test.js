const BeatMapStuff = require('../beatmap');
const fs = require('fs');

const beatmap = BeatMapStuff.BeatmapFile.read('./test.osu');

fs.writeFileSync('./test.json', JSON.stringify(beatmap));