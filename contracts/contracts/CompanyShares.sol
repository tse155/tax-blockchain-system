// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract CompanyShares is ERC721 {
    struct ShareData {
        uint256 acquisitionPrice;
        uint256 mintedAt;
        uint256 lastTransferAt;
        address previousOwner;
    }

    mapping(uint256 => ShareData) public shares;

    address public companyOwner;
    uint256 public sharesMinted;
    uint256 public constant MAX_SHARES = 20;

    event ShareMinted(uint256 indexed tokenId, address indexed to, uint256 acquisitionPriceCents);
    event ShareTransferredWithPrice(uint256 indexed tokenId, address indexed from, address indexed to, uint256 priceCents);
    event AcquisitionPriceUpdated(uint256 indexed tokenId, uint256 acquisitionPriceCents);

    modifier onlyCompanyOwner() {
        require(msg.sender == companyOwner, "Not company owner");
        _;
    }

    constructor() ERC721("Company Shares", "CSHARE") {
        companyOwner = msg.sender;
    }

    function mintShare(
        address to,
        uint256 tokenId,
        uint256 acquisitionPriceCents
    ) external onlyCompanyOwner returns (uint256) {
        require(tokenId >= 1 && tokenId <= MAX_SHARES, "Invalid tokenId");
        require(_ownerOf(tokenId) == address(0), "Already minted");
        require(sharesMinted < MAX_SHARES, "Max shares minted");

        _safeMint(to, tokenId);
        sharesMinted++;

        shares[tokenId] = ShareData({
            acquisitionPrice: acquisitionPriceCents,
            mintedAt: block.timestamp,
            lastTransferAt: 0,
            previousOwner: address(0)
        });

        emit ShareMinted(tokenId, to, acquisitionPriceCents);
        return tokenId;
    }

    // NEW: Transfer with price in one transaction
    function transferWithPrice(
        address to,
        uint256 tokenId,
        uint256 newPriceCents
    ) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        require(to != address(0), "Invalid recipient");
        
        address from = msg.sender;
        
        // Update price BEFORE transfer
        shares[tokenId].acquisitionPrice = newPriceCents;
        
        // Do the transfer (will call _update)
        safeTransferFrom(from, to, tokenId);
        
        emit ShareTransferredWithPrice(tokenId, from, to, newPriceCents);
    }

    function setAcquisitionPrice(uint256 tokenId, uint256 newPriceCents) external {
        address owner = _ownerOf(tokenId);
        require(owner != address(0), "Nonexistent share");
        require(
            _isAuthorized(owner, msg.sender, tokenId) || msg.sender == companyOwner,
            "Not owner/approved/company"
        );

        shares[tokenId].acquisitionPrice = newPriceCents;
        emit AcquisitionPriceUpdated(tokenId, newPriceCents);
    }

    function getShareData(uint256 tokenId) external view returns (ShareData memory) {
        require(_ownerOf(tokenId) != address(0), "Nonexistent share");
        return shares[tokenId];
    }

    function _update(address to, uint256 tokenId, address auth)
        internal override
        returns (address)
    {
        address from = super._update(to, tokenId, auth);

        // Track previous owner and timestamp on transfers (not mints)
        if (from != address(0) && to != address(0)) {
            ShareData storage data = shares[tokenId];
            data.previousOwner = from;
            data.lastTransferAt = block.timestamp;
        }

        return from;
    }
}