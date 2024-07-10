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
  const [lockAmount, setLockAmount] = useState("");
  const [lockDuration, setLockDuration] = useState("");
  const [isClient, setIsClient] = useState(false);

  const contractAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
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

  const deposit = async () => {
    if (atm && depositAmount) {
      try {
        const tx = await atm.deposit({ value: ethers.utils.parseEther(depositAmount) });
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

  const timeLockDeposit = async () => {
    if (atm && lockAmount && lockDuration) {
      try {
        const tx = await atm.timeLockDeposit(lockDuration, { value: ethers.utils.parseEther(lockAmount) });
        await tx.wait();
        getBalance(atm);
        setLockAmount("");
        setLockDuration("");
        alert("Time-locked deposit successful!");
      } catch (error) {
        console.error("Error during time-locked deposit:", error);
        alert("Time-locked deposit failed. Make sure you're the owner and the parameters are valid.");
      }
    }
  };

  const initUser = () => {
    if (!isClient) {
      return null;
    }

    if (!account) {
      return <button onClick={getWallet}>Connect MetaMask Wallet</button>
    }

    return (
      <div className="user-info">
        <p>Account: {account}</p>
        <p>Balance: {balance} ETH</p>
        <div className="input-group">
          <input
            type="number"
            step="0.01"
            placeholder="Deposit amount in ETH"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
          />
          <button onClick={deposit}>Deposit</button>
        </div>
        <div className="input-group">
          <input
            type="number"
            step="0.01"
            placeholder="Withdraw amount in ETH"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />
          <button onClick={withdraw}>Withdraw</button>
        </div>
        <div className="input-group">
          <input
            type="number"
            step="0.01"
            placeholder="Set new balance in ETH"
            value={newBalance}
            onChange={(e) => setNewBalance(e.target.value)}
          />
          <button onClick={setBalanceManually}>Set Balance</button>
        </div>
        <button onClick={resetBalance}>Reset Balance</button>
        <div className="input-group">
          <input
            type="number"
            step="0.01"
            placeholder="Lock amount in ETH"
            value={lockAmount}
            onChange={(e) => setLockAmount(e.target.value)}
          />
          <input
            type="number"
            placeholder="Lock duration in seconds"
            value={lockDuration}
            onChange={(e) => setLockDuration(e.target.value)}
          />
          <button onClick={timeLockDeposit}>Time-Lock Deposit</button>
        </div>
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
        }
        .user-info {
          margin-top: 20px;
        }
        .input-group {
          margin-top: 10px;
        }
        .input-group input, .input-group select {
          margin-right: 10px;
        }
      `}</style>
    </main>
  )
}
