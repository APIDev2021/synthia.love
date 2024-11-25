import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { css, keyframes } from "@emotion/react";
import { Canvas, useFrame } from "@react-three/fiber";
import styled from "@emotion/styled";
import {
  TextureLoader,
  ShaderMaterial,
  Vector2,
  CustomBlending,
  SrcAlphaFactor,
  OneMinusSrcAlphaFactor,
  AddEquation,
} from "three";
import useAudioHook from "./hooks/useAudioHook";
import { PointAndClick } from "./PointAndClick";
import { Color } from "./Color";
import messages from "./messages.json";
import { Margin } from "./Margin";
import Terminal from "./Terminal";
import { Messages } from "./Messages";
import useMatchMedia from "./hooks/useMatchMedia";
import { useLocalStorage } from "./hooks/useLocalStorageHook";
import { AppContext } from "./context/appContext";
import { Button } from "./Button";
import { Heading } from "./Heading";
import {
  Bar,
  BarInner,
  BodyImg,
  ContentRow,
  ContentRowReverse,
  Headline,
} from "./styled/App";
import { useMainStore } from "./store";

const terminalWrap = css`
  width: 100%;
  height: 100%;

  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow-x: hidden;
`;

const content = css`
  max-width: 1440px;
  margin: auto;
  margin-top: 4rem;
  padding: 2rem;
`;

const previewImage = css`
  width: calc(33%);
  height: auto;
  align-self: center;

  image-rendering: pixelated;
`;
const previewImage2 = css(
  previewImage,
  `
    width: calc(50%);
    height: auto;
    align-self: center;
  `
);

const previewImageWrap = css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
`;

const terminalImg = css`
  position: absolute;
  height: 100%;
  width: auto;
  top: 0;

  right: 0;
  bottom: 0;
  margin: auto;

  left: 0%;
  @media (max-width: 1440px) {
    left: 50%;
    transform: translateX(-50%);
  }
`;

const menu = css`
  width: 100%;
  height: 100px;
  max-width: 1440px;
  background-image: url(/menu-mid.png);
  background-repeat-x: repeat;
  background-repeat-y: no-repeat;

  z-index: 10;
  position: relative;
`;

const pixelated = css`
  image-rendering: pixelated;
`;

const menuImg = css(
  pixelated,
  `
    position: absolute;
    top: 0;
  `
);

const menuImgLeft = css`
  ${menuImg}
  left:0;
`;

const menuImgRight = css`
  ${menuImg}
  right:0;
`;

const menuInner = css`
  position: relative;
  z-index: 10;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  color: white;
  gap: 1rem;
  padding: 0 50px;
  height: calc(100% - 20px);
`;

const vertexShader = `
  uniform vec2 mouse;
  
    varying vec2 vUv;
  
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

const fragmentShader = `
  uniform vec2 mouse;
      uniform sampler2D tDiffuse;
      uniform vec2 resolution;
      uniform float time;
  
      varying vec2 vUv;
  
      float filmGrain(vec2 uv, float amount) {
        float randomValue = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453123);
        return randomValue * amount;
    }
  
      vec3 chromaticAberration(vec2 uv, vec4 color, float amount) {
        vec4 redChannel = texture2D(tDiffuse, uv + vec2(amount, 0.0));
        vec4 greenChannel = texture2D(tDiffuse, uv);
        vec4 blueChannel = texture2D(tDiffuse, uv - vec2(amount, 0.0));
        return vec3(redChannel.r, greenChannel.g, blueChannel.b);
    }
  
      // Function to create an old TV monitor effect
      float oldTvMonitorEffect(vec2 uv) {
        float scanline = sin((uv.y + time * 0.2) * resolution.y * 2.0);
        float randomValue = fract(sin(dot(uv * (1.0 + sin(time * 0.5)), vec2(12.9898, 78.233))) * 43758.5453123);
        float noise = clamp(randomValue, 0.0, 1.0);
        return clamp(scanline * noise, 0.0, 1.0);
      }
  
      // Function to create a glitch effect
      vec2 glitchEffect(vec2 uv) {
        float glitchAmount = sin(time * 5.0) * 0.2;
        uv.x += step(0.9, sin(uv.y * 50.0 + time * 10.0)) * glitchAmount;
        return uv;
      }
  
      // Function to increase brightness
      vec3 increaseBrightness(vec3 color, float amount) {
        return color * (1.0 + amount);
      }
  
      void main() {
        vec2 uv = vUv;
      
        // Get the original image color
        vec4 imageColor = texture2D(tDiffuse, uv);
      
        // If the alpha channel is above the threshold, apply the effects
        if (imageColor.a > 0.1) {
          // Apply the glitch effect
          uv = glitchEffect(uv);
      
          // Get the image color after applying the glitch effect
          imageColor = texture2D(tDiffuse, uv);
      
          // Apply chromatic aberration
          float aberrationAmount = 0.005;
          imageColor.rgb = chromaticAberration(uv, imageColor, aberrationAmount);
      
          // Apply the old TV monitor effect
          float tvEffect = oldTvMonitorEffect(uv);
          imageColor.rgb *= tvEffect;
      
          // Increase brightness
          float brightnessAmount = 1.5;
          imageColor.rgb = increaseBrightness(imageColor.rgb, brightnessAmount);
        }
      
        gl_FragColor = imageColor;
      }
  `;

const bobbing = keyframes`
    0%, 100% {
      background-color: #1ae5d4;
  
      transform: translateY(-10px);
    }
  
    50% {
      background-color: red;
  
      transform: translateY(-20px);
    }
  `;
const bobbingAnimationAltKeyframes = keyframes`
    0%, 100% {
      background-color: #1ae5d4;
  
    }
  
    50% {
      background-color: red;
  
    }
  `;

const bobbingAnimation = css`
  background-color: #1ae5d4;
  filter: blur(10px);
  width: 25px;
  height: 25px;
  animation: ${bobbing} 2s ease-in-out infinite;
`;

const bobbingAnimationAlt = css(bobbingAnimation, {
  animation: `${bobbingAnimationAltKeyframes} 2s ease-in-out infinite`,
  width: "18px",
  height: "18px",
  transform: "translateY(50%)",
  filter: "blur(5px)",
});

const bootloaderImg = css`
  text-align: center;
  margin-top: 20px;
  overflow: hidden;
  border-radius: 10px;
  & img {
    width: 100%;
    max-width: 250px;
  }
`;

const navRight = css`
  display: flex;
  align-items: center;
  gap: 2rem;
  & img {
    height: 30px;
  }
`;

const hideAtSmall = css`
  @media (max-width: 500px) {
    display: none;
  }
`;

const logo = css(pixelated, hideAtSmall);

function Screen({ screenTexture }: any) {
  const shaderMaterial = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          tDiffuse: { value: screenTexture },
          resolution: {
            value: new Vector2(window.innerWidth, window.innerHeight),
          },
          time: { value: 0 },
        },
        vertexShader,
        fragmentShader,
        transparent: true, // Make sure this is set to true
        blending: CustomBlending, // Add this line
        blendSrc: SrcAlphaFactor, // Add this line
        blendDst: OneMinusSrcAlphaFactor, // Add this line
        blendEquation: AddEquation, // Add this line
      }),
    [screenTexture]
  );

  useFrame((state) => {
    shaderMaterial.uniforms.time.value = state.clock.elapsedTime;
  });

  const meshRef = useRef<any>();

  // Set the y position of the mesh here
  useEffect(() => {
    meshRef.current.position.y = 0.001; // Adjust this value to move the image up or down
  }, []);

  return (
    <mesh ref={meshRef} material={shaderMaterial}>
      <planeBufferGeometry args={[2, 2]} />
    </mesh>
  );
}

const Left1 = styled.div`
  padding-right: 2rem;
  padding-top: 1rem;
  @media (max-width: 750px) {
    padding: 0;
  }
`;

function Home() {
  const [screenTexture, setScreenTexture] = useState(null);
  const isSmallScreen = useMatchMedia("(max-width: 767px)");
  const updateTerminalOpen = useMainStore((s) => s.updateTerminalOpen);

  useEffect(() => {
    const textureLoader = new TextureLoader();
    textureLoader.load("/screen.png", (texture: any) => {
      setScreenTexture(texture);
    });
  }, []);

  const { play, pause, playing } = useAudioHook("/tech-background.mp3", true);
  const {
    play: play2,
    pause: pause2,
    playing: playing2,
  } = useAudioHook("/power-buzz-sfx-loop-2.mp3", true);

  const {
    play: play3,
    pause: pause3,
    playing: playing3,
  } = useAudioHook("/computerized.mp3", true);

  const [msgSoundPath, updateMsgSoundPath] = useState<string>();

  return (
    <>
      <div
        onClick={() => {
          if (!playing) {
            play?.();
          }
          if (!playing2) {
            play2?.();
          }
          if (!playing3) {
            play3?.();
          }
        }}
        css={terminalWrap}
      >
        <img css={terminalImg} src="/terminal-art.png" />
        {screenTexture && (
          <div style={{ position: "absolute", width: "100%", height: "100%" }}>
            <Canvas
              gl={{ alpha: true }}
              camera={{
                fov: 75,
                near: 0.1,
                far: 1000,
                position: [0, 0, 1.25],
              }}
            >
              <Screen screenTexture={screenTexture} />
            </Canvas>
          </div>
        )}
        <PointAndClick
          // Terminal
          w={367.6430020452}
          h={277.2900608646}
          x={330.4787018594}
          y={308.4462474786}
          onClick={() => updateTerminalOpen(true)}
        ></PointAndClick>
        <PointAndClick
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
          // Message pad
          w={100.0000389498}
          h={62.612511159}
          x={70}
          y={756.2068641319}
          visibleContent={<div css={bobbingAnimation}></div>}
        >
          <Messages />
        </PointAndClick>
        {!isSmallScreen && (
          <PointAndClick
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
            }}
            // Message pad
            w={100.0000389498}
            h={62.612511159}
            x={70}
            y={756.2068641319}
            visibleContent={<div css={bobbingAnimation}></div>}
          >
            <Messages />
          </PointAndClick>
        )}
        {isSmallScreen && (
          <PointAndClick
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
            }}
            // Message pad
            w={39.9010186335}
            h={39.9010186335}
            x={463.0388074534 - 30}
            y={637.8788571429}
            soundPath={msgSoundPath}
            visibleContent={<div css={bobbingAnimationAlt}></div>}
          >
            <Messages />
          </PointAndClick>
        )}
        <PointAndClick
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
          // Message pad
          y={634.6982556071}
          x={480}
          w={69.5821501046}
          h={39.7646409754}
        >
          <Color color="#43e1e4">
            <div css={bootloaderImg}>
              <img src="/bootloader.gif" />
            </div>
          </Color>
        </PointAndClick>
        <PointAndClick
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
          // soundPath="/bootloader.mp3"
          // Message pad
          y={541}
          x={1160}
          w={35}
          h={39}
        >
          <img
            style={{ maxWidth: "100%", marginTop: "5rem" }}
            src="/synthia-portrait.png"
          />
        </PointAndClick>
      </div>
      {/* <div css={content}>
        <Headline>
          <Heading>Six factions remain.</Heading>
          <Heading>Which one will you join?</Heading>
        </Headline>
        <Margin margin="5rem 0">
          <ContentRow>
            {" "}
            <Left1>
              <Color color="#FFF">
                <p>
                  In a shattered world ravaged by the malevolent Nethria,
                  humanity finds solace in Nethria 's virtual refuge. Unite with
                  intriguing factions, each embracing unique perspectives and
                  goals, as together we strive to ensure the survival and future
                  of humankind.
                </p>
              </Color>
              <Margin margin="2rem 0">
                <Button onClick={() => updateTerminalOpen(true)}>
                  MINT NOW
                </Button>
              </Margin>
            </Left1>
            <div css={previewImageWrap}>
              <img css={previewImage} src="/preview-1.png" />
              <img css={previewImage} src="/preview-2.png" />
              <img css={previewImage} src="/preview-3.png" />
            </div>
          </ContentRow>
        </Margin>
      </div>
      <Bar>
        <BarInner>
          <Heading>Customizable NFTs</Heading>
          <Heading>100% Onchain</Heading>
          <Heading>CC0 Licensed Art</Heading>
        </BarInner>
      </Bar>
      <div css={content}>
        <ContentRow>
          <Left1>
            <Heading h2>Customizable NFTs</Heading>
            <Margin margin="2rem 0">
              <Color color="#FFF">
                <p>
                  Collect a helmet, facemask, or cybernetic vision goggles from
                  your favorite artists. All stored on-chain.
                </p>

                <p>Coming soon.</p>
              </Color>
            </Margin>
          </Left1>
          <div>
            <div css={previewImageWrap}>
              <img css={previewImage2} src="/custom-1.png" />
              <img css={previewImage2} src="/custom-2.png" />
            </div>
            <Color color="#FFF">
              <p style={{ textAlign: "center" }}>
                Custom traits by{" "}
                <a target="_blank" href="https://twitter.com/facuserif">
                  @Facu
                </a>
              </p>
            </Color>
          </div>
        </ContentRow>
        <Margin margin="5rem 0">
          <ContentRowReverse>
            <div css={previewImageWrap}>
              <BodyImg src="/body.png" />
            </div>
            <div>
              <Heading h2>100% Onchain</Heading>1
              <Margin margin="2rem 0">
                <Color color="#FFF">
                  <p>
                    Nethria NFTs are created and rendered entirely onchain. When
                    you mint a Nethria NFT, a random seed is generated that
                    determines the traits of your Nethria Virtual Identity.
                  </p>
                  <p>
                    Spritesheets are stored on Ethereum and different
                    coordiantes within the spritesheets are used to layer
                    together the Nethria NFT image. Most traits are grayscale
                    and we use SVG filters to color traits directly onchain.
                  </p>
                </Color>
              </Margin>
            </div>
          </ContentRowReverse>
        </Margin>

        <Margin margin="5rem 0">
          <ContentRow>
            <div>
              <Heading h2>CC0 Licensed Art</Heading>
              <Heading h3>+ Dep ecosystem</Heading>
              <Margin margin="2rem 0">
                <Color color="#FFF">
                  <p>
                    Nethria NFTs are licensed as CC0. We are champions of CC0
                    onchain assets. These NFTs usher in a new paradigm for
                    collaborative world building that has yet to be fully
                    realized. We believe that these types of projects are the
                    future of gaming and stories.
                  </p>
                  <p>
                    Nethria is part of the Dep ecosystem, a web3 CC0 driven
                    gaming ecosystem along with{" "}
                    <a href="https://heroes.fun" target="_blank">
                      Heroes
                    </a>
                    . Dep is creating a CC0 multiverse.
                  </p>
                </Color>
              </Margin>
            </div>
            <div css={previewImageWrap}>
              <img style={{ maxWidth: "100%" }} src="/dep-logo.png" />
            </div>
          </ContentRow>
        </Margin>
      </div> */}
    </>
  );
}

export default Home;
