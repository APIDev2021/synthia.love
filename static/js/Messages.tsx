import { css } from "@emotion/react";
import React, { useEffect, useState } from "react";
import messages from "./messages.json";
import { Color } from "./Color";
import { Margin } from "./Margin";
import { TextButton } from "./TextBtn";
import useAudioHook from "./hooks/useAudioHook";
import { useLocalStorage } from "./hooks/useLocalStorageHook";

const messageList = messages
  .flatMap(({ faction, messages, dates }) =>
    messages.map((_message, index) => {
      let soundPrefix = "";
      let img = "";
      switch (faction) {
        case "Techno-Shaman":
          soundPrefix = "techno-shaman";
          img = "ts.png";
          break;
        case "Neo-Luddites":
          soundPrefix = "nl";
          img = "nl.png";
          break;
        case "The Grid":
          soundPrefix = "grid";
          img = "grid.png";
          break;
        case "Data Syndicate":
          soundPrefix = "ds";
          img = "ds.png";
          break;
        case "The Reclaimed":
          soundPrefix = "reclaimed";
          img = "reclaimed.png";
          break;
        case "The Disconnected":
          soundPrefix = "disconnected";
          img = "disconnected.png";
          break;
      }
      const [subject, message] = _message.split(": ");
      return {
        faction,
        message,
        subject,
        img,
        audio: `/${soundPrefix}-${index + 1}.mp3`,
        date: dates[index],
      };
    })
  )
  // @ts-ignore
  .sort((a, b) => new Date(b.date) - new Date(a.date));

const styles = {
  wrap: css({}),
  msgWrap: css`
    display: flex;
    align-items: center;
    gap: 5px;
    margin: 2rem 0;
    max-width: 600px;
    @media (max-width: 600px) {
      flex-direction: column;

      & .hide {
        display: none;
      }
    }
  `,
  imgFrame: css`
    position: relative;
    width: 75px;
    margin-right: 10px;
    height: 75px;
    flex-shrink: 0;
    display: flex;
    border-radius: 75px;
    overflow: hidden;
    align-items: center;
    justify-content: center;
    background: #2d1f4e;
    border: 2px solid #8430e2;
    box-shadow: 0 0 10px #8430e2;
    & img {
      width: 100%;
      height: auto;

      &:last-child {
        position: relative;
        z-index: 2;
      }
    }
  `,
};

const msgDetailsStyle = {
  msgWrap: css(styles.msgWrap, {
    gap: "2rem",
    width: "100%",
    alignItems: "flex-start",
  }),
};

type MessageDetailProps = {
  onClose: any;
  faction: string;
  subject: string;
  audio: string;
  message: string;
  img: string;
  date: string;
};

const MessageDetail = ({
  onClose,
  faction,
  subject,
  audio,
  message,
  img,
  date,
}: MessageDetailProps) => {
  const { play, stop } = useAudioHook(audio, false);
  useEffect(() => {
    play?.();

    return () => {
      stop?.();
    };
  }, []);
  return (
    <>
      <TextButton style={{ marginTop: "2rem" }} onClick={onClose}>
        {"<"} back
      </TextButton>

      <div css={msgDetailsStyle.msgWrap}>
        <div css={styles.imgFrame}>
          <img src={`/${img}`} />
        </div>
        <div>
          <Margin margin="0 0 1rem 0">
            <Color color="#43e1e4">
              <p>From: {faction}</p>
              <p>Subject: {subject}</p>
              <p>Date: {date}</p>
              <p>{message}</p>
            </Color>
          </Margin>
        </div>
      </div>
    </>
  );
};

export const Messages = () => {
  const [details, updateDetails] = useState<any>();
  // TODO: Correctly type this
  const [viewed, updateViewed] = useLocalStorage<any>("viewed", {});
  return (
    <div data-cursor css={styles.wrap}>
      <p>Messages</p>
      {details && (
        <MessageDetail {...details} onClose={() => updateDetails(null)} />
      )}
      {!details &&
        messageList.map(
          ({ audio, message, faction, img, subject, date }, i) => (
            <div
              data-cursor=""
              style={{ opacity: viewed[subject] ? 0.5 : 1 }}
              css={styles.msgWrap}
              onClick={() => {
                updateViewed((viewed: any) => ({ ...viewed, [subject]: true }));
                updateDetails({ audio, message, faction, img, subject, date });
              }}
            >
              <div css={styles.imgFrame}>
                <img src={`/${img}`} />
              </div>
              <Color color="#43e1e4">
                <p>{subject}</p>
                <p className="hide">|</p>
                <p>{faction}</p>
                <p className="hide">|</p>
                <p>{date}</p>
              </Color>
            </div>
          )
        )}
    </div>
  );
};
