import React, { useState, useRef, useEffect, useCallback } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import {
  X,
  Calendar,
  Camera,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Sparkles,
  MapPin,
  RefreshCw,
  Compass,
  ShieldAlert,
  ShieldCheck,
  UploadCloud,
  FileText,
  Lightbulb,
  Radio,
  Lock
} from "lucide-react";

const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({
  position,
  setPosition,
}: {
  position: [number, number] | null;
  setPosition: (pos: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : <Marker position={position} />;
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
      map.setView(center, 16);
    }, 350);
    return () => clearTimeout(timer);
  }, [map, center]);

  return null;
}

export default function ReportForm({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: any) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    findingType: "Unsafe Condition",
    description: "",
    suggestion: "",
    photo: null as string | null,
    latitude: null as number | null,
    longitude: null as number | null,
  });

  const [isFetchingGPS, setIsFetchingGPS] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // REAL-TIME GPS FETCHER
  const fetchCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError("Browser tidak mendukung sensor Geolocation GPS.");
      setFormData((prev) => ({ ...prev, latitude: -6.1033, longitude: 106.8792 }));
      return;
    }

    setIsFetchingGPS(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        setIsFetchingGPS(false);
      },
      (error) => {
        console.error("GPS fetch error:", error);
        setGpsError("Gagal mengambil GPS otomatis. Default ke Dermaga Pelindo.");
        setFormData((prev) => ({ ...prev, latitude: -6.1033, longitude: 106.8792 }));
        setIsFetchingGPS(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // 🎯 KUNCI UTAMA LOGIKA:
  // Unsafe Condition -> Mengambil titik GPS & menampilkan map picker
  // Unsafe Action -> Kosongkan GPS & sembunyikan map
  useEffect(() => {
    if (formData.findingType === "Unsafe Condition") {
      fetchCurrentLocation();
    } else {
      setFormData((prev) => ({
        ...prev,
        latitude: null,
        longitude: null,
      }));
      setGpsError(null);
      setIsFetchingGPS(false);
    }
  }, [formData.findingType, fetchCurrentLocation]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit(formData);
      setIsSubmitting(false);
    }, 400);
  };

  const isCondition = formData.findingType === "Unsafe Condition";

  return (
    <ModalCard
      className="glass-card"
      as={motion.div}
      initial={{ opacity: 0, scale: 0.94, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: 20 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* MODAL HEADER */}
      <HeaderSection>
        <div className="header-left">
          <div className="header-icon-box">
            <ShieldAlert size={22} color="#38bdf8" />
          </div>
          <div>
            <h3>BUAT LAPORAN TEMUAN K3</h3>
            <p>PT. Pelindo Multi Terminal • Formulir Observasi Keselamatan</p>
          </div>
        </div>

        <CloseButton
          onClick={onClose}
          as={motion.button}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <X size={18} />
        </CloseButton>
      </HeaderSection>

      {/* FORM BODY */}
      <FormBody onSubmit={handleSubmit}>
        {/* 1. SELEKSI TIPE TEMUAN (LUXURY INTERACTIVE CARDS) */}
        <SectionBlock>
          <SectionLabel>
            <Sparkles size={14} color="#38bdf8" />
            <span>PILIH KATEGORI TEMUAN K3</span>
          </SectionLabel>

          <TypeSelectorGrid>
            {/* OPTION 1: UNSAFE CONDITION */}
            <TypeCard
              active={isCondition}
              onClick={() => setFormData((p) => ({ ...p, findingType: "Unsafe Condition" }))}
              as={motion.div}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="card-top">
                <div className={`icon-bubble ${isCondition ? "active-blue" : ""}`}>
                  <Compass size={20} />
                </div>
                {isCondition && <CheckCircle2 size={16} color="#38bdf8" />}
              </div>
              <h4>Unsafe Condition</h4>
              <p className="desc">Kondisi fisik, fasilitas, atau lingkungan kerja yang tidak aman</p>
              <div className="gps-pill blue">
                <Radio size={11} className="animate-pulse" />
                <span>GPS Otomatis Terpetakan</span>
              </div>
            </TypeCard>

            {/* OPTION 2: UNSAFE ACTION */}
            <TypeCard
              active={!isCondition}
              onClick={() => setFormData((p) => ({ ...p, findingType: "Unsafe Action" }))}
              as={motion.div}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="card-top">
                <div className={`icon-bubble ${!isCondition ? "active-amber" : ""}`}>
                  <ShieldAlert size={20} />
                </div>
                {!isCondition && <CheckCircle2 size={16} color="#fbbf24" />}
              </div>
              <h4>Unsafe Action</h4>
              <p className="desc">Perilaku manusia, pelanggaran APD, atau tindakan berisiko</p>
              <div className="gps-pill amber">
                <Lock size={11} />
                <span>Tanpa Rekam GPS (Observasi)</span>
              </div>
            </TypeCard>
          </TypeSelectorGrid>
        </SectionBlock>

        {/* 2. DYNAMIC GPS SECTION (CONDITIONAL) */}
        <AnimatePresence mode="wait">
          {isCondition ? (
            <GPSBox
              as={motion.div}
              key="gps-active"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="gps-header">
                <div className="header-badge">
                  <span className="live-dot" />
                  <span>SISTEM GEOLOCATION AKTIF</span>
                </div>
                <RefreshBtn
                  type="button"
                  onClick={fetchCurrentLocation}
                  disabled={isFetchingGPS}
                  as={motion.button}
                  whileTap={{ scale: 0.92 }}
                >
                  <RefreshCw size={12} className={isFetchingGPS ? "spin" : ""} />
                  <span>{isFetchingGPS ? "Mencari GPS..." : "Perbarui Titik GPS"}</span>
                </RefreshBtn>
              </div>

              {formData.latitude && formData.longitude && (
                <CoordinatesDisplay>
                  <div className="coord-item">
                    <span className="label">LATITUDE:</span>
                    <span className="val">{formData.latitude.toFixed(6)}</span>
                  </div>
                  <div className="coord-item">
                    <span className="label">LONGITUDE:</span>
                    <span className="val">{formData.longitude.toFixed(6)}</span>
                  </div>
                </CoordinatesDisplay>
              )}

              {gpsError && (
                <AlertBanner>
                  <AlertCircle size={14} />
                  <span>{gpsError}</span>
                </AlertBanner>
              )}

              {/* MAP PICKER */}
              <MapPickerContainer>
                {formData.latitude && formData.longitude ? (
                  <MapContainer
                    center={[formData.latitude, formData.longitude]}
                    zoom={16}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      attribution="&copy; OpenStreetMap"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker
                      position={[formData.latitude, formData.longitude]}
                      setPosition={(pos) =>
                        setFormData((p) => ({ ...p, latitude: pos[0], longitude: pos[1] }))
                      }
                    />
                    <MapController center={[formData.latitude, formData.longitude]} />
                  </MapContainer>
                ) : (
                  <div className="map-placeholder">
                    <Radio size={24} className="animate-spin text-blue-400" />
                    <span>Menginisialisasi peta pelabuhan...</span>
                  </div>
                )}
                <div className="map-instruction">
                  <MapPin size={12} />
                  <span>Klik pada peta jika ingin menggeser titik koordinat temuan</span>
                </div>
              </MapPickerContainer>
            </GPSBox>
          ) : (
            <PrivacyReassuranceBox
              as={motion.div}
              key="gps-disabled"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="privacy-icon">
                <ShieldCheck size={26} color="#fbbf24" />
              </div>
              <div className="privacy-text">
                <h5>Observasi Tindakan (Tanpa Rekam GPS)</h5>
                <p>
                  Untuk kategori <strong>Unsafe Action</strong>, sistem tidak menyimpan koordinat geografis pelapor demi menjaga objektivitas dan fokus evaluasi pada edukasi keselamatan kerja.
                </p>
              </div>
            </PrivacyReassuranceBox>
          )}
        </AnimatePresence>

        {/* 3. TANGGAL & FOTO LAPANGAN */}
        <TwoColGrid>
          <FieldGroup>
            <FieldLabel>
              <Calendar size={13} color="#38bdf8" />
              <span>TANGGAL TEMUAN</span>
            </FieldLabel>
            <StyledInput
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
              required
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>
              <Camera size={13} color="#38bdf8" />
              <span>DOKUMENTASI FOTO (OPSIONAL)</span>
            </FieldLabel>

            <PhotoUploadArea
              isDragging={isDragging}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handlePhotoUpload}
              />

              {formData.photo ? (
                <PhotoPreviewContainer>
                  <img src={formData.photo} alt="Preview Bukti" />
                  <RemovePhotoBtn
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData((p) => ({ ...p, photo: null }));
                    }}
                  >
                    <X size={13} />
                  </RemovePhotoBtn>
                </PhotoPreviewContainer>
              ) : (
                <UploadPrompt>
                  <UploadCloud size={24} color="#38bdf8" />
                  <span>Klik atau seret foto bukti di sini</span>
                </UploadPrompt>
              )}
            </PhotoUploadArea>
          </FieldGroup>
        </TwoColGrid>

        {/* 4. DESKRIPSI TEMUAN */}
        <FieldGroup>
          <FieldLabel>
            <FileText size={13} color="#38bdf8" />
            <span>DESKRIPSI TEMUAN BAHAYA</span>
          </FieldLabel>
          <StyledTextarea
            rows={3}
            placeholder="Jelaskan secara rinci apa yang Anda lihat, lokasi persis, kondisi bahaya atau tindakan yang membahayakan..."
            value={formData.description}
            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
            required
          />
        </FieldGroup>

        {/* 5. USULAN PERBAIKAN / SARAN */}
        <FieldGroup>
          <FieldLabel>
            <Lightbulb size={13} color="#fbbf24" />
            <span>USULAN REKOMENDASI PERBAIKAN (SARAN MITIGASI)</span>
          </FieldLabel>
          <StyledTextarea
            rows={2}
            placeholder="Usulkan solusi cepat atau tindakan pencegahan yang sebaiknya dilakukan tim operasional/HSE..."
            value={formData.suggestion}
            onChange={(e) => setFormData((p) => ({ ...p, suggestion: e.target.value }))}
          />
        </FieldGroup>

        {/* ACTIONS */}
        <ModalFooter>
          <CancelBtn type="button" onClick={onClose}>
            Batal
          </CancelBtn>
          <SubmitBtn
            type="submit"
            disabled={isSubmitting || !formData.description.trim()}
            as={motion.button}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? (
              <>
                <RefreshCw size={15} className="spin" />
                <span>Mengirim Laporan...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Kirim Laporan K3</span>
              </>
            )}
          </SubmitBtn>
        </ModalFooter>
      </FormBody>
    </ModalCard>
  );
}

// LUXURY STYLED COMPONENTS
const ModalCard = styled.div`
  background: var(--bg-card-solid);
  border: 1px solid var(--border-color);
  border-radius: 1.75rem;
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.65), 0 0 1px 1px rgba(255, 255, 255, 0.1);
  overflow: hidden;
  max-width: 680px;
  width: 100%;
  margin: auto;
`;

const HeaderSection = styled.div`
  padding: 1.25rem 1.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-card-subtle);

  .header-left {
    display: flex;
    align-items: center;
    gap: 0.85rem;

    .header-icon-box {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: rgba(56, 189, 248, 0.12);
      border: 1px solid rgba(56, 189, 248, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    h3 {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: 0.04em;
    }

    p {
      margin: 2px 0 0;
      font-size: 0.72rem;
      color: var(--text-secondary);
    }
  }
`;

const CloseButton = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: rgba(148, 163, 184, 0.1);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
  }
`;

const FormBody = styled.form`
  padding: 1.5rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-height: 80vh;
  overflow-y: auto;
`;

const SectionBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
`;

const SectionLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
  text-transform: uppercase;
`;

const TypeSelectorGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const TypeCard = styled.div<{ active: boolean }>`
  border-radius: 1.15rem;
  padding: 1.1rem;
  cursor: pointer;
  border: 1.5px solid ${({ active }) => (active ? "#3b82f6" : "var(--border-color)")};
  background: ${({ active }) =>
    active ? "rgba(37, 99, 235, 0.12)" : "var(--bg-card-subtle)"};
  box-shadow: ${({ active }) =>
    active ? "0 8px 24px -6px rgba(37, 99, 235, 0.35)" : "none"};
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  transition: all 0.25s ease;

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .icon-bubble {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: rgba(148, 163, 184, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);

      &.active-blue {
        background: rgba(56, 189, 248, 0.2);
        color: #38bdf8;
      }

      &.active-amber {
        background: rgba(245, 158, 11, 0.2);
        color: #fbbf24;
      }
    }
  }

  h4 {
    margin: 0.2rem 0 0;
    font-size: 0.95rem;
    font-weight: 800;
    color: var(--text-primary);
  }

  .desc {
    margin: 0;
    font-size: 0.72rem;
    color: var(--text-secondary);
    line-height: 1.4;
  }

  .gps-pill {
    margin-top: 0.5rem;
    padding: 4px 8px;
    border-radius: 999px;
    font-size: 0.65rem;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    width: fit-content;

    &.blue {
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.3);
    }

    &.amber {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
  }
`;

const GPSBox = styled.div`
  background: rgba(14, 165, 233, 0.06);
  border: 1px solid rgba(14, 165, 233, 0.2);
  border-radius: 1.25rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  .gps-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.72rem;
      font-weight: 800;
      color: #38bdf8;
      letter-spacing: 0.05em;

      .live-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #10b981;
        box-shadow: 0 0 8px #10b981;
      }
    }
  }
`;

const RefreshBtn = styled.button`
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: #38bdf8;
  border-radius: 0.55rem;
  padding: 4px 10px;
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;

  .spin {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const CoordinatesDisplay = styled.div`
  display: flex;
  gap: 1rem;
  background: var(--bg-card-solid);
  padding: 0.5rem 0.8rem;
  border-radius: 0.65rem;
  border: 1px solid var(--border-color);

  .coord-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.72rem;

    .label {
      font-weight: 700;
      color: var(--text-muted);
    }
    .val {
      font-family: monospace;
      font-weight: 700;
      color: #38bdf8;
    }
  }
`;

const AlertBanner = styled.div`
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #fbbf24;
  border-radius: 0.65rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.72rem;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const MapPickerContainer = styled.div`
  height: 180px;
  border-radius: 0.95rem;
  overflow: hidden;
  position: relative;
  border: 1px solid var(--border-color);

  .map-placeholder {
    width: 100%;
    height: 100%;
    background: #0b1120;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--text-secondary);
    font-size: 0.78rem;
  }

  .map-instruction {
    position: absolute;
    bottom: 8px;
    left: 8px;
    right: 8px;
    z-index: 1000;
    background: rgba(15, 23, 42, 0.85);
    backdrop-filter: blur(6px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 0.5rem;
    padding: 4px 8px;
    color: white;
    font-size: 0.68rem;
    display: flex;
    align-items: center;
    gap: 5px;
    pointer-events: none;
  }
`;

const PrivacyReassuranceBox = styled.div`
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: 1.25rem;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;

  .privacy-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: rgba(245, 158, 11, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .privacy-text {
    h5 {
      margin: 0;
      font-size: 0.85rem;
      font-weight: 800;
      color: #fbbf24;
    }
    p {
      margin: 3px 0 0;
      font-size: 0.72rem;
      color: var(--text-secondary);
      line-height: 1.45;
    }
  }
`;

const TwoColGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
`;

const FieldLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: var(--text-secondary);
`;

const StyledInput = styled.input`
  background: var(--bg-card-subtle);
  border: 1px solid var(--border-color);
  border-radius: 0.85rem;
  padding: 0.75rem 0.9rem;
  color: var(--text-primary);
  font-size: 0.82rem;
  outline: none;
  font-family: inherit;
  transition: all 0.2s;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
`;

const StyledTextarea = styled.textarea`
  background: var(--bg-card-subtle);
  border: 1px solid var(--border-color);
  border-radius: 0.85rem;
  padding: 0.75rem 0.9rem;
  color: var(--text-primary);
  font-size: 0.82rem;
  outline: none;
  font-family: inherit;
  resize: vertical;
  line-height: 1.5;
  transition: all 0.2s;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }

  &::placeholder {
    color: var(--text-muted);
  }
`;

const PhotoUploadArea = styled.div<{ isDragging: boolean }>`
  border: 1.5px dashed ${({ isDragging }) => (isDragging ? "#38bdf8" : "var(--border-color)")};
  border-radius: 0.85rem;
  padding: 0.75rem;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: ${({ isDragging }) =>
    isDragging ? "rgba(56, 189, 248, 0.1)" : "var(--bg-card-subtle)"};
  transition: all 0.2s;

  &:hover {
    border-color: #38bdf8;
  }
`;

const UploadPrompt = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
  font-size: 0.72rem;
  text-align: center;
`;

const PhotoPreviewContainer = styled.div`
  position: relative;
  width: 100%;
  height: 80px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 0.6rem;
  }
`;

const RemovePhotoBtn = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(239, 68, 68, 0.85);
  color: white;
  border: none;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
`;

const CancelBtn = styled.button`
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  border-radius: 0.85rem;
  padding: 0.65rem 1.25rem;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(148, 163, 184, 0.1);
    color: var(--text-primary);
  }
`;

const SubmitBtn = styled.button`
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #0284c7 100%);
  color: white;
  border: none;
  border-radius: 0.85rem;
  padding: 0.65rem 1.5rem;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
  transition: all 0.2s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
