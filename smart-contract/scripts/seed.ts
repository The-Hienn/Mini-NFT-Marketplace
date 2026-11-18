import { ethers, NonceManager } from "ethers";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const wallet = new ethers.Wallet(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    provider
  );
  const seller = new NonceManager(wallet);

  // Đọc địa chỉ từ file do deploy.ts tạo ra
  const { GameItem: GAME_ITEM_ADDRESS, GameMarketplace: MARKETPLACE_ADDRESS } = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "deployed-addresses.json"), "utf8")
  );

  const gameItemArtifact = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "artifacts/contracts/GameItem.sol/GameItem.json"), "utf8")
  );
  const marketArtifact = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "artifacts/contracts/GameMarketplace.sol/GameMarketplace.json"), "utf8")
  );

  const gameItem = new ethers.Contract(GAME_ITEM_ADDRESS, gameItemArtifact.abi, seller);
  const marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, marketArtifact.abi, seller);

  const items = [
    { name: "Thanh Gươm Ánh Sáng", price: "0.005" },
    { name: "Rìu Hỏa Ngục", price: "0.004" },
    { name: "Khiên Cơ Khí", price: "0.002" },
    { name: "Cung Băng Giá", price: "0.003" },
  ];

  console.log("Đang nạp sẵn 4 NFT lên chợ...");

  for (let i = 0; i < items.length; i++) {
    const tokenId = i + 1;

    const tx1 = await gameItem.mintItem(wallet.address, `ipfs://weapon-${tokenId}`);
    await tx1.wait();

    const tx2 = await gameItem.approve(MARKETPLACE_ADDRESS, tokenId);
    await tx2.wait();

    const priceWei = ethers.parseEther(items[i].price);
    const tx3 = await marketplace.listItem(GAME_ITEM_ADDRESS, tokenId, priceWei);
    await tx3.wait();

    console.log(`✅ Đã đăng bán [Listing #${tokenId}]: ${items[i].name} - ${items[i].price} ETH`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});