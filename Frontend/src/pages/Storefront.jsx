import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { buyMarketItem, mintAndListNFT } from '../utils/web3';

// Địa chỉ ví Admin duy nhất (Account #0 của Hardhat)
const ADMIN_WALLET = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

const DEFAULT_NFTS = [
  { id: 101, listingId: 1, name: "Thanh Gươm Ánh Sáng", price: 0.005, rarity: "Legendary", damage: "120", img: "https://placehold.co/400x300/151521/00FFCC?text=SWORD" },
  { id: 102, listingId: 2, name: "Rìu Hỏa Ngục", price: 0.004, rarity: "Legendary", damage: "180", img: "https://placehold.co/400x300/151521/FFAA00?text=AXE" },
  { id: 103, listingId: 3, name: "Khiên Cơ Khí", price: 0.002, rarity: "Epic", damage: "Thủ +150", img: "https://placehold.co/400x300/151521/A855F7?text=SHIELD" },
  { id: 104, listingId: 4, name: "Cung Băng Giá", price: 0.003, rarity: "Epic", damage: "95 (+Băng)", img: "https://placehold.co/400x300/151521/38BDF8?text=BOW" },
];

function Storefront() {
  const [activeTab, setActiveTab] = useState('cards');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentWallet, setCurrentWallet] = useState("");

  // Kiểm tra quyền Admin duy nhất theo địa chỉ ví
  const isAdmin = currentWallet.toLowerCase() === ADMIN_WALLET.toLowerCase();

  // --- THEO DÕI ĐỊA CHỈ VÍ METAMASK ---
  useEffect(() => {
    if (!window.ethereum) return;

    const fetchWallet = async () => {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      setCurrentWallet(accounts[0] || "");
    };
    fetchWallet();

    const handleAccountsChanged = (accounts) => {
      const addr = accounts[0] || "";
      setCurrentWallet(addr);
      if (addr.toLowerCase() !== ADMIN_WALLET.toLowerCase()) {
        setActiveTab((prev) => (prev === 'admin' ? 'nft' : prev));
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    return () => window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
  }, []);

  // --- TAB 1: THẺ GAME (VNĐ -> 100% VỀ VÍ ADMIN) ---
  const providers = [
    { id: 'garena', name: 'Thẻ Garena', icon: '🎮', hot: true },
    { id: 'zing', name: 'Thẻ Zing', icon: '🎵', hot: false },
    { id: 'vcoin', name: 'Thẻ V-Coin', icon: '🪙', hot: true },
    { id: 'appota', name: 'Thẻ Appota', icon: '📱', hot: false },
    { id: 'gate', name: 'Thẻ Gate', icon: '🚪', hot: false },
  ];
  const [selectedProvider, setSelectedProvider] = useState(providers[0]);

  const denominations = [
    { id: 1, value: 10000, label: '10.000 đ' },
    { id: 2, value: 20000, label: '20.000 đ' },
    { id: 3, value: 50000, label: '50.000 đ' },
    { id: 4, value: 100000, label: '100.000 đ' },
    { id: 5, value: 200000, label: '200.000 đ' },
    { id: 6, value: 500000, label: '500.000 đ' },
  ];
  const [selectedDenom, setSelectedDenom] = useState(denominations[3]);
  const [quantity, setQuantity] = useState(1);
  const [email, setEmail] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // --- TAB 2: DANH SÁCH NFT ---
  const [nftItems, setNftItems] = useState(() => {
    const saved = localStorage.getItem("cybernexus_nfts_admin");
    return saved ? JSON.parse(saved) : DEFAULT_NFTS;
  });
  const [selectedNft, setSelectedNft] = useState(nftItems[0]);

  useEffect(() => {
    localStorage.setItem("cybernexus_nfts_admin", JSON.stringify(nftItems));
  }, [nftItems]);

  // --- TAB 3: FORM ADMIN MINT & ĐĂNG BÁN NFT ---
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("0.01");
  const [newRarity, setNewRarity] = useState("Mythic");
  const [newDamage, setNewDamage] = useState("250 (+Sét)");

  const filteredProviders = providers.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const unitPriceVNĐ = selectedDenom ? selectedDenom.value : 0;
  const totalCardsPriceVNĐ = unitPriceVNĐ * quantity;
  const estimatedETH = (totalCardsPriceVNĐ / 75000000).toFixed(4); 
  const totalNftPriceETH = Number(selectedNft?.price || 0);

  // XỬ LÝ MUA THẺ / MUA NFT (100% TIỀN VỀ VÍ ADMIN)
  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!window.ethereum) return alert("Vui lòng cài đặt ví MetaMask!");
    if (!currentWallet) return alert("Vui lòng kết nối ví MetaMask ở góc phải trên cùng!");

    if (isAdmin) {
      return alert("⚠️ Bạn đang dùng ví Admin (chủ cửa hàng). Hãy chuyển sang ví Người dùng (ví dụ Account #1: 0x7099...) để thực hiện mua hàng!");
    }

    if (activeTab === 'cards' && !email) {
      return alert("Vui lòng nhập email nhận mã thẻ!");
    }

    try {
      setIsProcessing(true);

      if (activeTab === 'cards') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const tx = await signer.sendTransaction({
          to: ADMIN_WALLET,
          value: ethers.parseEther(estimatedETH.toString())
        });
        await tx.wait();
        alert(`✅ Mua thẻ thành công!\nĐã trừ ${estimatedETH} ETH từ ví của bạn và cộng 100% vào ví Admin.\nTx Hash: ${tx.hash}`);
      } else {
        await buyMarketItem(selectedNft.listingId, totalNftPriceETH.toString());
        alert(
          `🎉 Mua NFT "${selectedNft.name}" thành công!\n` +
          `• Đã trừ ${totalNftPriceETH} ETH từ ví của bạn.\n` +
          `• Đã cộng 100% (${totalNftPriceETH} ETH) vào ví Admin (0xf39F...2266).\n` +
          `• Quyền sở hữu NFT đã chuyển sang ví của bạn!`
        );
      }
    } catch (error) {
      console.error("Lỗi giao dịch:", error);
      alert("❌ Giao dịch thất bại hoặc đã bị hủy: " + (error.reason || error.message));
    } finally {
      setIsProcessing(false);
    }
  };

  // XỬ LÝ ADMIN MINT & ĐĂNG BÁN NFT MỚI
  const handleAdminMintAndList = async (e) => {
    e.preventDefault();
    if (!isAdmin) return alert("Chỉ ví Admin mới có quyền đăng bán NFT!");
    if (!newName.trim() || !newPrice) return alert("Vui lòng nhập đầy đủ tên vật phẩm và giá ETH!");

    try {
      setIsProcessing(true);
      const fallbackId = nftItems.length + 1;
      const tokenURI = `ipfs://weapon-${fallbackId}-${encodeURIComponent(newName)}`;

      // Gọi 3 giao dịch on-chain: Mint -> Approve -> ListItem
      const realTokenId = await mintAndListNFT(tokenURI, newPrice, fallbackId);

      const newItem = {
        id: 100 + realTokenId,
        listingId: realTokenId,
        name: newName,
        price: parseFloat(newPrice),
        rarity: newRarity,
        damage: newDamage,
        img: `https://placehold.co/400x300/151521/F43F5E?text=${encodeURIComponent(newName.toUpperCase())}`
      };

      const updatedList = [...nftItems, newItem];
      setNftItems(updatedList);
      setSelectedNft(newItem);
      setNewName("");

      alert(`✅ Admin đã đúc & đăng bán "${newItem.name}" (Listing #${realTokenId}) thành công!`);
      setActiveTab('nft');
    } catch (error) {
      console.error("Lỗi Mint NFT:", error);
      alert("❌ Lỗi đăng bán NFT: " + (error.reason || error.message));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="main-wrapper">
      {/* CỘT TRÁI */}
      <div className="content-area">
        <div className="nav-tabs">
          <button 
            className={`tab-btn ${activeTab === 'cards' ? 'active' : ''}`}
            onClick={() => setActiveTab('cards')}
          >
            ⚡ Mua Thẻ Game Trực Tuyến
          </button>
          <button 
            className={`tab-btn ${activeTab === 'nft' ? 'active' : ''}`}
            onClick={() => setActiveTab('nft')}
          >
            ⚔️ Sàn Vũ Khí NFT On-Chain
          </button>

          {/* CHỈ HIỂN THỊ TAB QUẢN TRỊ KHI VÍ ĐANG KẾT NỐI LÀ ADMIN */}
          {isAdmin && (
            <button 
              className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
              style={{ borderColor: '#f59e0b', color: activeTab === 'admin' ? '#05050a' : '#fbbf24', background: activeTab === 'admin' ? '#f59e0b' : 'transparent' }}
            >
              ⚙️ Quản Trị (Mint NFT)
            </button>
          )}
        </div>

        {/* TAB 1: THẺ GAME */}
        {activeTab === 'cards' && (
          <>
            <div className="section-box">
              <h2 className="section-title"><span>01</span> Chọn Nhà Cung Cấp Thẻ</h2>
              <input 
                type="text" 
                placeholder="🔍 Tìm nhanh tên thẻ (vd: Garena, Zing, Vcoin...)" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-bar"
              />
              <div className="provider-grid">
                {filteredProviders.map(p => (
                  <div 
                    key={p.id}
                    className={`provider-card ${selectedProvider.id === p.id ? 'active' : ''}`}
                    onClick={() => setSelectedProvider(p)}
                  >
                    {p.hot && <span className="badge-hot">HOT</span>}
                    <span style={{ fontSize: '32px' }}>{p.icon}</span>
                    <span className="provider-name" style={{ marginTop: '5px' }}>{p.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-box">
              <h2 className="section-title"><span>02</span> Chọn Mệnh Giá Thẻ Nạp</h2>
              <div className="denom-grid">
                {denominations.map(d => (
                  <div 
                    key={d.id}
                    className={`denom-card ${selectedDenom?.id === d.id ? 'active' : ''}`}
                    onClick={() => setSelectedDenom(d)}
                    style={{ padding: '20px 10px' }}
                  >
                    <div className="denom-price" style={{ fontSize: '20px' }}>{d.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-box">
              <h2 className="section-title"><span>03</span> Thông Tin Nhận Mã Thẻ</h2>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: '1', minWidth: '140px' }}>
                  <label>Số lượng</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="99" 
                    value={quantity} 
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="form-input" 
                  />
                </div>
                <div className="form-group" style={{ flex: '2', minWidth: '260px' }}>
                  <label>Email nhận mã thẻ bảo mật *</label>
                  <input 
                    type="email" 
                    placeholder="nhapngayemail@gmail.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    className="form-input" 
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: SÀN NFT */}
        {activeTab === 'nft' && (
          <div className="section-box">
            <h2 className="section-title"><span>🔥</span> Khám Phá Vũ Khí Độc Bản On-Chain</h2>
            <div className="provider-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
              {nftItems.map(item => (
                <div 
                  key={item.id}
                  className={`provider-card ${selectedNft?.id === item.id ? 'active' : ''}`}
                  onClick={() => setSelectedNft(item)}
                  style={{ textAlign: 'left', padding: '12px' }}
                >
                  <img src={item.img} alt={item.name} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
                  <span style={{ color: '#00ffcc', fontSize: '12px', fontWeight: 'bold' }}>{item.rarity} • #{item.listingId}</span>
                  <span className="provider-name" style={{ fontSize: '15px' }}>{item.name}</span>
                  <div style={{ color: '#94a3b8', fontSize: '13px' }}>⚔️ {item.damage}</div>
                  <div style={{ color: '#00ffcc', fontWeight: '700', marginTop: '4px' }}>{item.price} ETH</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: QUẢN TRỊ ADMIN (CHỈ HIỆN VỚI VÍ ADMIN) */}
        {activeTab === 'admin' && isAdmin && (
          <div className="section-box" style={{ border: '1px solid rgba(245, 158, 11, 0.4)' }}>
            <h2 className="section-title" style={{ color: '#fbbf24' }}>
              <span>⚙️</span> Bảng Điều Khiển Admin — Đúc (Mint) & Niêm Yết NFT
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px', lineHeight: '1.5' }}>
              Tài khoản Admin: <code style={{ color: '#fbbf24' }}>0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266</code><br />
              Khi người dùng mua vật phẩm, <strong>100% doanh thu</strong> sẽ chuyển trực tiếp từ ví người mua vào tài khoản Admin.
            </p>

            <form onSubmit={handleAdminMintAndList} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Tên vũ khí NFT *</label>
                <input 
                  type="text" 
                  placeholder="VD: Thương Long Thần Kích" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
                  <label>Giá niêm yết (ETH) *</label>
                  <input 
                    type="number" 
                    step="0.001"
                    min="0.001"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
                  <label>Độ hiếm (Rarity)</label>
                  <select value={newRarity} onChange={(e) => setNewRarity(e.target.value)} className="form-input">
                    <option value="Mythic">Mythic</option>
                    <option value="Legendary">Legendary</option>
                    <option value="Epic">Epic</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
                  <label>Chỉ số sức mạnh</label>
                  <input 
                    type="text" 
                    value={newDamage}
                    onChange={(e) => setNewDamage(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-pay" 
                disabled={isProcessing}
                style={{ background: '#f59e0b', color: '#05050a', marginTop: '10px' }}
              >
                {isProcessing ? '⏳ ĐANG XÁC NHẬN 3 BƯỚC ON-CHAIN...' : '🚀 MINT & ĐĂNG BÁN LÊN CỬA HÀNG'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* CỘT PHẢI: HÓA ĐƠN THANH TOÁN */}
      <div className="checkout-panel">
        <h2 className="section-title" style={{ fontSize: '17px', marginBottom: '20px' }}>
          <span>📋</span> Hóa Đơn Thanh Toán
        </h2>
        
        <div className="bill-row">
          <span>Loại giao dịch:</span>
          <strong style={{ color: '#00ffcc' }}>{activeTab === 'cards' ? 'Mua Thẻ Trực Tuyến' : 'Sở Hữu NFT'}</strong>
        </div>
        <div className="bill-row">
          <span>Sản phẩm:</span>
          <strong>
            {activeTab === 'cards' ? `Thẻ ${selectedProvider.name} (${selectedDenom.label})` : selectedNft?.name}
          </strong>
        </div>

        {activeTab === 'cards' && (
          <div className="bill-row">
            <span>Số lượng:</span>
            <strong>x {quantity}</strong>
          </div>
        )}

        <div className="bill-row">
          <span>Ví nhận thanh toán:</span>
          <span style={{ color: '#fbbf24', fontSize: '12px' }}>100% Admin (0xf39F...2266)</span>
        </div>
        
        <div className="total-box">
          <span className="total-title">TỔNG CỘNG:</span>
          <div style={{ textAlign: 'right' }}>
            <span className="total-price" style={{ fontSize: activeTab === 'cards' ? '20px' : '26px', display: 'block' }}>
              {activeTab === 'cards' ? `${totalCardsPriceVNĐ.toLocaleString('vi-VN')} đ` : `${totalNftPriceETH} ETH`}
            </span>
            {activeTab === 'cards' && (
              <span style={{ fontSize: '12px', color: '#00ffcc' }}>≈ {estimatedETH} ETH (Web3)</span>
            )}
          </div>
        </div>

        <button className="btn-pay" onClick={handleCheckout} disabled={isProcessing || activeTab === 'admin'}>
          {isProcessing 
            ? '⏳ ĐANG XỬ LÝ TRÊN BLOCKCHAIN...' 
            : (activeTab === 'cards' ? 'THANH TOÁN QUA SMART CONTRACT' : 'XÁC NHẬN THANH TOÁN WEB3')}
        </button>
        
        <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', marginTop: '18px', lineHeight: '1.4' }}>
          🛡️ Tiền thanh toán được trừ trực tiếp từ ví người mua và chuyển 100% về ví Admin.
        </p>
      </div>
    </div>
  );
}

export default Storefront;