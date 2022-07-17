import React, { useReducer, useCallback, useEffect } from "react";
import Web3 from "web3";
import EthContext from "./EthContext";
import { reducer, actions, initialState } from "./state";

function EthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  //const [listWorkflowEvent, setListWorkflowEvent] = useState([]);

  const init = useCallback(async (artifact) => {
    if (artifact) {
      const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
      const accounts = await web3.eth.requestAccounts();
      const networkID = await web3.eth.net.getId();
      const { abi } = artifact;
      let address, contract;
      try {
        address = artifact.networks[networkID].address;
        contract = new web3.eth.Contract(abi, address);
      } catch (err) {
        console.error(err);
      }
      let contractOwner = await contract.methods.owner().call();
      const isCurrentUserOwner = contractOwner === accounts[0];
      // On recup tous les events passés du contrat
      let options = {
        fromBlock: 0,
        toBlock: "latest",
      };

      let listVotersEvent = await contract.getPastEvents(
        "VoterRegistered",
        options
      );

      let listVoteEvent = await contract.getPastEvents("Voted", options);
      /*let listVoteEvent = [];
      contract.events
        .Voted(options1)
        .on("data", (event) => listVoteEvent.push(event));*/

      let listWorkflowEvent = await contract.getPastEvents(
        "WorkflowStatusChange",
        options
      );
      /*contract.events
        .WorkflowStatusChange(options1)
        .on("data", (event) => listWorkflowEvent.push(event));*/
      dispatch({
        type: actions.init,
        data: {
          artifact,
          web3,
          accounts,
          networkID,
          contract,
          listVotersEvent,
          listWorkflowEvent,
          listVoteEvent,
          contractOwner,
          isCurrentUserOwner,
        },
      });
    }
  }, []);

  useEffect(() => {
    const tryInit = async () => {
      try {
        const artifact = require("../../contracts/Voting.json");
        init(artifact);
      } catch (err) {
        console.error(err);
      }
    };

    tryInit();
  }, [init]);

  useEffect(() => {
    const events = ["chainChanged", "accountsChanged"];
    const handleChange = () => {
      init(state.artifact);
    };

    window.ethereum.on("disconnect", function () {
      alert("il faut se connecter");
    });
    window.ethereum.on("accountsChanged", function () {
      window.location.reload();
    });
    window.ethereum.on("chainChanged", function () {
      window.location.reload();
    });

    events.forEach((e) => window.ethereum.on(e, handleChange));
    return () => {
      events.forEach((e) => window.ethereum.removeListener(e, handleChange));
    };
  }, [init, state.artifact]);

  return (
    <EthContext.Provider
      value={{
        state,
        dispatch,
      }}
    >
      {children}
    </EthContext.Provider>
  );
}

export default EthProvider;
