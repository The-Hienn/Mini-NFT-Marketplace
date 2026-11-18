import { ethers } from "ethers";
import GameItemABI from "../contracts/GameItem.json";
import GameMarketplaceABI from "../contracts/GameMarketplace.json";

export const GAME_ITEM_ADDRESS = "0x9A676e781A523b5d0C0e43731313A708CB607508";
export const MARKETPLACE_ADDRESS = "0x0B306BF915C4d645ff596e518fAf3F9669b97016";

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

    // Bước A: Mint NFT cho Admin
    const mintTx = await gameItemContract.mintItem(userAddress, tokenURI);
    const receipt = await mintTx.wait();

    // Lấy chính xác tokenId vừa mint từ event Transfer của ERC721
    const transferEvent = receipt.logs.find(
        (log) => log.fragment && log.fragment.name === "Transfer"
    );
    const tokenId = transferEvent ? Number(transferEvent.args[2]) : fallbackListingId;

    // Bước B: Cấp quyền (Approve) cho Marketplace được phép chuyển NFT này
    const approveTx = await gameItemContract.approve(MARKETPLACE_ADDRESS, tokenId);
    await approveTx.wait();

    // Bước C: Đăng bán lên chợ
    const priceInWei = ethers.parseEther(priceInEth.toString());
    const listTx = await marketplaceContract.listItem(
        GAME_ITEM_ADDRESS,
        tokenId,
        priceInWei
    );
    await listTx.wait();

    return tokenId;
};

// 4. Mua vật phẩm từ chợ
export const buyMarketItem = async (listingId, priceInEth) => {
    const { marketplaceContract } = await getContracts();
    const priceInWei = ethers.parseEther(priceInEth.toString());

    const buyTx = await marketplaceContract.buyItem(listingId, {
        value: priceInWei,
    });
    await buyTx.wait();
};