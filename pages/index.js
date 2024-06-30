import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [newBalance, setNewBalance] = useState("");
  const [isClient, setIsClient] = useState(false);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  useEffect(() => {
    setIsClient(true);
    getWallet();
  }, []);

  const getWallet = async () => {
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      setEthWallet(window.ethereum);
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  }

  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  }

  const connectAccount = async () => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }
  
    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);
    
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
 
    setATM(atmContract);
  }

  const getBalance = async () => {
    if (atm) {
      const balance = await atm.getBalance();
      setBalance(ethers.utils.formatEther(balance));
    }
  };

  const deposit = async () => {
    if (atm && depositAmount) {
      try {
        let tx = await atm.deposit({ value: ethers.utils.parseEther(depositAmount) });
        await tx.wait();
        getBalance();
        setDepositAmount("");
      } catch (error) {
        console.error("Error during deposit:", error);
        alert("Deposit failed. Make sure you're the owner and the amount is valid.");
      }
    }
  }

  const withdraw = async () => {
    if (atm && withdrawAmount) {
      try {
        let tx = await atm.withdraw(ethers.utils.parseEther(withdrawAmount));
        await tx.wait();
        getBalance();
        setWithdrawAmount("");
      } catch (error) {
        console.error("Error during withdrawal:", error);
        alert("Withdrawal failed. Make sure you're the owner and have sufficient balance.");
      }
    }
  }

  const setBalanceManually = async () => {
    if (atm && newBalance) {
      try {
        let tx = await atm.setBalance(ethers.utils.parseEther(newBalance));
        await tx.wait();
        getBalance();
        setNewBalance("");
      } catch (error) {
        console.error("Error setting balance:", error);
        alert("Setting balance failed. Make sure you're the owner.");
      }
    }
  };

  const resetBalance = async () => {
    if (atm) {
      try {
        let tx = await atm.resetBalance();
        await tx.wait();
        getBalance();
      } catch (error) {
        console.error("Error resetting balance:", error);
        alert("Resetting balance failed. Make sure you're the owner.");
      }
    }
  };

  const initUser = () => {
    if (!isClient) {
      return null;
    }

    if (!ethWallet) {
      return <p>Please install MetaMask to use this ATM.</p>
    }

    if (!account) {
      return <button onClick={connectAccount}>Connect MetaMask Wallet</button>
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div className="user-info">
        <p>Account: {account}</p>
        <p>Balance: {balance} ETH</p>
        <div className="input-group">
          <input
            type="number"
            placeholder="Deposit amount in ETH"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
          />
          <button onClick={deposit}>Deposit</button>
        </div>
        <div className="input-group">
          <input
            type="number"
            placeholder="Withdraw amount in ETH"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />
          <button onClick={withdraw}>Withdraw</button>
        </div>
        <div className="input-group">
          <input
            type="number"
            placeholder="Set new balance in ETH"
            value={newBalance}
            onChange={(e) => setNewBalance(e.target.value)}
          />
          <button onClick={setBalanceManually}>Set Balance</button>
        </div>
        <button onClick={resetBalance}>Reset Balance</button>
      </div>
    )
  }

  return (
    <main className="container">
      <header><h1>Metacrafters ATM</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f0f0f0;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .user-info {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          margin-top: 20px;
        }
        .input-group {
          margin-bottom: 15px;
        }
        button {
          background-color: #4CAF50;
          border: none;
          color: white;
          padding: 10px 20px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 16px;
          margin: 4px 2px;
          cursor: pointer;
          border-radius: 4px;
          transition: background-color 0.3s;
        }
        button:hover {
          background-color: #45a049;
        }
        input {
          padding: 10px;
          font-size: 16px;
          border-radius: 4px;
          border: 1px solid #ddd;
          margin-right: 10px;
          width: 200px;
        }
        h1 {
          color: #333;
        }
        p {
          color: #666;
        }
      `}
      </style>
    </main>
  )
}
