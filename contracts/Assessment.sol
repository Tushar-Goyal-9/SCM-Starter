// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract SimpleVoting {
    address public owner;
    mapping(address => bool) public voters;
    mapping(bytes32 => uint256) public votes;
    bytes32[] public candidates;
    bool public votingOpen;

    event VoterRegistered(address voter);
    event VoteCast(address voter, bytes32 candidate);
    event VotingOpened();
    event VotingClosed();
    event CandidateAdded(bytes32 candidate);

    constructor() {
        owner = msg.sender;
        votingOpen = false;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    modifier onlyDuringVoting() {
        require(votingOpen, "Voting is not open");
        _;
    }

    modifier onlyRegisteredVoters() {
        require(voters[msg.sender], "You are not a registered voter");
        _;
    }

    function registerVoter(address _voter) public onlyOwner {
        voters[_voter] = true;
        emit VoterRegistered(_voter);
    }

    function addCandidate(bytes32 _candidate) public onlyOwner {
        candidates.push(_candidate);
        emit CandidateAdded(_candidate);
    }

    function openVoting() public onlyOwner {
        votingOpen = true;
        emit VotingOpened();
    }

    function closeVoting() public onlyOwner {
        votingOpen = false;
        emit VotingClosed();
    }

    function vote(bytes32 _candidate) public onlyDuringVoting onlyRegisteredVoters {
        votes[_candidate] += 1;
        emit VoteCast(msg.sender, _candidate);
    }

    function getVotes(bytes32 _candidate) public view returns (uint256) {
        return votes[_candidate];
    }

    function getCandidates() public view returns (bytes32[] memory) {
        return candidates;
    }
}
