import React, { useState } from 'react';
import { connectToMetaMask } from '../utils/connectWallet';

function Header() {
  const [wallet, setWallet] = useState("");

  const handleConnect = async () => {
    const address = await connectToMetaMask();
    if (address) setWallet(address);
  };

  return (
    <header className="header">
      <div className="logo-area">
        <span className="logo-icon">🛡️</span>
        <h1>CYBER<span>NEXUS</span></h1>
      </div>
      {wallet ? (
        <button className="btn-wallet" style={{ background: '#00ffcc', color: '#05050a' }}>
          🟢 {wallet.slice(0, 6)}...{wallet.slice(-4)}
        </button>
      ) : (
        <button className="btn-wallet" onClick={handleConnect}>
          KẾT NỐI VÍ METAMASK
        </button>
      )}
    </header>
  );
}

export default Header;