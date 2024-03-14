import { useState, useEffect, useRef } from "react";
import { Button, List, Space, Typography, Radio, Spin } from "antd";
import SicBo from "./sic_bo";
import SicBoController from "./controller/SicBoController";
import io from "socket.io-client";
import { WaittingPage } from "./components/WaittingPage/WaittingPage";
import "./App.css";
const isProduction = true;
function App() {
  useEffect(() => {
    const socket = io(
      isProduction ? "https://sic-bo.onrender.com/" : "http://localhost:3000/"
    );
    socket.on("state", (data) => {
      console.log("Socket state: ", data);
      initGame(data.state);
    });
  }, []);
  const [gameState, setGameState] = useState(null);
  const [totalOver, setTotalOver] = useState(0);
  const [totalUnder, setTotalUnder] = useState(0);

  function initGame(state) {
    if (state === null) {
      setGameState(state);
      console.log("Game started", state);
      return;
    }
    const previousAddress = gameState?.address;
    setGameState(state);
    if (previousAddress === state.address) {
      return;
    }
    setTotalOver(0);
    setTotalUnder(0);
    setUnders([]);
    setOvers([]);
    controller.startGame(state.address);
    updateBets(state.address);
    const sicBo = SicBo(state.address);
    sicBo.events.BetEvent().on("data", () => {
      updateBets(state.address);
    });
  }
  async function updateBets(address) {
    const sicBo = SicBo(address);
    const res = await sicBo.methods.getBets().call();
    const bets = res[0].concat(res[1]); // Nối mảng res[0] và res[1] thành một mảng duy nhất
    let totalOver = 0;
    let totalUnder = 0;
    let unders = [];
    let overs = [];
    bets.forEach((bet) => {
      if (bet.isOver) {
        totalOver += parseInt(bet.amount);
        overs.push(bet);
      } else {
        totalUnder += parseInt(bet.amount);
        unders.push(bet);
      }
    });
    setTotalOver(totalOver);
    setTotalUnder(totalUnder);
    setUnders(unders);
    setOvers(overs);
  }

  const [unders, setUnders] = useState([]);
  const [overs, setOvers] = useState([]);
  const [betAmount, setBetAmount] = useState(10000);
  const controllerRef = useRef(new SicBoController());
  const controller = controllerRef.current;
  const [isOverBetButtonLoading, setIsOverBetButtonLoading] = useState(false);
  const [isUnderBetButtonLoading, setIsUnderBetButtonLoading] = useState(false);

  async function bet(isOver) {
    try {
      if (isOver) {
        setIsOverBetButtonLoading(true);
      } else {
        setIsUnderBetButtonLoading(true);
      }
      await controller.bet(isOver, betAmount);

      if (isOver) {
        setIsOverBetButtonLoading(false);
      } else {
        setIsUnderBetButtonLoading(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (isOver) {
        setIsOverBetButtonLoading(false);
      } else {
        setIsUnderBetButtonLoading(false);
      }
    }
  }

  return gameState === null ? (
    <WaittingPage />
  ) : (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <div
        style={{
          flexDirection: "column",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography.Title level={3}>{gameState.address}</Typography.Title>
        <Space
          direction="horizontal"
          style={{
            padding: "0 50px",
            justifyContent: "center",
          }}
        >
          <Space
            direction="vertical"
            align="center"
            style={{
              padding: "0 50px",
            }}
          >
            <h1>Xỉu</h1>
            <h2>{totalUnder}</h2>
            <Button
              type="primary"
              loading={isUnderBetButtonLoading}
              disabled={gameState.isFinished || gameState.isSettling}
              onClick={async () => {
                await bet(false);
              }}
            >
              Cược
            </Button>
          </Space>
          <Space size="large" direction="vertical" style={{ width: "100%" }}>
            {gameState.isSettling === true ? (
              <Spin size="large" />
            ) : (
              <Typography.Title level={1}>
                {gameState.dices.length > 0
                  ? gameState.dices.join(" - ")
                  : "X - X - X"}
              </Typography.Title>
            )}
          </Space>
          <Space
            direction="vertical"
            align="center"
            style={{
              padding: "0 50px",
            }}
          >
            <h1>Tài</h1>
            <h2>{totalOver}</h2>
            <Button
              type="primary"
              loading={isOverBetButtonLoading}
              disabled={gameState.isFinished || gameState.isSettling}
              onClick={async () => {
                await bet(true);
              }}
            >
              Cược
            </Button>
          </Space>
        </Space>

        <Radio.Group
          style={{ marginTop: "20px" }}
          buttonStyle="solid"
          onChange={async (e) => {
            setBetAmount(e.target.value);
          }}
          defaultValue={10000}
        >
          {[
            10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000,
            100000,
          ].map((value) => {
            return (
              <Radio.Button key={value} value={value}>
                {value / 1000}k
              </Radio.Button>
            );
          })}
        </Radio.Group>
      </div>
      <div
        style={{
          width: "100%",
          flexDirection: "row",
          display: "flex",
          padding: "20px",
          marginTop: "20px",
        }}
      >
        <div style={{ width: "50%", paddingLeft: "20px" }}>
          <Typography.Title level={1}>Xỉu</Typography.Title>
          <List
            itemLayout="horizontal"
            dataSource={unders}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={String(item.amount)}
                  description={item.player}
                />
              </List.Item>
            )}
          />
        </div>
        <div style={{ width: "50%", textAlign: "right", paddingRight: "20px" }}>
          <Typography.Title level={1}>Tài</Typography.Title>
          <List
            itemLayout="horizontal"
            dataSource={overs}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={String(item.amount)}
                  description={item.player}
                />
              </List.Item>
            )}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
