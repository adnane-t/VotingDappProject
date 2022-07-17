//import { useEffect } from "react";
import useEth from "../../contexts/EthContext/useEth";

function WorkflowStatus({ setValue }) {
  const {
    state: { contract, accounts, listWorkflowEvent },
  } = useEth();

  /*
  * When uncomment switch import on line 1
  * This useEffect is disabled as it doesn't update the rendering currently. Still have to check why but Const object contract and listVotersEvent are decalred through useEth and not useState it might be the root cause of this
  *
  useEffect(() => {
    console.log("walk through useEffect");
    let options1 = {
      fromBlock: 0,
    };
    //event listener
    contract.events
        .WorkflowStatusChange(options1)
        .on("data", (event) => listWorkflowEvent.push(event));
  }, [contract.events, listWorkflowEvent]);
  */

  const nextWorkflowStatus = async () => {
    console.log("NextWorkflowStatus");
    await contract.methods
      .nextWorkflowStatus()
      .send({ from: accounts[0] })
      .then((results) => alert("workflowStatus changed"))
      .catch((err) => alert(err.message));
  };

  const setWorkflowStatus = async (e) => {
    if (e.target.tagName === "INPUT") {
      return;
    }
    let valeur = document.getElementById("setWorkflowStatus").value;
    if (valeur === "") {
      alert("Please enter a public address to register.");
      return;
    }
    await contract.methods
      .setWorkflowStatus(valeur)
      .send({ from: accounts[0] });
  };

  return (
    <div>
      <details>
        <summary>WorkflowStatus</summary>
        <div>
          <p>Move to the next workflow status</p>
          <button onClick={nextWorkflowStatus}>
            Switch to the new workflow status
          </button>
        </div>
        <br />
        <br />
        <p>Allow user to check if an address is authorzied to vote</p>
        <div>
          <input
            type="address"
            defaultValue=""
            id="setWorkflowStatus"
            size="45"
          />
          <button onClick={setWorkflowStatus}>
            Set the new workflow status
          </button>
          <br />
          <br />
          <table className="eventTable">
            <thead>
              <tr>
                <th>List of past events related to workflow</th>
              </tr>
            </thead>
            <tbody>
              {listWorkflowEvent.map((item) => (
                <tr key={item.id}>
                  <td>Address {item.address}</td>

                  <td>New status {item.returnValues.newStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

export default WorkflowStatus;
