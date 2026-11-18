import { ethers, NonceManager } from "ethers";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const wallet = new ethers.Wallet(privateKey, provider);
  const signer = new NonceManager(wallet);

  console.log("Đang deploy bằng tài khoản ví:", wallet.address);

  async function deployContract(contractName: string, args: any[] = []) {
    const artifactPath = path.join(
      process.cwd(),
      `artifacts/contracts/${contractName}.sol/${contractName}.json`
    );
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
    const contract = await factory.deploy(...args);
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log(`${contractName} deployed to: ${address}`);
    return address;
  }

  const gameItemAddress = await deployContract("GameItem");
  const marketplaceAddress = await deployContract("GameMarketplace");

  // Lưu địa chỉ để Frontend dùng
  fs.writeFileSync(
    path.join(process.cwd(), "deployed-addresses.json"),
    JSON.stringify({ GameItem: gameItemAddress, GameMarketplace: marketplaceAddress }, null, 2)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});