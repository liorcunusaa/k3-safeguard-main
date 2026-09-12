import React, { useState, useMemo, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Circle, CircleMarker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import {
  MapPin,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Eye,
  Layers,
  Filter,
  Info,
  Navigation,
  Sparkles,
  Radio,
  Compass
} from "lucide-react";
import { ReportStatus } from "../constants/enums";

// Haversine distance in meters
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface ClusterZone {
  id: string;
  name: string;
  centroidLat: number;
  centroidLng: number;
  reports: any[];
  count: number;
  riskLevel: "CRITICAL" | "WARNING" | "MONITOR";
  color: string;
  radiusMeters: number;
}

function MapFlyTo({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 16, { duration: 1.2 });
  }, [center, map]);
  return null;
}

export default function RiskMap({ reports = [] }: { reports: any[] }) {
  const [riskFilter, setRiskFilter] = useState<string>("ALL");
  const [showAura, setShowAura] = useState(true);
  const [activeCluster, setActiveCluster] = useState<ClusterZone | null>(null);

  // 🎯 Kebutuhan: Hanya Unsafe Condition dengan koordinat valid yang dimasukkan ke spatial clustering
  const validGPSReports = useMemo(() => {
    return reports.filter(
      (r) =>
        r.findingType === "Unsafe Condition" &&
        r.latitude !== null &&
        r.longitude !== null &&
        !isNaN(Number(r.latitude)) &&
        !isNaN(Number(r.longitude))
    );
  }, [reports]);

  // Spatial clustering dinamis berbasis jarak (threshold 250m)
  const clusters = useMemo(() => {
    const CLUSTER_DISTANCE_THRESHOLD = 250;
    const visited = new Set<string>();
    const result: ClusterZone[] = [];

    validGPSReports.forEach((rep) => {
      if (visited.has(rep.id)) return;

      const group: any[] = [rep];
      visited.add(rep.id);

      validGPSReports.forEach((other) => {
        if (!visited.has(other.id)) {
          const dist = getDistanceMeters(
            Number(rep.latitude),
            Number(rep.longitude),
            Number(other.latitude),
            Number(other.longitude)
          );
          if (dist <= CLUSTER_DISTANCE_THRESHOLD) {
            group.push(other);
            visited.add(other.id);
          }
        }
      });

      const avgLat =
        group.reduce((acc, curr) => acc + Number(curr.latitude), 0) / group.length;
      const avgLng =
        group.reduce((acc, curr) => acc + Number(curr.longitude), 0) / group.length;

      const count = group.length;
      let riskLevel: "CRITICAL" | "WARNING" | "MONITOR" = "MONITOR";
      let color = "#3b82f6";
      let radiusMeters = 35;

      if (count >= 3) {
        riskLevel = "CRITICAL";
        color = "#ef4444";
        radiusMeters = 95;
      } else if (count === 2) {
        riskLevel = "WARNING";
        color = "#f59e0b";
        radiusMeters = 60;
      } else {
        riskLevel = "MONITOR";
        color = "#38bdf8";
        radiusMeters = 35;
      }

      result.push({
        id: `cluster-${rep.id}`,
        name: `Zona Klaster #${result.length + 1} (${group[0].description ? group[0].description.slice(0, 20) : "Lokasi Operasional"}...)`,
        centroidLat: avgLat,
        centroidLng: avgLng,
        reports: group,
        count,
        riskLevel,
        color,
        radiusMeters,
      });
    });

    return result;
  }, [validGPSReports]);

  const filteredClusters = useMemo(() => {
    if (riskFilter === "ALL") return clusters;
    return clusters.filter((c) => c.riskLevel === riskFilter);
  }, [clusters, riskFilter]);

  const clusterCounts = useMemo(() => {
    return {
      critical: clusters.filter((c) => c.riskLevel === "CRITICAL").length,
      warning: clusters.filter((c) => c.riskLevel === "WARNING").length,
      monitor: clusters.filter((c) => c.riskLevel === "MONITOR").length,
    };
  }, [clusters]);

  const defaultCenter: [number, number] = useMemo(() => {
    if (clusters.length > 0) {
      return [clusters[0].centroidLat, clusters[0].centroidLng];
    }
    return [-6.1033, 106.8792];
  }, [clusters]);

  return (
    <Container className="glass-card">
      {/* MAP HEADER */}
      <HeaderRow>
        <HeaderLeft>
          <IconRadarPulse>
            <Flame size={20} color="#ef4444" />
          </IconRadarPulse>
          <div>
            <Title>
              <span>DYNAMIC RISK MAP RADAR</span>
              <LiveBadge>
                <span className="live-dot" /> LIVE CLUSTERING
              </LiveBadge>
            </Title>
            <Subtitle>
              Algoritma Deteksi Kepadatan Titik Bahaya (Unsafe Condition) Pelindo
            </Subtitle>
          </div>
        </HeaderLeft>

        <HeaderRight>
          <FilterPills>
            <PillButton
              active={riskFilter === "ALL"}
              onClick={() => setRiskFilter("ALL")}
              as={motion.button}
              whileTap={{ scale: 0.95 }}
            >
              Semua ({clusters.length})
            </PillButton>
            <PillButton
              active={riskFilter === "CRITICAL"}
              color="#ef4444"
              onClick={() => setRiskFilter("CRITICAL")}
              as={motion.button}
              whileTap={{ scale: 0.95 }}
            >
              <span className="dot critical" /> Zona Merah ({clusterCounts.critical})
            </PillButton>
            <PillButton
              active={riskFilter === "WARNING"}
              color="#f59e0b"
              onClick={() => setRiskFilter("WARNING")}
              as={motion.button}
              whileTap={{ scale: 0.95 }}
            >
              <span className="dot warning" /> Waspada ({clusterCounts.warning})
            </PillButton>
            <PillButton
              active={riskFilter === "MONITOR"}
              color="#38bdf8"
              onClick={() => setRiskFilter("MONITOR")}
              as={motion.button}
              whileTap={{ scale: 0.95 }}
            >
              <span className="dot monitor" /> Pantauan ({clusterCounts.monitor})
            </PillButton>
          </FilterPills>

          <ToggleButton
            active={showAura}
            onClick={() => setShowAura(!showAura)}
            as={motion.button}
            whileTap={{ scale: 0.95 }}
            title="Nyalakan/Matikan Radius Panas"
          >
            <Eye size={13} />
            <span>{showAura ? "Aura Aktif" : "Aura Sembunyi"}</span>
          </ToggleButton>
        </HeaderRight>
      </HeaderRow>

      {/* CLUSTERING ALGORITHM STATS BAR */}
      <InsightBar>
        <div className="insight-item critical">
          <span className="label">ZONA KRITIS (MERAH)</span>
          <span className="value">{clusterCounts.critical} Titik</span>
          <span className="desc">≥ 3 temuan terkonsentrasi</span>
        </div>
        <div className="insight-item warning">
          <span className="label">ZONA WASPADA (AMBER)</span>
          <span className="value">{clusterCounts.warning} Titik</span>
          <span className="desc">2 temuan berdekatan</span>
        </div>
        <div className="insight-item monitor">
          <span className="label">ZONA PANTAUAN (BIRU)</span>
          <span className="value">{clusterCounts.monitor} Titik</span>
          <span className="desc">1 temuan terisolir</span>
        </div>
        <div className="insight-note">
          <Info size={14} color="#38bdf8" />
          <span>
            <strong>Aturan Sistem:</strong> Hanya kategori <em>Unsafe Condition</em> yang memiliki koordinat GPS untuk analisis spasial.
          </span>
        </div>
      </InsightBar>

      {/* LEAFLET MAP CONTAINER */}
      <MapFrame>
        <MapContainer
          center={defaultCenter}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {activeCluster && (
            <MapFlyTo
              center={[activeCluster.centroidLat, activeCluster.centroidLng]}
            />
          )}

          {filteredClusters.map((cluster) => {
            const isRed = cluster.riskLevel === "CRITICAL";
            const isYellow = cluster.riskLevel === "WARNING";

            return (
              <React.Fragment key={cluster.id}>
                {/* Visual Radiation Aura */}
                {showAura && (
                  <Circle
                    center={[cluster.centroidLat, cluster.centroidLng]}
                    radius={cluster.radiusMeters}
                    pathOptions={{
                      color: cluster.color,
                      fillColor: cluster.color,
                      fillOpacity: isRed ? 0.35 : isYellow ? 0.25 : 0.15,
                      weight: isRed ? 2 : 1,
                      dashArray: isRed ? undefined : "4, 6",
                    }}
                  />
                )}

                {/* Center Solid Marker */}
                <CircleMarker
                  center={[cluster.centroidLat, cluster.centroidLng]}
                  radius={isRed ? 14 : isYellow ? 11 : 9}
                  pathOptions={{
                    color: "#ffffff",
                    fillColor: cluster.color,
                    fillOpacity: 0.95,
                    weight: 2.5,
                  }}
                  eventHandlers={{
                    click: () => setActiveCluster(cluster),
                  }}
                >
                  <Popup>
                    <PopupContent>
                      <div className="pop-badge" style={{ background: cluster.color }}>
                        {cluster.riskLevel === "CRITICAL"
                          ? "🔴 ZONA MERAH KRITIS"
                          : cluster.riskLevel === "WARNING"
                          ? "🟡 ZONA WASPADA"
                          : "🔵 TITIK PANTAUAN"}
                      </div>
                      <h4>{cluster.name}</h4>
                      <p className="pop-stat">
                        Total {cluster.count} Laporan Unsafe Condition di area radius {cluster.radiusMeters}m
                      </p>

                      <div className="report-mini-list">
                        {cluster.reports.map((r, i) => (
                          <div key={r.id || i} className="mini-card">
                            <span className="rep-num">#{i + 1}</span>
                            <div className="rep-info">
                              <p className="rep-desc">{r.description}</p>
                              <small>{r.date} • {r.status}</small>
                            </div>
                          </div>
                        ))}
                      </div>
                    </PopupContent>
                  </Popup>
                </CircleMarker>
              </React.Fragment>
            );
          })}
        </MapContainer>

        {/* FLOATING CLUSTERS QUICK SELECTOR */}
        {clusters.length > 0 && (
          <FloatingClusterList>
            <div className="floating-title">
              <Compass size={13} color="#38bdf8" />
              <span>Titik Klaster Aktif ({clusters.length})</span>
            </div>
            <div className="cluster-scroll">
              {clusters.map((c) => (
                <ClusterCardBtn
                  key={c.id}
                  level={c.riskLevel}
                  active={activeCluster?.id === c.id}
                  onClick={() => setActiveCluster(c)}
                  as={motion.button}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="dot" style={{ background: c.color }} />
                  <span className="c-name">{c.name.slice(0, 22)}...</span>
                  <span className="c-badge">{c.count} Lap</span>
                </ClusterCardBtn>
              ))}
            </div>
          </FloatingClusterList>
        )}
      </MapFrame>
    </Container>
  );
}

// LUXURY STYLED COMPONENTS
const Container = styled.div`
  border-radius: 1.5rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  box-shadow: var(--card-shadow);
  margin-bottom: 2rem;
`;

const HeaderRow = styled.div`
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-card-subtle);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;
`;

const IconRadarPulse = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    inset: -3px;
    border-radius: inherit;
    border: 1.5px solid rgba(239, 68, 68, 0.5);
    animation: pulse-ring 2.5s infinite;
  }
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.6rem;
  letter-spacing: 0.03em;
`;

const LiveBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #10b981;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.06em;

  .live-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 6px #10b981;
    animation: pulse-dot 1.5s infinite;
  }
`;

const Subtitle = styled.p`
  margin: 3px 0 0;
  font-size: 0.75rem;
  color: var(--text-secondary);
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const FilterPills = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-card-subtle);
  padding: 4px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
`;

const PillButton = styled.button<{ active: boolean; color?: string }>`
  background: ${({ active }) => (active ? "rgba(255, 255, 255, 0.15)" : "transparent")};
  border: 1px solid ${({ active }) => (active ? "var(--border-color)" : "transparent")};
  color: ${({ active, color }) =>
    active ? (color ? color : "var(--text-primary)") : "var(--text-secondary)"};
  border-radius: 8px;
  padding: 5px 10px;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;

  &:hover {
    color: var(--text-primary);
  }

  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    &.critical { background: #ef4444; }
    &.warning { background: #f59e0b; }
    &.monitor { background: #38bdf8; }
  }
`;

const ToggleButton = styled.button<{ active: boolean }>`
  background: ${({ active }) => (active ? "rgba(56, 189, 248, 0.15)" : "rgba(148, 163, 184, 0.1)")};
  color: ${({ active }) => (active ? "#38bdf8" : "var(--text-secondary)")};
  border: 1px solid ${({ active }) => (active ? "rgba(56, 189, 248, 0.3)" : "var(--border-color)")};
  border-radius: 10px;
  padding: 6px 12px;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;

  &:hover {
    background: rgba(56, 189, 248, 0.25);
  }
`;

const InsightBar = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr) 2fr;
  gap: 1rem;
  padding: 0.85rem 1.5rem;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);

  @media (max-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }

  .insight-item {
    padding: 0.5rem 0.75rem;
    border-radius: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 2px;

    &.critical {
      background: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.2);
    }
    &.warning {
      background: rgba(245, 158, 11, 0.08);
      border: 1px solid rgba(245, 158, 11, 0.2);
    }
    &.monitor {
      background: rgba(56, 189, 248, 0.08);
      border: 1px solid rgba(56, 189, 248, 0.2);
    }

    .label {
      font-size: 0.65rem;
      font-weight: 800;
      color: var(--text-secondary);
      letter-spacing: 0.06em;
    }
    .value {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--text-primary);
    }
    .desc {
      font-size: 0.65rem;
      color: var(--text-muted);
    }
  }

  .insight-note {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    background: rgba(14, 165, 233, 0.06);
    border: 1px solid rgba(14, 165, 233, 0.18);
    border-radius: 0.75rem;
    padding: 0.65rem 0.85rem;
    font-size: 0.72rem;
    color: var(--text-secondary);
    line-height: 1.45;

    @media (max-width: 900px) {
      grid-column: span 2;
    }
  }
`;

const MapFrame = styled.div`
  height: 480px;
  position: relative;
  width: 100%;
`;

const PopupContent = styled.div`
  padding: 0.4rem 0.2rem;
  max-width: 250px;

  .pop-badge {
    color: white;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 0.65rem;
    font-weight: 800;
    margin-bottom: 6px;
    display: inline-block;
  }

  h4 {
    margin: 0;
    font-size: 0.88rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .pop-stat {
    margin: 4px 0 8px;
    font-size: 0.72rem;
    color: var(--text-secondary);
  }

  .report-mini-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 140px;
    overflow-y: auto;

    .mini-card {
      display: flex;
      gap: 6px;
      padding: 5px;
      background: var(--bg-card-subtle);
      border-radius: 6px;
      font-size: 0.7rem;

      .rep-num {
        font-weight: 800;
        color: #38bdf8;
      }
      .rep-desc {
        margin: 0;
        font-weight: 600;
        color: var(--text-primary);
      }
      small {
        color: var(--text-muted);
        font-size: 0.62rem;
      }
    }
  }
`;

const FloatingClusterList = styled.div`
  position: absolute;
  bottom: 16px;
  left: 16px;
  z-index: 1000;
  background: var(--bg-card-solid);
  border: 1px solid var(--border-color);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.4);
  border-radius: 1rem;
  padding: 0.65rem;
  max-width: 260px;
  width: calc(100% - 32px);
  backdrop-filter: blur(14px);

  .floating-title {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.68rem;
    font-weight: 800;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 6px;
  }

  .cluster-scroll {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 110px;
    overflow-y: auto;
  }
`;

const ClusterCardBtn = styled.button<{ level: string; active: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 8px;
  background: ${({ active }) => (active ? "rgba(56, 189, 248, 0.15)" : "var(--bg-card-subtle)")};
  border: 1px solid ${({ active }) => (active ? "rgba(56, 189, 248, 0.35)" : "var(--border-color)")};
  color: var(--text-primary);
  font-size: 0.72rem;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: all 0.2s;

  &:hover {
    background: rgba(56, 189, 248, 0.12);
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .c-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 600;
  }

  .c-badge {
    font-size: 0.65rem;
    font-weight: 800;
    color: var(--text-muted);
  }
`;
