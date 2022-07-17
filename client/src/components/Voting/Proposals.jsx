import { useState } from "react";
import useEth from "../../contexts/EthContext/useEth";

function Proposals({ setValue }) {
  const {
    state: { contract, accounts },
  } = useEth();
  const [storageValue, setStorageValue] = useState(null);

  const getOneProposal = async (e) => {
    if (e.target.tagName === "INPUT") {
      return;
    }
    let valeur = document.getElementById("getOneProposal").value;
    if (valeur === "") {
      alert("Please enter a proposal ID to check.");
      return;
    }

    await contract.methods
      .getOneProposal(valeur)
      .call({ from: accounts[0] })
      .then((results) => {
        results.description
          ? setStorageValue(results.description)
          : setStorageValue("No proposal with this ID");
      })
      .catch((err) => alert(err.message));
  };

  const addProposal = async (e) => {
    if (e.target.tagName === "INPUT") {
      return;
    }
    let valeur = document.getElementById("addProposal").value;
    if (valeur === "") {
      alert("Please enter a proper text.");
      return;
    }
    await contract.methods
      .addProposal(valeur)
      .send({ from: accounts[0] })
      .then((results) => alert("Porposal registered"))
      .catch((err) => alert(err.message));
  };

  return (
    <div>
      <details>
        <summary>Proposal</summary>
        <div>
          <p>Allow proposal registration by designated voters</p>
          <textarea type="address" defaultValue="" id="addProposal" size="45" />
          <button onClick={addProposal}>Register your proposal</button>
        </div>
        <br />
        <br />
        <p>Check a specific proposal</p>
        <div>
          <input type="address" defaultValue="" id="getOneProposal" size="45" />
          <button onClick={getOneProposal}>
            Type the proposal ID you want to check
          </button>
          {storageValue && (
            <p>
              <strong>{storageValue}</strong>
            </p>
          )}
          <br />
        </div>
      </details>
    </div>
  );
}

export default Proposals;
