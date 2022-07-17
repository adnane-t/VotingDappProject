import { EthProvider } from "./contexts/EthContext";
import Intro from "./components/Intro/";
//import Setup from "./components/Setup";
import Voting from "./components/Voting";
import Footer from "./components/Footer";
import "./App.css";

function App() {
  return (
    <EthProvider>
      <div id="App">
        <div className="container">
          <Intro />
          <hr />
          <Voting />
          <hr />
          <Footer />
        </div>
      </div>
    </EthProvider>
  );
}

export default App;
