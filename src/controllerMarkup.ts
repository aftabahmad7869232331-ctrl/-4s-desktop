import { KEYBOARD_KEYS } from "./appData";

export function createControllerMarkup(title: string, description: string, note: string) {
    const keys = [...KEYBOARD_KEYS, "Space", "Back", "Desk", "Tasks"];
    return `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>4S Controller</title>
          <style>
            * { box-sizing: border-box; }
            html, body { min-height: 100%; }
            body { margin: 0; background: #f8f4ec; color: #0f172a; font-family: Arial, sans-serif; }
            .shell { width: min(100vw, 420px); min-height: 100vh; background: #f8f4ec; }
            header { background: #065f46; color: white; padding: 14px 16px; }
            h1 { margin: 0; font-size: 18px; }
            p { margin: 6px 0 0; color: #d1fae5; font-size: 12px; line-height: 1.4; }
            main { padding: 14px; }
            .grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; }
            button { min-height: 42px; border: 1px solid #cbd5e1; border-radius: 8px; background: white; color: #0f172a; font-weight: 800; cursor: pointer; }
            button:active { transform: scale(.98); }
            .wide { grid-column: span 2; background: #111827; color: white; border-color: #111827; }
            .green { grid-column: span 2; background: #047857; color: white; border-color: #047857; }
            .note { margin-top: 12px; border: 1px solid #fde68a; background: #fffbeb; color: #78350f; border-radius: 8px; padding: 10px; font-size: 12px; line-height: 1.45; }
            @media (max-width: 760px) {
              .shell { width: 100vw; }
              main { padding: 12px; }
              .grid { gap: 7px; }
              button { min-height: 44px; }
            }
          </style>
        </head>
        <body>
          <div class="shell">
            <header>
              <h1>${title}</h1>
              <p>${description}</p>
            </header>
            <main>
              <div class="grid">
                ${keys.map((key) => {
                  const command = key === "Space" ? "space" : key === "Back" ? "back" : key === "Desk" ? "desk" : key === "Tasks" ? "tasks" : "append";
                  const value = command === "append" ? key : "";
                  const className = key === "Space" || key === "Back" ? "wide" : key === "Desk" || key === "Tasks" ? "green" : "";
                  return `<button class="${className}" data-command="${command}" data-value="${value}">${key}</button>`;
                }).join("")}
              </div>
              <div class="note">${note}</div>
            </main>
          </div>
          <script>
            const channel = "BroadcastChannel" in window ? new BroadcastChannel("4s-controller") : null;
            function send(command, value) {
              const payload = { command, value, time: Date.now() };
              if (channel) channel.postMessage(payload);
              localStorage.setItem("4s_controller_command", JSON.stringify(payload));
            }
            document.addEventListener("click", (event) => {
              const button = event.target.closest("button");
              if (!button) return;
              send(button.dataset.command, button.dataset.value || "");
            });
          </script>
        </body>
      </html>
    `;
}
