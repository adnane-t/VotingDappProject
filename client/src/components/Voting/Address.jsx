// == Import
//import PropTypesLib from "prop-types";
//import { useState } from "react";
import useEth from "../../contexts/EthContext/useEth";

// == Composant
function Address() {
  const { state } = useEth();
  //const [value, setValue] = useState("?");

  return (
    <details>
      <summary>Current public address</summary>
      <p>Voici l'adress que vous utilisez: {state.accounts}</p>
    </details>
  );
}

// == Export
export default Address;
