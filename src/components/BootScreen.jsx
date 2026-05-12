import { useEffect, useState } from 'react';

const bootLines = [
  'Initializing personal portfolio',
  'Loading profile module',
  'Loading projects module',
  'Loading writing archive',
  'Loading media library',
  'Preparing shared files',
  'Interface ready',
];

export default function BootScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div id="boot-screen">
      <div id="boot-logo">PORTFOLIO CLIENT</div>
      <div id="boot-log">
        {bootLines.map((line) => (
          <div className="boot-line ok" key={line}>{`> ${line}`}</div>
        ))}
      </div>
      <div id="boot-bar-wrap"><div id="boot-bar" style={{ width: '100%' }} /></div>
    </div>
  );
}
