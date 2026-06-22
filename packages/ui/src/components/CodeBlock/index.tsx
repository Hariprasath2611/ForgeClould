import React from 'react';

export interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, filename }) => {
  return (
    <div className="forge-code-block">
      {filename && <div style={{ marginBottom: '8px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>{filename}</div>}
      <pre style={{ margin: 0, fontSize: '14px' }}>
        <code className={language ? `language-${language}` : ''}>{code}</code>
      </pre>
    </div>
  );
};
