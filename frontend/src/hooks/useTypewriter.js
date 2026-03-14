import { useEffect, useState } from 'react';

export default function useTypewriter(words, speed = 70, pause = 1200) {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex % words.length];
    const timeout = setTimeout(
      () => {
        if (!deleting) {
          const next = current.slice(0, text.length + 1);
          setText(next);
          if (next === current) {
            setTimeout(() => setDeleting(true), pause);
          }
        } else {
          const next = current.slice(0, text.length - 1);
          setText(next);
          if (!next) {
            setDeleting(false);
            setWordIndex((idx) => (idx + 1) % words.length);
          }
        }
      },
      deleting ? speed / 2 : speed
    );

    return () => clearTimeout(timeout);
  }, [words, wordIndex, text, deleting, speed, pause]);

  return text;
}
