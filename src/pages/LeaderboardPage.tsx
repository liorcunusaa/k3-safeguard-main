import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Star, Crown, Sparkles, ShieldCheck, Award, Shield, UserCheck } from "lucide-react";
import { collection, limit, onSnapshot, orderBy, query } from "../firebase";
import { db } from "../firebase";
import { useTheme } from "../context/ThemeContext";
import { UserRole } from "../constants/enums";
import AppSidebar from "../components/AppSidebar";
import { PageShell, PageShellContent } from "../components/PageShell";

interface LeaderboardUser {
  id: string;
  nama: string;
  divisi: string;
  jabatan: string;
  points: number;
}

export default function LeaderboardPage({ user, onToggleRole, onLogout }: { user?: any; onToggleRole?: () => void; onLogout?: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const isBPO = user?.role === UserRole.BPO;
  const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const leaderboardQuery = query(
      collection(db, "users"),
      orderBy("points", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(
      leaderboardQuery,
      (snapshot: any) => {
        setTopUsers(snapshot.docs.map((item: any) => ({
          id: item.id,
          ...item.data(),
        })));
        setLoading(false);
      },
      (error: any) => {
        console.error("Leaderboard error:", error);
        setTopUsers([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const podiumUsers = topUsers.slice(0, 3);
  const remainingUsers = topUsers.slice(3);

  return (
    <PageShell>
      <AppSidebar user={user} onToggleRole={onToggleRole} onLogout={onLogout} />
      <PageShellContent>
      <Container>
      <Header className="glass-card">
  <HeaderLeft>
    <div>
      <Title>LEADERBOARD K3</Title>
      <SubtitleText>PT. PELINDO MULTI TERMINAL</SubtitleText>
    </div>
  </HeaderLeft>
</Header>
        

      <HeroSection
        as={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="badge-pill">
          <Sparkles size={13} color="#f59e0b" />
          <span>APRESIASI BUDAYA KESELAMATAN KERJA</span>
        </div>
        <h1>Pahlawan K3 Pelindo</h1>
        <p>Penghargaan atas partisipasi aktif pelaporan potensi bahaya untuk mewujudkan Zero Accident di seluruh area terminal pelabuhan.</p>
      </HeroSection>

      {loading ? (
        <DataState>
          <Trophy size={34} color="#fbbf24" />
          <p>Memuat data peringkat dari Firebase...</p>
        </DataState>
      ) : topUsers.length === 0 ? (
        <DataState>
          <ShieldCheck size={34} color="var(--text-muted)" />
          <p>Belum ada data peringkat di Firebase.</p>
        </DataState>
      ) : (
      <>
      {/* PODIUM TOP 3 */}
      <PodiumContainer>
        {/* 2nd Place */}
        {podiumUsers[1] && (
          <PodiumItem
            as={motion.div}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            rank={2}
          >
            <PodiumAvatar>
              <Medal color="#94a3b8" size={30} className="rank-medal" />
              <div className="name-initial silver">{podiumUsers[1].nama?.charAt(0)}</div>
            </PodiumAvatar>
            <PodiumName>{podiumUsers[1].nama}</PodiumName>
            <PodiumDept>{podiumUsers[1].divisi}</PodiumDept>
            <PodiumPoints>{podiumUsers[1].points} PTS</PodiumPoints>
            <PodiumBase height={95} color="rgba(148, 163, 184, 0.15)">
              <span className="rank-number">2</span>
            </PodiumBase>
          </PodiumItem>
        )}

        {/* 1st Place (Winner) */}
        {podiumUsers[0] && (
          <PodiumItem
            as={motion.div}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            rank={1}
          >
            <PodiumAvatar>
              <Crown color="#fbbf24" size={38} className="crown" />
              <div className="name-initial gold">{podiumUsers[0].nama?.charAt(0)}</div>
            </PodiumAvatar>
            <PodiumName className="gold-name">{podiumUsers[0].nama}</PodiumName>
            <PodiumDept>{podiumUsers[0].divisi}</PodiumDept>
            <PodiumPoints className="gold-pts">{podiumUsers[0].points} PTS</PodiumPoints>
            <PodiumBase height={135} color="rgba(245, 158, 11, 0.2)">
              <span className="rank-number gold">1</span>
            </PodiumBase>
          </PodiumItem>
        )}

        {/* 3rd Place */}
        {podiumUsers[2] && (
          <PodiumItem
            as={motion.div}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            rank={3}
          >
            <PodiumAvatar>
              <Medal color="#d97706" size={28} className="rank-medal" />
              <div className="name-initial bronze">{podiumUsers[2].nama?.charAt(0)}</div>
            </PodiumAvatar>
            <PodiumName>{podiumUsers[2].nama}</PodiumName>
            <PodiumDept>{podiumUsers[2].divisi}</PodiumDept>
            <PodiumPoints>{podiumUsers[2].points} PTS</PodiumPoints>
            <PodiumBase height={75} color="rgba(217, 119, 6, 0.15)">
              <span className="rank-number">3</span>
            </PodiumBase>
          </PodiumItem>
        )}
      </PodiumContainer>

      {/* REMAINING RANKING LIST */}
      <Board className="glass-card">
        <div className="board-header">
          <span>PERINGKAT PELAPOR K3 LAINNYA</span>
          <Award size={15} color="#38bdf8" />
        </div>
        <AnimatePresence>
          {remainingUsers.map((user, index) => (
            <UserRow
              key={user.id}
              as={motion.div}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ backgroundColor: "var(--bg-card-hover)" }}
            >
              <Rank>{index + 4}</Rank>
              <Avatar>{user.nama?.charAt(0) || "U"}</Avatar>
              <UserInfo>
                <UserName>{user.nama}</UserName>
                <UserMeta>
                  {user.divisi} • {user.jabatan}
                </UserMeta>
              </UserInfo>
              <Points>
                <Star size={15} color="#fbbf24" fill="#fbbf24" />
                <span>{user.points || 0}</span>
                <small>PTS</small>
              </Points>
            </UserRow>
          ))}
        </AnimatePresence>
      </Board>
      </>
      )}
      </Container>
      </PageShellContent>
    </PageShell>
  );
}

// LUXURY STYLED COMPONENTS
const Container = styled.div`
  max-width: 960px;
  margin: 0 auto;
  min-height: 100vh;
  padding: 1.5rem 1.5rem 4rem;
  color: var(--text-primary);
`;

const DataState = styled.div`
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  color: var(--text-secondary);
  font-size: 0.8rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1.25rem;
  border-radius: 1.25rem;
  border: 1px solid var(--border-color);
  margin-bottom: 2.5rem;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;
  cursor: pointer;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: 0.04em;
`;

const SubtitleText = styled.div`
  font-size: 0.68rem;
  color: var(--text-muted);
  font-weight: 700;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ThemeToggleBtn = styled.button`
  background: var(--bg-card-subtle);
  border: 1px solid var(--border-color);
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const HeroSection = styled.div`
  text-align: center;
  margin-bottom: 3rem;

  .badge-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 999px;
    background: rgba(245, 158, 11, 0.12);
    border: 1px solid rgba(245, 158, 11, 0.3);
    color: #f59e0b;
    font-size: 0.7rem;
    font-weight: 800;
    margin-bottom: 0.75rem;
  }

  h1 {
    font-size: 2rem;
    font-weight: 900;
    margin: 0 0 0.5rem;
    color: var(--text-primary);
  }

  p {
    color: var(--text-secondary);
    font-size: 0.88rem;
    max-width: 580px;
    margin: 0 auto;
    line-height: 1.6;
  }
`;

const PodiumContainer = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 1.25rem;
  margin-bottom: 3rem;

  @media (max-width: 640px) {
    gap: 0.5rem;
  }
`;

const PodiumItem = styled.div<{ rank: number }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 200px;
  order: ${({ rank }) => (rank === 1 ? 2 : rank === 2 ? 1 : 3)};

  @media (max-width: 640px) {
    width: 110px;
  }
`;

const PodiumAvatar = styled.div`
  position: relative;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;

  .name-initial {
    width: 76px;
    height: 76px;
    border-radius: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
    font-weight: 900;
    color: white;

    &.gold {
      width: 90px;
      height: 90px;
      font-size: 2.2rem;
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      box-shadow: 0 16px 36px rgba(245, 158, 11, 0.45);
    }

    &.silver {
      background: linear-gradient(135deg, #94a3b8, #64748b);
      box-shadow: 0 12px 28px rgba(100, 116, 139, 0.4);
    }

    &.bronze {
      background: linear-gradient(135deg, #d97706, #b45309);
      box-shadow: 0 12px 28px rgba(217, 119, 6, 0.4);
    }
  }

  .crown {
    position: absolute;
    top: -32px;
    z-index: 10;
    filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.8));
    animation: float-subtle 3s ease-in-out infinite;
  }

  .rank-medal {
    position: absolute;
    top: -24px;
    z-index: 5;
  }
`;

const PodiumName = styled.div`
  font-weight: 800;
  font-size: 0.95rem;
  margin-bottom: 2px;
  text-align: center;
  color: var(--text-primary);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &.gold-name {
    font-size: 1.05rem;
  }
`;

const PodiumDept = styled.div`
  font-size: 0.68rem;
  color: var(--text-muted);
  margin-bottom: 4px;
`;

const PodiumPoints = styled.div`
  font-weight: 900;
  color: #38bdf8;
  font-size: 0.95rem;
  margin-bottom: 0.75rem;

  &.gold-pts {
    color: #fbbf24;
    font-size: 1.1rem;
  }
`;

const PodiumBase = styled.div<{ height: number; color: string }>`
  width: 100%;
  height: ${({ height }) => height}px;
  background: ${({ color }) => color};
  border-radius: 1.25rem 1.25rem 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  border-bottom: none;

  .rank-number {
    font-size: 2.2rem;
    font-weight: 900;
    opacity: 0.35;
    color: var(--text-primary);

    &.gold {
      opacity: 0.6;
      color: #fbbf24;
    }
  }
`;

const Board = styled.div`
  border-radius: 1.5rem;
  border: 1px solid var(--border-color);
  overflow: hidden;

  .board-header {
    padding: 0.85rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--bg-card-subtle);
    border-bottom: 1px solid var(--border-color);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    color: var(--text-secondary);
  }
`;

const UserRow = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  transition: all 0.2s;

  &:last-child {
    border-bottom: none;
  }
`;

const Rank = styled.div`
  width: 32px;
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--text-muted);
`;

const Avatar = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, #1d4ed8, #0284c7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: white;
  margin-right: 1rem;
  font-size: 0.95rem;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 700;
  font-size: 0.88rem;
  color: var(--text-primary);
`;

const UserMeta = styled.div`
  font-size: 0.72rem;
  color: var(--text-muted);
`;

const Points = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 800;
  color: var(--text-primary);

  span {
    font-size: 1.1rem;
  }
  small {
    font-size: 0.65rem;
    color: var(--text-muted);
  }
`;
