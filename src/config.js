// src/config.js
export const BIBLE_JSON_URL = "https://yehoshua.in/assets/json/bible.json";
export const TITLES_JSON_URL = "https://yehoshua.in/assets/json/title.json";
export const HEADINGS_JSON_URL = "https://yehoshua.in/assets/json/headings/bibleheadings.json";

// Cache configuration
export const CACHE_KEY_BIBLE = 'malayalamBibleData';
export const CACHE_KEY_TITLES = 'malayalamBibleTitles';
export const CACHE_KEY_HEADINGS = 'malayalamBibleHeadings';
export const CACHE_KEY_TIMESTAMP = 'malayalamBibleTimestamp';
export const CACHE_EXPIRY_MS = 1 * 24 * 60 * 60 * 1000; // 1 day in milliseconds