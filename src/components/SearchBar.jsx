import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import './SearchBar.css';

const SUGGESTION_DEBOUNCE_MS = 150;
const MAX_SUGGESTIONS_FROM_API = 5;

const SearchBar = ({ initialQuery = '' }) => {
  const [inputValue, setInputValue] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState([]); // Stores fully constructed suggestions
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [prefixText, setPrefixText] = useState(''); // Store text before the last word

  const debouncedSuggestionQuery = useDebounce(inputValue, SUGGESTION_DEBOUNCE_MS);

  const navigate = useNavigate();
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const isMounted = useRef(false);

  // --- Fetch Suggestions (Modified for Last Word) ---
  const fetchSuggestions = useCallback(async (fullText) => {
    const trimmedFullText = fullText.trimStart(); // Trim leading space only
    if (!trimmedFullText) {
      setSuggestions([]); setShowSuggestions(false); setIsSuggesting(false); setPrefixText(''); return;
    }

    // Find the start of the last word (after the last space)
    const lastSpaceIndex = trimmedFullText.lastIndexOf(' ');
    const currentWord = lastSpaceIndex === -1 ? trimmedFullText : trimmedFullText.substring(lastSpaceIndex + 1);
    const prefix = lastSpaceIndex === -1 ? '' : trimmedFullText.substring(0, lastSpaceIndex + 1); // Include the space

    setPrefixText(prefix); // Store the prefix

    if (!currentWord) { // If input ends with space, don't fetch yet
        setSuggestions([]); setShowSuggestions(false); setIsSuggesting(false); return;
    }

    // Only fetch if the *current word* looks like English
    const seemsEnglish = /^[a-zA-Z0-9]+$/.test(currentWord); // Check word only, no spaces
    if (!seemsEnglish) {
      setSuggestions([]); setShowSuggestions(false); setIsSuggesting(false); return;
    }

    setIsSuggesting(true);
    setHighlightedIndex(-1);
    const encodedWord = encodeURIComponent(currentWord);
    const numToFetch = MAX_SUGGESTIONS_FROM_API + 1;
    const apiUrl = `https://inputtools.google.com/request?text=${encodedWord}&itc=ml-t-i0-und&num=${numToFetch}&cp=0&cs=1&ie=utf-8&oe=utf-8`;

    console.log("Fetching suggestions for word:", currentWord, "with prefix:", prefix);

    try {
      const response = await fetch(apiUrl);
      // Check staleness based on the *word* being fetched
       const currentInputNow = inputRef.current?.value || '';
       const lastWordNow = currentInputNow.substring(currentInputNow.lastIndexOf(' ') + 1);
       if (lastWordNow !== currentWord) {
         console.log("Stale word suggestion request ignored for:", currentWord);
         // Don't necessarily return, maybe just don't update state? Or clear? Let's clear.
         setSuggestions([]); setShowSuggestions(false); setIsSuggesting(false);
         return;
       }


      if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
      const data = await response.json();
      let finalSuggestions = []; // These will be *full* suggestions including prefix

      if (data && data[0] === "SUCCESS" && data[1] && data[1][0] && data[1][0][1]) {
        const fetchedWordSuggestions = data[1][0][1];
        console.log("API Word Suggestions:", fetchedWordSuggestions);

        // Construct full suggestions, filter out original word, limit
        const otherSuggestions = fetchedWordSuggestions
            .filter(sugg => sugg !== currentWord)
            .slice(0, MAX_SUGGESTIONS_FROM_API);

        // Add prefix to each suggested word
        finalSuggestions = otherSuggestions.map(suggWord => prefix + suggWord);

      } else {
        console.warn("Received no suggestions or unexpected format:", data);
      }

      // Always add the original full input as the last option
      finalSuggestions.push(prefix + currentWord); // Add original word back with prefix

      setSuggestions(finalSuggestions);
      setShowSuggestions(true);

    } catch (error) {
      console.error("Error fetching suggestions:", error);
      // Show only original full input on error
      setSuggestions([prefix + currentWord]);
      setShowSuggestions(true);
    } finally {
       // Only stop suggesting if this was the latest word request
        const currentInputAfterFetch = inputRef.current?.value || '';
        const lastWordAfterFetch = currentInputAfterFetch.substring(currentInputAfterFetch.lastIndexOf(' ') + 1);
       if (lastWordAfterFetch === currentWord) {
         setIsSuggesting(false);
       }
    }
  }, []); // Empty dependency array

  // Effect to fetch suggestions based on DEBOUNCED suggestion query
  useEffect(() => {
    if (!isMounted.current && !debouncedSuggestionQuery) { isMounted.current = true; return; }
    fetchSuggestions(debouncedSuggestionQuery);
    if (!isMounted.current) { isMounted.current = true; }
  }, [debouncedSuggestionQuery, fetchSuggestions]);

  // Effect to sync input value if the initialQuery prop changes
  useEffect(() => {
    if (initialQuery !== inputValue) { setInputValue(initialQuery); setShowSuggestions(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);


  // --- Helper Function for Navigation ---
  const navigateToSearch = (term) => {
      const trimmedTerm = term.trim();
      if (trimmedTerm) {
          console.log(`Navigating to search for: "${trimmedTerm}"`);
          navigate(`/search?q=${encodeURIComponent(trimmedTerm)}`);
      } else {
          navigate('/search');
      }
      setShowSuggestions(false); setSuggestions([]); setHighlightedIndex(-1);
  }

  // --- Event Handlers ---
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    // Fetching handled by debounce effect
  };

  // handleSuggestionClick - uses the FULL suggestion (prefix + word)
  const handleSuggestionClick = (fullSuggestion) => {
    const trimmedTerm = fullSuggestion.trim();
    setInputValue(trimmedTerm); // Update input visually first
    navigateToSearch(trimmedTerm); // Then navigate
  };

  const handleKeyDown = (e) => {
    const currentSuggestionList = suggestions;

    switch (e.key) {
      case 'ArrowDown':
        if (showSuggestions && currentSuggestionList.length > 0) {
            e.preventDefault();
            setHighlightedIndex((prev) => (prev + 1) % currentSuggestionList.length);
        }
        break;

      case 'ArrowUp':
        if (showSuggestions && currentSuggestionList.length > 0) {
            e.preventDefault();
            setHighlightedIndex((prev) => (prev - 1 + currentSuggestionList.length) % currentSuggestionList.length);
        }
        break;

      case ' ': // Spacebar
         // If suggestions are showing, select the FIRST ONE (which is a full suggestion)
         if (showSuggestions && currentSuggestionList.length > 0) {
            e.preventDefault();
            const firstFullSuggestion = currentSuggestionList[0];
            console.log("Space pressed, selecting first suggestion:", firstFullSuggestion);
            setInputValue(firstFullSuggestion + " "); // Update input state AND add space
            setShowSuggestions(false);
            setSuggestions([]);
            setHighlightedIndex(-1);
            // Move cursor to end after state update (needs slight delay)
            setTimeout(() => inputRef.current?.focus(), 0);
            // DO NOT NAVIGATE
         }
         // Allow default space behavior if no suggestions
        break;

      case 'Enter':
         e.preventDefault();
         // Use the FULL suggestion text if highlighted
         if (showSuggestions && highlightedIndex >= 0 && highlightedIndex < currentSuggestionList.length) {
             console.log("Enter: Selecting highlighted suggestion");
             handleSuggestionClick(currentSuggestionList[highlightedIndex]);
         }
         // Select FIRST full suggestion if visible but none highlighted
         else if (showSuggestions && currentSuggestionList.length > 0 && !isSuggesting) {
              console.log("Enter: Selecting first suggestion");
              handleSuggestionClick(currentSuggestionList[0]);
         }
         // Search with current input value otherwise
         else {
              console.log("Enter: Searching with current input value");
              navigateToSearch(inputValue);
         }
        break;

      case 'Escape':
        if (showSuggestions) {
            e.preventDefault();
            setShowSuggestions(false); setSuggestions([]); setHighlightedIndex(-1);
        }
        break;

      default:
        break;
    }
  };

   // Handle clicks outside
   useEffect(() => {
    const handleClickOutside = (event) => {
      if ( suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
           inputRef.current && !inputRef.current.contains(event.target) )
      { setShowSuggestions(false); }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  return (
    <div className="search-bar-container">
      <input
        ref={inputRef}
        type="search"
        placeholder="മലയാളത്തിൽ വേദവാക്യങ്ങൾ തിരയുക..." // Updated placeholder
        className="search-input"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => inputValue.trim() && suggestions.length > 0 && setShowSuggestions(true)}
        aria-label="Search Bible verses"
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-container" ref={suggestionsRef}>
          {isSuggesting && <div className="suggestion-item loading">Loading suggestions...</div>}
          {!isSuggesting && suggestions.map((fullSuggestion, index) => {
             // Determine if this is the 'original' entry (last one)
             const isOriginal = index === suggestions.length - 1;
             const originalWord = prefixText ? inputValue.substring(prefixText.length) : inputValue;
             return (
                <div
                  key={`${fullSuggestion}-${index}`}
                  className={`suggestion-item ${index === highlightedIndex ? 'highlighted' : ''} ${isOriginal ? 'original-term' : ''}`}
                  onClick={() => handleSuggestionClick(fullSuggestion)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {fullSuggestion}
                  {isOriginal && <span className="original-term-indicator"> (you typed: {originalWord})</span>}
                </div>
             );
            })}
        </div>
      )}
    </div>
  );
};

export default SearchBar;