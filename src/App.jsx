import { useState, useEffect, useRef } from "react";
import { Button, Layout, List, Space, Typography, Radio, Spin } from "antd";
import SicBo from "./sic_bo";
import SicBoController from "./controller/SicBoController";
import io from "socket.io-client";
import { WaittingPage } from "./components/WaittingPage/WaittingPage";
import "./App.css";
const isProduction = true;
function App() {
  useEffect(() => {
    const socket = io(isProduction ? "https://sic-bo.onrender.com/" : "http://localhost:3000/");
    socket.on("state", (data) => {
      console.log("Socket state: ", data);
      initGame(data.state);
    });
  }, []);
  const [gameState, setGameState] = useState(null);
  const [totalOver, setTotalOver] = useState(0);
  const [totalUnder, setTotalUnder] = useState(0);

  function initGame(state) {
    setGameState(state);
    if (state === null) {
      console.log("Game started", state);
      return;
    }
    controller.startGame(state.address);
    updateBets(state.address);
    const sicBo = SicBo(state.address);
    sicBo.events.BetEvent().on("data", () => {
      updateBets(state.address);
    });
  }
  async function updateBets(address) {
    const sicBo = SicBo(address);
    const bets = await sicBo.methods.getBets().call();
    console.table(bets);
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
  const [betAmount, setBetAmount] = useState(100000);
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
          defaultValue={100000}
        >
          {[
            100000, 200000, 300000, 400000, 500000, 600000, 700000, 800000,
            900000, 1000000,
          ].map((value) => {
            return (
              <Radio.Button key={value} value={value}>
                {value / 1000}k
              </Radio.Button>
            );
          })}
        </Radio.Group>
      </div>
      <div style={{ width: "100%", flexDirection: "row", display: "flex", padding: "20px", marginTop: "20px" }}>
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
