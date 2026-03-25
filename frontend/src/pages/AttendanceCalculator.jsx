import React, { useState, useEffect } from "react";

export default function AttendanceCalculator() {
  const [total, setTotal] = useState(120);
  const [attended, setAttended] = useState(83);
  const [result, setResult] = useState(null);
  const [requiredPercentage, setRequiredPercentage] = useState(75);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [user, setUser] = useState(null);
  const TARGET = requiredPercentage;

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
    
    // If user has attendance data, pre-fill
    if (storedUser?.attendance) {
      const attendancePercent = parseInt(storedUser.attendance);
      if (!isNaN(attendancePercent)) {
        // This is just for reference, actual calculation needs total classes
      }
    }
  }, []);

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
    const targetPct = TARGET;
    
    // Calculate required attendance to reach target
    const requiredAttended = Math.ceil((targetPct / 100) * t);
    
    if (a >= requiredAttended) {
      // Already at or above target
      const canBunk = a - requiredAttended;
      const bunkPercentage = (canBunk / t) * 100;
      
      setResult({
        currentPct: currentPct.toFixed(2),
        status: "above",
        targetPct: targetPct,
        totalClasses: t,
        attended: a,
        classesLeft: t - a,
        canBunk: canBunk,
        needToAttend: 0,
        requiredAttended: requiredAttended,
        message: `✅ You already have ${currentPct.toFixed(2)}% which is above ${targetPct}%`,
        bunkMessage: `You can bunk ${canBunk} more classes (${bunkPercentage.toFixed(1)}% of total) and still maintain ${targetPct}%`,
        finalBreakdown: `Final: ${a}/${t} = ${currentPct.toFixed(2)}%`,
        excess: canBunk
      });
    } else {
      // Need to attend some to reach target
      const needToAttend = requiredAttended - a;
      const canBunk = (t - a) - needToAttend;
      const finalAttended = a + needToAttend;
      const finalPct = ((finalAttended / t) * 100).toFixed(2);
      
      // Calculate additional details
      const attendanceGap = targetPct - currentPct;
      const classesToIncrease = Math.ceil((attendanceGap / 100) * t);
      
      setResult({
        currentPct: currentPct.toFixed(2),
        status: "below",
        targetPct: targetPct,
        totalClasses: t,
        attended: a,
        classesLeft: t - a,
        needToAttend: needToAttend,
        canBunk: canBunk,
        requiredAttended: requiredAttended,
        attendanceGap: attendanceGap.toFixed(2),
        classesToIncrease: classesToIncrease,
        message: `To reach ${targetPct}% of ${t} total classes:`,
        attendMessage: `✓ You need to attend ${needToAttend} more classes`,
        bunkMessage: `✗ You can bunk ${canBunk} out of ${t - a} remaining classes`,
        finalBreakdown: `Final: ${finalAttended}/${t} = ${finalPct}%`,
        required: needToAttend
      });
    }
  };

  const reset = () => {
    setTotal(120);
    setAttended(83);
    setRequiredPercentage(75);
    setResult(null);
  };

  const fillSample = () => {
    setTotal(150);
    setAttended(95);
    calculate(new Event('submit'));
  };

  const getCurrentAttendanceStatus = () => {
    if (!user?.attendance) return null;
    const percent = parseInt(user.attendance);
    if (percent >= 75) return { text: "Safe", color: "#10b981", icon: "✅" };
    if (percent >= 60) return { text: "At Risk", color: "#f59e0b", icon: "⚠️" };
    return { text: "Critical", color: "#ef4444", icon: "🔴" };
  };

  const status = getCurrentAttendanceStatus();

  return (
    <div className="attendance-calculator" style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>📊 Attendance Calculator</h3>
        <p style={styles.subtitle}>Plan your remaining classes to reach target attendance</p>
      </div>

      {user?.attendance && (
        <div style={styles.currentStatus}>
          <div style={styles.statusBadge}>
            <span>{status.icon}</span>
            <span style={{ color: status.color, fontWeight: "bold" }}>Current: {user.attendance}</span>
            <span style={{ color: status.color }}>({status.text})</span>
          </div>
        </div>
      )}
      
      <form onSubmit={calculate} style={styles.form}>
        <div style={styles.formRow}>
          <label style={styles.label}>Total Classes (Fixed):</label>
          <input
            type="number"
            min="1"
            step="1"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            placeholder="e.g., 120"
            style={styles.input}
          />
        </div>

        <div style={styles.formRow}>
          <label style={styles.label}>Classes Attended So Far:</label>
          <input
            type="number"
            min="0"
            step="1"
            value={attended}
            onChange={(e) => setAttended(e.target.value)}
            placeholder="e.g., 83"
            style={styles.input}
          />
        </div>

        {showAdvanced && (
          <div style={styles.formRow}>
            <label style={styles.label}>Target Percentage (%):</label>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={requiredPercentage}
              onChange={(e) => setRequiredPercentage(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
              placeholder="75"
              style={styles.input}
            />
          </div>
        )}

        <div style={styles.formActions}>
          <button type="submit" style={styles.calculateBtn}>
            Calculate
          </button>
          <button type="button" onClick={reset} style={styles.resetBtn}>
            Reset
          </button>
          <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} style={styles.advancedBtn}>
            {showAdvanced ? "Hide" : "Advanced"}
          </button>
          <button type="button" onClick={fillSample} style={styles.sampleBtn}>
            Sample
          </button>
        </div>
      </form>

      {result && (
        <div style={styles.resultBlock}>
          {result.error ? (
            <div style={styles.errorMessage}>
              <span>⚠️</span>
              <p>{result.error}</p>
            </div>
          ) : (
            <>
              {/* Current Status */}
              <div style={styles.currentStatusCard}>
                <div style={styles.statusRow}>
                  <div>
                    <p style={styles.statusLabel}>Current Attendance</p>
                    <p style={styles.statusValue}>{result.currentPct}%</p>
                    <p style={styles.statusDetail}>{result.attended}/{result.totalClasses} classes</p>
                  </div>
                  <div>
                    <p style={styles.statusLabel}>Target</p>
                    <p style={styles.statusValue}>{result.targetPct}%</p>
                    <p style={styles.statusDetail}>{result.requiredAttended}/{result.totalClasses} classes</p>
                  </div>
                  <div>
                    <p style={styles.statusLabel}>Classes Left</p>
                    <p style={styles.statusValue}>{result.classesLeft}</p>
                    <p style={styles.statusDetail}>remaining</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={styles.progressContainer}>
                <div style={styles.progressLabels}>
                  <span>Current: {result.currentPct}%</span>
                  <span>Target: {result.targetPct}%</span>
                </div>
                <div style={styles.progressBar}>
                  <div 
                    style={{
                      ...styles.progressFill,
                      width: `${Math.min(100, (result.attended / result.totalClasses) * 100)}%`,
                      backgroundColor: result.status === "above" ? "#10b981" : "#3b82f6"
                    }}
                  />
                  <div 
                    style={{
                      ...styles.targetMarker,
                      left: `${result.targetPct}%`
                    }}
                  />
                </div>
              </div>

              {/* Results */}
              {result.status === "above" ? (
                <div style={styles.successCard}>
                  <div style={styles.successIcon}>✅</div>
                  <div style={styles.successContent}>
                    <p style={styles.successMessage}>{result.message}</p>
                    <p style={styles.bunkInfo}>{result.bunkMessage}</p>
                    <div style={styles.excessBox}>
                      <span>📊 You can bunk</span>
                      <strong>{result.canBunk}</strong>
                      <span>more classes</span>
                    </div>
                    <p style={styles.finalResult}>{result.finalBreakdown}</p>
                  </div>
                </div>
              ) : (
                <div style={styles.warningCard}>
                  <div style={styles.warningIcon}>⚠️</div>
                  <div style={styles.warningContent}>
                    <p style={styles.warningMessage}>{result.message}</p>
                    
                    <div style={styles.planBox}>
                      <div style={styles.attendBox}>
                        <span>✓</span>
                        <div>
                          <strong>ATTEND:</strong> {result.needToAttend} classes
                          <small>to reach {result.requiredAttended} total attended</small>
                        </div>
                      </div>
                      
                      <div style={styles.bunkBox}>
                        <span>✗</span>
                        <div>
                          <strong>BUNK:</strong> {result.canBunk} classes
                          <small>you can skip these</small>
                        </div>
                      </div>
                    </div>

                    <div style={styles.summaryBox}>
                      <p><strong>Out of {result.classesLeft} remaining classes:</strong></p>
                      <p style={styles.attendText}>{result.attendMessage}</p>
                      <p style={styles.bunkText}>{result.bunkMessage}</p>
                      <p style={styles.finalResult}>{result.finalBreakdown}</p>
                    </div>

                    <div style={styles.visualization}>
                      <p><strong>Remaining {result.classesLeft} classes:</strong></p>
                      <div style={styles.bars}>
                        <div 
                          style={{
                            ...styles.attendBar,
                            width: `${(result.needToAttend / result.classesLeft) * 100}%`
                          }}
                        >
                          {result.needToAttend} to Attend
                        </div>
                        <div 
                          style={{
                            ...styles.bunkBar,
                            width: `${(result.canBunk / result.classesLeft) * 100}%`
                          }}
                        >
                          {result.canBunk} to Bunk
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .attendance-calculator {
          animation: slideUp 0.3s ease;
        }
        
        button:hover {
          transform: translateY(-2px);
        }
        
        button:active {
          transform: scale(0.98);
        }
        
        input:focus {
          border-color: #f58003;
          outline: none;
          box-shadow: 0 0 0 3px rgba(245, 128, 3, 0.1);
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    background: "white",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  header: {
    marginBottom: "20px",
    textAlign: "center",
  },
  title: {
    margin: "0 0 8px 0",
    color: "#2d3748",
    fontSize: "1.3rem",
    fontWeight: "600",
  },
  subtitle: {
    margin: 0,
    color: "#718096",
    fontSize: "0.85rem",
  },
  currentStatus: {
    background: "#f8f9fa",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
    textAlign: "center",
  },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "0.9rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  formRow: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontWeight: "600",
    color: "#2d3748",
    fontSize: "0.9rem",
  },
  input: {
    padding: "10px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "1rem",
    transition: "all 0.3s ease",
  },
  formActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "10px",
  },
  calculateBtn: {
    flex: 1,
    background: "linear-gradient(135deg, #ff6d00, #e65100)",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  resetBtn: {
    background: "#6c757d",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  advancedBtn: {
    background: "#f8f9fa",
    color: "#4a5568",
    border: "2px solid #e2e8f0",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.3s ease",
  },
  sampleBtn: {
    background: "#f8f9fa",
    color: "#4a5568",
    border: "2px solid #e2e8f0",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.3s ease",
  },
  resultBlock: {
    marginTop: "20px",
    animation: "slideUp 0.3s ease",
  },
  errorMessage: {
    background: "#fff5f5",
    border: "1px solid #feb2b2",
    borderRadius: "8px",
    padding: "15px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#c62828",
  },
  currentStatusCard: {
    background: "#f8f9fa",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "15px",
  },
  statusRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "15px",
    textAlign: "center",
  },
  statusLabel: {
    margin: "0 0 5px 0",
    fontSize: "0.75rem",
    color: "#718096",
    fontWeight: "500",
  },
  statusValue: {
    margin: "0",
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#2d3748",
  },
  statusDetail: {
    margin: "5px 0 0 0",
    fontSize: "0.7rem",
    color: "#a0aec0",
  },
  progressContainer: {
    marginBottom: "20px",
  },
  progressLabels: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.75rem",
    color: "#718096",
    marginBottom: "5px",
  },
  progressBar: {
    height: "10px",
    background: "#e2e8f0",
    borderRadius: "5px",
    overflow: "visible",
    position: "relative",
  },
  progressFill: {
    height: "100%",
    borderRadius: "5px",
    transition: "width 0.3s ease",
  },
  targetMarker: {
    position: "absolute",
    top: "-8px",
    width: "2px",
    height: "26px",
    background: "#f58003",
    transform: "translateX(-50%)",
    borderRadius: "1px",
  },
  successCard: {
    background: "#d4edda",
    border: "1px solid #c3e6cb",
    borderRadius: "8px",
    padding: "15px",
    display: "flex",
    gap: "12px",
  },
  successIcon: {
    fontSize: "1.5rem",
  },
  successContent: {
    flex: 1,
  },
  successMessage: {
    margin: "0 0 10px 0",
    color: "#155724",
    fontWeight: "500",
  },
  bunkInfo: {
    margin: "0 0 10px 0",
    color: "#155724",
  },
  excessBox: {
    background: "rgba(40, 167, 69, 0.2)",
    padding: "8px",
    borderRadius: "6px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "10px",
    "& strong": {
      fontSize: "1.2rem",
      color: "#155724",
    },
  },
  warningCard: {
    background: "#fff3e0",
    border: "1px solid #ffe0b2",
    borderRadius: "8px",
    padding: "15px",
    display: "flex",
    gap: "12px",
  },
  warningIcon: {
    fontSize: "1.5rem",
  },
  warningContent: {
    flex: 1,
  },
  warningMessage: {
    margin: "0 0 15px 0",
    color: "#f57c00",
    fontWeight: "500",
  },
  planBox: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "15px",
  },
  attendBox: {
    background: "#d4edda",
    padding: "12px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    "& span:first-child": {
      fontSize: "1.2rem",
      color: "#28a745",
      fontWeight: "bold",
    },
    "& small": {
      display: "block",
      fontSize: "0.75rem",
      marginTop: "4px",
      opacity: 0.8,
    },
  },
  bunkBox: {
    background: "#fff3cd",
    padding: "12px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    "& span:first-child": {
      fontSize: "1.2rem",
      color: "#dc3545",
      fontWeight: "bold",
    },
    "& small": {
      display: "block",
      fontSize: "0.75rem",
      marginTop: "4px",
      opacity: 0.8,
    },
  },
  summaryBox: {
    background: "#e9ecef",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "15px",
    "& p": {
      margin: "5px 0",
    },
  },
  attendText: {
    color: "#28a745",
  },
  bunkText: {
    color: "#dc3545",
  },
  finalResult: {
    fontWeight: "bold",
    color: "#f58003",
    marginTop: "8px",
  },
  visualization: {
    marginTop: "15px",
  },
  bars: {
    display: "flex",
    height: "50px",
    borderRadius: "8px",
    overflow: "hidden",
    marginTop: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  attendBar: {
    background: "#28a745",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.85rem",
    fontWeight: "bold",
    transition: "width 0.3s ease",
  },
  bunkBar: {
    background: "#ffc107",
    color: "#856404",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.85rem",
    fontWeight: "bold",
    transition: "width 0.3s ease",
  },
};