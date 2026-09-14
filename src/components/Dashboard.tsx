import React, { useState, useMemo, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Bell,
  LogOut,
  X,
  Sparkles,
  BarChart3,
  Trophy,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Filter,
  Layers,
  MapPin,
  ChevronRight,
  Shield,
  ShieldCheck,
  Activity,
  Lock,
  Sun,
  Moon,
  Compass,
  Flame,
  Radio,
  Check,
  Award,
  Calendar,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  LayoutGrid,
  List,
  Menu,
  Home,
  ClipboardCheck,
  PanelLeftClose,
  PanelLeftOpen,
  UserCheck,
  ClipboardList,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { ReportStatus, UserRole } from "../constants/enums";
import ReportForm from "./ReportForm";
import ReportCard from "./ReportCard";
import RiskMap from "./RiskMap";
import { useTheme } from "../context/ThemeContext";
import { auth, signOut } from "../firebase";

const formatDepartmentLabel = (division?: string) => {
  const value = (division || "Operasional & Bongkar Muat").trim();
  return /^departemen\b/i.test(value) ? value : `Departemen ${value}`;
};

const PelindoLogo = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ rotate: 5, scale: 1.05 }}
    style={{
      height: 42,
      width: 42,
      background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #0284c7 100%)",
      borderRadius: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontWeight: 900,
      boxShadow: "0 6px 20px rgba(37, 99, 235, 0.45), inset 0 1px 1px rgba(255,255,255,0.4)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
    }}
  >
    <Shield size={24} />
  </motion.div>
);

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

export default function Dashboard({
  user,
  reports,
  notifications,
  onAddReport,
  onUpdateReport,
  onDeleteReport,
  onMarkNotificationsAsRead,
  onMarkNotificationAsRead,
  onLogout,
  onToggleRole,
}: {
  user: any;
  reports: any[];
  notifications: any[];
  onAddReport: (data: any) => void;
  onUpdateReport: (id: string, updates: any) => void;
  onDeleteReport: (id: string) => void;
  onMarkNotificationsAsRead: () => void;
  onMarkNotificationAsRead: (id: string) => void;
  onLogout: () => void;
  onToggleRole?: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"cards" | "map">("cards");
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [liveTime, setLiveTime] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem("safeguard_sidebar_collapsed") === "true";
  });

  useEffect(() => {
    localStorage.setItem("safeguard_sidebar_collapsed", String(isSidebarCollapsed));
    if (isSidebarCollapsed) {
      document.body.classList.add("sidebar-collapsed");
    } else {
      document.body.classList.remove("sidebar-collapsed");
    }
  }, [isSidebarCollapsed]);

  // Live Port Clock
  useEffect(() => {
    const updateTime = () => {
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
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isBPO = user?.role === UserRole.BPO;

  const counts = useMemo(() => {
    return {
      total: reports.length,
      open: reports.filter((r) => r.status === ReportStatus.OPEN).length,
      inProgress: reports.filter((r) => r.status === ReportStatus.IN_PROGRESS).length,
      closed: reports.filter((r) => r.status === ReportStatus.CLOSED).length,
      condition: reports.filter((r) => r.findingType === "Unsafe Condition").length,
      action: reports.filter((r) => r.findingType === "Unsafe Action").length,
      myReports: reports.filter((r) => r.reportedBy?.uid === user?.uid).length,
    };
  }, [reports, user]);

  const percentages = useMemo(() => {
    const total = counts.total || 0;
    return {
      open: total > 0 ? Math.round((counts.open / total) * 100) : 0,
      inProgress: total > 0 ? Math.round((counts.inProgress / total) * 100) : 0,
      closed: total > 0 ? Math.round((counts.closed / total) * 100) : 0,
    };
  }, [counts]);

  const filteredReports = useMemo(() => {
    const list = reports.filter((r) => {
      // Jika mode BPO, filterType dan searchQuery aktif
      if (isBPO) {
        const matchType = filterType === "ALL" || r.findingType === filterType;
        const matchSearch =
          !searchQuery ||
          r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.findingType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.suggestion?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchType && matchSearch;
      }
      // Mode Pelapor Lapangan (User): Tampilkan semua laporan tanpa filter
      return true;
    });

    return [...list].sort((a, b) => {
      const getReportTime = (item: any) => {
        if (item?.createdAt?.seconds) return item.createdAt.seconds * 1000;
        if (typeof item?.createdAt?.toMillis === "function") return item.createdAt.toMillis();
        if (item?.createdAt && typeof item.createdAt === "string") {
          const t = new Date(item.createdAt).getTime();
          if (!isNaN(t)) return t;
        }
        if (item?.date) {
          const t = new Date(item.date).getTime();
          if (!isNaN(t)) return t;
        }
        return 0;
      };

      const timeA = getReportTime(a);
      const timeB = getReportTime(b);
      if (timeB !== timeA) {
        const order = isBPO ? sortOrder : "newest";
        return order === "newest" ? timeB - timeA : timeA - timeB;
      }
      const order = isBPO ? sortOrder : "newest";
      return order === "newest"
        ? (b.id || "").localeCompare(a.id || "")
        : (a.id || "").localeCompare(b.id || "");
    });
  }, [reports, filterType, sortOrder, searchQuery, isBPO]);

  const hasUnread = notifications.some((n) => !n.isRead);

  const navigationItems: { label: string; path: string; icon: any; bpoOnly?: boolean }[] = [
    { label: "Dashboard", path: "/reports", icon: Home },
    { label: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { label: "Analitik", path: "/analytics", icon: BarChart3, bpoOnly: true },
  ];

  return (
    <Wrapper className={isSidebarCollapsed ? "sidebar-collapsed" : ""}>
      <Sidebar className={`${isSidebarOpen ? "open" : ""} ${isSidebarCollapsed ? "collapsed" : ""}`}>
        {/* BRAND / HEADER AREA WITH LOGGED-IN USER ACCOUNT */}
        <SidebarBrand style={{ paddingBottom: "1rem" }}>
          <BrandLogoButton
            className="brand-logo-toggle"
            onClick={() => setIsSidebarCollapsed((current) => !current)}
            title={isSidebarCollapsed ? "Buka sidebar" : "Ciutkan sidebar"}
            aria-label={isSidebarCollapsed ? "Buka sidebar" : "Ciutkan sidebar"}
          >
            <SidebarAvatar>{user?.name?.charAt(0) || "U"}</SidebarAvatar>
            <span className="logo-open-icon"><PanelLeftOpen size={18} /></span>
          </BrandLogoButton>
          <div className="brand-copy" style={{ overflow: "hidden" }}>
            <BrandTitle style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: "0.78rem" }}>
              {user?.name || "Petugas Pelindo"}
            </BrandTitle>
            <BrandSubtitle style={{ fontSize: "0.58rem" }}>
              {isBPO ? "BPO / HSE Supervisor" : "Pelapor Lapangan"}
            </BrandSubtitle>
          </div>
          <BrandCollapseButton
            className="brand-collapse-button"
            onClick={() => setIsSidebarCollapsed((current) => !current)}
            title="Ciutkan sidebar"
            aria-label="Ciutkan sidebar"
          >
            <PanelLeftClose size={16} />
          </BrandCollapseButton>
        </SidebarBrand>

        <SidebarSectionLabel className="sidebar-section-label">WORKSPACE</SidebarSectionLabel>
        <SidebarNav>
          {navigationItems.filter((item) => !item.bpoOnly || isBPO).map((item) => {
            const Icon = item.icon;
            const isActive = item.path === "/reports"
              ? location.pathname === "/reports"
              : location.pathname === item.path;
            return (
              <SidebarNavItem
                className="sidebar-nav-item"
                key={item.path}
                active={isActive}
                title={item.label}
                onClick={() => {
                  navigate(item.path);
                  setIsSidebarOpen(false);
                }}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </SidebarNavItem>
            );
          })}
                </SidebarNav>

        {/* FOOTER: LOGOUT BUTTON (ANCHORED) */}
        <SidebarFooter className="sidebar-footer">
          <SidebarLogoutButton
            className="logout-btn"
            onClick={async () => {
              sessionStorage.removeItem("safeguard_role_override");
              if (onLogout) {
                onLogout();
              } else {
                try {
                  await signOut(auth);
                } catch (err) {
                  console.error("Signout error:", err);
                }
              }
              setIsSidebarOpen(false);
            }}
            title="Keluar"
            type="button"
          >
            <div className="logout-icon">
              <LogOut size={13} />
            </div>
            <span className="logout-label">Keluar</span>
          </SidebarLogoutButton>
        </SidebarFooter>
      </Sidebar>
        
      {isSidebarOpen && <SidebarOverlay onClick={() => setIsSidebarOpen(false)} />}

      <ContentColumn collapsed={isSidebarCollapsed}>
        {/* TOP BAR */}
        <Header className="glass-card">
          <HeaderLeft>
            <MobileMenuButton onClick={() => setIsSidebarOpen(true)} aria-label="Buka navigasi">
              <Menu size={19} />
            </MobileMenuButton>
            <div>
              <TitleWrapper>
                <Title className="font-brand">
                  {location.pathname === "/reports"
                    ? isBPO
                      ? "DASHBOARD "
                      : "DASHBOARD "
                    : "Manajemen Laporan K3"}
                </Title>
                
              </TitleWrapper>
              <Subtitle>
                {isBPO
                  ? "PT. Pelindo Multi Terminal • Monitoring & Triage Analitik K3"
                  : "PT. Pelindo Multi Terminal "}
                <span className="topbar-divider">•</span> <span className="time-accent">{liveTime}</span>
              </Subtitle>
            </div>
          </HeaderLeft>

          <HeaderRight>
            {/* MODE BPO / MODE PELAPOR BADGE — DIPINDAH DARI SIDEBAR */}
            <RoleBadgeHeader isBPO={isBPO}>
              <div className="role-icon">
                {isBPO ? <Shield size={13} /> : <UserCheck size={13} />}
              </div>
              <span className="role-text">
                {isBPO ? "MODE BPO (HSE SUPERVISOR)" : "MODE PELAPOR (USER)"}
              </span>
            </RoleBadgeHeader>

            {/* THEME TOGGLE BUTTON IN TOP HEADER NEXT TO NOTIFICATION */}
            <ThemeToggleButton
            className="theme-toggle"
            onClick={toggleTheme}
            title={`Ubah ke mode ${theme === "dark" ? "terang" : "gelap"}`}
            style={{ width: "auto", margin: 0, padding: "0.5rem" }}
          >
            <span className={`theme-icon ${theme}`}>
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </span>
          </ThemeToggleButton>
          {/* NOTIFICATION CENTER */}
          <NotifWrapper>
            <NavIconButton
              active={isNotifOpen}
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              as={motion.button}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              title="Pusat Notifikasi"
            >
              <Bell size={17} />
              {hasUnread && <UnreadDot />}
            </NavIconButton>

            <AnimatePresence>
              {isNotifOpen && (
                <NotifDrawer
                  className="glass-card"
                  as={motion.div}
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                >
                  <NotifHeader>
                    <div className="notif-title">
                      <Bell size={15} color="#38bdf8" />
                      <span>Notifikasi Temuan K3</span>
                    </div>
                    <CloseNotifBtn onClick={() => setIsNotifOpen(false)}>
                      <X size={14} />
                    </CloseNotifBtn>
                  </NotifHeader>

                  <NotifList>
                    {notifications.length ? (
                      notifications.map((n) => (
                        <NotifItem key={n.id} unread={!n.isRead}>
                          <div className="n-top">
                            <strong>{n.title}</strong>
                            <small>{n.date || "Baru saja"}</small>
                          </div>
                          <p>{n.message}</p>
                        </NotifItem>
                      ))
                    ) : (
                      <EmptyNotif>
                        <ShieldCheck size={28} color="var(--text-muted)" />
                        <span>Tidak ada notifikasi baru</span>
                      </EmptyNotif>
                    )}
                  </NotifList>

                  {notifications.length > 0 && (
                    <NotifFooter>
                      <button onClick={onMarkNotificationsAsRead}>Tandai Semua Dibaca</button>
                    </NotifFooter>
                  )}
                </NotifDrawer>
              )}
            </AnimatePresence>
          </NotifWrapper>

          {/* TAMBAH LAPORAN PRIMARY BUTTON */}
          <CreateReportBtn
            id="btn-tambah-laporan"
            onClick={() => setIsReportModalOpen(true)}
            as={motion.button}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus size={16} />
            <span>Tambah Laporan</span>
          </CreateReportBtn>

          
        
          </HeaderRight>
        </Header>

        {/* MAIN DASHBOARD AREA */}
        <MainContent>
        {/* 👤 BANNER USER PELAPOR LAPANGAN JIKA BUKAN BPO */}
        {!isBPO && (
          <UserWelcomeSection className="glass-card">
            <div className="user-welcome-info">
              <div className="user-avatar-large">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div>
                <h4>Selamat Bertugas, {user?.name || "Kru Operasional Lapangan"}!</h4>
                <p>
                  {formatDepartmentLabel(user?.division)} • Laporkan setiap potensi bahaya di lingkungan pelabuhan.
                </p>
              </div>
            </div>

            <div className="user-stats">
              <div className="u-stat-box">
                <span className="num">{counts.myReports}</span>
                <span className="txt">Laporan Saya</span>
              </div>
              <div className="u-stat-box">
                <span className="num">{counts.total}</span>
                <span className="txt">Total Temuan</span>
              </div>
            </div>
          </UserWelcomeSection>
        )}

        {/* 📊 KARTU STATISTIK DENGAN CIRCULAR PROGRESS CHART (TAMPIL DI DASHBOARD BPO MAUPUN PELAPORAN LAPANGAN) */}
        <StatCardsGrid>
          {/* 1. TOTAL SEMUA LAPORAN */}
          <StatCard
            className="glass-card"
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setFilterType("ALL");
              setActiveTab("cards");
            }}
            title="Klik untuk melihat semua laporan"
          >
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
          <StatCard
            className="glass-card"
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/reports/menunggu")}
            title="Buka halaman Menunggu Verifikasi"
          >
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

          {/* 3. SEDANG PROSES */}
          <StatCard
            className="glass-card"
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/reports/diproses")}
            title="Buka halaman Sedang Proses"
          >
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
                <span className="stat-label">Sedang Proses</span>
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
          <StatCard
            className="glass-card"
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/reports/selesai")}
            title="Buka halaman Tuntas & Selesai"
          >
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

        {/* DYNAMIC RISK MAP ACCORDION / VIEW */}
        <AnimatePresence mode="wait">
          {activeTab === "map" && (
            <motion.div
              key="risk-map-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <RiskMap reports={reports} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* REPORT CARDS FEED */}
        <AnimatePresence mode="wait">
          {activeTab === "cards" && (
            <motion.div
              key="cards-feed-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* 🎛️ TOOLBAR FILTER & SEARCH KHUSUS MODE BPO (USER LAPANGAN TIDAK MENGGUNAKAN FILTER & SEARCH) */}
              {isBPO && (
                <FilterPanel className="glass-card" style={{ marginBottom: "1.25rem" }}>
                  <FilterGroup>
                    {/* DROPDOWN PILIHAN: SEMUA LAPORAN, LAPORAN UNSAFE CONDITION, LAPORAN UNSAFE ACTION */}
                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                      <Filter size={15} color="#38bdf8" style={{ position: "absolute", left: 10, pointerEvents: "none", zIndex: 1 }} />
                      <FilterSelect
                        id="filter-dropdown-laporan"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        style={{ paddingLeft: "2.1rem", minWidth: 230 }}
                        title="Pilihan jenis laporan"
                      >
                        <option value="ALL">Semua Laporan</option>
                        <option value="Unsafe Condition">Laporan Unsafe Condition</option>
                        <option value="Unsafe Action">Laporan Unsafe Action</option>
                      </FilterSelect>
                    </div>

                    {/* FITUR SORT: TERBARU, TERLAMA */}
                    <SortButtonGroup>
                      <SortBtn
                        type="button"
                        active={sortOrder === "newest"}
                        onClick={() => setSortOrder("newest")}
                        title="Urutkan dari laporan terbaru"
                      >
                        <ArrowDownWideNarrow size={14} />
                        <span>Terbaru</span>
                      </SortBtn>
                      <SortBtn
                        type="button"
                        active={sortOrder === "oldest"}
                        onClick={() => setSortOrder("oldest")}
                        title="Urutkan dari laporan terlama"
                      >
                        <ArrowUpWideNarrow size={14} />
                        <span>Terlama</span>
                      </SortBtn>
                    </SortButtonGroup>
                  </FilterGroup>

                  {/* SEARCH */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: "1 1 360px", justifyContent: "flex-end", minWidth: 0, marginLeft: "auto" }}>
                    <SearchBox>
                      <Search size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                      <input
                        type="text"
                        placeholder="Cari deskripsi laporan, lokasi temuan, atau saran..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      {searchQuery && (
                        <button type="button" onClick={() => setSearchQuery("")} title="Hapus pencarian">
                          <X size={13} />
                        </button>
                      )}
                    </SearchBox>
                  </div>
                </FilterPanel>
              )}

              {filteredReports.length > 0 ? (
                <ReportFeed>
                  <ReportsGrid>
                    {filteredReports.map((report) => (
                      <ReportCard
                        key={report.id}
                        report={report}
                        isBPO={isBPO}
                        user={user}
                        onUpdate={(updates) => onUpdateReport(report.id, updates)}
                        onDelete={(id) => onDeleteReport(id)}
                        onImageClick={(url) => setLightboxImage(url)}
                      />
                    ))}
                  </ReportsGrid>
                </ReportFeed>
              ) : (
                <EmptyStateBox className="glass-card">
                  <div className="empty-icon-wrap">
                    <ShieldCheck size={48} color="#38bdf8" />
                  </div>
                  <h3>Tidak Ada Laporan yang Cocok</h3>
                  <p>
                    {isBPO && searchQuery
                      ? `Tidak ditemukan hasil untuk "${searchQuery}". Coba kata kunci lain.`
                      : "Belum ada laporan temuan untuk kategori ini. Tambahkan laporan baru sekarang."}
                  </p>
                  <CreateReportBtn onClick={() => setIsReportModalOpen(true)}>
                    <Plus size={16} /> Buat Laporan Baru
                  </CreateReportBtn>
                </EmptyStateBox>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        </MainContent>
      </ContentColumn>

      {/* DETAIL POPUP: memakai card yang sama agar detail tetap konsisten */}
      <AnimatePresence>
        {selectedReport && (
          <ModalBackdrop
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedReport(null)}
          >
            <DetailModal onClick={(event: React.MouseEvent<HTMLDivElement>) => event.stopPropagation()}>
              <DetailModalHeader>
                <strong>Detail Temuan</strong>
                <CloseDetailButton
                  onClick={() => setSelectedReport(null)}
                  aria-label="Tutup detail temuan"
                >
                  <X size={16} />
                </CloseDetailButton>
              </DetailModalHeader>
              <ReportCard
                report={selectedReport}
                isBPO={isBPO}
                user={user}
                onUpdate={(updates) => {
                  onUpdateReport(selectedReport.id, updates);
                  setSelectedReport(null);
                }}
                onDelete={(id) => {
                  onDeleteReport(id);
                  setSelectedReport(null);
                }}
                onImageClick={(url) => setLightboxImage(url)}
              />
            </DetailModal>
          </ModalBackdrop>
        )}
      </AnimatePresence>

      {/* MODAL LAPORAN TEMUAN */}
      <AnimatePresence>
        {isReportModalOpen && (
          <ModalBackdrop
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsReportModalOpen(false)}
          >
            <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 680 }}>
              <ReportForm
                onClose={() => setIsReportModalOpen(false)}
                onSubmit={(data) => {
                  onAddReport(data);
                  setIsReportModalOpen(false);
                }}
              />
            </div>
          </ModalBackdrop>
        )}
      </AnimatePresence>
            {/* LIGHTBOX FOTO */}
      <AnimatePresence>
        {lightboxImage && (
          <ModalBackdrop
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
            style={{ zIndex: 2000 }}
          >
            <motion.img
              src={lightboxImage}
              alt="Foto Temuan Diperbesar"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: "90vw",
                maxHeight: "90vh",
                borderRadius: "1rem",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              }}
            />
            <CloseDetailButton
              onClick={() => setLightboxImage(null)}
              style={{
                position: "fixed",
                top: 20,
                right: 20,
              }}
            >
              <X size={18} />
            </CloseDetailButton>
          </ModalBackdrop>
        )}
      </AnimatePresence>
    </Wrapper>
  );
}

// LUXURY STYLED COMPONENTS
const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  background: transparent;
`;

const Sidebar = styled.aside`
  width: 248px;
  min-height: 100vh;
  flex: 0 0 248px;
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 1.25rem 0.9rem;
  background: var(--header-bg);
  border-right: 1px solid var(--border-color);
  backdrop-filter: blur(22px);
  z-index: 140;
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1), padding 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &.collapsed {
    width: 76px;
    padding-inline: 0.65rem;
  }

   &.collapsed .brand-copy,
  &.collapsed .brand-collapse-button,
  &.collapsed .sidebar-section-label,
  &.collapsed .sidebar-nav-label,
  &.collapsed .sidebar-user-copy,
  &.collapsed .theme-label,
  &.collapsed .theme-state,
  &.collapsed .logout-label,
  &.collapsed .sidebar-nav-item span,
  &.collapsed .sidebar-nav-item small {
    display: none !important;
  }

  &.collapsed .sidebar-nav-item {
    gap: 0;
    justify-content: center;
    padding-inline: 0;
  }

  &.collapsed .sidebar-nav-item svg {
    margin: 0 auto;
    flex-shrink: 0;
    display: block;
  }

  &.collapsed .sidebar-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &.collapsed .logout-btn {
    width: 36px;
    padding: 0.55rem 0;
    justify-content: center;
    margin-inline: auto;
  }

  &.collapsed .logout-btn .logout-icon {
    margin: 0 auto;
  }

  &.collapsed .theme-toggle {
    width: 42px;
    margin-inline: 0;
    justify-content: center;
    padding-inline: 0;
  }

  @media (max-width: 900px) {
    position: fixed;
    left: 0;
    transform: translateX(-105%);
    transition: transform 0.25s ease;
    box-shadow: 18px 0 40px rgba(0, 0, 0, 0.3);

    &.open {
      transform: translateX(0);
    }
  }
`;

const SidebarOverlay = styled.div`
  display: none;

  @media (max-width: 900px) {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(2, 6, 23, 0.58);
    z-index: 130;
  }
`;

const BrandLogoButton = styled.button`
  position: relative;
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #38BDF8;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(56, 189, 248, 0.1);
  }

  .logo-open-icon {
    display: none;
    position: absolute;
    inset: 0;
    align-items: center;
    justify-content: center;
    color: #38BDF8;
    background: var(--header-bg);
    border-radius: 8px;
  }

  .logo-open-icon { pointer-events: none; }

  .collapsed &.brand-logo-toggle:hover .logo-open-icon { display: flex; }
  .collapsed &.brand-logo-toggle:hover > svg:first-child { opacity: 0; }

  .collapsed & {
    width: 100%;
    margin: 0 auto;
    justify-content: center;
  }
`;

const BrandCollapseButton = styled.button`
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border: 1px solid var(--border-color);
  border-radius: 50%;
  background: var(--header-bg);
  color: var(--text-secondary);
  cursor: pointer;
  margin-left: auto;
  &:hover { color: #38BDF8; border-color: #38BDF8; }
`;

const SidebarBrand = styled.div`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.35rem 0.55rem 1.2rem;
  border-bottom: 1px solid var(--border-color);

  .logo-open-icon { pointer-events: none; }
`;

const BrandTitle = styled.strong`
  display: block;
  color: var(--text-primary);
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  white-space: nowrap;
`;

const BrandSubtitle = styled.span`
  display: block;
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 0.54rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  white-space: nowrap;
`;

const SidebarSectionLabel = styled.span`
  display: block;
  padding: 1.6rem 0.7rem 0.6rem;
  color: var(--text-muted);
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.12em;
`;

const SidebarNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  overflow-y: auto;
`;

const SidebarNavItem = styled.button<{ active: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.7rem 0.75rem;
  border: 1px solid ${({ active }) => active ? "rgba(56, 189, 248, 0.3)" : "transparent"};
  border-radius: 10px;
  background: ${({ active }) => active ? "rgba(56, 189, 248, 0.12)" : "transparent"};
  color: ${({ active }) => active ? "#38BDF8" : "var(--text-secondary)"};
  font: inherit;
  font-size: 0.76rem;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: var(--text-primary);
    background: var(--bg-card-subtle);
    border-color: var(--border-color);
  }
`;

const NavCount = styled.span<{ active: boolean }>`
  min-width: 21px;
  margin-left: auto;
  padding: 2px 5px;
  border-radius: 999px;
  background: ${({ active }) => active ? "rgba(125, 211, 252, 0.18)" : "var(--bg-card-subtle)"};
  color: ${({ active }) => active ? "#38BDF8" : "var(--text-muted)"};
  font-size: 0.64rem;
  text-align: center;
`;

const SidebarFooter = styled.div`
  margin-top: auto;
  flex-shrink: 0;
  border-top: 1px solid var(--border-color);
  padding-top: 0.5rem;
`;
const SidebarLogoutButton = styled.button`
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.55rem 0.65rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 10px;
  border: 1px solid rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
  font: inherit;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  .logout-icon {
    width: 22px;
    height: 22px;
    border-radius: 7px;
    background: rgba(239, 68, 68, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .logout-label {
    flex: 1;
    text-align: left;
    white-space: nowrap;
  }

  &:hover {
    background: rgba(239, 68, 68, 0.15);
    border-color: #ef4444;
  }
`;

const SidebarUser = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.65rem 0.55rem 0.15rem;

  strong, span {
    display: block;
    max-width: 155px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    color: var(--text-primary);
    font-size: 0.7rem;
  }

  span {
    margin-top: 3px;
    color: var(--text-muted);
    font-size: 0.62rem;
  }
`;

const ThemeToggleButton = styled.button`
  width: calc(100% - 1.1rem);
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0.8rem 0.55rem 0.15rem;
  padding: 0.6rem 0.65rem;
  border: 1px solid var(--border-color);
  border-radius: 9px;
  background: var(--bg-card-subtle);
  color: var(--text-secondary);
  font: inherit;
  font-size: 0.68rem;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    border-color: var(--border-hover);
    color: var(--text-primary);
    background: var(--bg-card-hover);
  }

  .theme-icon {
    display: inline-flex;

    &.dark { color: #fbbf24; }
    &.light { color: #3b82f6; }
  }

  .theme-state {
    margin-left: auto;
    color: var(--text-muted);
    font-size: 0.56rem;
    letter-spacing: 0.08em;
  }

  @media (max-width: 1150px) {
    .theme-label,
    .theme-state {
      display: none;
    }
    padding: 0.5rem;
  }
`;
const SidebarAvatar = styled.div`
  width: 30px;
  height: 30px;
  flex: 0 0 30px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  background: linear-gradient(135deg, #2563eb, #06b6d4);
  color: white;
  font-size: 0.75rem;
  font-weight: 900;
`;

const ContentColumn = styled.div<{ collapsed: boolean }>`
  min-width: 0;
  flex: 1;
  margin-left: ${({ collapsed }) => collapsed ? "76px" : "248px"};
  display: flex;
  flex-direction: column;
  transition: margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 900px) {
    margin-left: 0;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  border-radius: 9px;
  background: var(--bg-card-subtle);
  color: var(--text-primary);
  cursor: pointer;

  @media (max-width: 900px) {
    display: flex;
  }
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 0.85rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  background: var(--header-bg);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

  @media (max-width: 900px) {
    padding: 0.75rem 1rem;
    gap: 0.65rem;
  }
`;
const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
  flex: 1 1 auto;
`;
const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  justify-content: flex-end;

  @media (max-width: 900px) {
    gap: 0.4rem;
  }
`;
const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  font-family: 'Inter', sans-serif;
  letter-spacing: 0.04em;
  color: var(--text-primary);
  white-space: normal;
  overflow-wrap: break-word;

  @media (max-width: 1100px) {
    font-size: 1rem;
  }
`;
const LiveStatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 7px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #10b981;
  font-size: 0.62rem;
  font-weight: 800;
  font-family: 'Inter', sans-serif;
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
  margin: 2px 0 0;
  font-size: 0.74rem;
  color: var(--text-secondary);

  .time-accent {
    color: #38bdf8;
    font-weight: 700;
    font-family: monospace;
  }
`;


const RoleBadgeHeader = styled.div<{ isBPO: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0.4rem 0.75rem;
  border-radius: 10px;
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  background: ${({ isBPO }) => isBPO ? "rgba(56, 189, 248, 0.12)" : "rgba(16, 185, 129, 0.12)"};
  color: ${({ isBPO }) => isBPO ? "#38bdf8" : "#34d399"};
  border: 1px solid ${({ isBPO }) => isBPO ? "rgba(56, 189, 248, 0.3)" : "rgba(16, 185, 129, 0.3)"};
  white-space: nowrap;

  .role-icon {
    width: 20px;
    height: 20px;
    border-radius: 6px;
    background: ${({ isBPO }) => isBPO ? "rgba(56, 189, 248, 0.2)" : "rgba(16, 185, 129, 0.2)"};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  @media (max-width: 1150px) {
    .role-text {
      display: none;
    }
    padding: 0.4rem;
  }
`;

const NavIconButton = styled.button<{ active?: boolean; danger?: boolean }>`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: ${({ active }) => (active ? "rgba(56, 189, 248, 0.2)" : "var(--bg-card-subtle)")};
  border: 1px solid ${({ active }) => (active ? "rgba(56, 189, 248, 0.4)" : "var(--border-color)")};
  color: ${({ danger }) => (danger ? "#ef4444" : "var(--text-primary)")};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;

  &:hover {
    background: ${({ danger }) => (danger ? "rgba(239, 68, 68, 0.15)" : "var(--bg-card-hover)")};
    border-color: ${({ danger }) => (danger ? "#ef4444" : "var(--border-hover)")};
  }
`;

const UnreadDot = styled.span`
  position: absolute;
  top: 7px;
  right: 7px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ef4444;
  box-shadow: 0 0 6px #ef4444;
`;

const CreateReportBtn = styled.button`
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #0284c7 100%);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.55rem 1.15rem;
  font-size: 0.8rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.45);
  transition: all 0.2s;
  flex-shrink: 0;
  white-space: nowrap;

  &:hover {
    box-shadow: 0 6px 22px rgba(37, 99, 235, 0.6);
  }

  @media (max-width: 1000px) {
    padding: 0.55rem 0.7rem;

    span {
      display: none;
    }
  }
`;
const NotifWrapper = styled.div`
  position: relative;
`;

const NotifDrawer = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 320px;
  border-radius: 1.25rem;
  background: var(--bg-card-solid);
  border: 1px solid var(--border-color);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
  overflow: hidden;
  z-index: 200;
`;

const NotifHeader = styled.div`
  padding: 0.85rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-card-subtle);

  .notif-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.78rem;
    font-weight: 800;
    color: var(--text-primary);
  }
`;

const CloseNotifBtn = styled.button`
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const NotifList = styled.div`
  max-height: 260px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const NotifItem = styled.div<{ unread: boolean }>`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
  background: ${({ unread }) => (unread ? "rgba(56, 189, 248, 0.08)" : "transparent")};

  .n-top {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    margin-bottom: 3px;

    strong {
      color: var(--text-primary);
    }
    small {
      color: var(--text-muted);
      font-size: 0.65rem;
    }
  }

  p {
    margin: 0;
    font-size: 0.72rem;
    color: var(--text-secondary);
    line-height: 1.4;
  }
`;

const EmptyNotif = styled.div`
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 0.75rem;
`;

const NotifFooter = styled.div`
  padding: 0.5rem;
  text-align: center;
  border-top: 1px solid var(--border-color);
  background: var(--bg-card-subtle);

  button {
    background: transparent;
    border: none;
    color: #38bdf8;
    font-size: 0.72rem;
    font-weight: 700;
    cursor: pointer;
  }
`;

const MainContent = styled.main`
  flex: 1;
  max-width: 1380px;
  width: 100%;
  margin: 0 auto;
  padding: 1.75rem 2.25rem 4rem;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;

  @media (max-width: 900px) {
    padding: 1.25rem 1rem 3rem;
    gap: 1.25rem;
  }
`;

const HeroSection = styled.div`
  border-radius: 1.5rem;
  padding: 1.75rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border-color);

  @media (max-width: 900px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 1.25rem;
    gap: 1.25rem;
  }

  .hero-left {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    max-width: 780px;

    .hero-tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;

      .hero-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(56, 189, 248, 0.12);
        border: 1px solid rgba(56, 189, 248, 0.3);
        color: #38bdf8;
        font-size: 0.68rem;
        font-weight: 800;
        letter-spacing: 0.06em;
      }

      .role-pill {
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 0.68rem;
        font-weight: 800;

        &.bpo {
          background: rgba(37, 99, 235, 0.15);
          color: #60a5fa;
          border: 1px solid rgba(37, 99, 235, 0.3);
        }

        &.user {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
      }
    }

    h2 {
      margin: 0;
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.01em;
    }

    .hero-desc {
      margin: 0;
      font-size: 0.82rem;
      color: var(--text-secondary);
      line-height: 1.55;

      strong {
        color: var(--text-primary);
      }
    }
  }

  .hero-actions {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    flex-shrink: 0;

    @media (max-width: 900px) {
      flex-direction: row;
      width: 100%;
    }
  }
`;

const QuickCreateBtn = styled.button`
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #0284c7 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1.4rem;
  font-size: 0.82rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  box-shadow: 0 4px 18px rgba(37, 99, 235, 0.45);
  white-space: nowrap;
`;

// ROLE SWITCHER CAPSULE
const RoleCapsule = styled.button<{ isBPO: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.35rem 0.85rem 0.35rem 0.5rem;
  border-radius: 999px;
  background: ${({ isBPO }) =>
    isBPO ? "rgba(37, 99, 235, 0.12)" : "rgba(16, 185, 129, 0.12)"};
  border: 1px solid
    ${({ isBPO }) =>
      isBPO ? "rgba(37, 99, 235, 0.35)" : "rgba(16, 185, 129, 0.35)"};
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;

  &:hover {
    background: ${({ isBPO }) =>
      isBPO ? "rgba(37, 99, 235, 0.2)" : "rgba(16, 185, 129, 0.2)"};
  }

  .role-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: ${({ isBPO }) =>
      isBPO ? "rgba(37, 99, 235, 0.2)" : "rgba(16, 185, 129, 0.2)"};
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .role-text {
    display: flex;
    flex-direction: column;

    .role-badge {
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      color: ${({ isBPO }) => (isBPO ? "#38bdf8" : "#34d399")};
    }

    .role-user {
      font-size: 0.68rem;
      color: var(--text-secondary);
    }
  }

  @media (max-width: 768px) {
    .role-text { display: none; }
    padding: 0.35rem 0.5rem;
  }
`;

const QuickAnalyticsBtn = styled.button`
  background: var(--bg-card-subtle);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 0.7rem 1.4rem;
  font-size: 0.82rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: var(--bg-card-hover);
    border-color: #38bdf8;
  }
`;

const BpoExecutiveSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;

  .sec-left {
    display: flex;
    align-items: center;
    gap: 0.65rem;

    h3 {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 800;
      font-family: 'Inter', sans-serif;
      color: var(--text-primary);
      letter-spacing: 0.04em;
    }

    p {
      margin: 2px 0 0;
      font-size: 0.74rem;
      color: var(--text-secondary);
    }
  }

  .access-badge {
    padding: 3px 10px;
    border-radius: 999px;
    background: rgba(37, 99, 235, 0.12);
    border: 1px solid rgba(37, 99, 235, 0.3);
    color: #60a5fa;
    font-size: 0.68rem;
    font-weight: 800;
    font-family: 'Inter', sans-serif;
  }
`;

const StatusBentoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.15rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const StatusCard = styled.div<{ color: string }>`
  border-radius: 1.35rem;
  padding: 1.25rem 1.4rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.25s ease;

  &:hover {
    border-color: ${({ color }) => color};
    box-shadow: 0 16px 36px -8px ${({ color }) => color}40;
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ color }) => color};
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .metric-label {
      font-size: 0.7rem;
      font-weight: 800;
      font-family: 'Inter', sans-serif;
      letter-spacing: 0.06em;
      color: var(--text-secondary);
    }

    .icon-wrap {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;

      &.blue { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
      &.amber { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
      &.indigo { background: rgba(129, 140, 248, 0.15); color: #818cf8; }
      &.emerald { background: rgba(16, 185, 129, 0.15); color: #10b981; }
    }
  }

  .metric-value {
    font-size: 2.1rem;
    font-weight: 900;
    font-family: 'Inter', sans-serif;
    color: var(--text-primary);
    line-height: 1;
    font-family: inherit;
  }

  .card-footer-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.72rem;
    font-weight: 700;
    color: ${({ color }) => color};
    padding-top: 0.5rem;
    border-top: 1px solid var(--border-color);
  }
`;

const StatCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.15rem;
  margin-bottom: 1.5rem;

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
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: var(--border-hover);
    transform: translateY(-3px);
    box-shadow: var(--card-shadow-hover);
  }

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

    .more-btn {
      color: var(--text-muted);
      opacity: 0.45;
      transition: opacity 0.2s;
      &:hover {
        opacity: 1;
        color: var(--text-primary);
      }
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

const BpoAnalyticsActionBanner = styled(motion.div)`
  margin-top: -0.5rem;
  margin-bottom: 1.5rem;
  border-radius: 1.25rem;
  padding: 1rem 1.4rem;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(14, 165, 233, 0.08));
  border: 1px solid rgba(56, 189, 248, 0.25);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.2s;

  .banner-left {
    display: flex;
    align-items: center;
    gap: 0.85rem;

    .banner-icon {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      background: rgba(56, 189, 248, 0.18);
      border: 1px solid rgba(56, 189, 248, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    strong {
      display: block;
      font-size: 0.88rem;
      font-weight: 800;
      color: var(--text-primary);
    }

    p {
      margin: 2px 0 0;
      font-size: 0.74rem;
      color: var(--text-secondary);
      line-height: 1.35;
    }
  }

  .banner-right {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    font-weight: 700;
    color: #38bdf8;
    background: rgba(56, 189, 248, 0.12);
    border: 1px solid rgba(56, 189, 248, 0.25);
    padding: 6px 12px;
    border-radius: 8px;
    flex-shrink: 0;
  }

  &:hover {
    box-shadow: 0 8px 24px rgba(56, 189, 248, 0.15);
  }
`;

const UserWelcomeSection = styled.div`
  border-radius: 1.35rem;
  padding: 1.25rem 1.6rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  border: 1px solid var(--border-color);
  margin-bottom: 1.5rem;

  .user-welcome-info {
    display: flex;
    align-items: center;
    gap: 1rem;

    .user-avatar-large {
      width: 46px;
      height: 46px;
      border-radius: 50%;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      font-size: 1.2rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
    }

    h4 {
      margin: 0;
      font-size: 1rem;
      font-weight: 800;
      font-family: 'Inter', sans-serif;
      color: var(--text-primary);
    }

    p {
      margin: 3px 0 0;
      font-size: 0.75rem;
      color: var(--text-secondary);
    }
  }

  .user-stats {
    display: flex;
    align-items: center;
    gap: 1rem;

    .u-stat-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: var(--bg-card-subtle);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 6px 14px;

      .num {
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--text-primary);
      }
      .txt {
        font-size: 0.65rem;
        color: var(--text-muted);
      }
    }
  }
`;

const ViewModeBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding-bottom: 0.5rem;
`;

const FilterPanel = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 0.7rem;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: var(--bg-card-subtle);
`;

const ViewToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 3px;
  margin-left: auto;
  border: 1px solid var(--border-color);
  border-radius: 9px;
  background: var(--bg-card);
`;

const ViewToggleBtn = styled.button<{ active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 1px solid ${({ active }) => (active ? "var(--border-color)" : "transparent")};
  border-radius: 6px;
  padding: 5px 9px;
  background: ${({ active }) => (active ? "var(--bg-card-subtle)" : "transparent")};
  color: ${({ active }) => (active ? "var(--text-primary)" : "var(--text-secondary)")};
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
`;

const TabGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-card-subtle);
  padding: 4px;
  border-radius: 14px;
  border: 1px solid var(--border-color);
`;

const TabBtn = styled.button<{ active: boolean }>`
  background: ${({ active }) => (active ? "var(--bg-card)" : "transparent")};
  border: 1px solid ${({ active }) => (active ? "var(--border-color)" : "transparent")};
  color: ${({ active }) => (active ? "var(--text-primary)" : "var(--text-secondary)")};
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: ${({ active }) => (active ? "var(--card-shadow)" : "none")};
  transition: all 0.2s;

  .map-badge {
    padding: 1px 6px;
    border-radius: 999px;
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
    font-size: 0.62rem;
    font-weight: 800;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const FilterSelect = styled.select`
  min-width: 220px;
  padding: 0.55rem 2.25rem 0.55rem 2.25rem;
  
  /* BORDER & CORNER */
  border: 1px solid var(--border-color, rgba(226, 232, 240, 0.8)) !important;
  border-radius: 10px;
  outline: none !important;
  
  /* BACKGROUND & WARNA TEKS */
  background-color: var(--bg-card, #ffffff);
  /* Ubah default warna teks ke Hitam Pekat di mode terang */
  color: var(--text-primary, #000000);
  
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  
  box-shadow: var(--card-shadow, 0 1px 3px rgba(0, 0, 0, 0.05));
  backdrop-filter: blur(8px);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  /* EFFECT SAAT KURSOR DIARAHKAN (Hover) */
  &:hover {
    background-color: var(--bg-card-hover, #f8fafc);
    border-color: #38bdf8 !important;
    color: var(--text-primary, #000000);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  /* EFFECT SAAT DIKLIK (Focus) */
  &:focus {
    outline: none !important;
    border-color: #38bdf8 !important;
    background-color: var(--bg-card, #ffffff);
    color: var(--text-primary, #000000);
    box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.25);
  }

  /* STYLING DAFTAR OPTION (Popup Menu Terbuka) */
  option {
    border: none !important;
    outline: none !important;
    background-color: var(--bg-card-solid, #ffffff);
    color: var(--text-primary, #000000);
    padding: 12px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  /* STYLING ITEM YANG SEDANG DIPILIH */
  option:checked {
    background-color: #0284c7 !important;
    color: #ffffff !important;
    font-weight: 700;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const ReportFeed = styled.div`
  max-height: min(68vh, 760px);
  overflow-y: auto;
  padding: 0.25rem 0.35rem 1rem 0.1rem;
  scrollbar-width: thin;
  scrollbar-color: var(--border-hover) transparent;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-card-subtle);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 8px 14px;
  min-width: 360px;
  width: 100%;
  max-width: none;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--border-hover);
    background: var(--bg-card-hover);
  }

  &:focus-within {
    border-color: #38bdf8;
    box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
    background: var(--bg-card-hover);
  }

  input {
    background: transparent;
    border: none;
    outline: none;
    color: var(--text-primary);
    font-size: 0.8rem;
    font-family: inherit;
    width: 100%;

    &::placeholder {
      color: var(--text-muted);
      font-size: 0.76rem;
    }
  }

  button {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 0;

    &:hover {
      color: var(--text-primary);
    }
  }

  @media (max-width: 768px) {
    min-width: 100%;
    max-width: 100%;
  }
`;

const SortButtonGroup = styled.div`
  display: flex;
  align-items: center;
  background: var(--bg-card-subtle);
  border: 1px solid var(--border-color);
  border-radius: 9px;
  padding: 3px;
  gap: 3px;
`;

const SortBtn = styled.button<{ active: boolean }>`
  background: ${({ active }) => (active ? "var(--bg-card)" : "transparent")};
  color: ${({ active }) => (active ? "var(--text-primary)" : "var(--text-secondary)")};
  border: 1px solid ${({ active }) => (active ? "var(--border-color)" : "transparent")};
  border-radius: 6px;
  padding: 4px 9px;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.15s ease;
  box-shadow: ${({ active }) => (active ? "0 2px 6px rgba(0,0,0,0.12)" : "none")};

  &:hover {
    color: var(--text-primary);
  }
`;

const TypeFilterCapsules = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const FilterPill = styled.button<{ active: boolean; color?: string }>`
  background: ${({ active }) => (active ? "var(--bg-card)" : "var(--bg-card-subtle)")};
  border: 1px solid
    ${({ active, color }) => (active ? color || "var(--border-color)" : "var(--border-color)")};
  color: ${({ active, color }) =>
    active ? color || "var(--text-primary)" : "var(--text-secondary)"};
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;

  &:hover {
    color: var(--text-primary);
  }
`;

const ReportsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
`;

const TableScrollBox = styled.div`
  max-height: min(58vh, 620px);
  overflow: auto;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-card);
  scrollbar-width: thin;
  scrollbar-color: var(--border-hover) transparent;
`;

const ReportsTableElement = styled.table`
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
  text-align: left;

  th {
    position: sticky;
    top: 0;
    z-index: 1;
    padding: 0.8rem 0.9rem;
    background: var(--bg-card-subtle);
    border-bottom: 1px solid var(--border-color);
    color: var(--text-muted);
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  td {
    padding: 0.85rem 0.9rem;
    border-bottom: 1px solid var(--border-color);
    color: var(--text-secondary);
    font-size: 0.76rem;
    vertical-align: top;
    transition: background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
  }

  tbody tr {
    cursor: pointer;
    transition: background 0.18s ease, transform 0.18s ease;
  }

  tbody tr:hover td,
  tbody tr:focus-visible td {
    outline: none;
    background: rgba(56, 189, 248, 0.12);
    color: var(--text-primary);
    box-shadow: inset 0 1px 0 rgba(56, 189, 248, 0.25), inset 0 -1px 0 rgba(56, 189, 248, 0.25);
  }

  tbody tr:hover td:first-child,
  tbody tr:focus-visible td:first-child {
    box-shadow: inset 3px 0 0 #38bdf8, inset 0 1px 0 rgba(56, 189, 248, 0.25), inset 0 -1px 0 rgba(56, 189, 248, 0.25);
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  .description-cell {
    max-width: 330px;
    color: var(--text-primary);
    font-weight: 600;
    line-height: 1.45;
  }

  .location-cell {
    max-width: 220px;
    line-height: 1.4;
  }
`;

const SortableHeader = styled.th<{ active: boolean }>`
  cursor: pointer;
  user-select: none;
  transition: color 0.18s ease, background 0.18s ease;

  &:hover,
  &:focus-visible {
    color: #38bdf8;
    background: rgba(56, 189, 248, 0.1);
    outline: none;
  }
`;

const SortIndicator = styled.span<{ active: boolean; direction: "asc" | "desc" }>`
  display: inline-block;
  margin-left: 5px;
  color: ${({ active }) => (active ? "#38bdf8" : "var(--text-muted)")};
  opacity: ${({ active }) => (active ? 1 : 0.55)};

  &::after {
    content: ${({ direction }) => (direction === "asc" ? '"↑"' : '"↓"')};
  }
`;

const FindingTypeCell = styled.span<{ isCondition: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: ${({ isCondition }) => (isCondition ? "#38bdf8" : "#fbbf24")};
  font-weight: 700;
  white-space: nowrap;
`;

const StatusCell = styled.span<{ status: ReportStatus }>`
  color: ${({ status }) => {
    if (status === ReportStatus.CLOSED) return "#34d399";
    if (status === ReportStatus.IN_PROGRESS) return "#818cf8";
    return "#fbbf24";
  }};
  font-size: 0.68rem;
  font-weight: 800;
  white-space: nowrap;
`;

const EmptyStateBox = styled.div`
  border-radius: 1.5rem;
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  border: 1px solid var(--border-color);

  .empty-icon-wrap {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(56, 189, 248, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.25rem;
  }

  h3 {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 800;
    color: var(--text-primary);
  }

  p {
    margin: 6px 0 1.5rem;
    font-size: 0.82rem;
    color: var(--text-secondary);
    max-width: 400px;
  }
`;

const DetailModal = styled.div`
  width: min(100%, 680px);
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  border-radius: 1.4rem;
  background: var(--bg-card);
  box-shadow: var(--card-shadow-hover);
`;

const DetailModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);

  strong {
    font-size: 0.85rem;
  }
`;

const CloseDetailButton = styled.button`
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-card-subtle);
  color: var(--text-secondary);
  cursor: pointer;
`;

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(4, 8, 18, 0.75);
  backdrop-filter: blur(16px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;
