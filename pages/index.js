import { useState, useEffect } from "react";
import { ethers } from "ethers";
import assessment_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [newBalance, setNewBalance] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [isFrozen, setIsFrozen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = assessment_abi.abi;

  useEffect(() => {
    setIsClient(true);
    getWallet();
  }, []);

  const getWallet = async () => {
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        setEthWallet(window.ethereum);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        const contract = new ethers.Contract(contractAddress, atmABI, signer);
        setATM(contract);
        getBalance(contract);
        checkFrozenStatus(contract);
      } catch (err) {
        console.error(err);
        alert("An error occurred while connecting to the wallet.");
      }
    } else {
      alert('Please install MetaMask to use this ATM.');
    }
  }

  const getBalance = async (contract) => {
    try {
      const balance = await contract.getBalance();
      setBalance(ethers.utils.formatEther(balance));
    } catch (err) {
      console.error("Error fetching balance:", err);
    }
  };

  const checkFrozenStatus = async (contract) => {
    try {
      const frozen = await contract.frozen();
      setIsFrozen(frozen);
    } catch (err) {
      console.error("Error checking frozen status:", err);
    }
  };

  const deposit = async () => {
    if (atm && depositAmount) {
      try {
        const tx = await atm.deposit(ethers.utils.parseEther(depositAmount));
        await tx.wait();
        getBalance(atm);
        setDepositAmount("");
        alert("Deposit successful!");
      } catch (error) {
        console.error("Error during deposit:", error);
        alert("Deposit failed. Make sure you're the owner and the amount is valid.");
      }
    }
  }

  const withdraw = async () => {
    if (atm && withdrawAmount) {
      try {
        const tx = await atm.withdraw(ethers.utils.parseEther(withdrawAmount));
        await tx.wait();
        getBalance(atm);
        setWithdrawAmount("");
        alert("Withdrawal successful!");
      } catch (error) {
        console.error("Error during withdrawal:", error);
        alert("Withdrawal failed. Make sure you're the owner and have sufficient balance.");
      }
    }
  }

  const setBalanceManually = async () => {
    if (atm && newBalance) {
      try {
        const tx = await atm.setBalance(ethers.utils.parseEther(newBalance));
        await tx.wait();
        getBalance(atm);
        setNewBalance("");
        alert("Balance set successfully!");
      } catch (error) {
        console.error("Error setting balance:", error);
        alert("Setting balance failed. Make sure you're the owner.");
      }
    }
  };

  const resetBalance = async () => {
    if (atm) {
      try {
        const tx = await atm.resetBalance();
        await tx.wait();
        getBalance(atm);
        alert("Balance reset successfully!");
      } catch (error) {
        console.error("Error resetting balance:", error);
        alert("Resetting balance failed. Make sure you're the owner.");
      }
    }
  };

  const transferOwnership = async () => {
    if (atm && newOwner) {
      try {
        const tx = await atm.transferOwnership(newOwner);
        await tx.wait();
        alert("Ownership transferred successfully!");
      } catch (error) {
        console.error("Error transferring ownership:", error);
        alert("Ownership transfer failed. Make sure you're the owner.");
      }
    }
  };

  const freezeAccount = async () => {
    if (atm) {
      try {
        const tx = await atm.freezeAccount();
        await tx.wait();
        checkFrozenStatus(atm);
        alert("Account frozen successfully!");
      } catch (error) {
        console.error("Error freezing account:", error);
        alert("Freezing account failed. Make sure you're the owner.");
      }
    }
  };

  const unfreezeAccount = async () => {
    if (atm) {
      try {
        const tx = await atm.unfreezeAccount();
        await tx.wait();
        checkFrozenStatus(atm);
        alert("Account unfrozen successfully!");
      } catch (error) {
        console.error("Error unfreezing account:", error);
        alert("Unfreezing account failed. Make sure you're the owner.");
      }
    }
  };

  const initUser = () => {
    if (!isClient) {
      return null;
    }

    if (!account) {
      return <button onClick={getWallet} className="connect-btn">Connect MetaMask Wallet</button>
    }

    return (
      <div className="user-info">
        <p>Account: {account}</p>
        <p>Balance: {balance} ETH</p>
        <p>Status: {isFrozen ? "Frozen" : "Active"}</p>
        <div className="input-group">
          <input
            type="number"
            step="0.01"
            placeholder="Deposit amount in ETH"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
          />
          <button onClick={deposit} className="action-btn">Deposit</button>
        </div>
        <div className="input-group">
          <input
            type="number"
            step="0.01"
            placeholder="Withdraw amount in ETH"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />
          <button onClick={withdraw} className="action-btn">Withdraw</button>
        </div>
        <div className="input-group">
          <input
            type="number"
            step="0.01"
            placeholder="Set new balance in ETH"
            value={newBalance}
            onChange={(e) => setNewBalance(e.target.value)}
          />
          <button onClick={setBalanceManually} className="action-btn">Set Balance</button>
        </div>
        <button onClick={resetBalance} className="action-btn">Reset Balance</button>
        <div className="input-group">
          <input
            type="text"
            placeholder="New owner address"
            value={newOwner}
            onChange={(e) => setNewOwner(e.target.value)}
          />
          <button onClick={transferOwnership} className="action-btn">Transfer Ownership</button>
        </div>
        <button onClick={freezeAccount} className="action-btn">Freeze Account</button>
        <button onClick={unfreezeAccount} className="action-btn">Unfreeze Account</button>
      </div>
    )
  }

  return (
    <main className="container">
      <header><h1>Assessment ATM</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          text-align: center;
          background-color: #f9f9f9;
          border-radius: 10px;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        header {
          margin-bottom: 20px;
        }
        .user-info {
          margin-top: 20px;
        }
        .input-group {
          margin-top: 10px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .input-group input {
          margin-right: 10px;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          flex: 1;
        }
        .action-btn, .connect-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          background-color: #007bff;
          color: #fff;
          transition: background-color 0.3s ease;
        }
        .action-btn:hover, .connect-btn:hover {
          background-color: #0056b3;
        }
        p {
          margin: 5px 0;
        }
      `}</style>
    </main>
  )
}
