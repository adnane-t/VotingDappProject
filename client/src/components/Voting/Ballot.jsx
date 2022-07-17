import { useState } from "react";
import useEth from "../../contexts/EthContext/useEth";

function Ballot({ setValue }) {
  const {
    state: { contract, accounts, listVoteEvent },
  } = useEth();
  const [storageProposal, setStorageProposal] = useState(null);

  const getAllProposals = async () => {
    await contract.methods
      .getAllProposals()
      .call({ from: accounts[0] })
      .then((results) => setStorageProposal(results))
      .catch((err) => alert(err.message));
  };

  const setVote = async (e) => {
    if (e.target.tagName === "INPUT") {
      return;
    }

    let valeur = document.getElementById("setVote").value;
    if (valeur === "") {
      alert("Please choose a proposal.");
      return;
    }
    await contract.methods.setVote(valeur).send({ from: accounts[0] });
  };

  return (
    <div>
      <details>
        <summary>Vote</summary>
        <div>
          <p>Display all the proposals</p>
          <button onClick={getAllProposals}>getAllProposals</button>
        </div>
        {storageProposal && (
          <table className="eventTable">
            <thead>
              <tr>
                <th>List of proposals</th>
              </tr>
            </thead>
            <tbody>
              {storageProposal.map((item, index) => (
                <tr key={index}>
                  <td>Proposal ID : {index}</td>
                  <td>Description : {item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <br />
        <br />
        {listVoteEvent.some(
          (item) => item.returnValues.voter === accounts[0]
        ) ? (
          <div>
            <p>You have already voted</p>
            {listVoteEvent
              .filter((item) => item.returnValues.voter === accounts[0])
              .map((voterBallot) => (
                <>
                  <p>
                    Your vote was registered for the proposal ID =
                    <em>{voterBallot.returnValues.proposalId}</em>
                  </p>
                  <p>
                    It has been recoreded through the transaction identified by
                    the following hash = <em>{voterBallot.transactionHash}</em>
                  </p>
                </>
              ))}
          </div>
        ) : (
          <div>
            <p>Select a proposal ID based on the list above</p>
            <input type="address" defaultValue="" id="setVote" size="45" />
            <button onClick={setVote}>Select your proposal</button>
          </div>
        )}
        <br />
        <br />
      </details>
    </div>
  );
}

export default Ballot;
