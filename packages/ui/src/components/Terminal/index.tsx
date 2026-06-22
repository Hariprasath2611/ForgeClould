import React from 'react';

export interface TerminalProps {
  logs: string[];
}

export const Terminal: React.FC<TerminalProps> = ({ logs }) => {
  return (
    <div className="forge-terminal">
      {logs.map((log, i) => (
        <div key={i}>{log}</div>
      ))}
    </div>
  );
};
