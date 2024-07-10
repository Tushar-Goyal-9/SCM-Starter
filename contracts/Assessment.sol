// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;
    mapping(address => uint256) public allowances;
    mapping(address => uint256) public lockedBalances;
    mapping(address => uint256) public unlockTimes;

    event Deposit(uint256 amount, address indexed depositor);
    event Withdraw(uint256 amount);
    event BalanceSet(uint256 newBalance);
    event BalanceReset();
    event AllowanceSet(address indexed spender, uint256 amount);
    event AllowanceUsed(address indexed spender, uint256 amount);
    event LockedDeposit(address indexed depositor, uint256 amount, uint256 unlockTime);
    event Unlocked(address indexed depositor, uint256 amount);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    function getBalance() public view returns (uint256) {
        return balance;
    }

    function deposit() public payable onlyOwner {
        require(msg.value > 0, "Deposit amount must be greater than zero");

        balance += msg.value;

        emit Deposit(msg.value, msg.sender);
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public onlyOwner {
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        balance -= _withdrawAmount;
        (bool success, ) = owner.call{value: _withdrawAmount}("");
        require(success, "Withdraw failed");

        emit Withdraw(_withdrawAmount);
    }

    function setBalance(uint256 _newBalance) public onlyOwner {
        balance = _newBalance;
        emit BalanceSet(_newBalance);
    }

    function resetBalance() public onlyOwner {
        balance = 0;
        emit BalanceReset();
    }

    function setAllowance(address _spender, uint256 _amount) public onlyOwner {
        allowances[_spender] = _amount;
        emit AllowanceSet(_spender, _amount);
    }

    function useAllowance(uint256 _amount) public {
        require(allowances[msg.sender] >= _amount, "Allowance exceeded");
        require(balance >= _amount, "Insufficient balance");

        allowances[msg.sender] -= _amount;
        balance -= _amount;
        (bool success, ) = payable(msg.sender).call{value: _amount}("");
        require(success, "Transfer failed");

        emit AllowanceUsed(msg.sender, _amount);
    }

    // New function: Time-locked deposit
    function timeLockedDeposit(uint256 _unlockTime) public payable {
        require(msg.value > 0, "Deposit amount must be greater than zero");
        require(_unlockTime > block.timestamp, "Unlock time must be in the future");

        lockedBalances[msg.sender] += msg.value;
        unlockTimes[msg.sender] = _unlockTime;

        emit LockedDeposit(msg.sender, msg.value, _unlockTime);
    }

    function unlock() public {
        require(block.timestamp >= unlockTimes[msg.sender], "Funds are still locked");
        uint256 amount = lockedBalances[msg.sender];
        require(amount > 0, "No funds to unlock");

        lockedBalances[msg.sender] = 0;
        unlockTimes[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Unlock failed");

        emit Unlocked(msg.sender, amount);
    }
}
