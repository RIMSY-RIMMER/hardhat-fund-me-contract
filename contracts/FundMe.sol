// SPDX-License-Identifier: MIT
// Style guide - Pragma
pragma solidity ^0.8.8;
// Imports
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";
// Error codes
error FundMe__NotOwner();

contract FundMe {
    // Style guide - Type Declarations
    using PriceConverter for uint256;

    // Style guide - State Variables
    mapping(address => uint256) private s_addressToAmountFunded;
    address[] private s_funders;
    address[] private s_topFunders;
    mapping(address => uint256) private s_topFundersToAmountFunded;
    // Could we make this constant?  /* hint: no! We should make it immutable! */
    address private immutable i_owner;
    uint256 public constant MINIMUM_USD = 50 * 10 ** 18;
    AggregatorV3Interface private s_priceFeed;

    // Style guide - Modifier
    modifier onlyOwner() {
        // require(msg.sender == owner);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    // Style guide - Functions
    // Functions Order:
    // 1. constructor 2.recieve 3.fallback 4. external 5. public 6. internal 7. private
    constructor(address priceFeed) {
        s_priceFeed = AggregatorV3Interface(priceFeed);
        i_owner = msg.sender;
    }

    /*     receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    } */

    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "You need to spend more ETH!"
        );
        // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);

        // Update the list of top funders
        if (s_topFunders.length < 5) {
            // If the list is not full, just add the funder to the list
            s_topFunders.push(msg.sender);
            s_topFundersToAmountFunded[msg.sender] = msg.value;
        } else {
            // If the list is full, check if the funder's contribution is greater than the smallest contribution in the list
            uint256 smallestContribution = s_topFundersToAmountFunded[
                s_topFunders[0]
            ];
            for (uint256 i = 1; i < s_topFunders.length; i++) {
                if (
                    s_topFundersToAmountFunded[s_topFunders[i]] <
                    smallestContribution
                ) {
                    smallestContribution = s_topFundersToAmountFunded[
                        s_topFunders[i]
                    ];
                }
            }
            if (msg.value > smallestContribution) {
                // If the funder's contribution is greater than the smallest contribution, find the address with the smallest contribution and replace it with the new funder
                for (uint256 i = 0; i < s_topFunders.length; i++) {
                    if (
                        s_topFundersToAmountFunded[s_topFunders[i]] ==
                        smallestContribution
                    ) {
                        s_topFunders[i] = msg.sender;
                        s_topFundersToAmountFunded[msg.sender] = msg.value;
                        break;
                    }
                }
            }
        }
    }

    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    function cheaperWithdraw() public onlyOwner {
        address[] memory funders = s_funders;
        // mappings can't be in memory
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }

    function getAddressToAmountFunded(
        address fundingAddress
    ) public view returns (uint256) {
        return s_addressToAmountFunded[fundingAddress];
    }

    function getTopFunder(uint256 index) public view returns (address) {
        return s_topFunders[index];
    }

    function getTopFunderContribution(
        address topFunderAddress
    ) public view returns (uint256) {
        return s_topFundersToAmountFunded[topFunderAddress];
    }

    function getVersion() public view returns (uint256) {
        return s_priceFeed.version();
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
