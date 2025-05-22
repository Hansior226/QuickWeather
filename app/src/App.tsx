/*import './App.css';
import MainContent from './components/MainContent';
function App() {
  return (
    <>
      <MainContent />
    
    </>
  );
}

export default App;
*/
import SideBar from "./frontend/components/SideBar";
import MainContent from "./frontend/components/MainContent";

const App = () => {
  return (
    <div className="bg-[#100E1D] flex flex-col lg:flex-row">
      <SideBar />
      <MainContent />
    </div>
  );
};

export default App;
