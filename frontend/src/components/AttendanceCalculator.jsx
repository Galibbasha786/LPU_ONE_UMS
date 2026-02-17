import React, { useState } from "react";

export default function AttendanceCalculator() {
  const [desired, setDesired] = useState(75);
  const [total, setTotal] = useState(0);
  const [attended, setAttended] = useState(0);
  const [result, setResult] = useState(null);

  const parseNumber = (v) => {
    const n = parseInt(v);
    return Number.isNaN(n) ? 0 : n;
  };

  const calculate = (e) => {
    e.preventDefault();
    const d = parseNumber(desired);
    const t = parseNumber(total);
    const a = parseNumber(attended);

    if (t <= 0) {
      setResult({ error: "Total lectures must be greater than zero." });
      return;
    }
    if (a > t) {
      setResult({ error: "Lectures attended cannot exceed total lectures." });
      return;
    }
    const currentPct = (a / t) * 100;
    if (currentPct >= d) {
      setResult({
        currentPct: currentPct.toFixed(2),
        message: `You already have ${currentPct.toFixed(2)}% attendance which meets the target of ${d}%`,
      });
      return;
    }

    if (d >= 100) {
      setResult({ error: "Target of 100% is not achievable unless you attended all future classes." });
      return;
    }

    // Solve for x in (a + x) / (t + x) >= d/100
    const target = d / 100;
    const numerator = target * t - a;
    const denom = 1 - target;
    const xRaw = numerator / denom;
    const needed = Math.max(0, Math.ceil(xRaw));

    const newAttended = a + needed;
    const newTotal = t + needed;
    const newPct = ((newAttended / newTotal) * 100).toFixed(2);

    setResult({
      currentPct: currentPct.toFixed(2),
      needed,
      newPct,
      newAttended,
      newTotal,
      message: `Attend the next ${needed} class${needed === 1 ? "" : "es"} consecutively to reach ~${d}% attendance.`,
    });
  };

  const reset = () => {
    setDesired(75);
    setTotal(0);
    setAttended(0);
    setResult(null);
  };

  return (
    <div className="attendance-calculator info-card">
      <h3 className="card-title">Attendance Calculator</h3>
      <form className="attendance-form" onSubmit={calculate}>
        <div className="form-row">
          <label>Target Attendance %</label>
          <input
            type="number"
            min="1"
            max="99"
            value={desired}
            onChange={(e) => setDesired(e.target.value)}
          />
        </div>

        <div className="form-row">
          <label>Total Lectures</label>
          <input
            type="number"
            min="0"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
          />
        </div>

        <div className="form-row">
          <label>Lectures Attended</label>
          <input
            type="number"
            min="0"
            value={attended}
            onChange={(e) => setAttended(e.target.value)}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="action-btn">Calculate</button>
          <button type="button" onClick={reset} className="action-btn">Reset</button>
        </div>
      </form>

      {result && (
        <div className="result-block">
          {result.error ? (
            <p className="error">{result.error}</p>
          ) : (
            <>
              <p><strong>Current Attendance:</strong> {result.currentPct}%</p>
              <p><strong>Target:</strong> {desired}%</p>
              {result.needed === 0 ? (
                <p className="status">You already meet the target.</p>
              ) : (
                <>
                  <p><strong>Classes to attend consecutively:</strong> {result.needed}</p>
                  <p><strong>Projected after attending:</strong> {result.newPct}% ({result.newAttended}/{result.newTotal})</p>
                  <p className="advice">Tip: Maintain regular attendance to avoid last-minute catches.</p>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
