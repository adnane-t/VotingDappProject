const Voting = artifacts.require("./Voting.sol");

const { BN, expectRevert, expectEvent } = require("@openzeppelin/test-helpers");

const { expect } = require("chai");

contract("Voting", (accounts) => {
  const ownerAdmin = accounts[0];
  const voter1 = accounts[1];
  const voter2 = accounts[2];
  const voter3 = accounts[3];
  const voter4 = accounts[4];
  const voter5 = accounts[5];

  let VotingInstance;

  //expect({b: 2}).to.have.a.property('b');

  describe("Voting system test", function () {
    // ::::::::::::: REGISTRATION TESTING ::::::::::::: //
    describe("REGISTRATION", function () {
      before(async function () {
        VotingInstance = await Voting.new({ from: ownerAdmin });
        await VotingInstance.addVoter(ownerAdmin, { from: ownerAdmin });
        await VotingInstance.addVoter(voter1, { from: ownerAdmin });
        await VotingInstance.addVoter(voter2, { from: ownerAdmin });
        await VotingInstance.addVoter(voter3, { from: ownerAdmin });
        await VotingInstance.addVoter(voter4, { from: ownerAdmin });
      });

      // ------------- REQUIRE TESTING-------------------------- //
      it("Only Admin can add voters", async () => {
        await expectRevert(
          VotingInstance.addVoter(voter5, { from: voter2 }),
          "Ownable: caller is not the owner"
        );
      });

      it("Only add non registered voters", async () => {
        await expectRevert(
          VotingInstance.addVoter(voter2, { from: ownerAdmin }),
          "Already registered"
        );
      });
      it("Only Admin can delete voters", async () => {
        await expectRevert(
          VotingInstance.deleteVoter(voter3, { from: voter2 }),
          "Ownable: caller is not the owner"
        );
      });

      it("Only delete registered voters", async () => {
        await expectRevert(
          VotingInstance.deleteVoter(voter5, { from: ownerAdmin }),
          "Not registered."
        );
      });

      // ------------- EVENT TESTING---------------------------- //
      it("should emit event on addVoter", async () => {
        expectEvent(
          await VotingInstance.addVoter(voter5, { from: ownerAdmin }),
          "VoterRegistered",
          { voterAddress: voter5 }
        );
      });
      it("should emit event on deleteVoter", async () => {
        expectEvent(
          await VotingInstance.deleteVoter(voter5, { from: ownerAdmin }),
          "VoterRegistered",
          { voterAddress: voter5 }
        );
      });

      // ------------- FUNCTIONS TESTING-------------------------- //
      it("Can add a voter.", async () => {
        await VotingInstance.addVoter(voter5, { from: ownerAdmin });

        let registeredVoter = await VotingInstance.getVoter(voter5, {
          from: ownerAdmin,
        });

        expect(registeredVoter.isRegistered).to.be.true;
      });

      it("Can delete a voter.", async () => {
        await VotingInstance.deleteVoter(voter5, { from: ownerAdmin });

        let registeredVoter = await VotingInstance.getVoter(voter5, {
          from: ownerAdmin,
        });

        expect(registeredVoter.isRegistered).to.be.false;
      });
    });

    // ::::::::::::: PROPOSAL TESTING ::::::::::::: //
    describe("PROPOSAL", function () {
      before(async function () {
        await VotingInstance.setWorkflowStatus(new BN(1));
      });

      after(async function () {
        await VotingInstance.setWorkflowStatus(new BN(2));
      });
      // ------------- REQUIRE TESTING-------------------------- //
      it("Only voters can add proposal", async () => {
        await expectRevert(
          VotingInstance.addProposal("proposal : allow testing", {
            from: voter5,
          }),
          "You're not a voter"
        );
      });

      it("Proposal can't be empty", async () => {
        await expectRevert(
          VotingInstance.addProposal("", { from: voter1 }),
          "Vous ne pouvez pas ne rien proposer"
        );
      });

      // ------------- EVENT TESTING---------------------------- //
      it("should emit event on addProposal", async () => {
        expectEvent(
          await VotingInstance.addProposal("proposal : allow testing", {
            from: ownerAdmin,
          }),
          "ProposalRegistered",
          { proposalId: new BN(0) }
        );
      });

      // ------------- FUNCTIONS TESTING-------------------------- //
      it("Can add a proposal.", async () => {
        await VotingInstance.addProposal("proposal : automate testing", {
          from: ownerAdmin,
        });

        let registeredProposal = await VotingInstance.getOneProposal(0, {
          from: ownerAdmin,
        });

        //used to perfome some additional expect assertions later
        let AllPorposal = await VotingInstance.getAllProposals({
          from: ownerAdmin,
        });

        expect(registeredProposal.description).to.be.equal(
          "proposal : allow testing"
        );

        //Those assertions are not mandatory but tested in order to try some features of chai assertion library
        expect(AllPorposal).to.be.an("array");
        expect(AllPorposal).to.be.an("array").to.have.lengthOf(2);
        expect(AllPorposal).to.have.nested.property("0.description");
        expect(AllPorposal[1])
          .to.have.any.keys("description", "voteCount")
          .to.includes("proposal : automate testing");
      });
    });

    // ::::::::::::: VOTING TESTING ::::::::::::: //
    describe("VOTING", function () {
      before(async function () {
        await VotingInstance.setWorkflowStatus(new BN(3));
      });
      // ------------- REQUIRE TESTING-------------------------- //
      it("Only voters can vote", async () => {
        await expectRevert(
          VotingInstance.setVote(new BN(1), { from: voter5 }),
          "You're not a voter"
        );
      });
      it("Proposal has to exist", async () => {
        await expectRevert(
          VotingInstance.setVote(new BN(2), { from: voter1 }),
          "Proposal not found"
        );
      });

      // ------------- EVENT TESTING---------------------------- //
      it("should emit event on setVote", async () => {
        expectEvent(
          await VotingInstance.setVote(new BN(1), { from: voter1 }),
          "Voted",
          { voter: voter1, proposalId: new BN(1) }
        );
      });

      // ------------- FUNCTIONS TESTING-------------------------- //
      it("Can vote.", async () => {
        let proposalBeforeVote = await VotingInstance.getOneProposal(
          new BN(1),
          {
            from: ownerAdmin,
          }
        );

        await VotingInstance.setVote(new BN(1), { from: voter2 });

        let voterDetails = await VotingInstance.getVoter(voter2, {
          from: ownerAdmin,
        });
        let proposalAftereVote = await VotingInstance.getOneProposal(
          new BN(1),
          {
            from: ownerAdmin,
          }
        );

        expect(new BN(voterDetails.votedProposalId)).to.be.bignumber.equal(
          new BN(1)
        );
        expect(new BN(proposalBeforeVote.voteCount)).to.be.bignumber.equal(
          new BN(proposalAftereVote.voteCount).sub(new BN(1))
        );
      });
    });

    // ::::::::::::: STATUS TESTING ::::::::::::: //
    describe("STATUS", function () {
      /*before(async function () {
      await VotingInstance.setWorkflowStatus(new BN(3));
    });*/
      after(async function () {
        await VotingInstance.setWorkflowStatus(new BN(4));
      });
      // ------------- WORFLOWSTATUS REQUIRE TESTING-------------------------- //
      it("Can't get back to initial status", async () => {
        await expectRevert(
          VotingInstance.setWorkflowStatus(new BN(0), { from: ownerAdmin }),
          "Not possible to get back to the original state"
        );
      });

      it("Can't set inconsistent workflow status", async () => {
        await expectRevert(
          VotingInstance.setWorkflowStatus(new BN(2), { from: ownerAdmin }),
          "bad workflowstatus"
        );
      });

      // ------------- TALLY STATUS REQUIRE TESTING-------------------------- //
      it("Can't begin tally before reaching correct status", async () => {
        await expectRevert(
          VotingInstance.tallyDraw({ from: ownerAdmin }),
          "Current status is not voting session ended"
        );
      });

      // -------------OTHER FUNCTIONS STATUS REQUIRE TESTING-------------------------- //
      it("Only add voter when voters registration is open", async () => {
        await expectRevert(
          VotingInstance.addVoter(voter5, { from: ownerAdmin }),
          "Voters registration is not open yet"
        );
      });
      it("Only add proposal when proposals registration is open", async () => {
        await expectRevert(
          VotingInstance.addProposal("proposal : outside registration period", {
            from: ownerAdmin,
          }),
          "Proposals are not allowed yet"
        );
      });
    });

    // ::::::::::::: TALLIED TESTING ::::::::::::: //
    describe("TALLY", function () {
      // ------------- LAST STATUS TESTING-------------------------- //
      it("Only vote when voting session is open", async () => {
        await expectRevert(
          VotingInstance.setVote(new BN(1), { from: voter4 }),
          "Voting session havent started yet"
        );
      });
      it("Last status can't be set outside of tally functions", async () => {
        await expectRevert(
          VotingInstance.setWorkflowStatus(new BN(5), { from: ownerAdmin }),
          "il faut lancer tally votes"
        );
      });
      // ------------- REQUIRE TESTING-------------------------- //
      it("Only admin can tally vote", async () => {
        await expectRevert(
          VotingInstance.tallyDraw({ from: voter1 }),
          "Ownable: caller is not the owner"
        );
      });
      // ------------- FUNCTIONS TESTING-------------------------- //
      it("Tally vote", async () => {
        await VotingInstance.tallyDraw({ from: ownerAdmin });
        let status = await Voting.WorkflowStatus.VotesTallied;

        expect(
          new BN(
            await VotingInstance.getWinningProposalsID({ from: ownerAdmin })
          )
        ).to.be.bignumber.equal(new BN(1));
        expect(
          new BN(await VotingInstance.workflowStatus())
        ).to.be.bignumber.equal(new BN(status));
      });
    });
    //closing brackets
  });
});
