import React from 'react';

const GITHUB_URL = "https://github.com/HatfulBob/LCGCharRoller";

function Footer({ version }) {
  return (
    <footer style={{ marginTop: 40, padding: '1em 0', background: '#222', color: '#ccc', textAlign: 'center', fontSize: '1em' }}>
      <i>
        Arkham Horror: The Card Game and all information presented here, both literal and graphical, is copyrighted by Fantasy Flight Games. This website is not produced, endorsed, supported, or affiliated with Fantasy Flight Games.<br/>
        Created by HatfulBob. Full source code can be found <a href={GITHUB_URL} style={{ color: '#8cf' }} target="_blank" rel="noopener noreferrer">here</a>
      </i>
    </footer>
  );
}

export default Footer;
