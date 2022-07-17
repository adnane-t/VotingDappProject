function Tree() {
  return (
    <code>
      {`.\n`}
      {`├── client`}
      <span className="primary-color">
        {`   # React project (create-react-app)\n`}
      </span>
      {`├    └── src\n`}
      {`├         ├── componenents\n`}
      <span className="third-color">{`   # React components\n`}</span>
      {`├         ├     ├──componenents`}
      <span className="third-color">{`   # Actual Front part of the dapp\n`}</span>
      {`├         ├     └──...`}
      <span className="third-color">{`   # Default components\n`}</span>
      {`├         ├── contexts/ETHContext`}
      <span className="third-color">
        {`   # React context and web3 initiator\n`}
      </span>
      {`├         └── contract`}
      <span className="secondary-color">{`   # Contract definition\n`}</span>
      {`└── truffle`}
      <span className="primary-color">{`  # Truffle project`}</span>
    </code>
  );
}

export default Tree;
