/**
 * Hook to initialize and manage realtime WebSocket synchronization
 * Subscribes to all event types and updates stores automatically
 */

import { useEffect } from "react";
import { getRealtimeClient, initializeRealtimeClient } from "@/services/realtime";
import { useRealtimeStore } from "@/store/realtimeStore";
import { useDashboardStore } from "@/store/dashboardStore";
import { useIncidentStore } from "@/store/incidentStore";
import { useVolunteerStore } from "@/store/volunteerStore";
import { useAccessibilityStore } from "@/store/accessibilityStore";
import { useSustainabilityStore } from "@/store/sustainabilityStore";
import { useCrowdStore } from "@/store/crowdStore";
import { useReportsStore } from "@/store/reportsStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useDigitalTwinStore } from "@/store/digitalTwinStore";
import { ReportCategory, ReportFormat, ReportItem } from "@/types/reports";
import { SystemNotification } from "@/store/notificationStore";

type CrowdZoneUpdate = {
  zone_name: string;
  metric_name: string;
  value: number;
};

type CrowdGateUpdate = {
  gate_name: string;
  status: "open" | "closed" | "restricted";
};

function asCrowdZoneUpdate(data: Record<string, unknown>): CrowdZoneUpdate | null {
  if (
    typeof data.zone_name === "string" &&
    typeof data.metric_name === "string" &&
    typeof data.value === "number"
  ) {
    return {
      zone_name: data.zone_name,
      metric_name: data.metric_name,
      value: data.value,
    };
  }
  return null;
}

function asCrowdGateUpdate(data: Record<string, unknown>): CrowdGateUpdate | null {
  if (typeof data.gate_name === "string" && typeof data.status === "string") {
    const status = data.status;
    if (status === "open" || status === "closed" || status === "restricted") {
      return { gate_name: data.gate_name, status };
    }
  }
  return null;
}

function normalizeReportFromEvent(data: Record<string, unknown>): ReportItem {
  return {
    id: String(data.id ?? ""),
    title: String(data.title ?? "Untitled report"),
    category: String(data.category ?? "operations") as ReportCategory,
    generatedBy: String(data.generatedBy ?? data.generated_by ?? "System"),
    createdAt: String(data.createdAt ?? data.created_at ?? new Date().toISOString()),
    fileSizeBytes: Number(data.fileSizeBytes ?? data.file_size_bytes ?? 0),
    format: String(data.format ?? "pdf") as ReportFormat,
    downloadUrl: String(data.downloadUrl ?? data.download_url ?? "#"),
  };
}

function normalizeNotificationFromEvent(data: Record<string, unknown>): SystemNotification {
  return {
    id: String(data.id ?? `notif-${Date.now()}`),
    title: String(data.title ?? "Notification"),
    description: String(data.message ?? data.description ?? ""),
    timestamp: String(data.created_at ?? data.createdAt ?? new Date().toISOString()),
    category: "system",
    severity: "info",
    read: Boolean(data.is_read ?? data.isRead ?? false),
  };
}

/**
 * Initialize WebSocket connection and set up all event listeners
 */
export function useRealtimeInitialization() {
  useEffect(() => {
    const initializeRealtime = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
        initializeRealtimeClient(baseUrl);

        const client = getRealtimeClient();
        const realtimeStore = useRealtimeStore.getState();

        await realtimeStore.initializeConnection();

        client.on("dashboard:update", (event) => {
          const store = useDashboardStore.getState();
          if (event.data.metrics) {
            store.setMetrics(event.data.metrics);
          }
          if (event.data.telemetryPoint) {
            store.addTelemetryPoint(event.data.telemetryPoint);
          }
        });

        client.on("dashboard:kpi", (event) => {
          useDashboardStore.getState().updateStatsRealtime(event.data);
        });

        client.on("incident:created", (event) => {
          useIncidentStore.getState().addIncident(event.data);
        });

        client.on("incident:updated", (event) => {
          useIncidentStore.getState().updateIncidentRealtime(event.data);
        });

        client.on("incident:resolved", (event) => {
          useIncidentStore.getState().updateIncidentRealtime(event.data);
        });

        client.on("incident:deleted", (event) => {
          useIncidentStore.getState().deleteIncidentRealtime(String(event.data.id));
        });

        client.on("crowd:density", (event) => {
          const update = asCrowdZoneUpdate(event.data);
          if (!update) return;
          useCrowdStore.getState().updateZoneRealtime(update);
          useDigitalTwinStore.getState().updateZoneRealtime(update);
        });

        client.on("crowd:gate", (event) => {
          const update = asCrowdGateUpdate(event.data);
          if (update) {
            useCrowdStore.getState().updateGateRealtime(update);
          }
        });

        client.on("crowd:zone", (event) => {
          const update = asCrowdZoneUpdate(event.data);
          if (!update) return;
          useCrowdStore.getState().updateZoneRealtime(update);
          useDigitalTwinStore.getState().updateZoneRealtime(update);
        });

        client.on("volunteer:assigned", (event) => {
          useVolunteerStore.getState().updateVolunteerRealtime(event.data);
        });

        client.on("volunteer:unassigned", (event) => {
          useVolunteerStore.getState().updateVolunteerRealtime({ ...event.data, action: "deleted" });
        });

        client.on("volunteer:status", (event) => {
          useVolunteerStore.getState().updateShiftRealtime(event.data);
        });

        client.on("volunteer:updated", (event) => {
          useVolunteerStore.getState().updateVolunteerRealtime(event.data);
        });

        client.on("accessibility:request", (event) => {
          useAccessibilityStore.getState().updateRequestRealtime(event.data);
        });

        client.on("accessibility:resolved", (event) => {
          useAccessibilityStore.getState().updateRequestRealtime({
            ...event.data,
            action: event.data.action || "updated",
            status: "completed",
          });
        });

        client.on("sustainability:metric", (event) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          useSustainabilityStore.getState().updateMetricRealtime(event.data as any);
        });

        client.on("sustainability:update", (event) => {
          const store = useSustainabilityStore.getState();
          if (event.data.action === "deleted" && event.data.id) {
            store.deleteMetricRealtime(String(event.data.id));
            return;
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          store.updateMetricRealtime(event.data as any);
        });

        client.on("report:created", (event) => {
          useReportsStore.getState().addReportRealtime(normalizeReportFromEvent(event.data));
        });

        client.on("report:deleted", (event) => {
          useReportsStore.getState().deleteReportRealtime(String(event.data.id));
        });

        client.on("notification:new", (event) => {
          useNotificationStore.getState().addNotificationRealtime(normalizeNotificationFromEvent(event.data));
        });

        client.on("notification:read", (event) => {
          const store = useNotificationStore.getState();
          if (event.data.action === "deleted" && event.data.id) {
            store.clearNotification(String(event.data.id));
            return;
          }
          if (event.data.id) {
            store.markAsRead(String(event.data.id));
          }
        });

        client.onStatusChange((status) => {
          const isConnected = status.connected;

          useDashboardStore.getState().setRealtimeConnected(isConnected);
          useIncidentStore.getState().setRealtimeConnected(isConnected);
          useVolunteerStore.getState().setRealtimeConnected(isConnected);
          useAccessibilityStore.getState().setRealtimeConnected(isConnected);
          useSustainabilityStore.getState().setRealtimeConnected(isConnected);
          useCrowdStore.getState().setRealtimeConnected(isConnected);
          useReportsStore.getState().setRealtimeConnected(isConnected);
          useNotificationStore.getState().setRealtimeConnected(isConnected);
          useDigitalTwinStore.getState().setRealtimeConnected(isConnected);
        });
      } catch (error) {
        console.error("Failed to initialize realtime connection:", error);
      }
    };

    initializeRealtime();

    return () => {
      try {
        useRealtimeStore.getState().disconnectWebSocket();
      } catch (error) {
        console.error("Error during realtime cleanup:", error);
      }
    };
  }, []);
}
