import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import { Check, Copy } from 'lucide-react';

/** Copy button for code blocks */
function CopyButton({ code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  return (
    <button
      type="button"
      className="ai-md-copy"
      onClick={handleCopy}
      aria-label="Copy code"
      title="Copy code"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

/** Highlights the given code string with highlight.js */
function HighlightedCode({ language, code }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      try {
        hljs.highlightElement(ref.current);
      } catch {
        /* ignore highlight errors */
      }
    }
  }, [code, language]);

  return (
    <code ref={ref} className={`hljs language-${language || 'plaintext'}`}>
      {code}
    </code>
  );
}

/**
 * Renders Markdown in the assistant bubbles: headings, bold, lists, links,
 * blockquotes, inline code, and fenced code blocks with syntax highlighting
 * and a copy button.
 */
export default function AIMarkdown({ content }) {
  return (
    <div className="ai-md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const lang = match ? match[1] : '';
            const code = String(children).replace(/\n$/, '');

            if (!inline) {
              return (
                <div className="ai-md-codeblock">
                  <div className="ai-md-codehead">
                    <span className="ai-md-lang">{lang || 'text'}</span>
                    <CopyButton code={code} />
                  </div>
                  <pre className="ai-md-pre">
                    <HighlightedCode language={lang} code={code} />
                  </pre>
                </div>
              );
            }
            return (
              <code className="ai-md-inlinecode" {...props}>
                {children}
              </code>
            );
          },
          a({ node, children, ...props }) {
            return (
              <a className="ai-md-link" target="_blank" rel="noreferrer" {...props}>
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
