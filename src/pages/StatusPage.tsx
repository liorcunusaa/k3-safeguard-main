import React, { useState, useMemo, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Bell,
  LogOut,
  X,
  Sparkles,
  Search,
  Filter,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  BarChart3,
  Shield,
  Lock,
  Sun,
  Moon,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Trophy,
  Trash2,
  RotateCcw,
  Calendar,
  MapPin,
  ExternalLink,
  ShieldAlert,
  AlertOctagon,
  Info,
  ClipboardList
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ReportStatus, UserRole } from "../constants/enums";
import ReportForm from "../components/ReportForm";
import ReportTable from "../components/ReportTable";
import NotificationBell from "../components/NotificationBell";
import { useTheme } from "../context/ThemeContext";
import AppSidebar from "../components/AppSidebar";
import { PageShell, PageShellContent } from "../components/PageShell";
import Pagination from "../components/Pagination";

const CircularProgress = ({
  percentage,
  color,
  trackColor,
  size = 56,
  strokeWidth = 6,
}: {
  percentage: number;
  color: string;
  trackColor?: string;
  size?: number;
  strokeWidth?: number;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPct = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset = circumference - (clampedPct / 100) * circumference;

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)", display: "block" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor || "rgba(255, 255, 255, 0.08)"}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          style={{
            transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </svg>
      <span
        style={{
          position: "absolute",
          fontSize: "0.72rem",
          fontWeight: 800,
          fontFamily: "'Inter', sans-serif",
          color: "var(--text-primary)",
        }}
      >
        {clampedPct}%
      </span>
    </div>
  );
};

type FilterTabType = "ALL" | "OPEN" | "IN_PROGRESS" | "CLOSED" | "SAMPAH";

const getInitialTab = (statusVal: string): FilterTabType => {
  if (statusVal === "SAMPAH") return "SAMPAH";
  if (statusVal === ReportStatus.OPEN) return "OPEN";
  if (statusVal === ReportStatus.IN_PROGRESS) return "IN_PROGRESS";
  if (statusVal === ReportStatus.CLOSED) return "CLOSED";
  return "ALL";
};

const PelindoLogo = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    style={{
      height: 32,
      width: 32,
      background: "linear-gradient(135deg, #2563eb, #1e40af)",
      borderRadius: 8,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontWeight: 900,
      flexShrink: 0,
      boxShadow: "0 4px 12px rgba(37, 99, 235, 0.35)",
    }}
  >
    <Shield size={18} />
  </motion.div>
);

interface StatusPageProps {
  user: any;
  reports: any[];
  allReports?: any[];
  deletedReports?: any[];
  status: string;
  notifications?: any[];
  onAddReport: (data: any) => void;
  onUpdateReport: (id: string, updates: any) => void;
  onDeleteReport: (id: string) => void;
  onRestoreReport?: (id: string) => void;
  onPermanentDelete?: (id: string) => void;
  onMarkNotificationsAsRead?: () => void;
  onMarkNotificationAsRead?: (id: string) => void;
  onLogout?: () => void;
  onToggleRole?: () => void;
}

export default function StatusPage({
  user,
  reports,
  allReports = [],
  deletedReports = [],
  status,
  notifications = [],
  onAddReport,
  onUpdateReport,
  onDeleteReport,
  onRestoreReport,
  onPermanentDelete,
  onMarkNotificationsAsRead,
  onMarkNotificationAsRead,
  onLogout,
  onToggleRole,
}: StatusPageProps) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [liveTime, setLiveTime] = useState<string>("");

  const isBPO = user?.role === UserRole.BPO;

  const [currentTab, setCurrentTab] = useState<FilterTabType>(() => getInitialTab(status));

  // Pagination state for Tempat Sampah
  const [trashPage, setTrashPage] = useState(1);
  const [trashItemsPerPage, setTrashItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentTab(getInitialTab(status));
  }, [status]);

  useEffect(() => {
    setTrashPage(1);
  }, [currentTab, searchQuery, selectedCategory]);

  const handleTabChange = (newTab: FilterTabType) => {
    setCurrentTab(newTab);
    if (newTab === "ALL") navigate("/reports/all");
    else if (newTab === "OPEN") navigate("/reports/menunggu");
    else if (newTab === "IN_PROGRESS") navigate("/reports/diproses");
    else if (newTab === "CLOSED") navigate("/reports/selesai");
    else if (newTab === "SAMPAH") navigate("/reports/sampah");
  };

  const isTrashView = currentTab === "SAMPAH";

  // REAL-TIME RUNNING CLOCK
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setLiveTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZoneName: "short",
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // COUNTS FOR STATUS TABS & CHARTS
  const counts = useMemo(() => {
    return {
      open: allReports.filter((r) => r.status === ReportStatus.OPEN).length,
      inProgress: allReports.filter((r) => r.status === ReportStatus.IN_PROGRESS).length,
      closed: allReports.filter((r) => r.status === ReportStatus.CLOSED).length,
      trash: deletedReports.length,
      total: allReports.length,
    };
  }, [allReports, deletedReports]);

  const percentages = useMemo(() => {
    const total = counts.total || 1;
    return {
      open: Math.round((counts.open / total) * 100),
      inProgress: Math.round((counts.inProgress / total) * 100),
      closed: Math.round((counts.closed / total) * 100),
    };
  }, [counts]);

  const displayedBaseReports = useMemo(() => {
    if (currentTab === "SAMPAH") {
      return deletedReports;
    }
    if (currentTab === "OPEN") {
      return allReports.filter((r) => r.status === ReportStatus.OPEN);
    }
    if (currentTab === "IN_PROGRESS") {
      return allReports.filter((r) => r.status === ReportStatus.IN_PROGRESS);
    }
    if (currentTab === "CLOSED") {
      return allReports.filter((r) => r.status === ReportStatus.CLOSED);
    }
    return allReports;
  }, [currentTab, allReports, deletedReports]);

  // CATEGORIES FOR DROPDOWN FILTER
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    set.add("Unsafe Action");
    set.add("Unsafe Condition");
    allReports.forEach((r) => {
      if (r.findingType) set.add(r.findingType);
    });
    deletedReports.forEach((r) => {
      if (r.findingType) set.add(r.findingType);
    });
    return Array.from(set);
  }, [allReports, deletedReports]);

  // FILTERED & SORTED REPORTS
  const filteredReports = useMemo(() => {
    let result = [...displayedBaseReports];
    if (selectedCategory && selectedCategory !== "ALL") {
      result = result.filter((r) => r.findingType === selectedCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          (r.description || "").toLowerCase().includes(q) ||
          (r.findingType || "").toLowerCase().includes(q) ||
          (r.suggestion || "").toLowerCase().includes(q) ||
          (r.disposisiUnit || "").toLowerCase().includes(q) ||
          (r.picName || "").toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => {
      const dateA = a.date || a.deletedAt || "";
      const dateB = b.date || b.deletedAt || "";
      if (dateA !== dateB) {
        return sortOrder === "newest"
          ? dateB.localeCompare(dateA)
          : dateA.localeCompare(dateB);
      }
      return (b.id || "").localeCompare(a.id || "");
    });
  }, [displayedBaseReports, selectedCategory, searchQuery, sortOrder]);

  // Pagination calculations for Tempat Sampah
  const trashTotalItems = filteredReports.length;
  const trashTotalPages = Math.max(1, Math.ceil(trashTotalItems / trashItemsPerPage));
  const validTrashPage = Math.min(Math.max(1, trashPage), trashTotalPages);
  const trashStartIndex = (validTrashPage - 1) * trashItemsPerPage;
  const trashEndIndex = Math.min(trashStartIndex + trashItemsPerPage, trashTotalItems);
  const paginatedTrashReports = useMemo(() => {
    return filteredReports.slice(trashStartIndex, trashEndIndex);
  }, [filteredReports, trashStartIndex, trashEndIndex]);

  const getStatusMeta = () => {
    switch (currentTab) {
      case "ALL":
        return {
          title: "SEMUA LAPORAN TEMUAN K3",
          badgeColor: "#3b82f6",
          icon: Shield,
          desc: "Monitoring terpusat seluruh temuan bahaya K3 aktif di lingkungan pelabuhan PT. Pelindo Multi Terminal.",
        };
      case "OPEN":
        return {
          title: "LAPORAN MENUNGGU VERIFIKASI",
          badgeColor: "#fbbf24",
          icon: AlertTriangle,
          desc: "Daftar temuan K3 baru yang memerlukan tinjauan, evaluasi risiko, dan disposisi tindakan perbaikan oleh Pengawas BPO.",
        };
      case "IN_PROGRESS":
        return {
          title: "LAPORAN SEDANG DIPROSES",
          badgeColor: "#0ea5e9",
          icon: Clock,
          desc: "Temuan K3 dalam tahapan eksekusi perbaikan teknis operasional terminal dengan target waktu penyelesaian aktif.",
        };
      case "CLOSED":
        return {
          title: "LAPORAN TUNTAS & SELESAI",
          badgeColor: "#10b981",
          icon: CheckCircle2,
          desc: "Arsip temuan bahaya yang telah diselesaikan, diperbaiki, dan diverifikasi tuntas oleh petugas HSE lapangan.",
        };
      case "SAMPAH":
        return {
          title: "TEMPAT SAMPAH (TRASH BIN)",
          badgeColor: "#ef4444",
          icon: Trash2,
          desc: "Laporan yang dihapus tersimpan di sini selama 30 hari sebelum dihapus permanen secara otomatis oleh sistem. Laporan dapat dipulihkan sewaktu-waktu.",
        };
      default:
        return {
          title: "STATUS LAPORAN BPO",
          badgeColor: "#3b82f6",
          icon: Shield,
          desc: "Kelola alur penanganan bahaya dan disposisi Pelindo Multi Terminal.",
        };
    }
  };

  const meta = getStatusMeta();
  const StatusIcon = meta.icon;

  // 🎯 KEBUTUHAN #4: JIKA BUKAN BPO, TAMPILKAN AKSES KHUSUS BPO
  if (!isBPO) {
    return (
      <PageShell>
        <AppSidebar user={user} onToggleRole={onToggleRole} onLogout={onLogout} />
        <PageShellContent>
        <Wrapper>
        <Header className="glass-card">
          <HeaderLeft>
            <PelindoLogo />
            <div>
              <Title className="font-brand">AKSES TERBATAS</Title>
              <Subtitle>PT. PELINDO MULTI TERMINAL</Subtitle>
            </div>
          </HeaderLeft>

          <HeaderRight>
          </HeaderRight>
        </Header>

        <RestrictedContainer>
          <RestrictedCard
            className="glass-card"
            as={motion.div}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <LockIconCircle>
              <Lock size={36} color="#f59e0b" />
            </LockIconCircle>
            <h2>Akses Khusus Pengawas BPO</h2>
            <p>
              Halaman Status Triage dan Manajemen Alur Laporan ini dikhususkan bagi akun dengan hak akses{" "}
              <strong>BPO (Badan Pengawas Operasional / HSE Supervisor)</strong> untuk mendisposisikan serta memverifikasi penanganan bahaya.
            </p>
            <ReturnDashboardLink onClick={() => navigate("/reports")}>
              ← Kembali ke Dashboard Kartu Temuan
            </ReturnDashboardLink>
          </RestrictedCard>
        </RestrictedContainer>
        </Wrapper>
        </PageShellContent>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <AppSidebar user={user} counts={counts} onToggleRole={onToggleRole} onLogout={onLogout} />
      <PageShellContent>
      <Wrapper>
      {/* HEADER WITH REALTIME CLOCK & CONTROLS */}
      <Header className="glass-card">
        <HeaderLeft>
          <PelindoLogo />
          <div>
            <Title className="font-brand">
              PORT SAFETY TRIAGE
              <Sparkles size={11} style={{ display: "inline", marginLeft: 5, color: meta.badgeColor }} />
            </Title>
            <Subtitle>PT. PELINDO MULTI TERMINAL • KHUSUS PENGAWAS BPO</Subtitle>
          </div>
        </HeaderLeft>

        <HeaderRight>
          {/* RUNNING CLOCK */}
          {liveTime && (
            <ClockBadge className="glass-card" title="Waktu Pelabuhan Aktif">
              <Clock size={13} color="#38bdf8" />
              <span>{liveTime}</span>
            </ClockBadge>
          )}

          {/* REALTIME NOTIFICATIONS */}
          {notifications && onMarkNotificationAsRead && (
            <NotificationBell
              notifications={notifications}
              onMarkAsRead={onMarkNotificationAsRead}
              onMarkAllAsRead={onMarkNotificationsAsRead}
            />
          )}

          {/* TAMBAH LAPORAN */}
          <PrimaryButton
            onClick={() => setIsReportModalOpen(true)}
            as={motion.button}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
          >
            <Plus size={15} /> Tambah Laporan
          </PrimaryButton>

          {/* EXIT ACCOUNT / LOGOUT */}
          {onLogout && (
            <IconButton
              danger
              onClick={onLogout}
              as={motion.button}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              title="Keluar dari Akun"
            >
              <LogOut size={17} />
            </IconButton>
          )}
        </HeaderRight>
      </Header>

      {/* MAIN BODY */}
      <Main>
        {/* 📊 STAT CARDS ANALITIK (SEPERTI DI DASHBOARD BPO / HSE SUPERVISOR) */}
        {!isTrashView && (
          <StatCardsGrid>
            {/* 1. TOTAL SEMUA LAPORAN */}
            <StatCard className="glass-card">
              <div className="card-top">
                <div
                  className="icon-badge"
                  style={{
                    background: "rgba(59, 130, 246, 0.15)",
                    color: "#3b82f6",
                    border: "1px solid rgba(59, 130, 246, 0.25)",
                  }}
                >
                  <ClipboardList size={20} />
                </div>
              </div>
              <div className="card-bottom">
                <div className="stat-text">
                  <span className="stat-num">{counts.total || 0}</span>
                  <span className="stat-label">Total Semua Laporan</span>
                </div>
                <div className="chart-box">
                  <CircularProgress
                    percentage={100}
                    color="#3b82f6"
                    trackColor="rgba(59, 130, 246, 0.12)"
                  />
                </div>
              </div>
            </StatCard>

            {/* 2. MENUNGGU VERIFIKASI */}
            <StatCard className="glass-card">
              <div className="card-top">
                <div
                  className="icon-badge"
                  style={{
                    background: "rgba(245, 158, 11, 0.15)",
                    color: "#f59e0b",
                    border: "1px solid rgba(245, 158, 11, 0.25)",
                  }}
                >
                  <AlertTriangle size={20} />
                </div>
              </div>
              <div className="card-bottom">
                <div className="stat-text">
                  <span className="stat-num">{counts.open || 0}</span>
                  <span className="stat-label">Menunggu Verifikasi</span>
                </div>
                <div className="chart-box">
                  <CircularProgress
                    percentage={percentages.open}
                    color="#f59e0b"
                    trackColor="rgba(245, 158, 11, 0.12)"
                  />
                </div>
              </div>
            </StatCard>

            {/* 3. SEDANG DIPROSES */}
            <StatCard className="glass-card">
              <div className="card-top">
                <div
                  className="icon-badge"
                  style={{
                    background: "rgba(14, 165, 233, 0.15)",
                    color: "#0ea5e9",
                    border: "1px solid rgba(14, 165, 233, 0.25)",
                  }}
                >
                  <Clock size={20} />
                </div>
              </div>
              <div className="card-bottom">
                <div className="stat-text">
                  <span className="stat-num">{counts.inProgress || 0}</span>
                  <span className="stat-label">Sedang Diproses</span>
                </div>
                <div className="chart-box">
                  <CircularProgress
                    percentage={percentages.inProgress}
                    color="#0ea5e9"
                    trackColor="rgba(14, 165, 233, 0.12)"
                  />
                </div>
              </div>
            </StatCard>

            {/* 4. TUNTAS & SELESAI */}
            <StatCard className="glass-card">
              <div className="card-top">
                <div
                  className="icon-badge"
                  style={{
                    background: "rgba(16, 185, 129, 0.15)",
                    color: "#10b981",
                    border: "1px solid rgba(16, 185, 129, 0.25)",
                  }}
                >
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <div className="card-bottom">
                <div className="stat-text">
                  <span className="stat-num">{counts.closed || 0}</span>
                  <span className="stat-label">Tuntas & Selesai</span>
                </div>
                <div className="chart-box">
                  <CircularProgress
                    percentage={percentages.closed}
                    color="#10b981"
                    trackColor="rgba(16, 185, 129, 0.12)"
                  />
                </div>
              </div>
            </StatCard>
          </StatCardsGrid>
        )}


        {/* 📑 PRESET FILTER TABS & TABEL DATA (SEPERTI GAMBAR DI ATAS) */}
        <TableAreaSection>
          {/* TAB NAVIGATION / FILTER TABS */}
          <FilterTabsBar>
            <FilterTabBtn
              $active={currentTab === "ALL"}
              onClick={() => handleTabChange("ALL")}
              type="button"
            >
              <span>All</span>
              <FilterTabCount $active={currentTab === "ALL"}>{counts.total}</FilterTabCount>
            </FilterTabBtn>

            <FilterTabBtn
              $active={currentTab === "OPEN"}
              $accentColor="#f59e0b"
              onClick={() => handleTabChange("OPEN")}
              type="button"
            >
              <span>Menunggu Verifikasi</span>
              {counts.open > 0 && <TabRedDot />}
              <FilterTabCount $active={currentTab === "OPEN"} $accentColor="#f59e0b">
                {counts.open}
              </FilterTabCount>
            </FilterTabBtn>

            <FilterTabBtn
              $active={currentTab === "IN_PROGRESS"}
              $accentColor="#0ea5e9"
              onClick={() => handleTabChange("IN_PROGRESS")}
              type="button"
            >
              <span>Sedang Diproses</span>
              <FilterTabCount $active={currentTab === "IN_PROGRESS"} $accentColor="#0ea5e9">
                {counts.inProgress}
              </FilterTabCount>
            </FilterTabBtn>

            <FilterTabBtn
              $active={currentTab === "CLOSED"}
              $accentColor="#10b981"
              onClick={() => handleTabChange("CLOSED")}
              type="button"
            >
              <span>Tuntas & Selesai</span>
              <FilterTabCount $active={currentTab === "CLOSED"} $accentColor="#10b981">
                {counts.closed}
              </FilterTabCount>
            </FilterTabBtn>

            <FilterTabBtn
              $active={currentTab === "SAMPAH"}
              $accentColor="#ef4444"
              onClick={() => handleTabChange("SAMPAH")}
              type="button"
            >
              <span>Tempat Sampah</span>
              <FilterTabCount $active={currentTab === "SAMPAH"} $accentColor="#ef4444">
                {counts.trash}
              </FilterTabCount>
            </FilterTabBtn>
          </FilterTabsBar>

          {/* SEARCH & FILTER TOOLBAR */}
          <SearchFilterRow>
            <SearchBox className="glass-card">
              <Search size={16} color="var(--text-secondary)" />
              <SearchInput
                placeholder="Cari deskripsi laporan, lokasi, PIC, atau usulan perbaikan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                  onClick={() => setSearchQuery("")}
                  title="Hapus pencarian"
                >
                  <X size={13} />
                </button>
              )}
            </SearchBox>

            <CategoryFilterBox className="glass-card">
              <Filter size={15} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
              <CategorySelect
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                title="Pencarian dropdown berdasarkan kategori"
              >
                <option value="ALL">Semua Kategori</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </CategorySelect>
              {selectedCategory !== "ALL" && (
                <button
                  style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center" }}
                  onClick={() => setSelectedCategory("ALL")}
                  title="Reset filter kategori"
                >
                  <X size={13} />
                </button>
              )}
            </CategoryFilterBox>
          </SearchFilterRow>

          {/* CONTENT VIEW: TABLE ALUR PENANGANAN ATAU TEMPAT SAMPAH */}
          {isTrashView ? (
            /* 🗑️ TABEL TEMPAT SAMPAH DENGAN RETENSI 30 HARI */
            <TrashViewSection>
              <TrashInfoBanner className="glass-card">
                <Info size={20} color="#ef4444" style={{ flexShrink: 0 }} />
                <div>
                  <h4>Kebijakan Pembersihan Otomatis 30 Hari</h4>
                  <p>
                    Setiap laporan yang dipindahkan ke Tempat Sampah akan disimpan secara aman selama 30 hari. Setelah melewati 30 hari, sistem secara otomatis menghapus catatan temuan secara permanen. Anda dapat memulihkan (restore) laporan kapan saja.
                  </p>
                </div>
              </TrashInfoBanner>

              {filteredReports.length === 0 ? (
                <EmptyTrashCard className="glass-card">
                  <div className="trash-icon-wrap">
                    <Trash2 size={44} color="#64748b" />
                  </div>
                  <h3>Tempat Sampah Bersih</h3>
                  <p>Tidak ada laporan temuan yang sedang berada di antrean tempat sampah saat ini.</p>
                </EmptyTrashCard>
              ) : (
                <TableOuter className="glass-card">
                  <TableScroll>
                    <StyledTable>
                      <thead>
                        <tr>
                          <th style={{ width: "50px", textAlign: "center" }}>No</th>
                          <th style={{ width: "80px" }}>Foto</th>
                          <th style={{ width: "120px" }}>Tanggal Lapor</th>
                          <th style={{ width: "130px" }}>Tanggal Dihapus</th>
                          <th style={{ width: "130px" }}>Jenis</th>
                          <th style={{ minWidth: "220px" }}>Deskripsi Temuan</th>
                          <th style={{ width: "160px" }}>Retensi Otomatis</th>
                          <th style={{ width: "180px", textAlign: "center" }}>Aksi BPO</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedTrashReports.map((report, idx) => {
                          const deletedDate = report.deletedAt ? new Date(report.deletedAt) : new Date();
                          const diffDays = Math.floor((Date.now() - deletedDate.getTime()) / (1000 * 60 * 60 * 24));
                          const daysLeft = Math.max(0, 30 - diffDays);

                          return (
                            <tr key={report.id || idx}>
                              <td style={{ textAlign: "center", fontWeight: 700, color: "var(--text-muted)" }}>
                                {trashStartIndex + idx + 1}
                              </td>
                              <td>
                                {report.photoUrl ? (
                                  <PhotoThumbnail
                                    src={report.photoUrl}
                                    alt="Foto Temuan"
                                    onClick={() => setSelectedImage(report.photoUrl)}
                                    title="Perbesar Foto"
                                  />
                                ) : (
                                  <NoPhotoBox>
                                    <ShieldAlert size={16} color="var(--text-muted)" />
                                  </NoPhotoBox>
                                )}
                              </td>
                              <td>
                                <DateBadge>
                                  <Calendar size={11} color="var(--text-secondary)" />
                                  <span>{report.date || "-"}</span>
                                </DateBadge>
                              </td>
                              <td>
                                <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                                  {report.deletedAt ? new Date(report.deletedAt).toLocaleDateString("id-ID") : "Baru saja"}
                                </span>
                              </td>
                              <td>
                                <TrashFindingBadge isCondition={report.findingType === "Unsafe Condition"}>
                                  {report.findingType === "Unsafe Condition" ? "CONDITION" : "ACTION"}
                                </TrashFindingBadge>
                              </td>
                              <td>
                                <p style={{ margin: 0, fontWeight: 700, color: "var(--text-primary)", fontSize: "0.78rem" }}>
                                  {report.description}
                                </p>
                                {report.suggestion && (
                                  <p style={{ margin: "2px 0 0", fontStyle: "italic", fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                                    Usulan: "{report.suggestion}"
                                  </p>
                                )}
                              </td>
                              <td>
                                <DaysLeftBadge isUrgent={daysLeft <= 5}>
                                  <Clock size={12} />
                                  <span>Sisa {daysLeft} Hari</span>
                                </DaysLeftBadge>
                              </td>
                              <td>
                                <ActionButtonsCell>
                                  {onRestoreReport && (
                                    <RestoreBtn
                                      onClick={() => onRestoreReport(report.id)}
                                      title="Pulihkan laporan kembali ke antrean aktif"
                                      as={motion.button}
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <RotateCcw size={13} />
                                      <span>Pulihkan</span>
                                    </RestoreBtn>
                                  )}
                                  {onPermanentDelete && (
                                    <PermanentDeleteBtn
                                      onClick={() => {
                                        if (window.confirm("PERINGATAN: Hapus laporan ini secara permanen sekarang? Tindakan ini tidak dapat dibatalkan.")) {
                                          onPermanentDelete(report.id);
                                        }
                                      }}
                                      title="Hapus permanen sekarang"
                                      as={motion.button}
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <Trash2 size={13} />
                                    </PermanentDeleteBtn>
                                  )}
                                </ActionButtonsCell>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </StyledTable>
                  </TableScroll>
                  <Pagination
                    currentPage={validTrashPage}
                    totalPages={trashTotalPages}
                    totalItems={trashTotalItems}
                    itemsPerPage={trashItemsPerPage}
                    onPageChange={setTrashPage}
                    onItemsPerPageChange={setTrashItemsPerPage}
                    itemLabel="laporan di tempat sampah"
                  />
                </TableOuter>
              )}
            </TrashViewSection>
          ) : (
            /* 📋 TABEL ALUR PENANGANAN UTAMA */
            <TableWrapper>
              <ReportTable
                reports={filteredReports}
                user={user}
                onUpdate={onUpdateReport}
                onDelete={onDeleteReport}
                hideActions={false}
                onImageClick={(url: string) => setSelectedImage(url)}
              />
            </TableWrapper>
          )}
        </TableAreaSection>
      </Main>

      {/* MODAL TAMBAH LAPORAN */}
      <AnimatePresence>
        {isReportModalOpen && (
          <ModalOverlay
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ModalContent>
              <ReportForm
                onClose={() => setIsReportModalOpen(false)}
                onSubmit={(d) => {
                  onAddReport(d);
                  setIsReportModalOpen(false);
                }}
              />
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* IMAGE ZOOM LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedImage && (
          <LightboxOverlay
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <LightboxContent
              as={motion.div}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <LightboxCloseBtn onClick={() => setSelectedImage(null)}>
                <X size={20} />
              </LightboxCloseBtn>
              <img src={selectedImage} alt="Foto Temuan HD" />
            </LightboxContent>
          </LightboxOverlay>
        )}
      </AnimatePresence>
      </Wrapper>
      </PageShellContent>
    </PageShell>
  );
}

// LUXURY STYLED COMPONENTS
const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1.75rem;
  border-bottom: 1px solid var(--border-color);
  backdrop-filter: blur(12px);
  background: var(--bg-card);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 1.05rem;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: 0.04em;
`;

const Subtitle = styled.p`
  font-size: 0.65rem;
  color: var(--text-muted);
  font-weight: 700;
  letter-spacing: 0.08em;
  margin: 1px 0 0;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const ClockBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 9px;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  font-family: monospace;
`;

const ThemeToggleBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 9px;
  border: 1px solid var(--border-color);
  background: var(--bg-card-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--border-hover);
  }
`;

const IconButton = styled.button<{ danger?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 9px;
  border: 1px solid var(--border-color);
  background: var(--bg-card-subtle);
  color: ${({ danger }) => (danger ? "#ef4444" : "var(--text-secondary)")};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ danger }) => (danger ? "rgba(239, 68, 68, 0.15)" : "var(--border-hover)")};
    color: ${({ danger }) => (danger ? "#ef4444" : "var(--text-primary)")};
  }
`;

const Main = styled.main`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const StatCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.15rem;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled(motion.div)`
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 1.25rem;
  padding: 1.25rem 1.35rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.2rem;
  box-shadow: var(--card-shadow);
  backdrop-filter: blur(14px);
  cursor: default;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  .card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .icon-badge {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
    }
  }

  .card-bottom {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 0.75rem;

    .stat-text {
      display: flex;
      flex-direction: column;
      gap: 3px;

      .stat-num {
        font-size: 1.75rem;
        font-weight: 800;
        font-family: 'Inter', sans-serif;
        color: var(--text-primary);
        line-height: 1.15;
      }

      .stat-label {
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--text-secondary);
        white-space: nowrap;
      }
    }

    .chart-box {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
`;

const TableAreaSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
`;

const FilterTabsBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  border-bottom: 2px solid var(--border-color);
  padding: 0 0.5rem;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const FilterTabBtn = styled.button<{ $active: boolean; $accentColor?: string }>`
  background: transparent;
  border: none;
  padding: 0.55rem 0.2rem 0.75rem;
  font-size: 0.8rem;
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  color: ${({ $active, $accentColor }) =>
    $active ? ($accentColor || "#6366f1") : "var(--text-secondary)"};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  position: relative;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover {
    color: ${({ $active, $accentColor }) =>
      $active ? ($accentColor || "#6366f1") : "var(--text-primary)"};
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ $active, $accentColor }) =>
      $active ? ($accentColor || "#6366f1") : "transparent"};
    border-radius: 3px 3px 0 0;
    transition: all 0.2s ease;
  }
`;

const TabRedDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ef4444;
  display: inline-block;
  margin-top: -6px;
  margin-left: -2px;
`;

const FilterTabCount = styled.span<{ $active: boolean; $accentColor?: string }>`
  font-size: 0.68rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 999px;
  background: ${({ $active, $accentColor }) =>
    $active
      ? ($accentColor ? `${$accentColor}18` : "rgba(99, 102, 241, 0.12)")
      : "var(--bg-card-subtle)"};
  color: ${({ $active, $accentColor }) =>
    $active
      ? ($accentColor || "#6366f1")
      : "var(--text-muted)"};
  border: 1px solid
    ${({ $active, $accentColor }) =>
      $active
        ? ($accentColor ? `${$accentColor}33` : "rgba(99, 102, 241, 0.25)")
        : "var(--border-color)"};
`;

const PrimaryButton = styled.button`
  background: linear-gradient(135deg, #0284c7, #2563eb);
  color: white;
  border: none;
  border-radius: 9px;
  padding: 8px 15px;
  font-size: 0.8rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4);
`;

const StatusBanner = styled.div<{ badgeColor: string }>`
  border-radius: 1.25rem;
  padding: 1.25rem 1.6rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  box-shadow: var(--card-shadow);

  .banner-icon {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: ${({ badgeColor }) => `${badgeColor}18`};
    border: 1px solid ${({ badgeColor }) => `${badgeColor}35`};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .banner-content {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .banner-top {
      display: flex;
      align-items: center;
      gap: 8px;

      .badge {
        font-size: 0.65rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        color: ${({ badgeColor }) => badgeColor};
      }

      .count-pill {
        font-size: 0.68rem;
        color: var(--text-muted);
        background: var(--bg-card-subtle);
        padding: 2px 8px;
        border-radius: 6px;
        border: 1px solid var(--border-color);
      }
    }

    h3 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--text-primary);
    }

    p {
      margin: 0;
      font-size: 0.78rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }
  }
`;

const SearchFilterRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  min-width: 300px;
  flex: 1;
  max-width: 480px;
`;

const SearchInput = styled.input`
  background: transparent;
  border: none;
  outline: none;
  font-size: 0.78rem;
  color: var(--text-primary);
  font-family: inherit;
  width: 100%;
`;

const CategoryFilterBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  box-shadow: var(--card-shadow);
  backdrop-filter: blur(14px);
  min-width: 190px;
  max-width: 260px;
`;

const CategorySelect = styled.select`
  background: transparent;
  border: none;
  outline: none;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-primary);
  font-family: inherit;
  width: 100%;
  cursor: pointer;

  option {
    background: var(--bg-card, #1e293b);
    color: var(--text-primary, #ffffff);
  }
`;

const TableWrapper = styled.div`
  width: 100%;
`;

const TrashViewSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TrashInfoBanner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 1rem;
  border: 1px solid rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.08);

  h4 {
    margin: 0;
    font-size: 0.85rem;
    font-weight: 800;
    color: #ef4444;
  }

  p {
    margin: 3px 0 0;
    font-size: 0.75rem;
    color: var(--text-secondary);
    line-height: 1.45;
  }
`;

const EmptyTrashCard = styled.div`
  border-radius: 1.5rem;
  padding: 4rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  border: 1px solid var(--border-color);

  .trash-icon-wrap {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    background: var(--bg-card-subtle);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  h3 {
    color: var(--text-primary);
    font-size: 1.15rem;
    margin: 0;
    font-weight: 800;
  }

  p {
    font-size: 0.82rem;
    color: var(--text-secondary);
    margin: 0;
  }
`;

const TableOuter = styled.div`
  border-radius: 1.25rem;
  border: 1px solid var(--border-color);
  overflow: hidden;
  background: var(--bg-card);
  box-shadow: var(--card-shadow);
`;

const TableScroll = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.8rem;

  thead {
    background: var(--bg-card-subtle);
    border-bottom: 1px solid var(--border-color);

    th {
      padding: 0.9rem 1rem;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      color: var(--text-secondary);
      text-transform: uppercase;
      white-space: nowrap;
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid var(--border-color);
      transition: background 0.15s ease;

      &:hover {
        background: var(--bg-card-subtle);
      }

      &:last-child {
        border-bottom: none;
      }

      td {
        padding: 0.9rem 1rem;
        vertical-align: middle;
      }
    }
  }
`;

const PhotoThumbnail = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.08);
  }
`;

const NoPhotoBox = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: var(--bg-card-subtle);
  border: 1px dashed var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DateBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  color: var(--text-secondary);
  background: var(--bg-card-subtle);
  padding: 3px 7px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  white-space: nowrap;
`;

const TrashFindingBadge = styled.span<{ isCondition: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 3px 7px;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 800;
  background: ${({ isCondition }) => (isCondition ? "rgba(56, 189, 248, 0.12)" : "rgba(245, 158, 11, 0.12)")};
  color: ${({ isCondition }) => (isCondition ? "#38bdf8" : "#fbbf24")};
  border: 1px solid ${({ isCondition }) => (isCondition ? "rgba(56, 189, 248, 0.25)" : "rgba(245, 158, 11, 0.25)")};
`;

const DaysLeftBadge = styled.div<{ isUrgent: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 800;
  background: ${({ isUrgent }) => (isUrgent ? "rgba(239, 68, 68, 0.15)" : "rgba(148, 163, 184, 0.12)")};
  color: ${({ isUrgent }) => (isUrgent ? "#ef4444" : "var(--text-primary)")};
  border: 1px solid ${({ isUrgent }) => (isUrgent ? "rgba(239, 68, 68, 0.35)" : "var(--border-color)")};
  white-space: nowrap;
`;

const ActionButtonsCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

const RestoreBtn = styled.button`
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 7px;
  padding: 5px 9px;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;

  &:hover {
    background: #10b981;
    color: white;
  }
`;

const PermanentDeleteBtn = styled.button`
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 7px;
  padding: 5px 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: #ef4444;
    color: white;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
`;

const ModalContent = styled.div`
  width: 100%;
  max-width: 600px;
`;

const LightboxOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const LightboxContent = styled.div`
  position: relative;
  max-width: 90vw;
  max-height: 85vh;

  img {
    max-width: 100%;
    max-height: 80vh;
    border-radius: 12px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.2);
    object-fit: contain;
  }
`;

const LightboxCloseBtn = styled.button`
  position: absolute;
  top: -16px;
  right: -16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  color: black;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
`;

const RestrictedContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
`;

const RestrictedCard = styled.div`
  max-width: 480px;
  width: 100%;
  border-radius: 1.5rem;
  padding: 2.5rem 2rem;
  text-align: center;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 900;
    color: var(--text-primary);
  }

  p {
    margin: 0;
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.55;
  }
`;

const LockIconCircle = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
`;

const ReturnDashboardLink = styled.button`
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: var(--text-primary);
  }
`;
