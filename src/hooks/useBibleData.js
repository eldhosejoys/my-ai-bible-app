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
        // Ensure verse numbers are integers for potential sorting
        structuredData[book][chapter].push({ ...verse, v: parseInt(verse.v, 10) });
    });

     // Sort verses within each chapter numerically
    for (const book in structuredData) {
        for (const chapter in structuredData[book]) {
            structuredData[book][chapter].sort((a, b) => a.v - b.v);
        }
    }

    return structuredData;
};


export function useBibleData() {
    const [bibleData, setBibleData] = useState(null); // Will store structured data
    const [bookTitles, setBookTitles] = useState([]);
    const [bibleHeadings, setBibleHeadings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async (forceRefresh = false) => {
        setIsLoading(true);
        setError(null);

        const now = Date.now();
        const cachedTimestamp = localStorage.getItem(CACHE_KEY_TIMESTAMP);
        const isCacheExpired = !cachedTimestamp || (now - parseInt(cachedTimestamp, 10) > CACHE_EXPIRY_MS);

        // Try loading from cache first unless forced or expired
        if (!forceRefresh && !isCacheExpired) {
            console.log("Loading Bible data from cache...");
            const cachedBible = localStorage.getItem(CACHE_KEY_BIBLE);
            const cachedTitles = localStorage.getItem(CACHE_KEY_TITLES);
            const cachedHeadings = localStorage.getItem(CACHE_KEY_HEADINGS);

            if (cachedBible && cachedTitles && cachedHeadings) {
                try {
                    const parsedBible = JSON.parse(cachedBible);
                    const parsedTitles = JSON.parse(cachedTitles);
                    const parsedHeadings = JSON.parse(cachedHeadings);
                     // Sort titles by book number 'n'
                    parsedTitles.sort((a, b) => a.n - b.n);
                    setBibleData(parsedBible); // Already structured when cached
                    setBookTitles(parsedTitles);
                    setBibleHeadings(parsedHeadings);
                    setIsLoading(false);
                    console.log("Successfully loaded from cache.");
                    return; // Data loaded from cache, exit
                } catch (e) {
                    console.error("Failed to parse cached data:", e);
                    // Clear potentially corrupted cache
                    localStorage.removeItem(CACHE_KEY_BIBLE);
                    localStorage.removeItem(CACHE_KEY_TITLES);
                    localStorage.removeItem(CACHE_KEY_HEADINGS);
                    localStorage.removeItem(CACHE_KEY_TIMESTAMP);
                }
            }
        }

        // If cache is invalid, expired, or forceRefresh is true, fetch from network
        console.log("Fetching fresh Bible data from network...");
        try {
            const [bibleResponse, titlesResponse, headingsResponse] = await Promise.all([
                fetch(BIBLE_JSON_URL),
                fetch(TITLES_JSON_URL),
                fetch(HEADINGS_JSON_URL),
            ]);

            if (!bibleResponse.ok || !titlesResponse.ok || !headingsResponse.ok) {
                throw new Error('Network response was not ok');
            }

            const bibleJson = await bibleResponse.json();
            const titlesJson = await titlesResponse.json();
            const headingsJson = await headingsResponse.json();

            // Structure the bible data
            const structuredData = structureBibleData(bibleJson);
            // Sort titles by book number 'n'
            titlesJson.sort((a, b) => a.n - b.n);

            setBibleData(structuredData);
            setBookTitles(titlesJson);
            setBibleHeadings(headingsJson);

            // Save to localStorage
            try {
                localStorage.setItem(CACHE_KEY_BIBLE, JSON.stringify(structuredData));
                localStorage.setItem(CACHE_KEY_TITLES, JSON.stringify(titlesJson));
                localStorage.setItem(CACHE_KEY_HEADINGS, JSON.stringify(headingsJson));
                localStorage.setItem(CACHE_KEY_TIMESTAMP, now.toString());
                console.log("Bible data cached successfully.");
            } catch (e) {
                console.error("Error saving data to localStorage:", e);
                setError("Could not save data for offline use. Storage might be full.");
                // Proceed with the fetched data in memory
            }

        } catch (err) {
            console.error("Failed to fetch Bible data:", err);
            setError(`Failed to load Bible data: ${err.message}. Trying cache if available...`);

            // Fallback to potentially stale cache if fetching failed
            const cachedBible = localStorage.getItem(CACHE_KEY_BIBLE);
            const cachedTitles = localStorage.getItem(CACHE_KEY_TITLES);
            const cachedHeadings = localStorage.getItem(CACHE_KEY_HEADINGS);
            if (!bibleData && cachedBible && cachedTitles) { // Only load stale cache if we have nothing yet
                 console.warn("Using stale cache due to fetch error.");
                 try {
                    const parsedBible = JSON.parse(cachedBible);
                    const parsedTitles = JSON.parse(cachedTitles);
                    const parsedHeadings = JSON.parse(cachedHeadings);
                    parsedTitles.sort((a, b) => a.n - b.n);
                    setBibleData(parsedBible);
                    setBookTitles(parsedTitles);
                    setBibleHeadings(parsedHeadings);
                    setError(prev => `${prev} (Displaying potentially outdated offline data)`); // Update error message
                 } catch (e) {
                    console.error("Failed to parse stale cached data:", e);
                    setError("Failed to load Bible data and couldn't read offline data either.");
                    setBibleData(null); // Ensure data state is cleared on error
                    setBookTitles([]);
                    setBibleHeadings(null);
                 }
            } else if (!bibleData) {
                 // If fetch fails and there's no cache at all
                 setBibleData(null);
                 setBookTitles([]);
                 setBibleHeadings(null);
            }

        } finally {
            setIsLoading(false);
        }
    }, []); // Include bibleData in dependency array to avoid re-triggering fetch error fallback logic unnecessarily

    useEffect(() => {
        fetchData(); // Initial fetch on component mount
        // No interval needed here, fetch logic runs on mount and checks expiry
    }, [fetchData]); // Run effect when fetchData function identity changes (which is only on mount due to useCallback)

    // Function to manually trigger a refresh
    const refreshData = () => {
        fetchData(true); // Pass true to force network fetch
    };

    return { bibleData, bookTitles, bibleHeadings, isLoading, error, refreshData };
}