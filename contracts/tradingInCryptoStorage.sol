// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

library tradingInCryptoStorage  {
    struct trading {
        uint256 tradeNumber;
        string assetName;
        bytes32 currency;
        address fromAddress;
        address toAddress;
        uint256 totalAmount;
        string blHash;
        bool  acceptTrade;
        bool verifyBl;
        uint256 tradeType;
    }
    function set(
        trading storage self,
        uint256 _tradeNumber,
        string memory _assetName,
        bytes32 _currency,
        address _fromAddress,
        address _toAddress,
        uint256 _totalAmount,
        uint256 _tradeType
        ) internal {
        self.tradeNumber = _tradeNumber;
        self.assetName = _assetName;
        self.currency= _currency;
        self.fromAddress = _fromAddress;
        self.toAddress =  _toAddress; 
        self.totalAmount = _totalAmount;
        self.tradeType = _tradeType;
    }
    function setAcceptTrading(
    trading storage self
    )internal
    {
        self.acceptTrade=true;
    }
    function setTradingBL(
    trading storage self,
    string memory _blHash
    )internal
    {
        self.blHash=_blHash;
    }
    function setVerifyTradingBL(
    trading storage self
    )internal
    {
        self.verifyBl=true;
    }
    function tradingDetails(
        trading storage self
    ) internal view returns(uint256,
        string memory,
        bytes32,
        address,
        address,
        uint256,
        string memory ) 
    {
        return (
        self.tradeNumber,
        self.assetName,
        self.currency,
        self.fromAddress,
        self.toAddress,
        self.totalAmount,
        self.blHash
        );
    }
    function peelTradeNumber(
        trading storage self
    )internal view returns(bool)
    {
        if(self.tradeNumber!=0)
        {
           return true;
        }
        return false;
    }
    function tradingAssetName(
     trading storage self
    )internal view returns(string memory)
    {
        return self.assetName;
    }
    function tradingTotalAmount(
     trading storage self
    )internal view returns(uint256)
    {
        return self.totalAmount;
    }
    function tradingFromAddress(
     trading storage self
    )internal view returns(address)
    {
        return self.fromAddress;
    }
    function tradingToAddress(
     trading storage self
    )internal view returns(address)
    {
        return self.toAddress;
    }
    function isAcceptTrading(
    trading storage self
    )internal view returns(bool)
    {
        return self.acceptTrade;
    }
    function tradingCurrency(
    trading storage self
    )internal view returns(bytes32){
        return self.currency;
    } 
    function tradingBlHash(
    trading storage self
    )internal view returns(string memory){
       return self.blHash;
    }
    function isTradingBlHashEmpty(
    trading storage self
    )internal view returns(bool){
       return bytes(self.blHash).length == 0;
    }
    function tradingType(
    trading storage self
    )internal view returns(uint256){
        return self.tradeType;
    }
    function isVerifyBl(
    trading storage self
    )internal view returns(bool){
        return self.verifyBl;
    }
}   