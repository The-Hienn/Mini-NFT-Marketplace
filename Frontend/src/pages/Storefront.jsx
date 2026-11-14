import React, { useState } from 'react';

function Storefront() {
  const [activeTab, setActiveTab] = useState('cards');

  // --- TAB 1: THẺ GAME (VNĐ) ---
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
  const [selectedDenom, setSelectedDenom] = useState(denominations[3]); // Mặc định 100k
  const [quantity, setQuantity] = useState(1);
  const [email, setEmail] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // --- TAB 2: SÀN NFT (ĐÃ ĐIỀU CHỈNH GIÁ ETH PHÙ HỢP, TƯƠNG ĐƯƠNG PHÂN KHÚC THẺ) ---
  const nftItems = [
    { id: 101, name: "Thanh Gươm Ánh Sáng", price: 0.005, rarity: "Legendary", damage: "120", img: "https://placehold.co/400x300/151521/00FFCC?text=SWORD" },
    { id: 102, name: "Rìu Hỏa Ngục", price: 0.004, rarity: "Legendary", damage: "180", img: "https://placehold.co/400x300/151521/FFAA00?text=AXE" },
    { id: 103, name: "Khiên Cơ Khí", price: 0.002, rarity: "Epic", damage: "Thủ +150", img: "https://placehold.co/400x300/151521/A855F7?text=SHIELD" },
    { id: 104, name: "Cung Băng Giá", price: 0.003, rarity: "Epic", damage: "95 (+Băng)", img: "https://placehold.co/400x300/151521/38BDF8?text=BOW" },
  ];
  const [selectedNft, setSelectedNft] = useState(nftItems[0]);

  const filteredProviders = providers.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Tính tiền Tab 1
  const unitPriceVNĐ = selectedDenom ? selectedDenom.value : 0;
  const totalCardsPriceVNĐ = unitPriceVNĐ * quantity;
  const estimatedETH = (totalCardsPriceVNĐ / 75000000).toFixed(4); 

  // Tính tiền Tab 2 (ETH đã được cân đối lại cho hợp lý)
  const totalNftPriceETH = Number(selectedNft.price).toFixed(3);

  // 👉 ĐIỂM NÉO CHO ĐỒNG ĐỘI LÀM SMART CONTRACT
  const handleCheckout = (e) => {
    e.preventDefault();
    if (activeTab === 'cards' && !email) {
      alert("Vui lòng nhập email nhận mã thẻ!");
      return;
    }

    if (activeTab === 'cards') {
      alert(`[WEB3 GATEWAY] Gọi Smart Contract thanh toán:\n- Thẻ: ${selectedProvider.name} (${selectedDenom.label})\n- Số lượng: ${quantity}\n- Quy đổi: ${estimatedETH} ETH`);
    } else {
      alert(`[SMART CONTRACT] Mua NFT: ${selectedNft.name} với giá ${totalNftPriceETH} ETH`);
    }
  };

  return (
    <div className="main-wrapper">
      
      {/* CỘT TRÁI */}
      <div className="content-area">
        
        {/* Tabs */}
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
        </div>

        {/* TAB 1 */}
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

        {/* TAB 2 */}
        {activeTab === 'nft' && (
          <div className="section-box">
            <h2 className="section-title"><span>🔥</span> Khám Phá Vũ Khí Độc Bản On-Chain</h2>
            <div className="provider-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
              {nftItems.map(item => (
                <div 
                  key={item.id}
                  className={`provider-card ${selectedNft.id === item.id ? 'active' : ''}`}
                  onClick={() => setSelectedNft(item)}
                  style={{ textAlign: 'left', padding: '12px' }}
                >
                  <img src={item.img} alt={item.name} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
                  <span style={{ color: '#00ffcc', fontSize: '12px', fontWeight: 'bold' }}>{item.rarity}</span>
                  <span className="provider-name" style={{ fontSize: '15px' }}>{item.name}</span>
                  <div style={{ color: '#94a3b8', fontSize: '13px' }}>⚔️ {item.damage}</div>
                  <div style={{ color: '#00ffcc', fontWeight: '700', marginTop: '4px' }}>{item.price} ETH</div>
                </div>
              ))}
            </div>
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
            {activeTab === 'cards' ? `Thẻ ${selectedProvider.name} (${selectedDenom.label})` : selectedNft.name}
          </strong>
        </div>
        
        {activeTab === 'cards' && (
          <div className="bill-row">
            <span>Số lượng:</span>
            <strong>x {quantity}</strong>
          </div>
        )}
        
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

        <button className="btn-pay" onClick={handleCheckout}>
          {activeTab === 'cards' ? 'THANH TOÁN QUA SMART CONTRACT' : 'XÁC NHẬN THANH TOÁN WEB3'}
        </button>
        
        <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', marginTop: '18px', lineHeight: '1.4' }}>
          🛡️ Giao dịch được bảo mật và thực thi tự động qua Smart Contract trên Blockchain.
        </p>
      </div>

    </div>
  );
}

export default Storefront;