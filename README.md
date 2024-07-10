# Smart Contract Frontend Integration

The project here demonstrates how to integrate frontend to a smart contract and deploy it on the local machine. It includes basic functionalities for depositing and withdrawing funds and also for setting and resetting balances in the contract.

## Features

### Owner Management

The contract is initialized with an owner who has exclusive rights to deposit, withdraw, set a new balance, and reset the balance.

### Events

Events (`Deposit`, `Withdraw`, `BalanceSet`, `BalanceReset`) are emitted for important contract actions to track changes and interactions.

### Modifiers

Added `onlyOwner` modifier to restrict certain functions to the contract owner for security and control.

## Contract Overview

The starter template for this project was taken from [MetacrafterChris' SCM-Starter repository](https://github.com/MetacrafterChris/SCM-Starter.git). Then I modified the contract to include additional features for setting and resetting balances, enhancing flexibility for contract management.

This contract provides the following functionalities:

- **Deposit Function**: Allows the contract owner to deposit funds into the contract.
- **Withdraw Function**: Enables the contract owner to withdraw funds, ensuring sufficient balance using custom error handling.
- **Set Balance Function**: Adds a function to set a specific balance in the contract.
- **Reset Balance Function**: Introduces a function to reset the contract's balance to zero.

## Execution
# Starter Next/Hardhat Project

After cloning the github, you will want to do the following to get the code running on your computer.

1. Inside the project directory, in the terminal type: npm i
2. Open two additional terminals in your VS code
3. In the second terminal type: npx hardhat node
4. In the third terminal, type: npx hardhat run --network localhost scripts/deploy.js
5. Back in the first terminal, type npm run dev to launch the front-end.

After this, the project will be running on your localhost. 
Typically at http://localhost:3000/

## Authors

- [@MetacrafterChris](https://github.com/metacrafterchris) who provided the starter template.

## License

This smart contract is released under the MIT License.
