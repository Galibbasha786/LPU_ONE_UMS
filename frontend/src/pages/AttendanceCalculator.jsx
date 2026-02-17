import React, { useState } from "react";

export default function AttendanceCalculator() {
  const [total, setTotal] = useState(120);
  const [attended, setAttended] = useState(83);
  const [result, setResult] = useState(null);
  const TARGET = 75; // Fixed at 75%

  const parseNumber = (v) => {
    const n = parseInt(v);
    return Number.isNaN(n) ? 0 : n;
  };

  const calculate = (e) => {
    e.preventDefault();
    
    const t = parseNumber(total);
    const a = parseNumber(attended);

    // Validation
    if (t <= 0) {
      setResult({ error: "Total lectures must be greater than zero." });
      return;
    }
    
    if (a < 0 || t < 0) {
      setResult({ error: "Values cannot be negative." });
      return;
    }
    
    if (a > t) {
      setResult({ error: "Lectures attended cannot exceed total lectures." });
      return;
    }

    // Calculate current percentage
    const currentPct = (a / t) * 100;
    
    // Classes left (FIXED total)
    const classesLeft = t - a;
    
    // Required attendance to reach 75% of FIXED total
    const requiredFor75 = Math.ceil(0.75 * t);
    
    if (a >= requiredFor75) {
      // Already at or above 75%
      // Calculate how many can be bunked from remaining classes
      // Need to maintain: a / t >= 0.75 (but t is fixed, so a is fixed)
      // Actually, if you're already above 75%, you can bunk all remaining classes
      // because total is fixed, your attendance % won't change if you don't attend more
      
      const currentExcess = a - requiredFor75;
      
      setResult({
        currentPct: currentPct.toFixed(2),
        status: "above",
        classesLeft: classesLeft,
        message: `You already have ${currentPct.toFixed(2)}% which is above 75%`,
        canBunk: classesLeft,
        needToAttend: 0,
        bunkMessage: `You can bunk ALL ${classesLeft} remaining classes and still have ${currentPct.toFixed(2)}% attendance`,
        finalBreakdown: `Final: ${a}/${t} = ${currentPct.toFixed(2)}%`
      });
    } else {
      // Need to attend some to reach 75% of FIXED total
      // Required attended for 75% = 0.75 * t
      // Need to attend = required - already attended
      
      const requiredAttended = Math.ceil(0.75 * t);
      const needToAttend = requiredAttended - a;
      const canBunk = classesLeft - needToAttend;
      
      // Calculate final numbers
      const finalAttended = a + needToAttend;
      const finalPct = ((finalAttended / t) * 100).toFixed(2);
      
      setResult({
        currentPct: currentPct.toFixed(2),
        status: "below",
        classesLeft: classesLeft,
        needToAttend: needToAttend,
        canBunk: canBunk,
        requiredFor75: requiredAttended,
        message: `To reach 75% of ${t} total classes:`,
        attendMessage: `✓ Attend: ${needToAttend} out of ${classesLeft} remaining classes`,
        bunkMessage: `✗ Bunk: ${canBunk} out of ${classesLeft} remaining classes`,
        finalBreakdown: `Final: ${finalAttended}/${t} = ${finalPct}%`
      });
    }
  };

  const reset = () => {
    setTotal(120);
    setAttended(83);
    setResult(null);
  };

  return (
    <div className="attendance-calculator info-card">
      <h3 className="card-title">📊 75% Attendance Calculator</h3>
      <p className="subtitle">Fixed total classes - Plan your remaining classes</p>
      
      <form className="attendance-form" onSubmit={calculate}>
        <div className="form-row">
          <label>Total Classes (Fixed):</label>
          <input
            type="number"
            min="1"
            step="1"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            placeholder="e.g., 120"
          />
        </div>

        <div className="form-row">
          <label>Classes Attended So Far:</label>
          <input
            type="number"
            min="0"
            step="1"
            value={attended}
            onChange={(e) => setAttended(e.target.value)}
            placeholder="e.g., 83"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="action-btn calculate">
            Calculate
          </button>
          <button type="button" onClick={reset} className="action-btn reset">
            Reset
          </button>
        </div>
      </form>

      {result && (
        <div className="result-block">
          {result.error ? (
            <p className="error">{result.error}</p>
          ) : (
            <>
              <div className="current-status">
                <p><strong>📈 Current:</strong> {result.currentPct}% ({attended}/{total})</p>
                <p><strong>📚 Classes Remaining:</strong> {result.classesLeft}</p>
                <p><strong>🎯 Target:</strong> 75% of {total} classes = {Math.ceil(0.75 * total)} classes</p>
              </div>

              <div className="breakdown">
                {result.status === "above" ? (
                  <div className="above-plan">
                    <p className="success">✅ {result.message}</p>
                    <div className="bunk-box">
                      <span className="check">✓</span>
                      <span className="text">
                        <strong>You can bunk all {result.canBunk} remaining classes!</strong>
                      </span>
                    </div>
                    <p className="info">{result.bunkMessage}</p>
                    <p className="final">{result.finalBreakdown}</p>
                  </div>
                ) : (
                  <div className="below-plan">
                    <p className="message">{result.message}</p>
                    
                    <div className="plan-details">
                      <div className="attend-box">
                        <span className="check">✓</span>
                        <div className="text">
                          <strong>ATTEND:</strong> {result.needToAttend} classes
                          <small>(to reach {result.requiredFor75} total attended)</small>
                        </div>
                      </div>
                      
                      <div className="bunk-box">
                        <span className="cross">✗</span>
                        <div className="text">
                          <strong>BUNK:</strong> {result.canBunk} classes
                          <small>(you can skip these)</small>
                        </div>
                      </div>
                    </div>
                    
                    <div className="summary">
                      <p><strong>Out of {result.classesLeft} remaining classes:</strong></p>
                      <p>• {result.attendMessage}</p>
                      <p>• {result.bunkMessage}</p>
                      <p className="final">{result.finalBreakdown}</p>
                    </div>
                    
                    <div className="visualization">
                      <p><strong>Your remaining {result.classesLeft} classes:</strong></p>
                      <div className="progress-bars">
                        <div 
                          className="attend-bar" 
                          style={{width: `${(result.needToAttend/result.classesLeft)*100}%`}}
                        >
                          {result.needToAttend} to Attend
                        </div>
                        <div 
                          className="bunk-bar" 
                          style={{width: `${(result.canBunk/result.classesLeft)*100}%`}}
                        >
                          {result.canBunk} to Bunk
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        .subtitle {
          color: #666;
          font-size: 0.9rem;
          margin-top: -0.5rem;
          margin-bottom: 1rem;
        }
        
        .breakdown {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 8px;
          margin: 1rem 0;
        }
        
        .current-status {
          background: #e9ecef;
          padding: 0.75rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }
        
        .current-status p {
          margin: 0.25rem 0;
        }
        
        .plan-details {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin: 1.5rem 0;
        }
        
        .attend-box, .bunk-box {
          display: flex;
          align-items: flex-start;
          padding: 1rem;
          border-radius: 6px;
          font-size: 1.1rem;
        }
        
        .attend-box {
          background: #d4edda;
          color: #155724;
          border-left: 4px solid #28a745;
        }
        
        .bunk-box {
          background: #fff3cd;
          color: #856404;
          border-left: 4px solid #ffc107;
        }
        
        .check {
          color: #28a745;
          font-weight: bold;
          margin-right: 1rem;
          font-size: 1.3rem;
        }
        
        .cross {
          color: #dc3545;
          font-weight: bold;
          margin-right: 1rem;
          font-size: 1.3rem;
        }
        
        .text {
          flex: 1;
        }
        
        .text small {
          display: block;
          font-size: 0.85rem;
          margin-top: 0.25rem;
          opacity: 0.8;
        }
        
        .summary {
          background: #e9ecef;
          padding: 1rem;
          border-radius: 4px;
          margin: 1rem 0;
        }
        
        .final {
          font-weight: bold;
          color: #007bff;
          margin-top: 0.5rem;
          font-size: 1.1rem;
        }
        
        .visualization {
          margin-top: 1.5rem;
        }
        
        .progress-bars {
          display: flex;
          height: 50px;
          border-radius: 6px;
          overflow: hidden;
          margin-top: 0.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .attend-bar {
          background: #28a745;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          font-weight: bold;
          transition: width 0.3s ease;
        }
        
        .bunk-bar {
          background: #ffc107;
          color: #856404;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          font-weight: bold;
          transition: width 0.3s ease;
        }
        
        .action-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          margin: 0 0.25rem;
        }
        
        .action-btn.calculate {
          background: #007bff;
          color: white;
        }
        
        .action-btn.calculate:hover {
          background: #0056b3;
        }
        
        .action-btn.reset {
          background: #6c757d;
          color: white;
        }
        
        .action-btn.reset:hover {
          background: #545b62;
        }
        
        .success {
          color: #155724;
          background: #d4edda;
          padding: 0.75rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }
        
        .info {
          color: #004085;
          background: #cce5ff;
          padding: 0.5rem;
          border-radius: 4px;
          margin-top: 0.5rem;
        }
        
        .message {
          font-size: 1.1rem;
          margin-bottom: 1rem;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}