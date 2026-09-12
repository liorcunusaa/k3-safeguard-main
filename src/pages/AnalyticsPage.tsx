import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart as PieChartIcon,
  TrendingUp,
  Users,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Activity,
  ChevronDown,
  Sparkles,
  Shield,
  Layers,
  Flame,
  Download,
  Share2,
  Sun,
  Moon,
  Compass
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from "recharts";
import { ReportStatus } from "../constants/enums";
import RiskMap from "../components/RiskMap";
import { useTheme } from "../context/ThemeContext";
import AppSidebar from "../components/AppSidebar";
import { PageShell, PageShellContent } from "../components/PageShell";

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4"];

export default function AnalyticsPage({ reports = [], user, onToggleRole, onLogout }: { reports: any[]; user?: any; onToggleRole?: () => void; onLogout?: () => void }) {
  const { theme, toggleTheme } = useTheme();

  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [findingTypeFilter, setFindingTypeFilter] = useState<string>("ALL");

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (!r.date) return false;
      const d = new Date(r.date);
      const matchMonth = d.getMonth() === selectedMonth;
      const matchYear = d.getFullYear() === selectedYear;
      const matchType = findingTypeFilter === "ALL" || r.findingType === findingTypeFilter;
      return matchMonth && matchYear && matchType;
    });
  }, [reports, selectedMonth, selectedYear, findingTypeFilter]);

  const stats = useMemo(() => {
    const total = filteredReports.length;
    const closed = filteredReports.filter((r) => r.status === ReportStatus.CLOSED).length;
    const inProgress = filteredReports.filter((r) => r.status === ReportStatus.IN_PROGRESS).length;
    const open = filteredReports.filter((r) => r.status === ReportStatus.OPEN).length;
    const resolutionRate = total > 0 ? Math.round((closed / total) * 100) : 0;

    const statusData = [
      { name: "Menunggu", value: open, color: "#f59e0b" },
      { name: "Diproses", value: inProgress, color: "#6366f1" },
      { name: "Selesai", value: closed, color: "#10b981" },
    ];

    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const trendData = [...Array(daysInMonth)].map((_, i) => {
      const day = i + 1;
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const count = filteredReports.filter((r) => r.date === dateStr).length;
      return {
        date: `Tgl ${day}`,
        fullDate: dateStr,
        laporan: count,
      };
    });

    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const dayMap: Record<string, number> = {
      Senin: 0,
      Selasa: 0,
      Rabu: 0,
      Kamis: 0,
      Jumat: 0,
      Sabtu: 0,
      Minggu: 0,
    };

    filteredReports.forEach((r) => {
      if (r.date) {
        const dateObj = new Date(r.date);
        const dayName = days[dateObj.getDay()];
        dayMap[dayName] = (dayMap[dayName] || 0) + 1;
      }
    });

    const orderedDays = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
    const dayData = orderedDays.map((name) => ({ name, value: dayMap[name] }));

    const actionCount = filteredReports.filter((r) => r.findingType === "Unsafe Action").length;
    const conditionCount = filteredReports.filter((r) => r.findingType === "Unsafe Condition").length;

    const typeData = [
      {
        name: "Unsafe Action",
        value: actionCount,
        percent: total > 0 ? Math.round((actionCount / total) * 100) : 0,
        color: "#3b82f6",
        desc: "Tindakan Berbahaya (Tanpa GPS)",
      },
      {
        name: "Unsafe Condition",
        value: conditionCount,
        percent: total > 0 ? Math.round((conditionCount / total) * 100) : 0,
        color: "#f43f5e",
        desc: "Kondisi Berbahaya (GPS Aktif)",
      },
    ];

    return {
      total,
      closed,
      inProgress,
      open,
      resolutionRate,
      statusData,
      typeData,
      trendData,
      dayData,
    };
  }, [filteredReports, selectedMonth, selectedYear]);

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear - 1, currentYear - 2];
  }, []);

  // Framer Motion Animation Variants
  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <PageShell>
      <AppSidebar user={user} onToggleRole={onToggleRole} onLogout={onLogout} />
      <PageShellContent>
      <PageWrapper>
      {/* 🎯 STICKY HEADER YANG MENGIKUTI SAAT SCROLL */}
      <StickyHeader className="glass-card">
        <HeaderLeft>
          <div>
            <HeaderTitle>
              REKAP & ANALITIK K3
              <Sparkles size={13} style={{ display: "inline", marginLeft: 6, color: "#38bdf8" }} />
            </HeaderTitle>
            <HeaderSubtitle>PT. PELINDO MULTI TERMINAL • KINERJA HSE</HeaderSubtitle>
          </div>
        </HeaderLeft>

        <HeaderRight>
          {/* Quick Type Filter */}
          <TypeFilterGroup>
            <TypeFilterChip
              active={findingTypeFilter === "ALL"}
              onClick={() => setFindingTypeFilter("ALL")}
            >
              Semua
            </TypeFilterChip>
            <TypeFilterChip
              active={findingTypeFilter === "Unsafe Condition"}
              onClick={() => setFindingTypeFilter("Unsafe Condition")}
            >
              Kondisi
            </TypeFilterChip>
            <TypeFilterChip
              active={findingTypeFilter === "Unsafe Action"}
              onClick={() => setFindingTypeFilter("Unsafe Action")}
            >
              Tindakan
            </TypeFilterChip>
          </TypeFilterGroup>

          {/* Month & Year Filter */}
          <FilterControl className="glass-card">
            <Filter size={14} color="#3b82f6" />
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {months.map((m, i) => (
                <option key={m} value={i}>
                  {m}
                </option>
              ))}
            </Select>
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          </FilterControl>

          {/* ☀️ / 🌙 THEME TOGGLE BUTTON */}
          <ThemeToggleBtn
            onClick={toggleTheme}
            as={motion.button}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            title={`Ganti ke tema ${theme === "dark" ? "terang" : "gelap"}`}
          >
            {theme === "dark" ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} color="#3b82f6" />}
          </ThemeToggleBtn>
        </HeaderRight>
      </StickyHeader>

      {/* BODY CONTENT WITH STAGGERED MOTION */}
      <ContentContainer
        as={motion.div}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* KPI OVERVIEW CARDS */}
        <motion.div variants={itemVariants}>
          <KPIGrid>
            <KPICard as={motion.div} whileHover={{ y: -4, scale: 1.01 }}>
              <KPIIcon color="#3b82f6">
                <Activity size={22} />
              </KPIIcon>
              <KPIInfo>
                <span className="kpi-label">TOTAL TEMUAN</span>
                <h3 className="kpi-value">{stats.total}</h3>
                <span className="kpi-sub">Periode {months[selectedMonth]} {selectedYear}</span>
              </KPIInfo>
            </KPICard>

            <KPICard as={motion.div} whileHover={{ y: -4, scale: 1.01 }}>
              <KPIIcon color="#10b981">
                <CheckCircle2 size={22} />
              </KPIIcon>
              <KPIInfo>
                <span className="kpi-label">TINGKAT PENYELESAIAN</span>
                <h3 className="kpi-value">{stats.resolutionRate}%</h3>
                <span className="kpi-sub">{stats.closed} laporan ditutup</span>
              </KPIInfo>
            </KPICard>

            <KPICard as={motion.div} whileHover={{ y: -4, scale: 1.01 }}>
              <KPIIcon color="#f59e0b">
                <Clock size={22} />
              </KPIIcon>
              <KPIInfo>
                <span className="kpi-label">MENUNGGU VERIFIKASI</span>
                <h3 className="kpi-value">{stats.open}</h3>
                <span className="kpi-sub">Perlu respon BPO</span>
              </KPIInfo>
            </KPICard>

            <KPICard as={motion.div} whileHover={{ y: -4, scale: 1.01 }}>
              <KPIIcon color="#6366f1">
                <AlertCircle size={22} />
              </KPIIcon>
              <KPIInfo>
                <span className="kpi-label">SEDANG DIPROSES</span>
                <h3 className="kpi-value">{stats.inProgress}</h3>
                <span className="kpi-sub">Dalam perbaikan fisik</span>
              </KPIInfo>
            </KPICard>
          </KPIGrid>
        </motion.div>

        {/* FINDING TYPE DISTRIBUTION */}
        <motion.div variants={itemVariants}>
          <TypeGrid>
            {stats.typeData.map((type, i) => (
              <TypeCard
                key={type.name}
                as={motion.div}
                whileHover={{ y: -3 }}
                borderAccent={type.color}
              >
                <TypeIcon color={type.color}>
                  {type.name === "Unsafe Action" ? <Users size={24} /> : <Filter size={24} />}
                </TypeIcon>
                <TypeInfo>
                  <span className="type-title">{type.name}</span>
                  <p className="type-desc">{type.desc}</p>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${type.percent}%`, backgroundColor: type.color }}
                    />
                  </div>
                </TypeInfo>
                <TypeValue color={type.color}>
                  <span className="count">{type.value}</span>
                  <span className="pct">{type.percent}%</span>
                </TypeValue>
              </TypeCard>
            ))}
          </TypeGrid>
        </motion.div>

        {/* DYNAMIC RISK MAP ON ANALYTICS */}
        <motion.div variants={itemVariants}>
          <RiskMap reports={filteredReports} />
        </motion.div>

        {/* BENTO GRID OF VISUAL CHARTS */}
        <BentoGrid>
          {/* Main Area Trend Chart */}
          <motion.div className="span-2" variants={itemVariants}>
            <BentoItem>
              <CardHeader>
                <div className="header-icon blue">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h4>Tren Frekuensi Insiden Harian</h4>
                  <p>Distribusi pelaporan harian selama bulan {months[selectedMonth]} {selectedYear}</p>
                </div>
              </CardHeader>

              <ChartContainer>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={stats.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="var(--text-secondary, #94a3b8)"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="var(--text-secondary, #94a3b8)"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--bg-card-solid, #0f172a)",
                        border: "1px solid var(--border-color, rgba(255, 255, 255, 0.15))",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                        color: "var(--text-primary, #fff)",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="laporan"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#areaGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </BentoItem>
          </motion.div>

          {/* Donut Status Chart */}
          <motion.div variants={itemVariants}>
            <BentoItem>
              <CardHeader>
                <div className="header-icon amber">
                  <PieChartIcon size={18} />
                </div>
                <div>
                  <h4>Komposisi Status Laporan</h4>
                  <p>Rasio penyelesaian mitigasi</p>
                </div>
              </CardHeader>

              <ChartContainer>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={stats.statusData}
                      innerRadius={65}
                      outerRadius={88}
                      paddingAngle={6}
                      dataKey="value"
                    >
                      {stats.statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--bg-card-solid, #0f172a)",
                        border: "1px solid var(--border-color, rgba(255, 255, 255, 0.15))",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                        color: "var(--text-primary, #fff)",
                        fontSize: "12px",
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </BentoItem>
          </motion.div>

          {/* Day of Week Distribution */}
          <motion.div className="span-3" variants={itemVariants}>
            <BentoItem>
              <CardHeader>
                <div className="header-icon emerald">
                  <Calendar size={18} />
                </div>
                <div>
                  <h4>Intensitas Temuan Berdasarkan Hari</h4>
                  <p>Analisis tren beban kerja operasional pelabuhan sepanjang minggu</p>
                </div>
              </CardHeader>

              <ChartContainer>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.dayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="var(--text-secondary, #94a3b8)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="var(--text-secondary, #94a3b8)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(59, 130, 246, 0.06)" }}
                      contentStyle={{
                        background: "var(--bg-card-solid, #0f172a)",
                        border: "1px solid var(--border-color, rgba(255, 255, 255, 0.15))",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                        color: "var(--text-primary, #fff)",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={34} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </BentoItem>
          </motion.div>
        </BentoGrid>
      </ContentContainer>
      </PageWrapper>
      </PageShellContent>
    </PageShell>
  );
}

// STYLED COMPONENTS WITH MODERN DESIGN & RESPONSIVE BEHAVIOR
const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const StickyHeader = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 0.9rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  background: var(--header-bg);
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.15);

  @media (max-width: 860px) {
    padding: 0.75rem 1rem;
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.9rem;
`;

const HeaderTitle = styled.h1`
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: 0.06em;
  margin: 0;
  display: flex;
  align-items: center;
`;

const HeaderSubtitle = styled.p`
  font-size: 9px;
  color: #3b82f6;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin: 2px 0 0;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;

  @media (max-width: 860px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const TypeFilterGroup = styled.div`
  display: flex;
  background: rgba(148, 163, 184, 0.1);
  padding: 0.25rem;
  border-radius: 0.85rem;
  border: 1px solid var(--border-color);
  gap: 3px;
`;

const TypeFilterChip = styled.button<{ active: boolean }>`
  background: ${({ active }) => (active ? "#2563eb" : "transparent")};
  color: ${({ active }) => (active ? "white" : "var(--text-secondary)")};
  border: none;
  padding: 0.35rem 0.75rem;
  border-radius: 0.65rem;
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
`;

const FilterControl = styled.div`
  display: flex;
  align-items: center;
  padding: 0.35rem 0.85rem;
  border-radius: 0.85rem;
  gap: 0.5rem;
  border: 1px solid var(--border-color);
`;

const Select = styled.select`
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 0.78rem;
  font-weight: 700;
  outline: none;
  cursor: pointer;

  option {
    background: var(--bg-card-solid);
    color: var(--text-primary);
  }
`;

const ThemeToggleBtn = styled.button`
  background: rgba(148, 163, 184, 0.1);
  border: 1px solid var(--border-color);
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(148, 163, 184, 0.2);
  }
`;

const ContentContainer = styled.main`
  padding: 1.75rem 2rem;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const KPIGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1.25rem;
`;

const KPICard = styled.div`
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  border: 1px solid var(--border-color);
  border-radius: 1.25rem;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: var(--card-shadow);
  transition: all 0.25s;

  &:hover {
    border-color: var(--border-hover);
  }
`;

const KPIIcon = styled.div<{ color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: ${({ color }) => `${color}18`};
  color: ${({ color }) => color};
  border: 1px solid ${({ color }) => `${color}33`};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const KPIInfo = styled.div`
  display: flex;
  flex-direction: column;

  .kpi-label {
    font-size: 9px;
    font-weight: 800;
    color: var(--text-secondary);
    letter-spacing: 0.08em;
  }

  .kpi-value {
    font-size: 1.5rem;
    font-weight: 900;
    color: var(--text-primary);
    margin: 2px 0;
  }

  .kpi-sub {
    font-size: 10px;
    color: var(--text-muted);
  }
`;

const TypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.25rem;
`;

const TypeCard = styled.div<{ borderAccent: string }>`
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  border: 1px solid var(--border-color);
  border-radius: 1.25rem;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  box-shadow: var(--card-shadow);
  transition: all 0.25s;

  &:hover {
    border-color: ${({ borderAccent }) => borderAccent};
  }
`;

const TypeIcon = styled.div<{ color: string }>`
  width: 50px;
  height: 50px;
  border-radius: 14px;
  background: ${({ color }) => `${color}18`};
  color: ${({ color }) => color};
  border: 1px solid ${({ color }) => `${color}30`};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const TypeInfo = styled.div`
  flex: 1;

  .type-title {
    font-size: 1rem;
    font-weight: 800;
    color: var(--text-primary);
    display: block;
  }

  .type-desc {
    font-size: 11px;
    color: var(--text-secondary);
    margin: 2px 0 8px;
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    border-radius: 999px;
    background: rgba(148, 163, 184, 0.15);
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: 999px;
    transition: width 0.6s ease;
  }
`;

const TypeValue = styled.div<{ color: string }>`
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  .count {
    font-size: 1.6rem;
    font-weight: 900;
    color: ${({ color }) => color};
  }

  .pct {
    font-size: 10px;
    font-weight: 700;
    color: var(--text-secondary);
  }
`;

const BentoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  .span-2 {
    grid-column: span 2;
    @media (max-width: 768px) {
      grid-column: span 1;
    }
  }

  .span-3 {
    grid-column: span 3;
    @media (max-width: 1024px) {
      grid-column: span 2;
    }
    @media (max-width: 768px) {
      grid-column: span 1;
    }
  }
`;

const BentoItem = styled.div`
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  border: 1px solid var(--border-color);
  border-radius: 1.5rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  box-shadow: var(--card-shadow);
  transition: all 0.25s;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;

  .header-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;

    &.blue {
      background: rgba(59, 130, 246, 0.15);
      color: #3b82f6;
    }
    &.amber {
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
    }
    &.emerald {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
    }
  }

  h4 {
    font-size: 0.95rem;
    font-weight: 800;
    color: var(--text-primary);
    margin: 0;
  }

  p {
    font-size: 11px;
    color: var(--text-secondary);
    margin: 2px 0 0;
  }
`;

const ChartContainer = styled.div`
  flex: 1;
  min-height: 220px;
`;
