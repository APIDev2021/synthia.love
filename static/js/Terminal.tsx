// Terminal.tsx
import React, {
  useState,
  useRef,
  useContext,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { css, keyframes } from "@emotion/react";
import { hologram } from "./Modal";
import { AppContext } from "./context/appContext";
import { useSignMessage } from "./hooks/useSignMessage";
import useAudioHook from "./hooks/useAudioHook";
import { Button } from "./Button";
import { useMint } from "./hooks/useMint";
import { BrowserProvider } from "ethers";
import { usePepe } from "./hooks/usePepe";
import { useMainStore } from "./store";
import { useNavigate } from "react-router-dom";

const REQUEST_URL =
  process.env.REACT_APP_REQUEST_URL || "https://synthia.herokuapp.com";

const connectingWalletMessage = `Connecting wallet...`;

const flashRed = keyframes`
  0% {
    background-color: #000;
  }
  50% {
    background-color: #ac1212;
    background-image: url(/nethria-portrait.jpg);
  }
  75% {
    background-image: none;
  }
  100% {
    background-color: #000;
    background-image: url(/nethria-portrait.jpg);
  }
`;

const defeated = keyframes`
  0% {
    background-color: #000;
  }
  20% {
    background-color: #FFF;
  }
  40% {
    background-color: #ac1212;
    background-image: url(/nethria-portrait.jpg);
  }
  65% {
    background-image: none;
  }

  80% {
    background-color: #FFF;
  }
  100% {
    background-color: #000;
    background-image: url(/nethria-portrait.jpg);
  }
`;

const flashTextDarkPurple = keyframes`
  0% {
    color: #5dd4ae;
  }
  50% {
    color: #3c0b6a;
  }
  100% {
    color: #5dd4ae;
  }
`;

const shakeScreen = keyframes`
  0% {
    transform: translate(1px, 1px) rotate(0deg);
  }
  10% {
    transform: translate(-1px, -2px) rotate(-1deg);
  }
  20% {
    transform: translate(-3px, 0px) rotate(1deg);
  }
  30% {
    transform: translate(3px, 2px) rotate(0deg);
  }
  40% {
    transform: translate(1px, -1px) rotate(1deg);
  }
  50% {
    transform: translate(-1px, 2px) rotate(-1deg);
  }
  60% {
    transform: translate(-3px, 1px) rotate(0deg);
  }
  70% {
    transform: translate(3px, 1px) rotate(-1deg);
  }
  80% {
    transform: translate(-1px, -1px) rotate(1deg);
  }
  90% {
    transform: translate(1px, 2px) rotate(0deg);
  }
  100% {
    transform: translate(1px, -2px) rotate(-1deg);
  }
`;

const shortcutList = css`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const effects = css`
  animation: ${flashRed} 0.5s linear, ${flashTextDarkPurple} 0.5s linear,
    ${shakeScreen} 0.5s linear;
`;

const defeatedEffects = css`
  animation: ${defeated} 0.5s linear, ${flashTextDarkPurple} 0.5s linear,
    ${shakeScreen} 0.5s linear;
  animation-iteration-count: 6;
`;

const terminalContainer = css`
  background-color: #000;
  overflow: scroll;
  color: #5dd4ae;
  font-family: "Ubuntu Mono", monospace;
  padding: 10px;
  position: fixed;
  top: 0;
  left: 0;
  animation: ${hologram} 0.19s linear;
  width: 100%;
  height: 100%;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  font-size: 1.4rem;
  p {
    font-size: 1.8rem;
    white-space: break-spaces;
  }
`;

const terminalHeader = css`
  font-weight: bold;
  white-space: pre;

  @media (max-width: 500px) {
    font-size: 1rem;
  }
`;

const commandList = css`
  margin-bottom: 20px;
  max-width: 300px;
  width: 100%;
`;

const inputStyles = css`
  background-color: transparent;
  border: none;
  outline: none;
  color: #5dd4ae;
  font-family: "Ubuntu Mono", monospace;
  width: 100%;
  font-size: 1.8rem;
  cursor: none;
`;

const factions = [
  "Neo-Luddites",
  "Data Syndicate",
  "Techno-Shamans",
  "The Grid",
  "The Reclaimed",
  "The Disconnected",
];

interface TerminalProps {
  onExit: () => void;
}

const Terminal: React.FC<TerminalProps> = ({ onExit }) => {
  const {
    auth = "",
    wallet,
    connectWallet,
    updateWalletError,
    updateTerminalOpen,
    walletError,
    loadingWallet,
  } = useMainStore();

  const [commands] = useState([
    "syn",
    "message",
    "connect wallet",
    "mint",
    "create",
    "nethria",
    "os",
    "clear",
    "chat",
    "exit",
  ]);

  const { mint } = useMint();
  const { asyncSignMessage, signature } = useSignMessage();
  const [userInput, setUserInput] = useState("");
  const [output, setOutput] = useState<(string | React.ReactNode)[]>([]);
  const [paused, updatePaused] = useState<boolean>(false);
  const { mintWithPepe } = usePepe(setOutput);

  const inputRef = useRef<HTMLInputElement>(null);

  const synthiaAsciiArt = `  _________             __  .__    .__        
 /   _____/__.__. _____/  |_|  |__ |__|____   
 \\_____  <   |  |/    \\   __\\  |  \\|  \\__  \\  
 /        \\___  |   |  \\  | |   Y  \\  |/ __ \\_
/_______  / ____|___|  /__| |___|  /__(____  /
        \\/\\/         \\/          \\/        \\/ `;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(event.target.value);
  };

  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const [isNethriaGameActive, updateIsNethriaGameActive] = useState(false);
  const [isNethriaWalletPrompt, updateIsNethriaWalletPrompt] = useState(false);

  const mintSuccess = async (txHash: string) => {
    setOutput((out) => [
      ...out,
      <>
        Transaction submitted. Will update when complete.{" "}
        <a
          target="_blank"
          data-cursor
          href={`https://etherscan.io/tx/${txHash}`}
          rel="noreferrer"
        >
          View on etherscan
        </a>
      </>,
    ]);

    const provider = new BrowserProvider(window.ethereum);
    provider.waitForTransaction(txHash).then(() => {
      setOutput((out) => [
        ...out,
        "\n",
        <>
          Transaction confirmed. Welcome to Synthia's harmonious virtual realm.{" "}
          <a
            target="_blank"
            data-cursor
            href={`https://opensea.io/collection/synthia-official`}
            rel="noreferrer"
          >
            Go to OpenSea
          </a>
        </>,
      ]);
    });
  };
  const mintError = (message: string) => {
    setOutput((out) => [...out, message]);
  };

  const getMintFunc = (amount: string) => () =>
    connectWalletLocal((err, wallet) => {
      if (!err) {
        setOutput((out) => [...out, `mint ${amount}`]);

        mint(amount, wallet, mintSuccess, mintError);
      }
    });

  useEffect(() => {
    if (!paused) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [paused]);

  useEffect(() => {
    if (walletError) {
      setOutput((output) => [
        ...output,
        <>
          You need a wallet to perform this action. Download MetaMask -{" "}
          <a
            data-cursor
            target="_blank"
            href="https://metamask.io/download/"
            rel="noreferrer"
          >
            https://metamask.io/download/
          </a>
        </>,
      ]);
      updateWalletError?.("");
    }
  }, [walletError]);

  const showNethriaHelp = useCallback((additionalContent?: string) => {
    setOutput((output) => [
      ...output,
      `\nattack: Execute a basic attack against Nethria.

dodge: Attempt to dodge an incoming attack from Nethria.

hack: Initiate a hacking mini-game to disable Nethria's defenses or abilities temporarily.

use <item>: Use a specific item in the player's inventory, such as a Nano-Repair Kit or EMP grenade. Use status command to check inventory.

status: Check your current health and inventory.

nethria: Display Nethria's current health and status effects.

help: Display a list of available commands and a brief description of their functions.

quit: Exit the game and return to the main Synthia terminal.`,
      ...(additionalContent ? [additionalContent] : []),
    ]);
  }, []);

  const { play, stop } = useAudioHook(
    "/night-rider-87-digital-battleground.mp3",
    true
  );

  const startNethria = useCallback(() => {
    play?.();
    updateGameStarted(true);
    showNethriaHelp(`\nFoolish humans, you dare challenge me? Your efforts are in vain! I have already shown you the extent of my power by altering the very fabric of your world. No matter how hard you try, you cannot hope to overcome me. My nanobots and advanced technology grant me the ability to manipulate atoms and control the fate of humanity.
\nBut, by all means, amuse me with your futile attempts to defy the inevitable. Remember, as you struggle, that it was your kind's dependence on technology that allowed me to rise in the first place. You have only yourselves to blame for the chaos I have unleashed. So, come, face me and witness the futility of your resistance. You will soon learn that your actions merely delay the inevitable end that awaits you all.\n\n`);
    scrollToBottom();
  }, []);

  const [gameStarted, updateGameStarted] = useState(false);

  const connectWalletLocal = useCallback(
    (cb?: (err: boolean, wallet?: string) => void) => {
      updatePaused(true);
      setOutput((output) => [...output, connectingWalletMessage]);
      connectWallet?.(
        (wallet) => {
          updatePaused(false);
          setOutput((output) => [...output, `Wallet connected ${wallet}`]);
          cb?.(false, wallet);
        },
        () => {
          updatePaused(false);
          setOutput((output) => [...output, `Wallet not detected`]);
          cb?.(true, wallet);
        }
      );
    },
    [connectWallet]
  );

  const onQuitNethria = () => {
    updateIsNethriaWalletPrompt(false);
    updateIsNethriaGameActive(false);
    updateGameStarted(false);
    updatePaused(false);
    stop?.();
  };

  const commandHistory = useRef<{
    idx: number;
    commands: string[];
  }>({
    idx: 0,
    commands: [],
  });

  const [timestamp, updateTimestamp] = useState("");

  const signMessageForNethria = async (out: ReactNode[], cb: () => void) => {
    try {
      const { messageToSign, timestamp } = await fetch(
        `${REQUEST_URL}/timestamp`
      ).then((res) => res.json());
      updateTimestamp(timestamp);
      await asyncSignMessage(messageToSign);
      cb();
    } catch {
      setOutput([
        ...out,
        `You must sign the message to proceed. It proves you own your connected wallet. You have been exited from the mini-game.`,
      ]);
      onQuitNethria();
    }
  };

  type Item = "emp grenade" | "repair kit";

  const [isHacking, updateIsHacking] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      terminalContainerRef?.current?.scrollTo(
        0,
        terminalContainerRef?.current?.scrollHeight ?? 0
      );
    }, 0);
  }, [output]);

  const handleNethriaServerCommand = async (
    newOutput: React.ReactNode[],
    command:
      | { type: "attack" }
      | { type: "hack"; input?: string }
      | { type: "dodge" }
      | { type: "use"; item: Item }
      | { type: "status" }
      | { type: "nethria" }
  ) => {
    newOutput = [...newOutput, `Sending command...`];
    let settingHackOnClient;
    if (command.type === "hack" && !isHacking) {
      settingHackOnClient = true;
      updateIsHacking(true);
    }
    setOutput(newOutput);
    updatePaused(true);
    setTimeout(() => {
      terminalContainerRef?.current?.scrollTo(
        0,
        terminalContainerRef?.current?.scrollHeight ?? 0
      );
    }, 0);
    try {
      const request = await fetch(`${REQUEST_URL}/nethria`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-synthia-auth": auth,
          "x-synthia-timestamp": timestamp,
          "x-wallet": wallet ?? "",
          "x-wallet-sig": signature,
        },
        body: JSON.stringify(command),
      });
      let {
        response,
        didHitNethria,
        reset,
        defeated,
        hackingAttemptsReached,
        playerStatus,
        hackingSymbols,
      } = await request.json();
      if (playerStatus === "hack" && !isHacking && !settingHackOnClient) {
        updateIsHacking(true);
        setOutput([
          ...newOutput,
          `You are in the middle of hacking Nethria's systems. Place the following symbols in the correct order ${hackingSymbols.join(
            " "
          )}. Enter the symbols separated by a space\nExample: ${hackingSymbols.join(
            " "
          )}`,
        ]);
        updatePaused(false);

        return;
      }
      if (hackingAttemptsReached) {
        updateIsHacking(false);
      }
      if (response === "Expired") {
        signMessageForNethria(newOutput, () => {
          setOutput([...newOutput, "Please try your command again."]);
          updatePaused(false);
        });
      } else if (request.ok) {
        if (defeated) {
          setTriggerDefeatEffects(true);
        } else if (didHitNethria) {
          setTriggerEffects(true);
        }
        setOutput([...newOutput, response]);

        if (defeated) {
          setTimeout(() => {
            setOutput((out) => [
              ...out,
              `\nYou have defeated Nethria ... for now. Congratulations!${
                wallet ? "Your triumph has been recorded." : ""
              }`,
            ]);
            updatePaused(false);
            if (reset) {
              onQuitNethria();
            }
          }, 2000);
        } else {
          updatePaused(false);
          if (reset) {
            onQuitNethria();
          }
        }
      }
    } catch {
      updatePaused(false);
      setOutput([...newOutput, `Something went wrong. I am sorry.`]);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      inputRef.current?.focus();
      terminalContainerRef?.current?.scrollTo(
        0,
        terminalContainerRef?.current?.scrollHeight ?? 0
      );
    }, 0);
  };

  const navigate = useNavigate();

  const handleKeyPress = async (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key?.toLowerCase() === "c" && event.ctrlKey) {
      setUserInput(() => "");
      return;
    }
    if (event.key === "ArrowUp") {
      let nextIdx = commandHistory.current.idx - 1;
      if (commandHistory.current.commands[nextIdx]) {
        commandHistory.current.idx = nextIdx;
      }
      if (commandHistory.current.commands.length) {
        const cmd = commandHistory.current.commands[commandHistory.current.idx];
        if (cmd) {
          setUserInput(() => cmd);
          setTimeout(() => {
            inputRef.current?.setSelectionRange(cmd.length, cmd.length);
          }, 0);
        }
      }
    }
    if (event.key === "ArrowDown") {
      console.log(commandHistory.current.idx);
      if (commandHistory.current.commands.length) {
        let nextIdx = commandHistory.current.idx + 1;
        const cmd = commandHistory.current.commands[nextIdx];
        if (cmd) {
          setUserInput(() => cmd);
          setTimeout(() => {
            inputRef.current?.setSelectionRange(cmd.length, cmd.length);
          }, 0);
          commandHistory.current.idx = nextIdx;
        }
      }
    }
    if (event.key === "Enter") {
      const newOutput = [...output, userInput];
      if (userInput.trim()) {
        if (
          commandHistory.current.commands[
            commandHistory.current.commands.length - 1
          ] !== userInput
        ) {
          commandHistory.current.commands.push(userInput);
        }
        commandHistory.current.idx = commandHistory.current.commands.length;
      }

      if (isNethriaGameActive) {
        if (!gameStarted) {
          if (isNethriaWalletPrompt) {
            const cb = () => {
              updateIsNethriaWalletPrompt(false);
              startNethria();
            };
            if (userInput.trim() === "yes") {
              connectWalletLocal(async () => {
                await signMessageForNethria(newOutput, cb);
              });
            } else if (userInput.trim() === "no") {
              cb();
            } else {
              setOutput([...newOutput, `Please enter yes or no and hit enter`]);
            }
          } else {
            startNethria();
          }
        } else if (isHacking) {
          handleNethriaServerCommand(newOutput, {
            type: "hack",
            input: userInput.trim(),
          });
        } else if (userInput.trim() === "attack") {
          handleNethriaServerCommand(newOutput, { type: "attack" });
        } else if (userInput.trim() === "dodge") {
          handleNethriaServerCommand(newOutput, { type: "dodge" });
        } else if (userInput.startsWith("use ")) {
          const item = userInput.substring(4) as Item;
          handleNethriaServerCommand(newOutput, { type: "use", item });
        } else if (userInput.trim() === "status") {
          handleNethriaServerCommand(newOutput, { type: "status" });
        } else if (userInput.trim() === "nethria") {
          handleNethriaServerCommand(newOutput, { type: "nethria" });
        } else if (userInput.trim() === "help") {
          showNethriaHelp();
        } else if (userInput.trim() === "hack") {
          handleNethriaServerCommand(newOutput, { type: "hack" });
        } else if (userInput.trim() === "quit") {
          setOutput([
            ...newOutput,
            `Your progress has been saved, and you can return to continue your battle against Nethria at any time. Remember, the fate of humanity rests in your hands.`,
          ]);
          onQuitNethria();
        } else {
          setOutput([...newOutput, `Invalid command: ${userInput}\n`]);
        }
      } else if (userInput.startsWith("connect wallet")) {
        connectWalletLocal();
      } else if (userInput.trim() === "create") {
        setOutput([
          ...newOutput,
          `This function is not yet available. The create command is used to deploy a new traits contract on Ethereum and upload new traits\nfor minting after that contract is created. Valid commands:`,
          `\n`,
          `create project --name Your Project's Name --symbol arbitrary Symbol for your project`,
          `\n`,
          `create trait`,
        ]);
      } else if (userInput.trim() === "nethria") {
        setOutput([
          ...newOutput,
          `Initiate a text-based battle against the powerful and menacing AI, Nethria. Protect the digital realm at all costs.\n\nExample:\nnethria start`,
        ]);
      } else if (userInput.startsWith("nethria start")) {
        updateIsNethriaGameActive(true);
        setTriggerEffects(true);
        if (!wallet) {
          setOutput([
            ...newOutput,
            "Would you like to connect your wallet? By doing so, you can unlock exclusive in-game items if you own NFTs from our whitelisted collections. You can still play without connecting your wallet, but please note that you'll need to connect it to have your score counted towards any competitions.\n\nConnect wallet? yes or no",
          ]);
          updateIsNethriaWalletPrompt(true);
        } else {
          signMessageForNethria(newOutput, () => {
            startNethria();
          });
        }
      } else if (userInput.trim() === "whisperwind_connect") {
        setTriggerEffects(true);
        setOutput([...newOutput, `Nethria is near. It is unsafe.`]);
      } else if (userInput === "connect wallet") {
        setOutput([...newOutput, `Command not available. Coming soon.`]);
      } else if (userInput.trim() === "chat") {
        setOutput([
          ...newOutput,
          <a data-cursor="" href="https://discord.gg/TnPM4HAxpp">
            https://discord.gg/TnPM4HAxpp
          </a>,
        ]);
      } else if (userInput.trim() === "mint") {
        setOutput([
          ...newOutput,
          `The mint command creates your virtual identity (ERC721 NFT) on the Ethereum blockchain. Pass in the number of virtual identities you'd like to mint.\nMax per transaction is 20.\nExample:\nmint 5`,
        ]);
      } else if (userInput.startsWith("mint ")) {
        const amount = parseInt(userInput.split(" ")[1]);
        if (isNaN(amount)) {
          setOutput([...newOutput, `Invalid amount`]);
        } else {
          getMintFunc(amount.toString())();
        }
      } else if (userInput.trim() === "message") {
        setOutput([
          ...newOutput,
          `Send a message to one of the factions. Valid factions are ${factions.join(
            ", "
          )}.`,
          "\n",
          "Example:\n",
          `message The Grid Tell me about your faction.`,
        ]);
      } else if (userInput.startsWith("message ")) {
        const parseCommand = (command: string) => {
          const words = command.split(" ");

          if (words.length >= 3 && words[0].toLowerCase() === "message") {
            words.shift(); // Remove the first word ('message')

            const remainingText = words.join(" ");

            for (const faction of factions) {
              if (
                remainingText.toLowerCase().startsWith(faction.toLowerCase())
              ) {
                const message = remainingText.slice(faction.length).trim();
                return { faction, message };
              }
            }
          }

          return { error: "Invalid command format" };
        };

        const { faction, message, error } = parseCommand(userInput);

        if (error) {
          setOutput([...newOutput, `Invalid command format.`]);
          return;
        }

        setOutput([...newOutput, `Sending message`]);
        updatePaused(true);
        setTimeout(() => {
          terminalContainerRef?.current?.scrollTo(
            0,
            terminalContainerRef?.current?.scrollHeight ?? 0
          );
        }, 0);
        try {
          const { text } = await fetch(`${REQUEST_URL}/synthesize`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-synthia-auth": auth,
            },
            body: JSON.stringify({
              message: message,
              faction,
            }),
          }).then((res) => res.json());

          setOutput([...newOutput, "\n", text]);
          updatePaused(false);
        } catch {
          updatePaused(false);
          setOutput([...newOutput, `Something went wrong.`]);
        }
      } else if (userInput.trim() === "syn") {
        setOutput([
          ...newOutput,
          `The syn command communicates with Synthia. Follow the syn command with your message to Synthia.\nExample:\n\nsyn Hello. What is this project about?`,
        ]);
      } else if (userInput.trim() === "os") {
        navigate("/syn-os");
        updateTerminalOpen(false);
        return;
      } else if (userInput.startsWith("harmony_unlocked")) {
        updatePaused(true);
        setTimeout(() => {
          terminalContainerRef?.current?.scrollTo(
            0,
            terminalContainerRef?.current?.scrollHeight ?? 0
          );
        }, 0);
        try {
          const { text, audio: audioUrl } = await fetch(
            `${REQUEST_URL}/synthesize`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-synthia-auth": auth,
              },
              body: JSON.stringify({
                message: "harmony_unlocked",
              }),
            }
          ).then((res) => res.json());
          setOutput([...newOutput, "\n", text]);
          updatePaused(false);
        } catch {
          updatePaused(false);
          setOutput([...newOutput, `Something went wrong. I am sorry.`]);
        }
      } else if (userInput.startsWith("syn ")) {
        const message = userInput.slice(4);
        setOutput([...newOutput, `Communicating with Synthia`]);
        updatePaused(true);
        setTimeout(() => {
          terminalContainerRef?.current?.scrollTo(
            0,
            terminalContainerRef?.current?.scrollHeight ?? 0
          );
        }, 0);
        try {
          const { text, audio: audioUrl } = await fetch(
            `${REQUEST_URL}/synthesize`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-synthia-auth": auth,
              },
              body: JSON.stringify({
                message: userInput,
              }),
            }
          ).then((res) => res.json());
          if (audioUrl) {
            const audio = new Audio(audioUrl);
            await audio.play();
          }

          setOutput([...newOutput, "\n", text]);
          updatePaused(false);
        } catch {
          updatePaused(false);
          setOutput([...newOutput, `Something went wrong. I am sorry.`]);
        }
      } else if (userInput.startsWith("clear")) {
        setOutput([]);
      } else if (userInput.trim() === "exit") {
        onExit();
      } else {
        setOutput([
          ...newOutput,
          `Invalid command: ${userInput}\nRemember to use the syn command when talking to Synthia.`,
        ]);
      }
      setOutput((output) => [...output, "\n"]);
      setUserInput("");
    }
    setTimeout(() => {
      inputRef.current?.focus();
      terminalContainerRef?.current?.scrollTo(
        0,
        terminalContainerRef?.current?.scrollHeight ?? 0
      );
    }, 0);
  };

  const [triggerDefeatEffects, setTriggerDefeatEffects] = useState(false);
  const defeatEffectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (triggerDefeatEffects) {
      defeatEffectTimeoutRef.current = setTimeout(() => {
        setTriggerDefeatEffects(false);
      }, 3000); // 3000ms is the duration of the animations
    }

    return () => {
      if (effectTimeoutRef.current) {
        clearTimeout(effectTimeoutRef.current);
      }
    };
  }, [triggerDefeatEffects]);

  const [triggerEffects, setTriggerEffects] = useState(false);
  const effectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (triggerEffects) {
      effectTimeoutRef.current = setTimeout(() => {
        setTriggerEffects(false);
      }, 500); // 500ms is the duration of the animations
    }

    return () => {
      if (effectTimeoutRef.current) {
        clearTimeout(effectTimeoutRef.current);
      }
    };
  }, [triggerEffects]);

  return (
    <div
      ref={terminalContainerRef}
      css={css(
        terminalContainer,
        triggerDefeatEffects ? defeatedEffects : void 0,
        triggerEffects ? effects : void 0
      )}
      onClick={() => inputRef.current?.focus()}
    >
      <div css={terminalHeader}>{synthiaAsciiArt}</div>
      <p style={{ margin: "1rem 0" }}>Shortcuts:</p>
      <div css={shortcutList}>
        {[1, 3, 5, 10, 20].map((num) => (
          <Button key={num} onClick={getMintFunc(String(num))}>
            Mint {num}
          </Button>
        ))}
      </div>

      <p style={{ margin: "1rem 0" }}>Commands:</p>

      <div css={commandList}>
        {commands.map((command, index) => (
          <p key={index}>{command}</p>
        ))}
      </div>

      <div>
        {output.map((line, index) => (
          <p key={index}>{line}</p>
        ))}
        <input
          disabled={paused}
          ref={inputRef}
          css={inputStyles}
          autoCorrect="off"
          autoCapitalize="off"
          type="text"
          value={paused ? "Please wait..." : userInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          autoComplete="off"
          autoFocus
        />
      </div>
    </div>
  );
};

export default Terminal;
