// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

//1.创建一个发款函数
//2.记录投资人并且查看
//3.在锁定期内达到目标值，生产商可以取款并开始项目
//4.在锁定期内没有达到目标值，投资者可以退款  //当在锁定期内达到众筹的目标值后，生产商取款并生产出商品，之后投资者便可通过凭证去取商品

contract FundMe {

    //1.创建一个发款函数 payable关键字
    //2.记录投资人并且查看  地址address&&金额value
    mapping(address => uint256) public funderToAmount;

    //设置投资的最小额度
    uint256 constant MINIMUM_VALUE = 1 * 10**18; //ether -> wei   USD 预言机:一个ETH值多少钱,获取链下的数据

    AggregatorV3Interface internal dataFeed;//合约类型

    //只有owner才能取款
    address owner;

    //设置锁定期
    uint256 deploymentTimestamp;   //合约部署时间 时间戳
    uint256 lockTime;   //锁定期 单位：秒

    address erc20Addr; //ERC20合约地址

    bool public getFundSuccess = false;   //记录取款状态

    //构造函数：在合约初始化时被调用且之后不会被调用
    constructor(uint256 _lockTime) {
        //sepolia testnet
        dataFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        owner = msg.sender;   //msg代表当前交易
        deploymentTimestamp = block.timestamp;   //当前区块的时间戳 constructor调用的时间戳   //block代表当前区块
        lockTime = _lockTime;
    }

    function fund() external payable {
        require(block.timestamp < deploymentTimestamp + lockTime, "Timeout!");  //设置锁定期
        require(convertEthToUsd(msg.value) >= MINIMUM_VALUE, "Send more ETH");  //当msg.value >= MINIMUM_VALUE不满足条件则退回
        funderToAmount[msg.sender] = msg.value;
    }

    function setFunderToAmount(address funder, uint256 amountToUpdate) external {
        require(msg.sender == erc20Addr, "You do not have permission to call this function!");
        funderToAmount[funder] = amountToUpdate;
    }

    function setErc20Addr(address _erc20Addr) public onlyOwner {
        erc20Addr = _erc20Addr;
    }

    //预言机
    function getChainlinkDataFeedLatestAnswer() public view returns (int) {
    // prettier-ignore
    (
        /* uint80 roundID */,
        int answer,
        /*uint startedAt*/,
        /*uint timeStamp*/,
        /*uint80 answeredInRound*/
    ) = dataFeed.latestRoundData();
    return answer; //得到一个ETH对应的USD的价格
    }

    //价格转换ETH->USD
    function convertEthToUsd(uint256 ethAmount) internal view returns(uint256) {
        //ETH数量×ETH的价格
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
        //ETH / USD = 10**8     ETH / Wei = 10**18
        return (ethAmount * ethPrice) / (10 ** 8);
        //1ETH -> 20 (10^8)USD -(/10 ** 8)-> 20 USD  -> 20*10^18 Wei

    }

    //在锁定期内达到目标值，生产商可以取款
    uint256 constant TARGET = 100 * 10**18;   //目标值 常量 USD

    //改变owner
    function transferOwnership(address newOwner) public onlyOwner{
        //require(msg.sender == owner, "This function can only be called by owner!");
        owner = newOwner;
    }

    //只有owner才能取款
    function getFund() external notTime onlyOwner{
        //用修改器实现重复操作
        //require(block.timestamp >= deploymentTimestamp + lockTime, "It is not the right time yet!");  //设置锁定期
        require(convertEthToUsd(address(this).balance/*单位:Wei*/) >= TARGET ,"Target is not enough!");  //this指当前合约 .balance指当前合约的存款
        //require(msg.sender == owner, "This function can only be called by owner!");
        // transfer: transfer ETH and revert if tx failed
        payable(msg.sender).transfer(address(this).balance);
        funderToAmount[msg.sender] = 0;   //取款后不能再退款
        getFundSuccess = true;   //表示已取款，可以继续通证交易

        // send: transfer ETH and return false if failed or return true
        // bool success = payable(msg.sender).send(address(this).balance);
        // require(success, "Tx failed!");

        // call: transfer ETH (with data) return value of function and bool
        // bool success;
        // (success, /*func_result*/) = payable(msg.sender).call{value: address(this).balance}("");   // ("")函数的入参  func_result函数返回结果
        // require(success, "Transfer tx failed!");

    }

    //修改器
    modifier onlyOwner(){
        require(msg.sender == owner, "This function can only be called by owner!");
        _;
    }

    //资金不足就退款 
    function reFund() external notTime {
        //用修改器实现重复操作   先执行修改器里的require，在执行其他操作
        //require(block.timestamp >= deploymentTimestamp + lockTime, "It is not the right time yet!");  //设置锁定期
        require(convertEthToUsd(address(this).balance/*单位:Wei*/) < TARGET ,"Target is enough!");
        require(funderToAmount[msg.sender] != 0, "There is no fund for you!");  //投资者是否有投资
        bool success;
        (success, /*func_result*/) = payable(msg.sender).call{value: funderToAmount[msg.sender]}("");   // ("")函数的入参
        require(success, "Transfer tx failed!");
        funderToAmount[msg.sender] = 0;   //退款后不能再继续退款

    }

    //修改器
    modifier notTime(){
        require(block.timestamp >= deploymentTimestamp + lockTime, "It is not the right time yet!");  //设置锁定期
        _;   //函数其他操作
    }

}
