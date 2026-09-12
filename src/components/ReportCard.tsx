import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  MapPin,
  Share2,
  Trash2,
  Eye,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  User,
  Navigation
} from 'lucide-react';
import { ReportStatus } from '../constants/enums';
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const STATUS_CONFIG = {
  [ReportStatus.OPEN]: {
    color: '#fbbf24',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.35)',
    label: 'MENUNGGU VERIFIKASI',
    icon: AlertTriangle,
  },
  [ReportStatus.IN_PROGRESS]: {
    color: '#818cf8',
    bg: 'rgba(99, 102, 241, 0.12)',
    border: 'rgba(99, 102, 241, 0.35)',
    label: 'SEDANG DITANGANI',
    icon: Clock,
  },
  [ReportStatus.CLOSED]: {
    color: '#34d399',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.35)',
    label: 'SELESAI (TERATASI)',
    icon: CheckCircle2,
  },
};

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
      map.setView([lat, lng], 16);
    }, 300);
    return () => clearTimeout(timer);
  }, [lat, lng, map]);

  return null;
}

export default function ReportCard({
  report,
  isBPO,
  onUpdate,
  onDelete,
  onImageClick,
  user
}: {
  report: any;
  isBPO: boolean;
  onUpdate: (data: any) => void;
  onDelete?: (id: string) => void;
  onImageClick?: (url: string) => void;
  user?: any;
}) {
  const [showActions, setShowActions] = useState(false);
  const [bpoData, setBpoData] = useState({
    estimationDate: report?.estimationDate || '',
    plannedAction: report?.plannedAction || '',
    handlingReport: '',
  });
  const [showMap, setShowMap] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  const isCondition = report?.findingType === "Unsafe Condition";
  const hasGPS = Boolean(report?.latitude && report?.longitude);

  useEffect(() => {
    if (!hasGPS) {
      setAddress(null);
      return;
    }

    let isMounted = true;
    const fetchAddress = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${report.latitude}&lon=${report.longitude}`
        );
        const data = await res.json();
        if (isMounted) {
          setAddress(data.display_name || `Area Dermaga Pelindo (${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)})`);
        }
      } catch (err) {
        if (isMounted) {
          setAddress(`Area Koordinat: ${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`);
        }
      }
    };

    fetchAddress();
    return () => { isMounted = false; };
  }, [report?.latitude, report?.longitude, hasGPS]);

  if (!report) return null;

  const config = (STATUS_CONFIG as any)[report.status] || STATUS_CONFIG[ReportStatus.OPEN];
  const StatusIcon = config.icon;

  const handleShare = async () => {
    const googleMapsUrl = hasGPS ? `https://www.google.com/maps?q=${report.latitude},${report.longitude}` : '';
    const shareText = `[SAFEGUARD K3 PELINDO]\nTemuan: ${report.findingType}\nDeskripsi: ${report.description}\nLokasi: ${hasGPS ? (address || `${report.latitude},${report.longitude}`) : 'Observasi Perilaku Lapangan'}\n${googleMapsUrl ? `Lihat di Peta: ${googleMapsUrl}` : ''}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Temuan K3 Pelindo',
          text: shareText,
          url: googleMapsUrl || undefined,
        });
      } catch (err) {
        console.log('Share canceled:', err);
      }
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const canDelete = isBPO || report.reportedBy?.uid === user?.uid;

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(report.id);
    }
  };

  return (
    <CardContainer
      className="glass-card"
      as={motion.div}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25 }}
      layout
    >
      {/* PHOTO PREVIEW HERO */}
      <ImageWrapper onClick={() => report.photoUrl && onImageClick?.(report.photoUrl)}>
  {report.photoUrl ? (
    <>
      <ReportImage
        src={report.photoUrl}
        alt="Foto Temuan K3"
        as={motion.img}
        whileHover={{ scale: 1.06 }}
        transition={{ duration: 0.4 }}
        referrerPolicy="no-referrer"
      />
      <ImageScrim />
    </>
  ) : (
          <NoImagePlaceholder>
            <ShieldAlert size={36} color="var(--text-muted)" />
            <span>Tanpa Lampiran Foto</span>
          </NoImagePlaceholder>
        )}

        {/* STATUS BADGE */}
        <StatusBadgeFloating
          bg={config.bg}
          border={config.border}
          color={config.color}
        >
          <StatusDot color={config.color} />
          <StatusIcon size={12} />
          <span>{config.label}</span>
        </StatusBadgeFloating>

        {/* FINDING TYPE BADGE */}
        <TypeBadgeFloating isCondition={isCondition}>
          {isCondition ? (
            <>
              <MapPin size={12} />
              <span>UNSAFE CONDITION</span>
            </>
          ) : (
            <>
              <ShieldAlert size={12} />
              <span>UNSAFE ACTION</span>
            </>
          )}
        </TypeBadgeFloating>
      </ImageWrapper>

      {/* CARD CONTENT */}
      <BodyContent>
        {/* TOP METADATA ROW: DATE & ACTIONS */}
        <MetaHeader>
          <DateBadge>
            <Calendar size={13} />
            <span>{report.date || "Hari Ini"}</span>
          </DateBadge>

          <ShareHeaderBtn
            onClick={handleShare}
            as={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Bagikan laporan ini via WhatsApp"
          >
            <Share2 size={13} />
            <span>Bagikan Laporan</span>
          </ShareHeaderBtn>
        </MetaHeader>

        {/* ALAMAT LAPORAN & LIHAT PETA */}
        <LocationContainer>
          <div className="location-header">
            <MapPin size={15} color="#38bdf8" />
            <span className="loc-label">ALAMAT LAPORAN</span>
          </div>

          <p className="addr-text">
            {hasGPS
              ? (address || `Area Dermaga Pelindo (${Number(report.latitude).toFixed(4)}, ${Number(report.longitude).toFixed(4)})`)
              : "Observasi Perilaku Lapangan • PT. Pelindo Multi Terminal"}
          </p>

          {/* LIHAT PETA (HANYA JIKA CONDITION / GPS) */}
          {hasGPS && (
            <LocationButtonRow>
              <ViewMapBtn
                onClick={() => setShowMap(!showMap)}
                as={motion.button}
                whileTap={{ scale: 0.96 }}
                active={showMap}
              >
                <Navigation size={13} />
                <span>{showMap ? "Tutup Peta" : "Lihat Peta"}</span>
              </ViewMapBtn>

              <ExternalMapLink
                href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                target="_blank"
                rel="noreferrer"
                title="Buka di Google Maps"
              >
                <ExternalLink size={12} />
                <span>Google Maps</span>
              </ExternalMapLink>
            </LocationButtonRow>
          )}
        </LocationContainer>

        {/* INTERACTIVE EXPANDABLE MAP */}
        <AnimatePresence>
          {showMap && hasGPS && (
            <MapAccordionWrapper
              as={motion.div}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 180 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <MapContainer
                center={[report.latitude, report.longitude]}
                zoom={16}
                style={{ height: "100%", width: "100%", borderRadius: "0.85rem" }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[report.latitude, report.longitude]} />
                <RecenterMap lat={report.latitude} lng={report.longitude} />
              </MapContainer>
            </MapAccordionWrapper>
          )}
        </AnimatePresence>

        {/* TEMUAN */}
        <TemuanBlock>
          <div className="section-title">
            <AlertTriangle size={13} color="#f59e0b" />
            <span>TEMUAN</span>
          </div>
          <p className="temuan-content">{report.description || "Tidak ada deskripsi temuan."}</p>
        </TemuanBlock>

        {/* USULAN PERBAIKAN */}
        <UsulanBlock>
          <div className="section-title">
            <Sparkles size={13} color="#38bdf8" />
            <span>USULAN PERBAIKAN</span>
          </div>
          <p className="usulan-content">
            {report.suggestion ? `"${report.suggestion}"` : "Belum ada usulan perbaikan spesifik."}
          </p>
        </UsulanBlock>

        {/* BPO RESOLUTION NOTE IF ALREADY RESOLVED */}
        {report.status === ReportStatus.CLOSED && (
          <ResolvedNote>
            <CheckCircle2 size={15} color="#10b981" />
            <div>
              <span className="title">Telah Terverifikasi Tuntas oleh BPO</span>
              {report.closedAt && <span className="date">Diselesaikan pada: {report.closedAt}</span>}
              {report.plannedAction && <p className="notes">Catatan: {report.plannedAction}</p>}
            </div>
          </ResolvedNote>
        )}
      </BodyContent>
    </CardContainer>
  );
}

// LUXURIOUS STYLED COMPONENTS
const CardContainer = styled.div`
  border-radius: 1.4rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  box-shadow: var(--card-shadow);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;

  &:hover {
    border-color: var(--border-hover);
    box-shadow: var(--card-shadow-hover);
  }
`;

const ImageWrapper = styled.div`
  height: 160px;
  position: relative;
  background: #0b1222;
  overflow: hidden;
  cursor: pointer;
`;

const ReportImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const ImageScrim = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(6, 9, 19, 0.4) 0%, transparent 40%, rgba(6, 9, 19, 0.8) 100%);
  pointer-events: none;
`;

const HoverZoomOverlay = styled.div`
  position: absolute;
  bottom: 12px;
  right: 12px;
  padding: 5px 10px;
  border-radius: 9999px;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: white;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 5px;
  opacity: 0.85;
  transition: opacity 0.2s;

  ${CardContainer}:hover & {
    opacity: 1;
  }
`;

const NoImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.5), rgba(15, 23, 42, 0.8));
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 600;
`;

const StatusBadgeFloating = styled.div<{ bg: string; border: string; color: string }>`
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 5px 10px;
  border-radius: 999px;
  background: ${({ bg }) => bg};
  border: 1px solid ${({ border }) => border};
  color: ${({ color }) => color};
  backdrop-filter: blur(14px);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.08em;
  display: flex;
  align-items: center;
  gap: 5px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
`;

const StatusDot = styled.span<{ color: string }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ color }) => color};
  box-shadow: 0 0 8px ${({ color }) => color};
`;

const TypeBadgeFloating = styled.div<{ isCondition: boolean }>`
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 5px 10px;
  border-radius: 999px;
  background: ${({ isCondition }) =>
    isCondition
      ? "linear-gradient(135deg, rgba(37, 99, 235, 0.9), rgba(14, 165, 233, 0.9))"
      : "linear-gradient(135deg, rgba(217, 119, 6, 0.9), rgba(245, 158, 11, 0.9))"};
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.25);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.08em;
  display: flex;
  align-items: center;
  gap: 5px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
`;

const BodyContent = styled.div`
  padding: 1.15rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  flex: 1;
`;

const MetaHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
`;

const DateBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-secondary);
  background: var(--bg-card-subtle);
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
`;

const ShareHeaderBtn = styled.button`
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;

  &:hover {
    background: #10b981;
    color: white;
  }
`;

const LocationContainer = styled.div`
  background: rgba(14, 165, 233, 0.07);
  border: 1px solid rgba(14, 165, 233, 0.2);
  border-radius: 0.9rem;
  padding: 0.75rem 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  .location-header {
    display: flex;
    align-items: center;
    gap: 6px;

    .loc-label {
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      color: #38bdf8;
    }
  }

  .addr-text {
    margin: 0;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.45;
  }
`;

const LocationButtonRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 0.25rem;
`;

const ViewMapBtn = styled.button<{ active?: boolean }>`
  background: ${({ active }) => (active ? "#0284c7" : "rgba(56, 189, 248, 0.15)")};
  color: ${({ active }) => (active ? "#ffffff" : "#38bdf8")};
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 0.55rem;
  padding: 4px 10px;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;

  &:hover {
    background: #0284c7;
    color: white;
  }
`;

const ExternalMapLink = styled.a`
  background: var(--bg-card-subtle);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.55rem;
  padding: 4px 10px;
  font-size: 0.72rem;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;

  &:hover {
    color: var(--text-primary);
    border-color: #38bdf8;
  }
`;

const TemuanBlock = styled.div`
  background: var(--bg-card-subtle);
  border-left: 3px solid #f59e0b;
  border-radius: 0 0.85rem 0.85rem 0;
  padding: 0.65rem 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 4px;

  .section-title {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    color: #f59e0b;
  }

  .temuan-content {
    margin: 0;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.5;
  }
`;

const UsulanBlock = styled.div`
  background: var(--bg-card-subtle);
  border-left: 3px solid #38bdf8;
  border-radius: 0 0.85rem 0.85rem 0;
  padding: 0.65rem 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 4px;

  .section-title {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    color: #38bdf8;
  }

  .usulan-content {
    margin: 0;
    font-size: 0.8rem;
    color: var(--text-secondary);
    line-height: 1.45;
  }
`;

const MapAccordionWrapper = styled.div`
  overflow: hidden;
  border-radius: 0.85rem;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
`;

const DescriptionBlock = styled.div`
  h4 {
    margin: 0;
    font-size: 0.85rem;
    font-weight: 600;
    line-height: 1.5;
    color: var(--text-primary);
  }
`;

const SuggestionBox = styled.div`
  background: var(--bg-card-subtle);
  border-left: 3px solid #38bdf8;
  border-radius: 0 0.75rem 0.75rem 0;
  padding: 0.6rem 0.85rem;

  .sugg-header {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    color: #38bdf8;
    margin-bottom: 3px;
  }

  p {
    margin: 0;
    font-size: 0.78rem;
    color: var(--text-secondary);
    font-style: italic;
    line-height: 1.45;
  }
`;

const ResolvedNote = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 0.75rem;
  padding: 0.6rem 0.8rem;

  .title {
    display: block;
    font-size: 0.75rem;
    font-weight: 700;
    color: #34d399;
  }

  .date {
    display: block;
    font-size: 0.68rem;
    color: var(--text-muted);
  }

  .notes {
    margin: 4px 0 0;
    font-size: 0.72rem;
    color: var(--text-secondary);
  }
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-color);
`;

const DeleteIconButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #ef4444;
    color: white;
  }
`;

const BpoActionBtn = styled.button`
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  border-radius: 0.75rem;
  padding: 0.45rem 0.9rem;
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
  transition: all 0.2s;

  &:hover {
    background: linear-gradient(135deg, #1d4ed8, #1e40af);
  }
`;

const BpoDrawer = styled.div`
  background: var(--bg-card-subtle);
  border: 1px solid var(--border-color);
  border-radius: 0.95rem;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin-top: 0.4rem;

  .drawer-header {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.72rem;
    font-weight: 800;
    color: #38bdf8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .input-field {
    display: flex;
    flex-direction: column;
    gap: 4px;

    label {
      font-size: 0.68rem;
      font-weight: 700;
      color: var(--text-secondary);
    }

    input, textarea {
      background: var(--bg-card-solid);
      border: 1px solid var(--border-color);
      border-radius: 0.6rem;
      padding: 0.5rem;
      color: var(--text-primary);
      font-size: 0.75rem;
      outline: none;
      font-family: inherit;

      &:focus {
        border-color: #3b82f6;
      }
    }
  }
`;

const DrawerSubmitBtn = styled.button`
  background: #10b981;
  color: white;
  border: none;
  border-radius: 0.65rem;
  padding: 0.55rem;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: background 0.2s;

  &:hover {
    background: #059669;
  }
`;
