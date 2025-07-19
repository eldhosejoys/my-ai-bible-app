import React, { useContext } from 'react';
import {
  generatePath,
  useNavigate
} from "react-router-dom";
import { useBibleData } from '../../hooks/useBibleData';

import './RandomVerseButton.css';

const RandomVerseButton = () => {
  const navigate = useNavigate();
  const { bibleData } = useBibleData();

  const getRandomBookAndChapterAndVerse = () => {
    if (!bibleData) {
      return {};
    }

    const books = Object.keys(bibleData);
    const randomBook = books[Math.floor(Math.random() * books.length)];
    const chapters = Object.keys(bibleData[randomBook]);
    const randomChapter = chapters[Math.floor(Math.random() * chapters.length)];
    const verses = bibleData[randomBook][randomChapter];
    const randomVerse = verses[Math.floor(Math.random() * verses.length)].v;

    return { book: randomBook, chapter: randomChapter, verse: randomVerse };
  };

  const handleRandomVerse = () => {
    const { book, chapter, verse } = getRandomBookAndChapterAndVerse();
    if (book && chapter && verse) {
      navigate(generatePath('/:bookId/:chapterId', { bookId: book, chapterId: chapter }) + `/${verse}`);
    } else {
      alert('Could not find a random verse.');
    }
  };

  return (
    <button className="random-verse-button" onClick={handleRandomVerse}>
      Random Verse
    </button>
  );
};

export default RandomVerseButton;
