// @ts-check

// @ts-ignore
const fs = require('fs');

class BeatmapFile {
    /**
     * Create a beatmap file 
     * @param {GeneralBeatmapInfo} general General Items
     * @param {Metadata} meta Song Metadata
     * @param {Difficulty} diff Difficulty Settings
     * @param {Array<TimingPoint>} timingPoints List of Timing Points
     * @param {Array<HitObject>} hitObjects List of Hit Objects
     */
    constructor(general, meta, diff, timingPoints, hitObjects) {

        //#region General 

        /**
         * Specifies the location of the audio file relative to the current folder.
         */
        this.audioFileName = general.audioFileName;

        /**
         * (ms) Amount of time added before the audio file begins playing. Useful for audio files that begin immediately.
         */
        this.audioLeadIn = general.audioLeadIn || 0;

        /**
         * (ms) Defines when the audio file should begin playing when selected in the song selection menu.
         */
        this.previewTime = general.previewTime || 0;

        /**
         * Specifies the speed of the countdown which occurs before the first hit object appears. (0=No countdown, 1=Normal, 2=Half 3=Double)
         */
        this.countdown = general.countdown || 0;

        /**
         * Specifies which set of hit sounds will be used throughout the beatmap.
         */
        this.sampleSet = general.sampleSet || "Normal";

        /**
         * How often closely placed hit objects will be stacked together.
         */
        this.stackLeniency = general.stackLeniency || 0;

        /**
         * Defines the game mode of the beatmap. (0=osu!, 1=Taiko, 2=Catch the Beat, 3=osu!mania)
         */
        this.mode = general.mode || 0;
        
        /**
         * Specifies whether the letterbox appears during breaks.
         */
        this.letterboxInBreaks = general.letterboxInBreaks || false;
        
        /**
         * Specifies whether or not display the storyboard in front of combo fire.
         */
        this.storyFireInFront = general.storyFireInFront || false;
        
        /**
         * Specifies the preferred skin to use during gameplay.
         */
        this.skinPreference = general.skinPreference || "Default"
        
        /**
         * Specifies whether or not show a 'This beatmap contains scenes with rapidly flashing colours...' warning at the beginning of the beatmap.
         */
        this.epilepsyWarning = general.epilepsyWarning || false;
        
        /**
         * Specifies how many beats earlier the countdown starts.
         */
        this.countdownOffset = general.countdownOffset || 0;
        
        /**
         * Specifies whether or not the storyboard should be widescreen.
         */
        this.widescreenStoryboard = general.widescreenStoryboard || false;
        
        /**
         * Specifies whether or not use the special `N+1` style for osu!mania.
         */
        this.specialStyle = general.specialStyle || false;
        
        /**
         * Specifies whether or not the storyboard can use user's skin resources.
         */
        this.useSkinSprites = general.useSkinSprites || false;
        //#endregion

        //#region Metadata 
        /**
         * Title of the song limited to ASCII characters.
         */
        this.title = meta.title;
        
        /**
         *  Title of the song with unicode support. If not present, Title is used.
         */
        this.titleUnicode = meta.titleUnicode;
        
        /**
         * Name of the song's artist limited to ASCII characters.
         */
        this.artist = meta.artist;
        
        /**
         * Name of the song's artist with unicode support. If not present, Artist is used.
         */
        this.artistUnicode = meta.artistUnicode;
        
        /**
         * Username of the mapper.
         */
        this.creator = meta.creator;
        
        /**
         * Name of the beatmap's difficulty.
         */
        this.version = meta.version;
        
        /**
         * Origin of the song.
         */
        this.source = meta.source
        
        /**
         * Collection of words describing the song
         */
        this.tags = meta.tags;
        
        /**
         * ID of the single beatmap.
         */
        this.beatmapID = meta.beatmapID;
        
        /**
         * ID of the beatmap set.
         */
        this.beatmapSetID = meta.beatmapSetID
        //#endregion

        //#region Difficulty
        /**
         * Specifies how fast the health decreases. (The definition of this property may be changed in the near future.)
         */ 
        this.hpDrainRate = diff.hpDrainRate;
        
        /**
         * Defines the size of the hit objects in the osu!standard mode. In osu!mania mode, CircleSize is the number of columns.
         */ 
        this.circleSize = diff.circleSize;
        
        /**
         * Harshness of the hit window and the difficulty of spinners.
         */ 
        this.overallDifficulty = diff.overallDifficulty;
        
        /**
         * Defines when hit objects start to fade in relatively to when they should be hit.
         */ 
        this.approachRate = diff.approachRate;
        
        /**
         * Specifies the multiplier of the slider velocity.
         */ 
        this.sliderMultiplier = diff.sliderMultiplier;
        //#endregion

        //#region Timing Points
        this.timingPoints = timingPoints;
        //#endregion

        //#region hit objects
        this.hitObjects = hitObjects;
        //#endregion
    }

    //TODO
    calculateStarRating() {
        throw new Error("not implemented");
    }

    /**
     * @param {String|URL} path
     * @returns {BeatmapFile}
     */
    static read(path) {
        const file = fs.readFileSync(path, 'utf8');

        //@ts-ignore
        return this.parse(file);
    }

    /**
     * Load a beatmap from raw text
     * @param {string} str Raw Beatmap File
     * @returns {BeatmapFile} loaded file
     */
    static parse(str) {
        const lines = str.split('\r').join('').split('\n');

        //#region Variables
        let general = {audioFileName:'', background:''};
        let metadata = {title:'', titleUnicode:null, artist:'', artistUnicode:null, creator:'', version:'', tags:[], beatmapID:0, beatmapSetID:0};
        let difficulty = {hpDrainRate:0, circleSize:0, overallDifficulty:0, approachRate:0, sliderMultiplier:0};

        let timingPoints = [];
        let hitObjects = [];
        //#endregion

        let section = 0; //general:0, editor:1, metadata:2, difficulty:3, events:4, timing:5, colors:6, hitobjects:7
        const pi = parseInt;
        const pf = parseFloat;

        lines.forEach(line => {
            // empty line or comment
            if (line == "" || line.startsWith('//')) return;

            // look for section
            if (line.startsWith('[')) {
                // general: 0 (Default)
                if (line.startsWith("[Editor]")) section = 1;
                if (line.startsWith("[Metadata]")) section = 2;
                if (line.startsWith("[Difficulty]")) section = 3;
                if (line.startsWith("[Events]")) section = 4;
                if (line.startsWith("[TimingPoints]")) section = 5;
                if (line.startsWith("[Colours]")) section = 6;
                if (line.startsWith("[HitObjects]")) section = 7;
                return;
            }

            //#region General
            if (section === 0) {

                // get the property
                const lin = line.split(':');
                const property = lin[0];
                const value = lin[1];
                
                // check properties
                if      (property === "AudioFilename") general.audioFileName = value; 
                else if (property === "AudioLeadIn") general.audioLeadIn = pi(value);
                else if (property === "PreviewTime") general.previewTime = pi(value);
                else if (property === "Countdown") general.countdown = pi(value);
                else if (property === "SampleSet") general.sampleSet = value;
                else if (property === "StackLeniency") general.stackLeniency = pf(value);
                else if (property === "Mode") general.mode = pi(value);
                else if (property === "LetterboxInBreaks") general.letterboxInBreaks = pi(value);
                else if (property === "StoryFireInFront") general.storyFireInFront = pi(value);
                else if (property === "SkinPreference") general.skinPreference = value;
                else if (property === "EpilepsyWarning") general.epilepsyWarning = value == '1';
                else if (property === "CountdownOffset") general.countdownOffset = pi(value);
                else if (property === "WidescreenStoryboard") general.mode = value == '1';
                else if (property === "SpecialStyle") general.specialStyle = value == '1';
                else if (property === "UseSkinSprites") general.useSkinSprites = value == '1';
            }
            //#endregion

            //#region Editor (skip)
            if (section === 1) return;
            //#endregion

            //#region Metadata
            if (section === 2) {
                
                // get the property
                const lin = line.split(':');
                const property = lin[0];
                const value = lin[1];

                // check properties
                if      (property === "Title") metadata.title = value; 
                else if (property === "TitleUnicode") metadata.titleUnicode = value;
                else if (property === "Artist") metadata.artist = value;
                else if (property === "ArtistUnicode") metadata.artistUnicode = value;
                else if (property === "Creator") metadata.creator = value;
                else if (property === "Version") metadata.version = value;
                else if (property === "Source") metadata.source = value;
                else if (property === "Tags") metadata.tags = value.split(' ');
                else if (property === "BeatmapID") metadata.beatmapID = pi(value);
                else if (property === "BeatmapSetID") metadata.beatmapSetID = pi(value);
            }
            //#endregion

            //#region Difficulty
            if (section === 3) {
                
                // get the property
                const lin = line.split(':');
                const property = lin[0]; // TODO maybe trim to exclude '//' if needed (.split('//')[0])
                const value = lin[1];

                if      (property === "HPDrainRate") difficulty.hpDrainRate = pf(value);
                else if (property === "CircleSize") difficulty.circleSize = pf(value);
                else if (property === "OverallDifficulty") difficulty.overallDifficulty = pf(value);
                else if (property === "CircleSize") difficulty.circleSize = pf(value);
                else if (property === "ApproachRate") difficulty.approachRate = pf(value);
                else if (property === "SliderMultiplier") difficulty.sliderMultiplier = pf(value);
                else if (property === "SliderTickRate") difficulty.sliderTickRate = pf(value);
            }
            //#endregion

            //#region Events (BG Only)
            if (section === 4) {
                if (line.startsWith('0,0') && line.endsWith(',0,0')) {
                    const li = line.split(',');
                    general.background = li[2];
                }
                else return;
            }
            //#endregion

            //#region Timing
            if (section === 5) {
                timingPoints.push(TimingPoint.parse(line));
            }
            //#endregion
            
            //#region Colors (skip)
            if (section === 6) return;
            //#endregion
            
            //#region hit Objects
            if (section === 7) {
                hitObjects.push(HitObject.parse(line));
            }
            //#endregion

        });

        return new BeatmapFile(general, metadata, difficulty, timingPoints, hitObjects);
    }

    //TODO
    /**
     * coverts this file into a .osu file string 
     * @returns {string}
     */
    osu() {
        throw new Error('Not Implemented');

        let output = 'osu file format v14\n\n';

        //#region General
        output += '[General]\n';

        //#endregion

        return output;
    }
}


class TimingPoint {
    /**
     * @param {number} offset The offset is an integral number of milliseconds, from the start of the song. 
     * - It defines when the timing point starts. 
     * - A timing point ends when the next one starts. 
     * - The first timing point starts at 0, disregarding its offset.
     * @param {number} millisecondsPerBeat Defines the duration of one beat.
     * - It affect the scrolling speed in osu!taiko or osu!mania, and the slider speed in osu!standard, among other things. 
     * - When positive, it is faithful to its name. When negative, it is a percentage of previous non-negative milliseconds per beat. 
     * - For instance, 3 consecutive timing points with `500`, `-50`, `-100` will have a resulting beat duration of half a second, a quarter of a second, and half a second, respectively.
     * @param {number} meter Defines the number of beats in a measure.
     * @param {number} sampleSet Defines the default sample set for hit objects.
     * @param {number} sampleIndex Default custom index.
     * @param {number} volume (0 to 100) is the default volume.
     * @param {boolean} inherited Tells if the timing point can be inherited from. 
     * - Inherited is redundant with the milliseconds per beat field. 
     * - A positive milliseconds per beat implies inherited is 1, and a negative one implies it is 0.
     * @param {boolean} kiaiMode Defines whether or not Kiai Time effects are active.
     */
    constructor(offset, millisecondsPerBeat, meter, sampleSet, sampleIndex, volume, inherited, kiaiMode) {
        /**
         - The offset is an integral number of milliseconds, from the start of the song. 
         - It defines when the timing point starts. A timing point ends when the next one starts. 
         - The first timing point starts at 0, disregarding its offset.
         * @type {number}
         */
        this.offset = offset;
        
        /**
         * Defines the duration of one beat. 
         * - It affect the scrolling speed in osu!taiko or osu!mania, and the slider speed in osu!standard, among other things. 
         * - When positive, it is faithful to its name. 
         * - When negative, it is a percentage of previous non-negative milliseconds per beat. 
         * - For instance, 3 consecutive timing points with `500`, `-50`, `-100` will have a resulting beat duration of half a second, a quarter of a second, and half a second, respectively.
         * @type {number}
         */
        this.millisecondsPerBeat = millisecondsPerBeat;

        /**
         * Defines the number of beats in a measure.
         * @type {number}
         */
        this.meter = meter;
        
        /**
         * Defines the default sample set for hit objects.
         * @type {number}
         */
        this.sampleSet = sampleSet;

        /**
         * Default custom index.
         * @type {number}
         */
        this.sampleIndex = sampleIndex;

        /**
         * (0 to 100) is the default volume.
         * @type {number}
         */
        this.volume = volume;

        /**
         * Tells if the timing point can be inherited from. Inherited is redundant with the milliseconds per beat field. 
         * - A positive milliseconds per beat implies inherited is 1, and a negative one implies it is 0.
         * @type {boolean}
         */
        this.inherited = inherited;

        /**
         * Defines whether or not Kiai Time effects are active.
         * @type {boolean}
         */
        this.kiaiMode = kiaiMode;
    }

    /**
     * Convert a line into a Timing Point object
     * @param {string} str 
     * @returns {TimingPoint}
     */
    static parse(str) {
        const line = str.split(',');
        let offset, millisecondsPerBeat, meter, sampleSet, sampleIndex, volume, inherited, kiaiMode;

        const pi = parseInt;
        const pf = parseFloat;

        offset              = pi(line[0]);
        millisecondsPerBeat = pi(line[1]);
        meter               = pi(line[2]);
        sampleSet           = pi(line[3]);
        sampleIndex         = pi(line[4]);
        volume              = pf(line[5]);
        inherited           = line[6].trim() === "1";
        kiaiMode            = line[7].trim() === "1";

        return new TimingPoint(offset, millisecondsPerBeat, meter, sampleSet, sampleIndex, volume, inherited, kiaiMode)
    }
}

/**
 * Main HitObject Class
 */
class HitObject {
    /**
     * @param {number} x Integer representing the x position of the center of the hit object. ranges from 0 to 512 pixels, inclusive. The origin, (0, 0) is at the top left of the screen.
     * @param {number} y Integer representing the y position of the center of the hit object. ranges from 0 to 384 pixels, inclusive. The origin, (0, 0) is at the top left of the screen.
     * @param {number} time Integral number of milliseconds from the beginning of the song, and specifies when the hit begins.
     * @param {number} type Bitmap specifying the object type and attributes.
     * @param {number} hitSound Bitmap of hit sounds to play when the hit object is successfully hit.
     * @param {Extras} [extras] Defines additional parameters related to the hit sound samples.
     */
    constructor(x, y, time, type, hitSound, extras) {
        /**
         * Integer representing the x position of the center of the hit object. ranges from 0 to 512 pixels, inclusive. The origin, (0, 0) is at the top left of the screen.
         * @type {number}
         */
        this.x = x;

        /**
         * Integer representing the y position of the center of the hit object. ranges from 0 to 384 pixels, inclusive. The origin, (0, 0) is at the top left of the screen.
         * @type {number}
         */
        this.y = y;

        /**
         * Integral number of milliseconds from the beginning of the song, and specifies when the hit begins.
         * @type {number}
         */
        this.time = time;

        /**
         * Bitmap specifying the object type and attributes.
         * @type {number}
         */
        this.type = type;
        this.hitSound = hitSound;

        // extras
        if (!extras) extras = {};
        this.sampleSet = extras.sampleSet || 0;
        this.additionSet = extras.additionSet || 0;
        this.customIndex = extras.customIndex || 0;
        this.sampleVolume = extras.sampleVolume || 0;
        this.filename = extras.filename || undefined;
    }

    /**
     * Turns this object into a new combo
     */
    applyNewCombo() {
        this.type += 4;
    }

    /**
     * Parse an osu beatmap line and returns a corresponding object
     * @param {string} line line to parse
     * @returns {HitCircle|HitSlider|HitSpinner|HitManiaHold} 
     */
    static parse(line) {
        //let x, y, time, type, hitSound, extras, output;
        let type, output;

        // remove spaces, then split by comma
        const info = (line.split(' ').join('')).split(',');

        // x,y,time,type,hitSound...,extras
        //x = parseFloat(info[0]);
        //y = parseFloat(info[1]);
        //time = parseFloat(info[2]);
        type = parseFloat(info[3]);
        //hitSound = parseInt(info[4]);
        //extras = parseExtras(info[info.length-1]);

        
        if (type & 1) output = HitCircle.parse(line);
        if (type & 2) output = HitSlider.parse(line);
        if (type & 8) output = HitSpinner.parse(line);
        // skip 16, 32 and 64, they're for color stuff which doesnt matter
        if (type & 128) output = HitSpinner.parse(line);



        // @ts-ignore
        if (type & 4) output.applyNewCombo();

        return output;
    }
}

/**
 * A hit circle is a single hit in all osu! game modes.
 */
class HitCircle extends HitObject {
    /**
     * @param {number} x Integer representing the x position of the center of the hit object. ranges from 0 to 512 pixels, inclusive. The origin, (0, 0) is at the top left of the screen.
     * @param {number} y Integer representing the y position of the center of the hit object. ranges from 0 to 384 pixels, inclusive. The origin, (0, 0) is at the top left of the screen.
     * @param {number} time Integral number of milliseconds from the beginning of the song, and specifies when the hit begins.
     * @param {number} hitSound Bitmap of hit sounds to play when the hit object is successfully hit.
     * @param {Extras} [extras] Defines additional parameters related to the hit sound samples.
     */
    constructor(x, y, time, hitSound, extras) {
        super(x, y, time, 1, hitSound, extras);
        // all done lol
    }

    /**
     * @param {string} str 
     * @returns {HitCircle}
     */
    static parse(str) {
        let x, y, time, hitSound, extras;

        // remove spaces, then split by comma
        const info = (str.split(' ').join('')).split(',');

        x = parseFloat(info[0]);
        y = parseFloat(info[1]);
        time = parseFloat(info[2]);
        // type = info[3]
        hitSound = parseInt(info[4]);
        extras = parseExtras(info[5]);

        return new HitCircle(x, y, time, hitSound, extras);
    }

}

/**
 * A slider also creates droplets in Catch the Beat, yellow drumrolls in Taiko, and does not appear in osu!mania.
 */
class HitSlider extends HitObject {
    /**
     * @param {number} x Integer representing the x position of the center of the hit object. 
     * - Ranges from 0 to 512 pixels, inclusive. 
     * - The origin, (0, 0) is at the top left of the screen.
     * @param {number} y Integer representing the y position of the center of the hit object. 
     * - Ranges from 0 to 384 pixels, inclusive. 
     * - The origin, (0, 0) is at the top left of the screen.
     * @param {number} time Integral number of milliseconds from the beginning of the song, and specifies when the hit begins.
     * @param {number} hitSound Bitmap of hit sounds to play when the hit object is successfully hit.
     * 
     * @param {string} sliderType Should be L (linear), P (perfect), B (Bezier), or C (Catmull, deprecated).
     * @param {Array<Point>} [curvePoints] Coordinates describing the control points of the slider. 
     * - A linear slider has a start, specified in x and y from the common fields, and an end point specified in curvePoints. 
     * - A perfect circle slider is defined by three points. In that order: start, pass-through, and end. 
     * - x and y define the start point, and curvePoints defines the pass-through and end point. 
     * - A Bézier slider is made of one or many Bézier curves, sharing common ends. 
     * - The degree of each curve is arbitrary. 
     * - The first control points is defined with x and y, and the other ones by curvePoints. 
     * - To identify the separation between two curves, the intersection point is repeated. 
     * - Consider the sequence ABCDDEFFG. You would get the 3 Bézier curves: ABCD (cubic), DEF (quadratic) , FG (linear).
     * @param {number} repeat Number of times a player will go over the slider. A value of 1 will not repeat, 2 will repeat once, 3 twice, and so on.
     * @param {number} pixelLength Length of the slider along the path of the described curve. 
     * - Specified in osu!pixels, i.e. relative to the 512×384 virtual screen. 
     * - The pixelLength is not the length of the curve path described above, but the actual length the slider should have. 
     * - If the pixelLength is smaller than the path length, the path must be shrinked. 
     * - Conversely, if the pixelLength is bigger than the path length, the path must be naturally extended: a longer line for linear sliders, a longer arc for perfect circle curves, and a final linear segment for Bézier paths.
     * @param {Array<number>} edgeHitsounds List of hitSounds to apply to the circles of the slider. 
     * - The values are the same as those for regular hit objects. 
     * - The list must contain exactly repeat + 1 values, where the first value is the hit sound to play when the slider is first clicked, and the last one when the slider is released.
     * @param {Array<number>} edgeAdditions List of samples sets to apply to the circles of the slider. 
     * - The list contains exactly repeat + 1 elements. s
     * - ampleSet and additionSet are the same as for hit circles' extras fields.
     * @param {Extras} [extras] Defines additional parameters related to the hit sound samples.
    */
    constructor(x, y, time, hitSound, sliderType, curvePoints, repeat, pixelLength, edgeHitsounds, edgeAdditions, extras) {
       super(x, y, time, 2, hitSound, extras);

        /**
         * Should be L (linear), P (perfect), B (Bezier), or C (Catmull, deprecated).
         * @type {string}
         */
        this.sliderType = sliderType;

        /**
         * Coordinates describing the control points of the slider. A linear slider has a start, specified in x and y from the common fields, and an end point specified in curvePoints. A perfect circle slider is defined by three points. In that order: start, pass-through, and end. x and y define the start point, and curvePoints defines the pass-through and end point.A Bézier slider is made of one or many Bézier curves, sharing common ends. The degree of each curve is arbitrary. The first control points is defined with x and y, and the other ones by curvePoints. To identify the separation between two curves, the intersection point is repeated. Consider the sequence ABCDDEFFG. You would get the 3 Bézier curves: ABCD (cubic), DEF (quadratic) , FG (linear).
         * @type {Array<Point>}
         */
        this.curvePoints = curvePoints;

        /**
         * Number of times a player will go over the slider. A value of 1 will not repeat, 2 will repeat once, 3 twice, and so on.
         * @type {number}
         */
        this.repeat = repeat;

        /**
         * Length of the slider along the path of the described curve. It is specified in osu!pixels, i.e. relative to the 512×384 virtual screen. The pixelLength is not the length of the curve path described above, but the actual length the slider should have. If the pixelLength is smaller than the path length, the path must be shrinked. Conversely, if the pixelLength is bigger than the path length, the path must be naturally extended: a longer line for linear sliders, a longer arc for perfect circle curves, and a final linear segment for Bézier paths.
         * @type {number}
         */
        this.pixelLength = pixelLength;

        /**
         * List of hitSounds to apply to the circles of the slider. The values are the same as those for regular hit objects. The list must contain exactly repeat + 1 values, where the first value is the hit sound to play when the slider is first clicked, and the last one when the slider is released.
         * @type {Array<number>}
         */
        this.edgeHitsounds = edgeHitsounds;

        /**
         * List of samples sets to apply to the circles of the slider. The list contains exactly repeat + 1 elements. sampleSet and additionSet are the same as for hit circles' extras fields.
         * @type {Array<number>}
         */
        this.edgeAdditions = edgeAdditions;
    }

    /**
     * Parse a Slider Object String
     * @param {string} str 
     * @returns {HitSlider} 
     */
    static parse(str) {
        let x, y, time, hitSound, sliderType,curvePoints, repeat, pixelLength, edgeHitsounds, edgeAdditions, extras;

        // remove spaces, then split by comma
        const info = (str.split(' ').join('')).split(',');
        
        // 0  1   2     3      4                 5                6      7                 8             9         10
        // x, y, time, type, hitSound, sliderType|curvePoints, repeat, pixelLength, edgeHitsounds, edgeAdditions, extras
        // ex: '424,96,66,2,0,B|380:120|332:96|332:96|304:124,1,130,2|0,0:0|0:0,0:0:0:0:'

        x = parseFloat(info[0]);
        y = parseFloat(info[1]);
        time = parseFloat(info[2]);
        // type = info[3]
        hitSound = parseInt(info[4]);

        //#region Slider
        // B|380:120|332:96|332:96|304:124
        let sliderInfo = info[5];

        // type
        sliderType = sliderInfo[0];
        sliderInfo = sliderInfo.substring(2);

        // points
        const points = sliderInfo.split('|');
        curvePoints = points.map(point => {
            const p = point.split(':');
            const x = parseInt(p[0]);
            const y = parseInt(p[1]);
            return {x:x, y:y};
        });
        //#endregion
        
        repeat = parseInt(info[6]);
        pixelLength = parseInt(info[7]);

        //#region Hitsounds

        // edge
        edgeHitsounds = info[8].split('|').map(sound => {
            return parseInt(sound);
        });

        edgeAdditions = info[9].split('|').map(sound => {
            return parseInt(sound);
        });
        //#endregion

        extras = parseExtras(info[10]);

        return new HitSlider(x, y, time, hitSound, sliderType, curvePoints, repeat, pixelLength, edgeHitsounds, edgeAdditions, extras);
    }
}

/**
 * A spinner also creates bananas in Catch the Beat, a spinner in osu!taiko, and does not appear in osu!mania.
 */
class HitSpinner extends HitObject {
    /**
     * @param {number} time Integral number of milliseconds from the beginning of the song, and specifies when the hit begins.
     * @param {number} hitSound Hit sound to play at the end of the spinner.
     * @param {number} endTime When the spinner will end, in milliseconds from the beginning of the song.
     * @param {Extras} extras Defines additional parameters related to the hit sound samples.
     */
    constructor(time, hitSound, endTime, extras) {
        super(0, 0, time, 8, hitSound, extras);

        /**
         * When the spinner will end, in milliseconds from the beginning of the song.
         */
        this.endtime = endTime;
    }

    /**
     * Parse a Spinner Object String
     * @param {string} str 
     * @returns {HitSpinner}
     */
    static parse(str) {
        // Syntax: x,y,time,type,hitSound,endTime,extras
        let time, hitSound, endTime, extras;

        // remove spaces, then split by comma
        const info = (str.split(' ').join('')).split(',');

        // x = parseFloat(info[0]);
        // y = parseFloat(info[1]);
        time = parseFloat(info[2]);
        // type = info[3]
        hitSound = parseInt(info[4]);
        endTime = parseInt(info[5]);
        extras = parseExtras(info[6]);

        return new HitSpinner(time, hitSound, endTime, extras);
    }
}

/**
 * A hold note unique to osu!mania.
 * - The number of column is defined by the CircleSize property in the Difficulty section. Columns are indexed from 0.
 * - The column for a note is computed with x / column width with column width = 512 / number of columns. The resulting value is floored, then clamped between 0 and (#column - 1) for safety.
 */
class HitManiaHold extends HitObject {
    /**
     * @param {number} x determines which column a note will fall on.
     * @param {number} time Integral number of milliseconds from the beginning of the song, and specifies when the hit begins.
     * @param {number} hitSound Hit sound to play at the end of the spinner.
     * @param {number} endTime Time when the key should be released, in milliseconds from the beginning of the song.
     * @param {Extras} extras Defines additional parameters related to the hit sound samples.
     */
    constructor(x, time, hitSound, endTime, extras) {
        super(x, 0, time, 8, hitSound, extras);

        /**
         * Time when the key should be released, in milliseconds from the beginning of the song.
         * @type {number}
         */
        this.endtime = endTime;
    }

    static parse(str) {
        let x, time, hitSound, endTime, extras;

        // remove spaces, then split by comma
        const info = (str.split(' ').join('')).split(',');

        x = parseFloat(info[0]);
        // y = parseFloat(info[1]);
        time = parseFloat(info[2]);
        // type = info[3]
        hitSound = parseInt(info[4]);
        endTime = parseInt(info[5]);
        extras = parseExtras(info[6]);

        return new HitManiaHold(x, time, hitSound, endTime, extras);
    }
}

/**
 * 
 * @param {string} str 
 * @returns {Extras}
 */
function parseExtras(str) {
    let output = {};

    // sampleSet:additionSet:customIndex:sampleVolume:filename
    const vars = str.split(':');

    output.sampleSet = parseInt(vars[0]) || 0;
    output.additionSet = parseInt(vars[1]) || 0;
    output.customIndex = parseInt(vars[2]) || 0;
    output.sampleVolume = parseFloat(vars[3]) || 0;
    output.filename = vars[4];

    return output;
}

// #region typedefs
/**
 * Defined an X and a Y
 * @typedef {Object} Point
 * @property {number} x X position
 * @property {number} y Y position
 */
/**
 * Defines additional parameters related to the hit sound samples.
 * @typedef {Object} Extras
 * @property {number} [sampleSet=0] Changes the sample set of the normal hit sound. When sampleSet is 0, its value is inherited from the timing point.
 * @property {number} [additionSet=0] Changes the sample set for the whistle, finish and clap hit sounds. additionSet inherits from sampleSet. Otherwise, it inherits from the timing point.
 * @property {number} [customIndex=0] Custom sample set index. The special index 1 doesn't appear in the filename, and the special index 0 means it is inherited from the timing point.
 * @property {number} [sampleVolume=0] Volume of the sample, ranges from 0 to 100 (percent).
 * @property {string} [filename=undefined] Names an audio file in the folder to play instead of sounds from sample sets, relative to the beatmap's directory.
 */
/**
 * @typedef {Object} GeneralBeatmapInfo
 * @property {string}  audioFileName Specifies the location of the audio file relative to the current folder.
 * @property {number}  [audioLeadIn=0] (ms) Amount of time added before the audio file begins playing. Useful for audio files that begin immediately.
 * @property {number}  [previewTime=0] (ms) Defines when the audio file should begin playing when selected in the song selection menu.
 * @property {number}  [countdown=0] Specifies the speed of the countdown which occurs before the first hit object appears. (0=No countdown, 1=Normal, 2=Half, 3=Double)
 * @property {string}  [sampleSet="Normal"] Specifies which set of hit sounds will be used throughout the beatmap.
 * @property {number}  [stackLeniency=0] How often closely placed hit objects will be stacked together.
 * @property {number}  [mode=0] Defines the game mode of the beatmap. (0=osu!, 1=Taiko, 2=Catch the Beat, 3=osu!mania)
 * @property {boolean} [letterboxInBreaks=false] Specifies whether the letterbox appears during breaks.
 * @property {boolean} [storyFireInFront=false] Specifies whether or not display the storyboard in front of combo fire.
 * @property {string}  [skinPreference="Default"] Specifies the preferred skin to use during gameplay.
 * @property {boolean} [epilepsyWarning=false] Specifies whether or not show a 'This beatmap contains scenes with rapidly flashing colours...' warning at the beginning of the beatmap.
 * @property {number}  [countdownOffset=0] Specifies how many beats earlier the countdown starts.
 * @property {boolean} [widescreenStoryboard=false] Specifies whether or not the storyboard should be widescreen.
 * @property {boolean} [specialStyle=false] Specifies whether or not use the special `N+1` style for osu!mania.
 * @property {boolean} [useSkinSprites=false] Specifies whether or not the storyboard can use user's skin resources.
 * @property {string}  [background] Specifies the background image
 */
/**
 * @typedef {Object} Metadata
 * @property {string} title Title of the song limited to ASCII characters.
 * @property {string} titleUnicode Title of the song with unicode support. If not present, Title is used.
 * @property {string} artist Name of the song's artist limited to ASCII characters.
 * @property {string} artistUnicode Name of the song's artist with unicode support. If not present, Artist is used.
 * @property {string} creator Username of the mapper.
 * @property {string} version Name of the beatmap's difficulty.
 * @property {string} [source] Origin of the song.
 * @property {Array<string>} tags Collection of words describing the song
 * @property {number} beatmapID ID of the single beatmap.
 * @property {number} beatmapSetID ID of the beatmap set.
 */
/**
 * @typedef {Object} Difficulty
 * @property {number} hpDrainRate Specifies how fast the health decreases. (The definition of this property may be changed in the near future.)
 * @property {number} circleSize Defines the size of the hit objects in the osu!standard mode. In osu!mania mode, CircleSize is the number of columns.
 * @property {number} overallDifficulty Harshness of the hit window and the difficulty of spinners.
 * @property {number} approachRate Defines when hit objects start to fade in relatively to when they should be hit.
 * @property {number} sliderMultiplier Specifies the multiplier of the slider velocity.
 */
// #endregion


module.exports = {
    BeatmapFile:BeatmapFile,
    HitObject:HitObject,
    HitObjects: {
        HitCircle: HitCircle,
        HitSlider: HitSlider,
        HitSpinner: HitSpinner,
        HitManiaHold: HitManiaHold
    }
}