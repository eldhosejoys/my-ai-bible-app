import React from 'react';

// Helper function to escape special characters for regex
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
};

const HighlightText = ({ text, highlight }) => {
  if (!highlight || !text) {
    return <>{text}</>; // Return original text if no highlight term or text
  }

  const escapedHighlight = escapeRegex(highlight);
  // Create case-insensitive regex with capturing group for splitting
  const regex = new RegExp(`(${escapedHighlight})`, 'gi');
  const parts = text.split(regex);

  // Filter out empty strings that might result from split
  const filteredParts = parts.filter(part => part);

  return (
    <>
      {filteredParts.map((part, index) =>
        // Check if the part matches the highlight term (case-insensitive)
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={index}>{part}</mark> // Wrap match in <mark>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment> // Render non-matches as text
        )
      )}
    </>
  );
};

export default HighlightText;