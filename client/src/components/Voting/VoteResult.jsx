import { useState } from "react";
import useEth from "../../contexts/EthContext/useEth";

function VoteResult({ setValue }) {
  const {
    state: { contract, accounts },
  } = useEth();
  const [storageProposal, setStorageProposal] = useState(null);
  console.log("storageProposal : " + storageProposal);

  const getWinningProposalsID = async () => {
    await contract.methods
      .getWinningProposalsID()
      .call({ from: accounts[0] })
      .then((results) => setStorageProposal(results))
      .catch((err) => alert(err.message));
  };

  return (
    <div>
      <details>
        <summary>Voting session results</summary>
        <div>
          <p>Display voting session results</p>
          <button onClick={getWinningProposalsID}>getWinningProposals</button>
        </div>
        {storageProposal && (
          <table className="eventTable">
            <thead>
              <tr>
                <th>Wining proposal ID</th>
              </tr>
            </thead>
            <tbody>
              {storageProposal.map((item, index) => (
                <tr key={index}>
                  <td>Proposal ID : {index}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <br />
        <br />
      </details>
    </div>
  );
}

export default VoteResult;
