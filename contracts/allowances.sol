// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract Allowances {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    mapping(bytes32 => address) private _currencyAllowed;

    EnumerableSet.Bytes32Set private _totalCurrencies;


    function _addCurrency(bytes32 currency, address currencyAddress) internal {
        require(currencyAddress != address(0), "Allowances: The Zero Address is not allowed");
        _currencyAllowed[currency] = currencyAddress;
        _totalCurrencies.add(currency);
    }

    function _removeCurrency(bytes32 currency) internal {
        require(_currencyAllowed[currency] != address(0));

        _totalCurrencies.remove(currency);
        delete _currencyAllowed[currency];
    }

    function addressCurrency(bytes32 currency) public view returns(address) {
        return _currencyAllowed[currency];
    }
   
    function _allowedCurrency(bytes32 currency) internal view returns(bool){
        return _currencyAllowed[currency] != address(0);
    }

    /**
     @dev use this function to get all erc20 allowed as payment method in the contract.
     */
    function allCurrenciesAllowed() public view returns(bytes32[] memory) {
        uint256 indexMax = _totalCurrencies.length();
        bytes32[] memory currencies = new bytes32[](indexMax);
        for (uint256 index = 0; index < indexMax; ++index) {
            bytes32 currency = _totalCurrencies.at(index);
            currencies[index] = currency;
        }
        return currencies;
    }

    modifier currencyAllowed(bytes32 currency)  {
        require(_currencyAllowed[currency] != address(0), "Allowances: This currency its not allowed" );
        _;
    }    
}