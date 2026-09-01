import { useMemo, useState } from "react";

const initialOperators = [
  { id: 1, name: "Maya Kareem", role: "Admin", active: true },
  { id: 2, name: "Omar Haddad", role: "Operator", active: true },
  { id: 3, name: "Nadia Salem", role: "Viewer", active: false }
];

const initialLogs = [
  {
    id: 1,
    user: "Maya Kareem",
    action: "Remote access enabled",
    time: "2026-08-31 09:12 AM",
    device: "Admin Console",
    status: "Success"
  },
  {
    id: 2,
    user: "Omar Haddad",
    action: "Gate status checked",
    time: "2026-08-31 09:35 AM",
    device: "Security iPad",
    status: "Success"
  },
  {
    id: 3,
    user: "Nadia Salem",
    action: "CCTV preview opened",
    time: "2026-08-31 09:48 AM",
    device: "Mobile Browser",
    status: "Failed"
  }
];

const gateStates = ["Closed", "Opening", "Open", "Closing", "Offline"];
const roles = ["Admin", "Operator", "Viewer"];

function formatTimestamp(date) {
  const datePart = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  }).format(date);

  return `${datePart} ${timePart}`;
}

function StatusPill({ status }) {
  const className = status.toLowerCase().replace(/\s+/g, "-");
  return <span className={`status-pill ${className}`}>{status}</span>;
}

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedLogin, setSelectedLogin] = useState("Operator");
  const [gateStatus, setGateStatus] = useState("Closed");
  const [confirmAction, setConfirmAction] = useState(null);
  const [operators, setOperators] = useState(initialOperators);
  const [logs, setLogs] = useState(initialLogs);
  const [remoteAccess, setRemoteAccess] = useState(true);
  const [newOperator, setNewOperator] = useState("");
  const [newRole, setNewRole] = useState("Operator");
  const [deviceStatus, setDeviceStatus] = useState({
    cctv: "Online",
    gate: "Online",
    network: "Stable"
  });

  const currentOperator = useMemo(() => {
    if (!currentUser) return null;
    return operators.find((operator) => operator.role === currentUser.role) || operators[0];
  }, [currentUser, operators]);

  function addLog(action, status = "Success", device = "Web Dashboard") {
    const actor = currentOperator?.name || currentUser?.name || "Security Operator";
    setLogs((existing) => [
      {
        id: Date.now(),
        user: actor,
        action,
        time: formatTimestamp(new Date()),
        device,
        status
      },
      ...existing
    ]);
  }

  function login() {
    const fallbackName = selectedLogin === "Admin" ? "Maya Kareem" : "Omar Haddad";
    setCurrentUser({ name: fallbackName, role: selectedLogin });
  }

  function openGate() {
    if (!remoteAccess || gateStatus === "Offline") {
      addLog("Gate open command blocked", "Failed");
      setConfirmAction(null);
      return;
    }

    setGateStatus("Opening");
    addLog(`Gate opened by ${currentUser.role}`);
    setConfirmAction(null);

    window.setTimeout(() => setGateStatus("Open"), 850);
  }

  function closeGate() {
    if (!remoteAccess || gateStatus === "Offline") {
      addLog("Gate close command blocked", "Failed");
      setConfirmAction(null);
      return;
    }

    setGateStatus("Closing");
    addLog(`Gate closed by ${currentUser.role}`);
    setConfirmAction(null);

    window.setTimeout(() => setGateStatus("Closed"), 850);
  }

  function addOperator(event) {
    event.preventDefault();
    const name = newOperator.trim();
    if (!name) return;

    setOperators((existing) => [
      ...existing,
      { id: Date.now(), name, role: newRole, active: true }
    ]);
    setNewOperator("");
    addLog(`Operator added: ${name}`);
  }

  function removeOperator(id, name) {
    setOperators((existing) => existing.filter((operator) => operator.id !== id));
    addLog(`Operator removed: ${name}`);
  }

  function updateRole(id, role) {
    setOperators((existing) =>
      existing.map((operator) => (operator.id === id ? { ...operator, role } : operator))
    );
    const operator = operators.find((item) => item.id === id);
    addLog(`Role updated for ${operator?.name || "operator"} to ${role}`);
  }

  function toggleOperator(id) {
    const operator = operators.find((item) => item.id === id);
    setOperators((existing) =>
      existing.map((item) => (item.id === id ? { ...item, active: !item.active } : item))
    );
    addLog(`${operator?.name || "Operator"} ${operator?.active ? "disabled" : "enabled"}`);
  }

  function cycleGateStatus() {
    const nextIndex = (gateStates.indexOf(gateStatus) + 1) % gateStates.length;
    const next = gateStates[nextIndex];
    setGateStatus(next);
    addLog(`Gate demo status changed to ${next}`);
  }

  if (!currentUser) {
    return (
      <main className="login-shell">
        <section className="login-panel">
          <div className="brand-mark">W</div>
          <p className="eyebrow">Westpoint Remote Security</p>
          <h1>Gate + CCTV access control demo</h1>
          <p className="login-copy">
            Software-only operator console for remote gate commands, CCTV visibility,
            access roles, and audit logs.
          </p>
          <div className="reference-id">Reference ID: WP-GATE-CCTV-001</div>
          <div className="login-options" role="tablist" aria-label="Login role">
            {["Operator", "Admin"].map((role) => (
              <button
                className={selectedLogin === role ? "selected" : ""}
                key={role}
                onClick={() => setSelectedLogin(role)}
                type="button"
              >
                {role}
              </button>
            ))}
          </div>
          <button className="primary-action" onClick={login} type="button">
            Sign in as {selectedLogin}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-row">
          <div className="brand-mark">W</div>
          <div>
            <strong>Westpoint</strong>
            <span>Security Control</span>
          </div>
        </div>
        <nav>
          <a href="#dashboard">Dashboard</a>
          <a href="#devices">Devices</a>
          <a href="#admin">Admin</a>
          <a href="#logs">Logs</a>
        </nav>
        <div className="operator-card">
          <span>Signed in</span>
          <strong>{currentUser.name}</strong>
          <StatusPill status={currentUser.role} />
          <button type="button" onClick={() => setCurrentUser(null)}>
            Log out
          </button>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Software demo</p>
            <h1>Remote gate and CCTV dashboard</h1>
            <div className="reference-id compact">Reference ID: WP-GATE-CCTV-001</div>
          </div>
          <div className="topbar-actions">
            <StatusPill status={remoteAccess ? "Remote Enabled" : "Remote Disabled"} />
            <button type="button" onClick={() => setRemoteAccess((value) => !value)}>
              {remoteAccess ? "Disable Remote" : "Enable Remote"}
            </button>
          </div>
        </header>

        <section className="dashboard-grid" id="dashboard">
          <article className="panel cctv-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">CCTV 01</p>
                <h2>Main entrance live preview</h2>
              </div>
              <StatusPill status={deviceStatus.cctv} />
            </div>
            <div className="camera-frame">
              <div className="camera-overlay">
                <span>WESTPOINT / GATE A</span>
                <span>{formatTimestamp(new Date())}</span>
              </div>
              <div className="gate-visual">
                <div className="road"></div>
                <div className="gate-left"></div>
                <div className="gate-right"></div>
                <div className="checkpoint"></div>
              </div>
              <div className="scan-line"></div>
            </div>
          </article>

          <article className="panel gate-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Gate controller</p>
                <h2>Gate A status</h2>
              </div>
              <button className="text-button" onClick={cycleGateStatus} type="button">
                Demo Status
              </button>
            </div>
            <div className={`gate-state ${gateStatus.toLowerCase()}`}>
              <span>{gateStatus}</span>
            </div>
            <div className="gate-actions">
              <button
                className="open-gate"
                disabled={
                  !remoteAccess ||
                  gateStatus === "Offline" ||
                  gateStatus === "Open" ||
                  gateStatus === "Opening" ||
                  gateStatus === "Closing"
                }
                onClick={() => setConfirmAction("open")}
                type="button"
              >
                Open Gate
              </button>
              <button
                className="close-gate"
                disabled={
                  !remoteAccess ||
                  gateStatus === "Offline" ||
                  gateStatus === "Closed" ||
                  gateStatus === "Opening" ||
                  gateStatus === "Closing"
                }
                onClick={() => setConfirmAction("close")}
                type="button"
              >
                Close Gate
              </button>
            </div>
            <p className="hint">
              Commands are simulated and write an audit log. No hardware connection is active.
            </p>
          </article>
        </section>

        <section className="device-grid" id="devices">
          {[
            ["CCTV System", deviceStatus.cctv, "Camera stream and recording availability"],
            ["Gate Controller", deviceStatus.gate, "Relay controller and access command channel"],
            ["Network", deviceStatus.network, "Remote tunnel and dashboard connectivity"]
          ].map(([label, status, description]) => (
            <article className="metric-card" key={label}>
              <div>
                <h3>{label}</h3>
                <p>{description}</p>
              </div>
              <StatusPill status={status} />
            </article>
          ))}
        </section>

        <section className="split-grid">
          <article className="panel" id="admin">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Admin panel</p>
                <h2>Operators and access</h2>
              </div>
              <label className="switch">
                <input
                  checked={remoteAccess}
                  onChange={() => {
                    setRemoteAccess((value) => !value);
                    addLog(`Remote access ${remoteAccess ? "disabled" : "enabled"}`);
                  }}
                  type="checkbox"
                />
                <span>Remote access</span>
              </label>
            </div>
            <form className="operator-form" onSubmit={addOperator}>
              <input
                aria-label="Operator name"
                onChange={(event) => setNewOperator(event.target.value)}
                placeholder="Operator name"
                value={newOperator}
              />
              <select
                aria-label="Operator role"
                onChange={(event) => setNewRole(event.target.value)}
                value={newRole}
              >
                {roles.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
              <button type="submit">Add</button>
            </form>
            <div className="operator-list">
              {operators.map((operator) => (
                <div className="operator-row" key={operator.id}>
                  <div>
                    <strong>{operator.name}</strong>
                    <span>{operator.active ? "Active" : "Disabled"}</span>
                  </div>
                  <select
                    aria-label={`${operator.name} role`}
                    onChange={(event) => updateRole(operator.id, event.target.value)}
                    value={operator.role}
                  >
                    {roles.map((role) => (
                      <option key={role}>{role}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => toggleOperator(operator.id)}>
                    {operator.active ? "Disable" : "Enable"}
                  </button>
                  <button type="button" onClick={() => removeOperator(operator.id, operator.name)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </article>

          <article className="panel" id="logs">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Activity logs</p>
                <h2>Recent events</h2>
              </div>
              <StatusPill status={`${logs.length} Events`} />
            </div>
            <div className="log-table">
              <div className="log-row header">
                <span>User</span>
                <span>Action</span>
                <span>Time</span>
                <span>Device</span>
                <span>Status</span>
              </div>
              {logs.map((log) => (
                <div className="log-row" key={log.id}>
                  <span>{log.user}</span>
                  <span>{log.action}</span>
                  <span>{log.time}</span>
                  <span>{log.device}</span>
                  <span>
                    <StatusPill status={log.status} />
                  </span>
                </div>
              ))}
            </div>
          </article>
        </section>
      </section>

      {confirmAction && (
        <div className="modal-backdrop" role="presentation">
          <section aria-labelledby="confirm-title" className="confirm-modal" role="dialog">
            <p className="eyebrow">Confirm command</p>
            <h2 id="confirm-title">
              {confirmAction === "open" ? "Open Gate A?" : "Close Gate A?"}
            </h2>
            <p>
              This demo will simulate a remote gate {confirmAction} command and record the
              operator, device, time, and result in the activity log.
            </p>
            <div className="modal-actions">
              <button onClick={() => setConfirmAction(null)} type="button">
                Cancel
              </button>
              <button
                className="primary-action"
                onClick={confirmAction === "open" ? openGate : closeGate}
                type="button"
              >
                {confirmAction === "open" ? "Confirm Open" : "Confirm Close"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
