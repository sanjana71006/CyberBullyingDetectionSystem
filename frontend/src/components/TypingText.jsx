import { useState, useEffect } from 'react';

const phrases = [
  'Scanning social media feeds…',
  'Analyzing toxic patterns…',
  'Protecting digital communities…',
  'Detecting harmful intent…',
  'Empowering safe spaces…',
];

export default function TypingText() {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting,  setDeleting]  = useState(false);

  useEffect(() => {
    const current = phrases[phraseIdx];
    let timeout;

    if (!deleting && displayed.length < current.length) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 55);
    } else if (!deleting && displayed.length === current.length) {
      timeout = setTimeout(() => setDeleting(true), 1600);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 28);
    } else {
      setDeleting(false);
      setPhraseIdx((i) => (i + 1) % phrases.length);
    }

    return () => clearTimeout(timeout);
  }, [displayed, deleting, phraseIdx]);

  return (
    <p className="font-mono text-sm text-cyan-400/80 mt-4 h-6 flex items-center gap-1.5">
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
      {displayed}
      <span className="inline-block w-[2px] h-4 bg-cyan-400/80 animate-pulse ml-0.5" />
    </p>
  );
}
