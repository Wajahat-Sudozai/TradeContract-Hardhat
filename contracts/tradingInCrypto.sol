//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./tradingInCryptoStorage.sol";
import "./allowances.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

error InvalidTradeNumber();
error InvalidTradeType();
error InvalidSeller();
error InvalidTrader();
error InvalidBuyer();
error InvalidCallerAddress();
error CurrencyNotAllowed();
error AllReadyAgreed();
error NotAcceptedYet();
error AlreadyAddedBL();
error NotBLAddedYet();
error TradeCompleted();

contract tradingInCrypto is AccessControl, Allowances{
    bytes32 public constant SELLER_ROLE = keccak256("SELLER_ROLE");
    bytes32 public constant TRADER_ROLE = keccak256("TRADER_ROLE");
    bytes32 public constant BUYER_ROLE = keccak256("BUYER_ROLE");
   
    using tradingInCryptoStorage for tradingInCryptoStorage.trading;
    IERC20 private ERC20;

    using EnumerableSet for EnumerableSet.UintSet;
    EnumerableSet.UintSet private totalTradingNumbers;

    string private baseUri;

    constructor (string memory uri) {  
      baseUri=uri;
     _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
     _grantRole(SELLER_ROLE, msg.sender);
     _grantRole(TRADER_ROLE, msg.sender);
     _grantRole(BUYER_ROLE, msg.sender);
    }
    
    mapping (uint256=>tradingInCryptoStorage.trading)private trading;
    
    function updateBaseUri(string memory uri)public onlyRole(DEFAULT_ADMIN_ROLE){
     baseUri=uri;
    }

    function _baseURI() internal view  returns (string memory) {
    return baseUri;
    }

    function addCurrency(bytes32 currency, address currencyAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _addCurrency(currency, currencyAddress);
    }

    function removeCurrency(bytes32 currency) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _removeCurrency(currency);
    }

    function totalTrades() public view returns(uint256) {
        return totalTradingNumbers.length();
    }
    function totalTradesNumberByIndex(uint256 index) public view returns(uint256) {
        return totalTradingNumbers.at(index);
    }

    
    function _createtrade(
        uint256 _tradingNumber,
        string memory _assetName,
        bytes32 _currency,
        address _fromAddress,
        address _toAddress,
        uint256 _totalAmount,
        uint256 _tradeType
    )internal
    {
        uint256 matterId=_tradingNumber;
        trading[matterId].set(
            _tradingNumber,
            _assetName,
            _currency,
            _fromAddress,
            _toAddress,
            _totalAmount,
            _tradeType
        );
    }
    
    //Trade can be create by any of the Role 
    function createtrade(
        uint256 tradeNumber,
        string memory assetName,
        bytes32 currency,
        address walletAddress,
        uint256 totalAmount,
        uint256 tradeType
    )external    
    {
        address fromAddress;
        address toAddress;

      if(trading[tradeNumber].peelTradeNumber()){revert InvalidTradeNumber();}
      if(addressCurrency(currency)==address(0)){revert CurrencyNotAllowed();}

      if(tradeType==1){ //Seller To Trader
        if(!hasRole(SELLER_ROLE,msg.sender)){revert InvalidSeller();}        
        if(!hasRole(TRADER_ROLE,walletAddress)){revert InvalidTrader();}
        fromAddress = msg.sender;
        toAddress = walletAddress;
      }else if(tradeType==2){ //Trader To Buyer
        if(!hasRole(TRADER_ROLE,msg.sender)){revert InvalidTrader();}
        if(!hasRole(BUYER_ROLE,walletAddress)){revert InvalidBuyer();}
        fromAddress = msg.sender;
        toAddress = walletAddress;
      }else if(tradeType==3){ //Buyer To Trader
        if(!hasRole(BUYER_ROLE,msg.sender)){revert InvalidBuyer();}
        if(!hasRole(TRADER_ROLE,walletAddress)){revert InvalidTrader();}
        fromAddress = walletAddress;
        toAddress = msg.sender;
      }else{
          revert InvalidTradeType();
      }

        _createtrade(
            tradeNumber,
            assetName,
            currency,
            fromAddress,
            toAddress,
            totalAmount,
            tradeType);
        totalTradingNumbers.add(tradeNumber);
    }
    
    function agreeToTrade(uint256 tradeNumber)public {
      if(!trading[tradeNumber].peelTradeNumber()){revert InvalidTradeNumber();}
      if(trading[tradeNumber].isAcceptTrading()){revert AllReadyAgreed();}
      if(trading[tradeNumber].tradingType()==1 || trading[tradeNumber].tradingType()==2){
        if(trading[tradeNumber].tradingToAddress()!=msg.sender){revert InvalidCallerAddress();}
      }else if(trading[tradeNumber].tradingType()==3){
        if(trading[tradeNumber].tradingFromAddress()!=msg.sender){revert InvalidCallerAddress();}
      }else{
         revert InvalidTradeType();
      }
      address tradingCurrency = addressCurrency(trading[tradeNumber].tradingCurrency());
      trading[tradeNumber].setAcceptTrading();
      IERC20(tradingCurrency).transferFrom(trading[tradeNumber].tradingToAddress(),address(this),trading[tradeNumber].tradingTotalAmount());
     
    }

    function updateBL(uint256 tradeNumber,string memory hash)public{
      if(!trading[tradeNumber].peelTradeNumber()){revert InvalidTradeNumber();}
      if(!trading[tradeNumber].isAcceptTrading()){revert NotAcceptedYet();}
      if(!trading[tradeNumber].isTradingBlHashEmpty()){revert AlreadyAddedBL();}
      if(trading[tradeNumber].tradingFromAddress()!=msg.sender){revert InvalidCallerAddress();}
      trading[tradeNumber].setTradingBL(hash);
    }

    function verifyBL(uint256 tradeNumber)public{
      if(!trading[tradeNumber].peelTradeNumber()){revert InvalidTradeNumber();}
      if(trading[tradeNumber].isVerifyBl()){revert TradeCompleted();}
      if(trading[tradeNumber].isTradingBlHashEmpty()){revert NotBLAddedYet();}
      if(trading[tradeNumber].tradingToAddress()!=msg.sender){revert InvalidCallerAddress();}
      trading[tradeNumber].setVerifyTradingBL();
      address tradingCurrency = addressCurrency(trading[tradeNumber].tradingCurrency());
      IERC20(tradingCurrency).transfer(trading[tradeNumber].tradingFromAddress(),trading[tradeNumber].tradingTotalAmount());
    }
    
    //Trading details
    function tradingDetails(uint256 tradeNumber)public view returns(uint256 TradeNumber,
        string memory AssetName,
        bytes32 Currency,
        address FromAddress,
        address ToAddress,
        uint256 TotalAmount,
        string memory  TradeBL)
    {
        return trading[tradeNumber].tradingDetails();
    }
    
    //Trading BL Hash
    function getTradingHash(uint256 tradeNumber) public virtual view returns(string memory) {
    if(!trading[tradeNumber].peelTradeNumber()){revert InvalidTradeNumber();}
    string memory baseURI = _baseURI();
    string memory hash=trading[tradeNumber].tradingBlHash();
    return
        bytes(baseURI).length > 0
        ? string(abi.encodePacked(baseURI,hash))
        : "";   
    }

    // get All matter number
    function allTradingNumbers() public view returns(uint256[] memory) {
        uint256 tradingNumbers = totalTrades();
        uint256[] memory trades = new uint256[](tradingNumbers);
        for (uint256 index = 0; index < tradingNumbers; ++index) {
            uint256 tradingNumber = totalTradesNumberByIndex(index);
            trades[index] = tradingNumber;
        }
        return trades;
    }

    function batchDetailsTrades(uint256[] memory tradingNumbers) public view returns(tradingInCryptoStorage.trading[] memory) {
        tradingInCryptoStorage.trading[] memory detailsTrades = new tradingInCryptoStorage.trading[](tradingNumbers.length);
        for (uint256 index = 0; index < tradingNumbers.length; ++index) {
            detailsTrades[index] = trading[tradingNumbers[index]];
        }
        return detailsTrades;
    }

    
}