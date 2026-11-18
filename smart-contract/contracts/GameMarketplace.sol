// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract GameMarketplace is ReentrancyGuard {
    address payable public admin;
    uint256 public feePercent = 5; // Phí sàn 5% về Admin, 95% về Người bán

    struct Listing {
        address nftContract;
        uint256 tokenId;
        address payable seller;
        uint256 price;
        bool isSold;
    }

    uint256 public listingCount;
    mapping(uint256 => Listing) public listings;

    event ItemListed(uint256 indexed listingId, address indexed nftContract, uint256 indexed tokenId, address seller, uint256 price);
    event ItemSold(uint256 indexed listingId, address indexed buyer, uint256 sellerAmount, uint256 adminFee);

    constructor() {
        admin = payable(msg.sender); // Account #0 (0xf39F...2266) làm Admin
    }

    function listItem(address nftContract, uint256 tokenId, uint256 price) external nonReentrant {
        require(price > 0, "Price must be greater than 0");
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        listingCount++;
        listings[listingCount] = Listing(
            nftContract,
            tokenId,
            payable(msg.sender),
            price,
            false
        );

        emit ItemListed(listingCount, nftContract, tokenId, msg.sender, price);
    }

    function buyItem(uint256 listingId) external payable nonReentrant {
        Listing storage item = listings[listingId];
        require(listingId > 0 && listingId <= listingCount, "Listing does not exist");
        require(!item.isSold, "Item already sold");
        require(msg.value == item.price, "Please submit the asking price");
        require(msg.sender != item.seller, "Seller cannot buy their own item");

        item.isSold = true;

        // Tính toán chia tiền: 5% phí sàn về Admin, 95% về Người bán
        uint256 adminFee = (msg.value * feePercent) / 100;
        uint256 sellerAmount = msg.value - adminFee;

        // Chuyển tiền về ví Admin và ví Người bán
        if (item.seller == admin) {
            (bool successAdmin, ) = admin.call{value: msg.value}("");
            require(successAdmin, "Transfer to admin failed");
        } else {
            (bool successSeller, ) = item.seller.call{value: sellerAmount}("");
            require(successSeller, "Transfer to seller failed");

            (bool successFee, ) = admin.call{value: adminFee}("");
            require(successFee, "Transfer fee to admin failed");
        }

        // Chuyển quyền sở hữu NFT sang ví Người mua
        IERC721(item.nftContract).transferFrom(address(this), msg.sender, item.tokenId);

        emit ItemSold(listingId, msg.sender, sellerAmount, adminFee);
    }
}