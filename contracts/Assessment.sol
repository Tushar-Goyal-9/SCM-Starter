// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;

    event Deposit(uint256 amount, address indexed depositor);
    event Withdraw(uint256 amount);
    event BalanceSet(uint256 newBalance);
    event BalanceReset();

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
// new functions

    function setBalance(uint256 _newBalance) public onlyOwner {
        balance = _newBalance;
        emit BalanceSet(_newBalance);
    }

    function resetBalance() public onlyOwner {
        balance = 0;
        emit BalanceReset();
    }
}
