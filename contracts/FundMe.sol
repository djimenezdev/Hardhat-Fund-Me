// SPDX-License-Identifier: MIT
//pragma statements
pragma solidity 0.8.8;

//imports
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

//errors
error FundMe__NotOwner();

/** @title A contract for crowd Funding
 * @author Daniel Jimenez
 * @notice This contract is a demo
 * @dev This implements price feeds as our library
 */
contract FundMe {
    // Type declarations
    using PriceConverter for uint256;

    //state variables
    //private and internal variables are cheaper than public variables
    mapping(address => uint256) private s_addressToAmountFunded;
    address[] private s_funders;

    address private immutable i_owner;
    uint256 public constant MINIMUM_USD = 1 * 10**18;
    AggregatorV3Interface private s_priceFeed;

    modifier onlyOwner() {
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    constructor(address priceFeedAddr) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddr);
    }

    // Explainer from: https://solidity-by-example.org/fallback/
    // Ether is sent to contract
    //      is msg.data empty?
    //          /   \
    //         yes  no
    //         /     \
    //    receive()?  fallback()
    //     /   \
    //   yes   no
    //  /        \
    //receive()  fallback()
    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    /**  @notice This function funds the contract
     * @dev Utilize the PriceConversion library to get latest price fund for proper funding
     */

    function fund() public payable {
        if (msg.value.getConversionRate(s_priceFeed) < MINIMUM_USD) {
            revert FundMe__NotOwner();
        }
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }

    /**  @notice This function allows contract owner to withdraw funds
    
     */
    /* function withdraw() public payable onlyOwner {
        if (funders.length == 0) {
            revert("No funds at the moment");
        }
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }
        funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    } */

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory funders = s_funders;
        if (funders.length == 0) {
            revert("No funders!");
        }
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool callSuccess, ) = i_owner.call{value: address(this).balance}("");
        if (!callSuccess) revert FundMe__NotOwner();
    }

    /**  @notice This function returns version of price feed
     */
    function getVersion() public view returns (uint256) {
        return s_priceFeed.version();
    }

    function getPrice() public view returns (int256) {
        int256 currentPrice;
        (, currentPrice, , , ) = s_priceFeed.latestRoundData();
        return currentPrice;
    }

    function getDecimal() public view returns (uint8) {
        return s_priceFeed.decimals();
    }

    function getOwner() external view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) external view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(address funder)
        external
        view
        returns (uint256)
    {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() external view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
