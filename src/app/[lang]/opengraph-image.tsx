import { ImageResponse } from "next/og";

export const alt = "Archai Solutions";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "edge";

export default async function OGImage({
  params,
}: {
  params: { lang: string };
}) {
  const ar = params.lang === "ar";
  const title = ar ? "اكتشف مشاريعنا الرقمية" : "Explore Our Digital Projects";
  const subtitle = ar
    ? "حلول برمجية · ذكاء اصطناعي · أنظمة مدمجة"
    : "Software · AI · Embedded · IoT";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          color: "#ffffff",
          background:
            "linear-gradient(135deg, #0E1317 0%, #2c1679 45%, #084F67 100%)",
          position: "relative",
          overflow: "hidden",
          fontFamily: ar ? "Arial" : "Arial, sans-serif",
          direction: ar ? "rtl" : "ltr",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "620px",
            height: "620px",
            right: ar ? "auto" : "-160px",
            left: ar ? "-160px" : "auto",
            top: "-220px",
            borderRadius: "50%",
            border: "2px solid rgba(46,210,255,.5)",
            boxShadow: "0 0 0 60px rgba(46,210,255,.08)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            fontSize: 22,
            letterSpacing: "5px",
            color: "#cbfff6",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 16,
              color: "white",
              fontSize: 30,
              fontWeight: 700,
              background: "linear-gradient(135deg, #2ED2FF, #2ED2FF)",
            }}
          >
            A
          </div>
          ARCHAI SOLUTIONS
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            maxWidth: 980,
          }}
        >
          <div
            style={{
              fontSize: 72,
              lineHeight: 1.1,
              fontWeight: 700,
              letterSpacing: "-2px",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 30,
              color: "#8AE8FF",
              fontWeight: 600,
            }}
          >
            {subtitle}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 18,
            letterSpacing: 3,
            color: "#2ED2FF",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 10,
              background: "#2ED2FF",
              boxShadow: "0 0 20px #2ED2FF",
            }}
          />
          {ar ? "الأنظمة المتكاملة" : "INTEGRATED SYSTEMS"}
        </div>
      </div>
    ),
    { ...size }
  );
}