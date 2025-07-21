import React, { useState, useEffect } from 'react';
import './FontSizeSlider.css';

const DEFAULT_FONT_SIZE = 16;

const FontSizeSlider = () => {
  const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || DEFAULT_FONT_SIZE);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-size', `${fontSize}px`);
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  const handleSliderChange = (e) => {
    setFontSize(e.target.value);
  };

  const handleReset = () => {
    setFontSize(DEFAULT_FONT_SIZE);
  };

  return (
    <div className="font-size-slider-container">
      <label htmlFor="font-size-slider">Font Size</label>
      <input
        type="range"
        id="font-size-slider"
        min="12"
        max="32"
        value={fontSize}
        onChange={handleSliderChange}
      />
      <span>{fontSize}px</span>
      <button onClick={handleReset} className="font-size-reset-button">
      ↺
      </button>
    </div>
  );
};

export default FontSizeSlider;
