import React, { useState, useEffect } from 'react';
import { connectWallet } from '../utils/web3';

function Header() {
  const [wallet, setWallet] = useState("");
  const [isDisconnected, setIsDisconnected] = useState(false);

  const handleConnect = async () => {
    const res = await connectWallet();
    if (res && res.address) {
      setWallet(res.address);
      setIsDisconnected(false);
    }
  };

  const handleDisconnect = () => {
    setWallet("");
    setIsDisconnected(true);
  };

  useEffect(() => {
    if (!window.ethereum) return;

    // Tự động nhận diện lại ví nếu trước đó đã kết nối và chưa bấm ngắt kết nối
    const checkExistingConnection = async () => {
      if (!isDisconnected) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWallet(accounts[0]);
        }
      }
    };
    checkExistingConnection();

    // Tự động cập nhật địa chỉ khi chuyển đổi tài khoản trên MetaMask
    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setWallet(accounts[0]);
        setIsDisconnected(false);
      } else {
        setWallet("");
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, [isDisconnected]);

  return (
    <header className="header">
      <div className="logo-area">
        <span className="logo-icon">🛡️</span>
        <h1>CYBER<span>NEXUS</span></h1>
      </div>

      {wallet ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            className="btn-wallet"
            style={{ background: '#00ffcc', color: '#05050a', cursor: 'default' }}
          >
            🟢 {wallet.slice(0, 6)}...{wallet.slice(-4)}
          </span>
          <button
            className="btn-wallet"
            onClick={handleDisconnect}
            title="Ngắt kết nối ví hiện tại"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              padding: '10px 14px'
            }}
          >
            Ngắt kết nối
          </button>
        </div>
      ) : (
        <button className="btn-wallet" onClick={handleConnect}>
          KẾT NỐI VÍ METAMASK
        </button>
      )}
    </header>
  );
}

export default Header;