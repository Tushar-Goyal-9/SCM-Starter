import { useState, useEffect } from "react";
import { ethers } from "ethers";
import voting_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [voting, setVoting] = useState(undefined);
  const [candidates, setCandidates] = useState([]);
  const [votingOpen, setVotingOpen] = useState(false);
  const [newCandidate, setNewCandidate] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [isClient, setIsClient] = useState(false);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 
  const votingABI = voting_abi.abi;

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
        const contract = new ethers.Contract(contractAddress, votingABI, signer);
        setVoting(contract);
        getCandidates(contract);
        checkVotingStatus(contract);
      } catch (err) {
        console.error(err);
        alert("An error occurred while connecting to the wallet.");
      }
    } else {
      alert('Please install MetaMask to use this voting system.');
    }
  }

  const getCandidates = async (contract) => {
    try {
      const candidates = await contract.getCandidates();
      setCandidates(candidates);
    } catch (err) {
      console.error("Error fetching candidates:", err);
    }
  };

  const checkVotingStatus = async (contract) => {
    try {
      const status = await contract.votingOpen();
      setVotingOpen(status);
    } catch (err) {
      console.error("Error checking voting status:", err);
    }
  };

  const registerVoter = async () => {
    if (voting) {
      try {
        const tx = await voting.registerVoter(account);
        await tx.wait();
        alert("Voter registered successfully!");
      } catch (error) {
        console.error("Error registering voter:", error);
        alert("Voter registration failed.");
      }
    }
  }

  const addCandidate = async () => {
    if (voting && newCandidate) {
      try {
        const candidateBytes32 = ethers.utils.formatBytes32String(newCandidate);
        const tx = await voting.addCandidate(candidateBytes32);
        await tx.wait();
        getCandidates(voting);
        setNewCandidate("");
        alert("Candidate added successfully!");
      } catch (error) {
        console.error("Error adding candidate:", error);
        alert("Adding candidate failed.");
      }
    }
  }

  const openVoting = async () => {
    if (voting) {
      try {
        const tx = await voting.openVoting();
        await tx.wait();
        setVotingOpen(true);
        alert("Voting opened successfully!");
      } catch (error) {
        console.error("Error opening voting:", error);
        alert("Opening voting failed.");
      }
    }
  }

  const closeVoting = async () => {
    if (voting) {
      try {
        const tx = await voting.closeVoting();
        await tx.wait();
        setVotingOpen(false);
        alert("Voting closed successfully!");
      } catch (error) {
        console.error("Error closing voting:", error);
        alert("Closing voting failed.");
      }
    }
  }

  const vote = async () => {
    if (voting && selectedCandidate) {
      try {
        const tx = await voting.vote(ethers.utils.formatBytes32String(selectedCandidate));
        await tx.wait();
        alert("Vote cast successfully!");
      } catch (error) {
        console.error("Error casting vote:", error);
        alert("Casting vote failed.");
      }
    }
  }

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
        <p>Voting Status: {votingOpen ? "Open" : "Closed"}</p>
        <button onClick={registerVoter}>Register as Voter</button>
        <div className="input-group">
          <input
            type="text"
            placeholder="New candidate name"
            value={newCandidate}
            onChange={(e) => setNewCandidate(e.target.value)}
          />
          <button onClick={addCandidate}>Add Candidate</button>
        </div>
        <button onClick={openVoting}>Open Voting</button>
        <button onClick={closeVoting}>Close Voting</button>
        <div className="input-group">
          <select
            value={selectedCandidate}
            onChange={(e) => setSelectedCandidate(e.target.value)}
          >
            <option value="">Select Candidate</option>
            {candidates.map((candidate, index) => (
              <option key={index} value={ethers.utils.parseBytes32String(candidate)}>
                {ethers.utils.parseBytes32String(candidate)}
              </option>
            ))}
          </select>
          <button onClick={vote}>Vote</button>
        </div>
      </div>
    )
  }

  return (
    <main className="container">
      <header><h1>Simple Voting System</h1></header>
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
