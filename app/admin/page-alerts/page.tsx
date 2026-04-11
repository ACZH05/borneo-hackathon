"use client";

import { useEffect, useState } from "react";
import CloudDoneOutlinedIcon from "@mui/icons-material/CloudDoneOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AutorenewIcon from "@mui/icons-material/Autorenew";

type Alert = {
  id: string;
  title: string;
  body: string;
  severity: string;
  status: string;
};

const getSeverityStyle = (severity: string) => {
  switch (severity.toLowerCase()) {
    case "priority":
      return {
        textColor: "text-priority",
        backgroundColor: "bg-priority/10",
      };
    case "warning":
      return {
        textColor: "text-warning",
        backgroundColor: "bg-warning/10",
      };
    case "monitor":
      return {
        textColor: "text-monitor",
        backgroundColor: "bg-monitor/10",
      };
    default:
      return {
        textColor: "text-textGrey",
        backgroundColor: "bg-textGrey/10",
      };
  }
};

export default function AdminAlertsPage() {
  const [drafts, setDrafts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  
  // NEW: State for our UI feedback
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchDrafts = async () => {
    try {
      const res = await fetch('/api/alert?status=draft', { cache: 'no-store' });
      const data = await res.json();
      
      if (data.success && data.alerts) {
        const onlyDrafts = data.alerts.filter((alert: Alert) => alert.status === "draft");
        setDrafts(onlyDrafts);
      }
    } catch (error) {
      console.error("Failed to fetch drafts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const handlePublish = async (alertId: string) => {
    // 1. Show loading state on the button
    setProcessingId(alertId); 
    
    try {
      const res = await fetch('/api/alert/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId })
      });

      const data = await res.json();
      
      if (data.success) {
        // 2. Show the success banner
        setSuccessMessage("Alert successfully published to the public feed!");
        
        // 3. Hide the banner after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000); 
        
        // 4. Refresh the list to remove the published draft
        fetchDrafts(); 
      } else {
        alert("Failed to publish: " + data.error);
      }
    } catch (error) {
      console.error("Error publishing:", error);
      alert("Failed to publish alert.");
    } finally {
      // 5. Remove loading state
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-160px)] items-center justify-center p-6 text-sm font-semibold text-textGrey">
        Loading AI drafts...
      </div>
    );
  }

  if (drafts.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-160px)] items-center justify-center bg-primary/5">
        <div className="flex flex-col items-center gap-4">
          <div className="flex justify-center items-center w-48 h-48 bg-textGrey/10 text-textGrey rounded-full">
            <CloudDoneOutlinedIcon fontSize="large" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl font-black">No Pending Alerts</span>
            <span className="w-96 text-center text-textGrey">
              The automated AI system has not detected any new severe weather warnings. All clear!
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-[calc(100vh-160px)] max-w-5xl p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black flex items-center gap-3">
          <WarningAmberOutlinedIcon fontSize="large" className="text-red-500" />
          Pending AI Weather Drafts
        </h1>
        <p className="text-textGrey mt-2 font-medium">
          Review and publish automated weather alerts fetched by the BorNEO AI background system.
        </p>
      </div>

      {/* NEW: Success Banner */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl flex items-center gap-3 font-semibold shadow-sm transition-all animate-fade-in">
          <CheckCircleOutlineIcon className="text-green-600" />
          {successMessage}
        </div>
      )}

      <div className="space-y-4">
        {drafts.map((alert) => {
          const severityStyle = getSeverityStyle(alert.severity);

          return (
            <div
              key={alert.id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold uppercase ${severityStyle.backgroundColor} ${severityStyle.textColor}`}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 12 }}
                    >
                      warning
                    </span>
                    <span>{alert.severity}</span>
                  </span>
                  <h2 className="text-xl font-black">{alert.title}</h2>
                </div>
                <p className="text-textGrey leading-relaxed">{alert.body}</p>
              </div>

              {/* NEW: Dynamic Button State */}
              <button
                onClick={() => handlePublish(alert.id)}
                disabled={processingId === alert.id}
                className={`flex items-center gap-2 font-semibold py-3 px-6 rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                  processingId === alert.id
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-black hover:bg-gray-800 text-white"
                }`}
              >
                {processingId === alert.id ? (
                  <>
                    <AutorenewIcon fontSize="small" className="animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <CheckCircleOutlineIcon fontSize="small" />
                    Approve & Publish
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
