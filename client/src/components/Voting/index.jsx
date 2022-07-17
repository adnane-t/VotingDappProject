//import { useState } from "react";
import useEth from "../../contexts/EthContext/useEth";
import Title from "./Title";
import Address from "./Address";
import Voters from "./Voters";
import Proposals from "./Proposals";
import WorkflowStatus from "./WorkflowStatus";
import Ballot from "./Ballot";
import TallyVotes from "./TallyVotes";
import VoteResult from "./VoteResult";
//import Desc from "./Desc";
import NoticeNoArtifact from "./NoticeNoArtifact";
import NoticeWrongNetwork from "./NoticeWrongNetwork";
import NoticeOnlyAdmin from "./NoticeOnlyAdmin";

function Voting() {
  const {
    state: { artifact, contract, isCurrentUserOwner },
  } = useEth();
  // const [value, setValue] = useState("?");

  const Voting = (
    <>
      <Address />
      <Voters />
      <Proposals />
      <Ballot />
      <VoteResult />
    </>
  );

  return (
    <div className="Voting">
      <Title />
      {!artifact ? (
        <NoticeNoArtifact />
      ) : !contract ? (
        <NoticeWrongNetwork />
      ) : (
        Voting
      )}
      {!isCurrentUserOwner ? (
        <NoticeOnlyAdmin />
      ) : (
        <>
          <TallyVotes />
          <WorkflowStatus />
        </>
      )}
    </div>
  );
}

export default Voting;
