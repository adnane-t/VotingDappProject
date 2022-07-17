//import { useState } from "react";
import useEth from "../../contexts/EthContext/useEth";

function TallyVotes({ setValue }) {
  const {
    state: { contract, accounts },
  } = useEth();
  //const [storageValue, setStorageValue] = useState(null);

  const tallyDraw = async () => {
    console.log("tallyDraw");
    await contract.methods
      .tallyDraw()
      .send({ from: accounts[0] })
      .then((results) => alert("Voting session has ended"))
      .catch((err) => alert(err.message));
  };

  return (
    <div>
      <details>
        <summary>TallyVotes</summary>
        <p>Tally votes by the owner of the contract</p>
        <button onClick={tallyDraw}>
          Tally votes and close the voting session
        </button>
        <br />
      </details>
    </div>
  );
}

export default TallyVotes;
