import { useEffect } from "react";
// import message from "components/Message";
// import I18n from "components/I18n";
// import Input from "components/Input";
import message from "components/Message";
import "./styles.css";
// import { useTheme } from "./theme";

let counter = 0;

export default function App() {
  // const theme = useTheme();
  // const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    message.info({
      content: "haha",
      duration: 3,
      style: {
        marginTop: "20vh"
      }
    });
  }, []);

  return (
    <div className="App">
      {/* <I18n /> */}
      {/* <Modal /> */}
      <button
        style={{
          zIndex: 10
        }}
        onClick={() => {
          message.success({ content: "ooo" + counter++ });
        }}
      >
        add message
      </button>
      <button
        style={{
          zIndex: 100
        }}
        onClick={() => {
          message.success({ content: "eee" + counter++, duration: 5 });
        }}
      >
        add message duration
      </button>
    </div>
  );
}
