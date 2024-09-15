// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.7;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {PriceConverter} from "./PriceConverter.sol";
error FundMe_NotOWner();
error FundMe_InsufficientFunds();

contract FundMe {
    using PriceConverter for uint256;
    //variables
    uint256 public constant MINIMUM_USD_AMOUNT = 10 * 10 ** 18;
    address private owner;
    address[] public donators;
    mapping(address => uint256) public donations;
    AggregatorV3Interface public priceFeed;

    // modifiers
    modifier onlyOwner() {
        if (msg.sender != owner) revert FundMe_NotOWner();
        _;
    }

    constructor(address _priceFeed) {
        owner = msg.sender;
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    function fund() public payable {
        if (msg.value.getConversionRate(priceFeed) < MINIMUM_USD_AMOUNT) {
            revert FundMe_InsufficientFunds();
        }
        donations[msg.sender] += msg.value;
        donators.push(msg.sender);
    }

    // 5ether
    // 0 ether
    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < donators.length;
            funderIndex++
        ) {
            address funder = donators[funderIndex];
            donations[funder] = 0;
        }
        donators = new address[](0);
        (bool sent, ) = owner.call{value: address(this).balance}("");
        require(sent);
    }

    function getAddressToAmountFunded(
        address _address
    ) public view returns (uint256) {
        return donations[_address];
    }

    function getVersion() public view returns (uint256) {
        return priceFeed.version();
    }

    function getFunder(uint256 index) public view returns (address) {
        return donators[index];
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return priceFeed;
    }
}
