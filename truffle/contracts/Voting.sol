// SPDX-License-Identifier: MIT

pragma solidity 0.8.14;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Voting
 * @notice A smart contract allowing to organize a voting session based on 6 workflow steps
 * @dev Voting contract extend ownable contract from openzeppelin library
 * @dev some minor modifications have been done for project 2 (adding functions gettAllPorposals() and  getWiningproposalsID())
 * @author Alyra team
 * @author Adnane Tabaï
 */

contract Voting is Ownable {

    uint[] winningProposalsID;
    Proposal[] winningProposals;
    
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    struct Proposal {
        string description;
        uint voteCount;
    }

    enum  WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    WorkflowStatus public workflowStatus;
    Proposal[] proposalsArray;
    mapping (address => Voter) voters;


    event VoterRegistered(address voterAddress); 
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted (address voter, uint proposalId);

    modifier onlyVoters() {
        require(voters[msg.sender].isRegistered, "You're not a voter");
        _;
    }
    
    // on peut faire un modifier pour les états

    // ::::::::::::: GETTERS ::::::::::::: //

    /**
     * @notice Getter on the status of voter for a public address
     * @param _addr address of the voter to look for
     */ 
    function getVoter(address _addr) external onlyVoters view returns (Voter memory) {
        return voters[_addr];
    }
    /**
     * @notice Getter of a specific proposal
     * @dev two requires added to avoid Panic: Index out of bounds issues when calling the fucntion while no proposal has been pushed
     * @param _id id of the proposal to retreive
     * @return Proposal the requested proposal
     */  
    function getOneProposal(uint _id) external onlyVoters view returns (Proposal memory) {
        require(proposalsArray.length > 0, "proposalsArray is empty");
        require(proposalsArray.length >= _id, "Proposal ID is out of index");
        return proposalsArray[_id];
    }
    /**
     * @notice Getter of all the proposals
     * @return Proposal the proposal array
     */ 
    //this getters have been added in order to perform some specific assertion style testing or 
    function getAllProposals() external onlyVoters view returns (Proposal[] memory) {
        return proposalsArray;
    }
    /**
     * @notice Getter of the winning proposal's id 
     * @dev require added to make sure Winning proposal ID details will only be available once the vote is tallied
     * @return uint winningProposalsID array
     */ 
    function getWinningProposalsID() public view returns (uint[] memory) {
        require(workflowStatus == WorkflowStatus.VotesTallied, "Current voting session has not ended yet");
        return winningProposalsID;
    }

 
    // ::::::::::::: REGISTRATION ::::::::::::: // 
    /**
     * @notice function allowing to add voter is only callable by owner of the contract
     * @param _addr address of the voter
     */

    function addVoter(address _addr) external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, 'Voters registration is not open yet');
        require(voters[_addr].isRegistered != true, 'Already registered');
    
        voters[_addr].isRegistered = true;
        emit VoterRegistered(_addr);
    }
 
     /**
     * @notice function allowing to delete voter is only callable by owner of the contract
     * @param _addr address of the voter
     */   
    function deleteVoter(address _addr) external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, 'Voters registration is not open yet');
        require(voters[_addr].isRegistered == true, 'Not registered.');
        voters[_addr].isRegistered = false;
        emit VoterRegistered(_addr);
    }

    // ::::::::::::: PROPOSAL ::::::::::::: // 
     /**
     * @notice function allowing to push a proposal is only callable by registered voters
     * @param _desc String describing the proposal
     */   
    function addProposal(string memory _desc) external onlyVoters {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, 'Proposals are not allowed yet');
        require(keccak256(abi.encode(_desc)) != keccak256(abi.encode("")), 'Vous ne pouvez pas ne rien proposer'); // facultatif
        // voir que desc est different des autres

        Proposal memory proposal;
        proposal.description = _desc;
        proposalsArray.push(proposal);
        emit ProposalRegistered(proposalsArray.length-1);
    }

    // ::::::::::::: VOTE ::::::::::::: //
     /**
     * @notice function allowing to push a proposal is only callable by registered voters
     * @param _id id of the proposal within the proposal array
     */ 
    function setVote( uint _id) external onlyVoters {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, 'Voting session havent started yet');
        require(voters[msg.sender].hasVoted != true, 'You have already voted');
        require(_id < proposalsArray.length, 'Proposal not found'); // pas obligé, et pas besoin du >0 car uint

        voters[msg.sender].votedProposalId = _id;
        voters[msg.sender].hasVoted = true;
        proposalsArray[_id].voteCount++;

        /// @dev if statement added to avoid security break with a for loop within the tallyVote function
        if(winningProposalsID.length == 0){
            winningProposalsID.push(_id);
        }
        else {
            if (proposalsArray[_id].voteCount > proposalsArray[winningProposalsID[0]].voteCount) {
                winningProposalsID.push(_id);
            }
        }

        emit Voted(msg.sender, _id);
    }

    // ::::::::::::: STATE ::::::::::::: //

    modifier checkWorkflowStatus(uint  _num) {
        require (_num != 0, "Not possible to get back to the original state");
        require (workflowStatus==WorkflowStatus(uint(_num)-1), "bad workflowstatus");
        require (_num != 5, "il faut lancer tally votes");
        _;
      }

    /**
     * @notice function allowing to update the workflow status
     * @param _num workflow tatus ID to set
     */    
    function setWorkflowStatus(uint _num) external checkWorkflowStatus(_num) onlyOwner {
        WorkflowStatus old = workflowStatus;
        workflowStatus = WorkflowStatus(_num);
        emit WorkflowStatusChange(old, workflowStatus);
       } 
    
    //ou 
    /**
     * @notice function allowing to update the workflow status automatically setting the next workflow status
     */  
    function nextWorkflowStatus() external onlyOwner{
        require (uint(workflowStatus)!=4, "il faut lancer tallyvotes");
        WorkflowStatus old = workflowStatus;
        workflowStatus= WorkflowStatus(uint (workflowStatus) + 1);
        emit WorkflowStatusChange(old, workflowStatus);
    }
        
    /**
     * @notice function allowing to tallyVotes and managing draw up to 5 max
     * @dev modification done by adding an additional require to avoid a DoS Gas limit attack
     */  
    function tallyVotesDraw() external onlyOwner {
       require(workflowStatus == WorkflowStatus.VotingSessionEnded, "Current status is not voting session ended");
       require(proposalsArray.length <= 100, "Too many proposals can't tallyVote for a fair price");
        uint highestCount;
        uint[5]memory winners; // egalite entre 5 personnes max
        uint nbWinners;
        for (uint i = 0; i < proposalsArray.length; i++) {
            if (proposalsArray[i].voteCount == highestCount) {
                winners[nbWinners]=i;
                nbWinners++;
            }
            if (proposalsArray[i].voteCount > highestCount) {
                delete winners;
                winners[0]= i;
                highestCount = proposalsArray[i].voteCount;
                nbWinners=1;
            }
        }
        for(uint j=0;j<nbWinners;j++){
            winningProposalsID.push(winners[j]);
            winningProposals.push(proposalsArray[winners[j]]);
        }
        workflowStatus = WorkflowStatus.VotesTallied;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
    }


// ou
    /**
     * @notice function allowing to tallyVotes used in our test and called from the dapp
     * @dev modification done by canceling the for loops to avoid a DoS Gas limit attack
     */  
    function tallyDraw() external onlyOwner{
       require(workflowStatus == WorkflowStatus.VotingSessionEnded, "Current status is not voting session ended");
       /* uint highestCount;
       
        for (uint i = 0; i < proposalsArray.length; i++) {
            if (proposalsArray[i].voteCount > highestCount) {
                highestCount = proposalsArray[i].voteCount;
            }
        }
        
        for (uint j = 0; j < proposalsArray.length; j++) {
            if (proposalsArray[j].voteCount == highestCount) {
                winningProposalsID.push(j);
            }
        }
        */

        workflowStatus = WorkflowStatus.VotesTallied;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);

    }

}