// src/hooks/useBibleData.js
import { useState, useEffect, useCallback } from 'react';
import {
    BIBLE_JSON_URL,
    TITLES_JSON_URL,
    HEADINGS_JSON_URL,
    CACHE_KEY_BIBLE,
    CACHE_KEY_TITLES,
    CACHE_KEY_HEADINGS,
    CACHE_KEY_TIMESTAMP,
    CACHE_EXPIRY_MS
} from '../config';
import { getFromDB, setInDB } from '../utils/indexedDB';

// Helper function to structure bible data
const structureBibleData = (verses) => {
    const structuredData = {};
    if (!Array.isArray(verses)) return structuredData;

    verses.forEach(verse => {
        const book = verse.b;
        const chapter = verse.c;
        if (!structuredData[book]) {
            structuredData[book] = {};
        }
        if (!structuredData[book][chapter]) {
            structuredData[book][chapter] = [];
        }
        structuredData[book][chapter].push({ ...verse, v: parseInt(verse.v, 10) });
    });

    for (const book in structuredData) {
        for (const chapter in structuredData[book]) {
            structuredData[book][chapter].sort((a, b) => a.v - b.v);
        }
    }

    return structuredData;
};

export function useBibleData() {
    const [bibleData, setBibleData] = useState(null);
    const [bookTitles, setBookTitles] = useState([]);
    const [bibleHeadings, setBibleHeadings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isBibleLoading, setIsBibleLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadInitialData = useCallback(async (forceRefresh = false) => {
        setIsLoading(true);
        setError(null);

        const now = Date.now();
        const cachedTimestamp = await getFromDB(CACHE_KEY_TIMESTAMP);
        const isCacheExpired = !cachedTimestamp || (now - cachedTimestamp > CACHE_EXPIRY_MS);

        if (!forceRefresh && !isCacheExpired) {
            console.log("Loading initial data from IndexedDB...");
            const cachedTitles = await getFromDB(CACHE_KEY_TITLES);
            const cachedHeadings = await getFromDB(CACHE_KEY_HEADINGS);

            if (cachedTitles && cachedHeadings) {
                cachedTitles.sort((a, b) => a.n - b.n);
                setBookTitles(cachedTitles);
                setBibleHeadings(cachedHeadings);
                setIsLoading(false);
                console.log("Successfully loaded initial data from IndexedDB.");
                
                // Also check for cached bible data without forcing a load
                const cachedBible = await getFromDB(CACHE_KEY_BIBLE);
                if (cachedBible) {
                    setBibleData(cachedBible);
                }
                return;
            }
        }

        console.log("Fetching fresh initial data from network...");
        try {
            const [titlesResponse, headingsResponse] = await Promise.all([
                fetch(TITLES_JSON_URL),
                fetch(HEADINGS_JSON_URL),
            ]);

            if (!titlesResponse.ok || !headingsResponse.ok) {
                throw new Error('Network response was not ok');
            }

            const titlesJson = await titlesResponse.json();
            const headingsJson = await headingsResponse.json();

            titlesJson.sort((a, b) => a.n - b.n);

            setBookTitles(titlesJson);
            setBibleHeadings(headingsJson);

            await setInDB(CACHE_KEY_TITLES, titlesJson);
            await setInDB(CACHE_KEY_HEADINGS, headingsJson);
            await setInDB(CACHE_KEY_TIMESTAMP, now);
            console.log("Initial data cached successfully in IndexedDB.");

        } catch (err) {
            console.error("Failed to fetch initial data:", err);
            setError(`Failed to load initial data: ${err.message}.`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadBibleData = useCallback(async () => {
        if (bibleData) {
            return; // Already loaded
        }
        setIsBibleLoading(true);
        setError(null);

        try {
            console.log("Loading Bible data from IndexedDB...");
            const cachedBible = await getFromDB(CACHE_KEY_BIBLE);
            const cachedTimestamp = await getFromDB(CACHE_KEY_TIMESTAMP);
            const isCacheExpired = !cachedTimestamp || (Date.now() - cachedTimestamp > CACHE_EXPIRY_MS);
            
            if (cachedBible && !isCacheExpired) {
                setBibleData(cachedBible);
                console.log("Successfully loaded Bible data from IndexedDB.");
                setIsBibleLoading(false);
                return;
            }

            console.log("Fetching fresh Bible data from network...");
            const bibleResponse = await fetch(BIBLE_JSON_URL);
            if (!bibleResponse.ok) {
                throw new Error('Network response was not ok');
            }
            const bibleJson = await bibleResponse.json();
            const structuredData = structureBibleData(bibleJson);
            setBibleData(structuredData);
            await setInDB(CACHE_KEY_BIBLE, structuredData);
            console.log("Bible data cached successfully in IndexedDB.");

        } catch (err) {
            console.error("Failed to fetch Bible data:", err);
            setError(`Failed to load Bible data: ${err.message}.`);
        } finally {
            setIsBibleLoading(false);
        }
    }, [bibleData]);


    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    const refreshData = () => {
        loadInitialData(true);
    };

    return { bibleData, bookTitles, bibleHeadings, isLoading, isBibleLoading, error, refreshData, loadBibleData };
}
