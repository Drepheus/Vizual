import React from 'react';
import { motion } from 'motion/react';
import { useInView } from 'motion/react';
import { useRef } from 'react';

interface FormattedTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export default function FormattedText({ text, className = '', delay = 0 }: FormattedTextProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const parseMarkdownToElements = (text: string) => {
    const elements: React.ReactElement[] = [];
    let wordIndex = 0;

    // Enhanced regex to capture all markdown patterns including links
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[([^\]]+)\]\(([^)]+)\)|^[-•]\s+.*$|^\d+\.\s+.*$)/gm);
    
    parts.forEach((part, partIndex) => {
      if (!part) return;

      if (part.match(/^\*\*[^*]+\*\*$/)) {
        // Bold text
        const boldText = part.slice(2, -2);
        const words = boldText.split(' ');
        words.forEach((word, idx) => {
          if (word.trim()) {
            elements.push(
              <motion.strong
                key={`${partIndex}-${idx}-${wordIndex}`}
                initial={{ opacity: 0, filter: 'blur(10px)' }}
                animate={isInView ? { opacity: 1, filter: 'blur(0px)' } : {}}
                transition={{
                  duration: 0.3,
                  delay: wordIndex * 0.03 + delay,
                  ease: [0.4, 0.0, 0.2, 1]
                }}
                style={{ display: 'inline-block', marginRight: '0.25em' }}
                className="text-bold"
              >
                {word}
              </motion.strong>
            );
            wordIndex++;
          }
        });
      } else if (part.match(/^\*[^*]+\*$/) && !part.match(/^\*\*.*\*\*$/)) {
        // Italic text (single asterisk, not double)
        const italicText = part.slice(1, -1);
        const words = italicText.split(' ');
        words.forEach((word, idx) => {
          if (word.trim()) {
            elements.push(
              <motion.em
                key={`${partIndex}-${idx}-${wordIndex}`}
                initial={{ opacity: 0, filter: 'blur(10px)' }}
                animate={isInView ? { opacity: 1, filter: 'blur(0px)' } : {}}
                transition={{
                  duration: 0.3,
                  delay: wordIndex * 0.03 + delay,
                  ease: [0.4, 0.0, 0.2, 1]
                }}
                style={{ display: 'inline-block', marginRight: '0.25em' }}
                className="text-italic"
              >
                {word}
              </motion.em>
            );
            wordIndex++;
          }
        });
      } else if (part.match(/^`[^`]+`$/)) {
        // Code text
        const codeText = part.slice(1, -1);
        elements.push(
          <motion.code
            key={`${partIndex}-${wordIndex}`}
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={isInView ? { opacity: 1, filter: 'blur(0px)' } : {}}
            transition={{
              duration: 0.3,
              delay: wordIndex * 0.03 + delay,
              ease: [0.4, 0.0, 0.2, 1]
            }}
            style={{ display: 'inline-block', marginRight: '0.25em' }}
            className="text-code"
          >
            {codeText}
          </motion.code>
        );
        wordIndex++;
      } else if (part.match(/\[([^\]]+)\]\(([^)]+)\)/)) {
        // Markdown link [text](url)
        const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (match) {
          const linkText = match[1];
          const linkUrl = match[2];
          elements.push(
            <motion.a
              key={`${partIndex}-${wordIndex}`}
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={isInView ? { opacity: 1, filter: 'blur(0px)' } : {}}
              transition={{
                duration: 0.3,
                delay: wordIndex * 0.03 + delay,
                ease: [0.4, 0.0, 0.2, 1]
              }}
              style={{ display: 'inline-block', marginRight: '0.25em' }}
              className="text-link gradient-link"
            >
              {linkText}
            </motion.a>
          );
          wordIndex += linkText.split(' ').length;
        }
      } else if (part.match(/^[-•]\s+/) || part.match(/^\d+\.\s+/)) {
        // Bullet points or numbered lists
        const isNumbered = part.match(/^\d+\.\s+/);
        const bulletSymbol = isNumbered ? part.match(/^\d+\./)![0] : '•';
        const bulletText = part.replace(/^[-•]\s+|^\d+\.\s+/, '');
        
        elements.push(
          <motion.div
            key={`${partIndex}-${wordIndex}`}
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={isInView ? { opacity: 1, filter: 'blur(0px)' } : {}}
            transition={{
              duration: 0.3,
              delay: wordIndex * 0.03 + delay,
              ease: [0.4, 0.0, 0.2, 1]
            }}
            className="bullet-point"
          >
            <span className="bullet">{bulletSymbol}</span>
            <span className="bullet-text">{bulletText}</span>
          </motion.div>
        );
        wordIndex += bulletText.split(' ').length;
      } else if (part === '\n') {
        // Line break
        elements.push(<br key={`br-${partIndex}-${wordIndex}`} />);
      } else {
        // Regular text
        const words = part.split(/(\s+)/);
        words.forEach((word, idx) => {
          if (word.trim()) {
            elements.push(
              <motion.span
                key={`${partIndex}-${idx}-${wordIndex}`}
                initial={{ opacity: 0, filter: 'blur(10px)' }}
                animate={isInView ? { opacity: 1, filter: 'blur(0px)' } : {}}
                transition={{
                  duration: 0.3,
                  delay: wordIndex * 0.03 + delay,
                  ease: [0.4, 0.0, 0.2, 1]
                }}
                style={{ display: 'inline-block', marginRight: '0.25em' }}
              >
                {word}
              </motion.span>
            );
            wordIndex++;
          } else if (word === ' ') {
            // Preserve spaces
            elements.push(
              <span key={`space-${partIndex}-${idx}`}> </span>
            );
          }
        });
      }
    });

    return elements;
  };

  return (
    <div ref={ref} className={className}>
      {parseMarkdownToElements(text)}
    </div>
  );
}