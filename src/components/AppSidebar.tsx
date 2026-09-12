import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  BarChart3,
  Home,
  Moon,
  Shield,
  Sun,
  Trophy,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  UserCheck,
  ArrowLeftRight,
  LogOut,
} from "lucide-react";
import { UserRole } from "../constants/enums";
import { useTheme } from "../context/ThemeContext";
import { useState, useEffect } from "react";
import { auth, signOut } from "../firebase";

interface AppSidebarProps {
  user?: any;
  counts?: { open?: number; inProgress?: number; closed?: number; trash?: number };
  onLogout?: () => void;
  onToggleRole?: () => void;
}

export default function AppSidebar({ user, onToggleRole, onLogout }: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("safeguard_sidebar_collapsed") === "true";
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("safeguard_sidebar_collapsed", String(collapsed));
    if (collapsed) {
      document.body.classList.add("sidebar-collapsed");
    } else {
      document.body.classList.remove("sidebar-collapsed");
    }
  }, [collapsed]);

  const isBPO = user?.role === UserRole.BPO;

  const items: { label: string; path: string; icon: any; bpoOnly?: boolean }[] = [
    { label: "Dashboard", path: "/reports", icon: Home },
    { label: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { label: "Analitik", path: "/analytics", icon: BarChart3, bpoOnly: true },
  ];

  const handleLogoutAction = async () => {
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
    setMobileOpen(false);
  };

  return (
    <>
      <MobileMenuButton onClick={() => setMobileOpen(true)} aria-label="Buka navigasi">
        <Menu size={18} />
      </MobileMenuButton>
      <Sidebar data-collapsed={collapsed} className={`${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        
        {/* BRAND / HEADER AREA: LOGGED-IN USER ACCOUNT */}
        <HeaderArea>
          <UserBrandRow>
            <LogoToggle className="brand-logo-toggle" onClick={() => setCollapsed((current) => !current)} title={collapsed ? "Buka sidebar" : "Ciutkan sidebar"} aria-label={collapsed ? "Buka sidebar" : "Ciutkan sidebar"}>
              <Avatar>{user?.name?.charAt(0) || "U"}</Avatar>
              <span className="logo-open-icon"><PanelLeftOpen size={16} /></span>
            </LogoToggle>

            <div className="sidebar-user-copy">
              <strong>{user?.name || "Petugas Pelindo"}</strong>
              <span>{isBPO ? "BPO / HSE Supervisor" : "Pelapor Lapangan"}</span>
            </div>

            <CollapseButton className="brand-collapse-button" onClick={() => setCollapsed((current) => !current)} title="Ciutkan sidebar" aria-label="Ciutkan sidebar">
              <PanelLeftClose size={16} />
            </CollapseButton>
          </UserBrandRow>
        </HeaderArea>

        {/* WORKSPACE NAVIGATION */}
        <SectionLabel className="sidebar-section-label">WORKSPACE</SectionLabel>
        <Nav>
          {items.filter((item) => !item.bpoOnly || isBPO).map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <NavItem
                className="sidebar-nav-item"
                key={item.path}
                active={active}
                title={item.label}
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
              >
                <Icon size={16} /><span>{item.label}</span>
              </NavItem>
            );
          })}
        </Nav>

        {/* FOOTER: LOGOUT BUTTON (ANCHORED) */}
        <Footer className="sidebar-footer">
          <LogoutButton
            className="logout-btn"
            onClick={handleLogoutAction}
            title="Keluar"
            type="button"
          >
            <div className="logout-icon">
              <LogOut size={13} />
            </div>
            <span className="logout-label">Keluar</span>
          </LogoutButton>
        </Footer>
      </Sidebar>
      {mobileOpen && <MobileOverlay onClick={() => setMobileOpen(false)} />}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLED COMPONENTS FOR RESTRUCTURED SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────

const Sidebar = styled.aside`
  width: 248px;
  min-height: 100vh;
  flex: 0 0 248px;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 1.25rem 0.9rem;
  background: var(--header-bg);
  border-right: 1px solid var(--border-color);
  backdrop-filter: blur(22px);
  z-index: 140;
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1), padding 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  &.collapsed { width: 76px; padding-inline: 0.65rem; }
  &.collapsed .sidebar-user-copy,
  &.collapsed .brand-collapse-button,
  &.collapsed .sidebar-section-label,
  &.collapsed .sidebar-nav-item span,
  &.collapsed .sidebar-nav-item small,
  &.collapsed .logout-label,
  &.collapsed .role-label,
  &.collapsed .switch-icon,
  &.collapsed .theme-label,
  &.collapsed .theme-toggle small { display: none !important; }
  &.collapsed .sidebar-nav-item { gap: 0; justify-content: center; padding-inline: 0; }
  &.collapsed .sidebar-nav-item svg { margin: 0 auto; flex-shrink: 0; display: block; }
  &.collapsed .role-toggle-btn { width: 36px; margin-inline: auto; justify-content: center; padding-inline: 0; }
  &.collapsed .sidebar-footer { display: flex; flex-direction: column; align-items: center; }
  &.collapsed .logout-btn { width: 36px; padding: 0.55rem 0; justify-content: center; margin-inline: auto; }
  &.collapsed .logout-btn .logout-icon { margin: 0 auto; }
  &.collapsed .theme-toggle { width: 42px; margin-inline: 0; justify-content: center; padding-inline: 0; }
  @media (max-width: 900px) {
    display: flex;
    transform: translateX(-105%);
    transition: transform 0.25s ease;
    z-index: 140;
    &.mobile-open { transform: translateX(0); }
  }
`;

const HeaderArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
`;

const UserBrandRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.2rem 0.25rem;

  .sidebar-user-copy {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  strong {
    color: var(--text-primary);
    font-size: 0.78rem;
    font-weight: 800;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span {
    margin-top: 2px;
    color: var(--text-muted);
    font-size: 0.58rem;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: linear-gradient(135deg, #2563eb, #38bdf8);
  color: white;
  font-size: 0.8rem;
  font-weight: 900;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
`;

const CollapseButton = styled.button`
  width: 26px; height: 26px; display: grid; place-items: center; border: 1px solid var(--border-color); border-radius: 50%; background: var(--header-bg); color: var(--text-secondary); cursor: pointer; margin-left: auto;
  &:hover { color: #38BDF8; border-color: #38BDF8; }
`;

const LogoToggle = styled.button`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  border-radius: 10px;

  .logo-open-icon {
    display: none;
    position: absolute;
    inset: 0;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: var(--header-bg);
    color: #38BDF8;
  }

  .logo-open-icon { pointer-events: none; }

  .collapsed &.brand-logo-toggle:hover .logo-open-icon { display: flex; }
  .collapsed &.brand-logo-toggle:hover > div { opacity: 0; }
`;

const MobileMenuButton = styled.button`
  display: none;
  @media (max-width: 900px) { display: grid; place-items: center; position: fixed; top: 0.8rem; left: 0.8rem; width: 36px; height: 36px; z-index: 120; border: 1px solid var(--border-color); border-radius: 9px; background: var(--header-bg); color: var(--text-primary); cursor: pointer; }
`;

const MobileOverlay = styled.div`
  display: none;
  @media (max-width: 900px) { display: block; position: fixed; inset: 0; z-index: 130; background: rgba(2, 6, 23, 0.58); }
`;

const SectionLabel = styled.span`
  display: block; padding: 1.25rem 0.7rem 0.55rem; color: var(--text-muted); font-size: 0.6rem; font-weight: 800; letter-spacing: 0.12em;
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  overflow-y: auto;
`;
const NavItem = styled.button<{ active: boolean }>`

  width: 100%; display: flex; align-items: center; gap: 0.65rem; padding: 0.68rem 0.75rem; border: 1px solid ${({ active }) => active ? "rgba(56,189,248,.3)" : "transparent"}; border-radius: 10px; background: ${({ active }) => active ? "rgba(56, 189, 248, 0.12)" : "transparent"}; color: ${({ active }) => active ? "#38BDF8" : "var(--text-secondary)"}; font: inherit; font-size: 0.74rem; font-weight: 700; text-align: left; cursor: pointer;
  &:hover { color: var(--text-primary); background: var(--bg-card-subtle); border-color: var(--border-color); }
`;
const Footer = styled.div`
  margin-top: auto;
  flex-shrink: 0;
  border-top: 1px solid var(--border-color);
  padding-top: 0.5rem;
`;

const LogoutButton = styled.button`
  width: 100%;
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