import { ethers } from "ethers";
import GameItemABI from "../contracts/GameItem.json";
import GameMarketplaceABI from "../contracts/GameMarketplace.json";

export const GAME_ITEM_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const MARKETPLACE_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

// 1. Kết nối ví MetaMask
export const connectWallet = async () => {
    if (!window.ethereum) {
        alert("Vui lòng cài đặt tiện ích MetaMask trên trình duyệt!");
        return null;
    }
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        return { provider, signer, address: accounts[0] };
    } catch (error) {
        console.error("Lỗi kết nối ví:", error);
        return null;
    }
};

// 2. Lấy instance của 2 Smart Contract để gọi hàm
export const getContracts = async () => {
    if (!window.ethereum) throw new Error("Vui lòng cài đặt MetaMask!");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const gameItemContract = new ethers.Contract(
        GAME_ITEM_ADDRESS,
        GameItemABI.abi,
        signer
    );

    const marketplaceContract = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        GameMarketplaceABI.abi,
        signer
    );

    return { gameItemContract, marketplaceContract, signer };
};

// 3. Tạo mới (Mint) và Đăng bán (List) vật phẩm game lên chợ (Dành cho Admin)
export const mintAndListNFT = async (tokenURI, priceInEth, fallbackListingId) => {
    const { gameItemContract, marketplaceContract, signer } = await getContracts();
    const userAddress = await signer.getAddress();

    const mintTx = await gameItemContract.mintItem(userAddress, tokenURI);
    const receipt = await mintTx.wait();

    const transferEvent = receipt.logs.find(
        (log) => log.fragment && log.fragment.name === "Transfer"
    );
    const tokenId = transferEvent ? Number(transferEvent.args[2]) : fallbackListingId;

    const approveTx = await gameItemContract.approve(MARKETPLACE_ADDRESS, tokenId);
    await approveTx.wait();

    const priceInWei = ethers.parseEther(priceInEth.toString());
    const listTx = await marketplaceContract.listItem(
        GAME_ITEM_ADDRESS,
        tokenId,
        priceInWei
    );
    await listTx.wait();

    return tokenId;
};

// 4. Mua vật phẩm từ chợ và trả về Transaction Hash
export const buyMarketItem = async (listingId, priceInEth) => {
    const { marketplaceContract } = await getContracts();
    const priceInWei = ethers.parseEther(priceInEth.toString());

    const buyTx = await marketplaceContract.buyItem(listingId, {
        value: priceInWei,
    });
    const receipt = await buyTx.wait();
    return receipt.hash;
};
// 5. Truy vấn trực tiếp Blockchain xem ví đang sở hữu những TokenId nào
export const getOwnedTokenIds = async (walletAddress, maxTokenId) => {
    if (!window.ethereum || !walletAddress) return [];
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const gameItemContract = new ethers.Contract(
            GAME_ITEM_ADDRESS,
            GameItemABI.abi,
            provider
        );

        const ownedIds = [];
        for (let id = 1; id <= maxTokenId; id++) {
            try {
                const owner = await gameItemContract.ownerOf(id);
                if (owner.toLowerCase() === walletAddress.toLowerCase()) {
                    ownedIds.push(id);
                }
            } catch (e) {
                // Bỏ qua nếu tokenId chưa tồn tại
            }
        }
        return ownedIds;
    } catch (error) {
        console.error("Lỗi kiểm tra sở hữu NFT:", error);
        return [];
    }
};