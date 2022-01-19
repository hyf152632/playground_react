import { useEffect } from "react";
// import message from "components/Message";
// import I18n from "components/I18n";
// import Input from "components/Input";
import message from "components/Message";
import SignalLamp from "components/SignalLamp";
import "./styles.css";
// import { useTheme } from "./theme";

let counter = 0;

// message.config({
//   maxCount: 2
// });

export default function App() {
  // const theme = useTheme();
  // const [inputValue, setInputValue] = useState("");
  // const [messageApis] = message.useMessage();

  useEffect(() => {
    // message.info("haha", 3, console.log);
    // const key = "updatable";
    // const openMessage = () => {
    //   message.loading({ content: "Loading...", key });
    //   setTimeout(() => {
    //     message.success({ content: "Loaded!", key, duration: 2 });
    //   }, 2000);
    // };
    // openMessage();
    // messageApis.success("oo");
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
          message.success({
            style: {
              // zIndex: 10
              // marginTop: 20
            },
            content: (
              <div>
                haha
                <br />
                oo
                <br /> oo
                <br />
                oeiowe
                <br />
              </div>
            ),
            duration: 0,
            onClick: () => {
              message.destroy();
            }
          });
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
      <button
        style={{
          zIndex: 100
        }}
        onClick={() => {
          const loading = message.loading({
            content: "eee" + counter++,
            duration: 0
          });
          setTimeout(loading, 4000);
        }}
      >
        async loading
      </button>
      <div>
        <SignalLamp status={1} />
      </div>
    </div>
  );
}
