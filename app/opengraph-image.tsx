import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { messages } from "@/content/messages";

export const alt = "Auto Botics — Technology should work for you, not the other way around.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logo = await readFile(join(process.cwd(), "public/logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  // Quiet Node Grid (brand element A): navy dots at low opacity, one cyan path
  const dots = [];
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 6; c++) {
      dots.push(
        <div
          key={`${r}-${c}`}
          style={{
            position: "absolute",
            left: 860 + c * 52,
            top: 110 + r * 64,
            width: 6,
            height: 6,
            borderRadius: 3,
            background: "rgba(16,42,67,0.14)",
          }}
        />,
      );
    }
  }

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#FFFFFF", position: "relative" }}>
        {dots}
        <div style={{ position: "absolute", left: 912, top: 239, width: 158, height: 3, background: "#19B8E6" }} />
        <div style={{ position: "absolute", left: 1067, top: 239, width: 3, height: 131, background: "#19B8E6" }} />
        <div style={{ position: "absolute", left: 906, top: 233, width: 15, height: 15, borderRadius: 8, background: "#19B8E6" }} />

        <div style={{ display: "flex", flexDirection: "column", padding: "64px 72px", width: 820 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={223} height={120} alt="" />
          <div
            style={{
              marginTop: 48,
              fontSize: 60,
              fontWeight: 700,
              lineHeight: 1.1,
              color: "#102A43",
              letterSpacing: "-0.02em",
            }}
          >
            {messages.tagline}
          </div>
          <div style={{ marginTop: 28, fontSize: 32, fontWeight: 700, color: "#1677E8" }}>{messages.promise}</div>
          <div style={{ marginTop: 20, fontSize: 24, color: "#486581" }}>AI Agents • Automation • Chatbots</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
