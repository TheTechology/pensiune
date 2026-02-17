exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, message: "Method not allowed" }),
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.BOOKING_TO_EMAIL || "office@pensiuneaovidiuadjud.ro";
  const fromEmail = process.env.BOOKING_FROM_EMAIL || "Pensiunea Ovidiu <onboarding@resend.dev>";

  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: false,
        message: "Lipseste RESEND_API_KEY in environment.",
      }),
    };
  }

  let data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, message: "Payload invalid." }),
    };
  }

  const required = ["nume", "email", "telefon", "check_in", "check_out", "tip_camera"];
  const missing = required.filter((field) => !String(data[field] || "").trim());
  if (missing.length) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: false,
        message: `Campuri lipsa: ${missing.join(", ")}`,
      }),
    };
  }

  const subject = data._subject || "Cerere rezervare website - Pensiunea Ovidiu Adjud";
  const html = `
    <h2>Cerere noua de rezervare</h2>
    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-family:Arial,sans-serif;">
      <tr><td><strong>Nume</strong></td><td>${escapeHtml(data.nume)}</td></tr>
      <tr><td><strong>Email</strong></td><td>${escapeHtml(data.email)}</td></tr>
      <tr><td><strong>Telefon</strong></td><td>${escapeHtml(data.telefon)}</td></tr>
      <tr><td><strong>Check-in</strong></td><td>${escapeHtml(data.check_in)}</td></tr>
      <tr><td><strong>Check-out</strong></td><td>${escapeHtml(data.check_out)}</td></tr>
      <tr><td><strong>Adulti</strong></td><td>${escapeHtml(data.adulti || "-")}</td></tr>
      <tr><td><strong>Copii</strong></td><td>${escapeHtml(data.copii || "-")}</td></tr>
      <tr><td><strong>Tip camera</strong></td><td>${escapeHtml(data.tip_camera)}</td></tr>
      <tr><td><strong>Plan masa</strong></td><td>${escapeHtml(data.plan_masa || "-")}</td></tr>
      <tr><td><strong>Estimare</strong></td><td>${escapeHtml(data.estimare || "-")}</td></tr>
      <tr><td><strong>Observatii</strong></td><td>${escapeHtml(data.observatii || "-")}</td></tr>
    </table>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject,
        html,
        reply_to: data.email,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        statusCode: 502,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ success: false, message: text || "Email provider error." }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true }),
    };
  } catch {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, message: "Eroare server la trimiterea emailului." }),
    };
  }
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
