import React, { useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { Shield, Sparkles, ArrowRight, UserCheck } from "lucide-react";
import { UserRole } from "../constants/enums";

export default function Onboarding({ onFinish }: { onFinish: (user: any) => void }) {
  const [name, setName] = useState("Ahmad Fauzi");
  const [division, setDivision] = useState("Operasional Terminal");
  const [position, setPosition] = useState("Staff K3 Pelaksana");
  const [role, setRole] = useState<UserRole>(UserRole.USER);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFinish({
      uid: `usr-${Date.now()}`,
      name: name || "Officer K3 Pelindo",
      division: division || "Operasional",
      position: position || "Staff",
      role: role,
      email: `${name.toLowerCase().replace(/\s+/g, '')}@pelindo.co.id`,
    });
  };

  return (
    <Container>
      <Card
        className="glass-card"
        as={motion.div}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <LogoWrapper>
          <div className="icon-badge">
            <Shield size={32} />
          </div>
          <div>
            <Title className="font-brand">SafeGuard K3</Title>
            <Subtitle>PT. PELINDO MULTI TERMINAL</Subtitle>
          </div>
        </LogoWrapper>

        <WelcomeText>
          <h3>Masuk Sistem Pelaporan K3</h3>
          <p>Laporkan kondisi dan tindakan tidak aman untuk mewujudkan Zero Accident di seluruh wilayah pelabuhan.</p>
        </WelcomeText>

        <Form onSubmit={handleSubmit}>
          <FieldGroup>
            <Label>Nama Petugas / Pelapor</Label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
            />
          </FieldGroup>

          <FieldGroup>
            <Label>Divisi / Unit Kerja</Label>
            <Select value={division} onChange={(e) => setDivision(e.target.value)}>
              <option value="Operasional Terminal">Operasional Terminal</option>
              <option value="HSE & K3 Lingkungan">HSE & K3 Lingkungan</option>
              <option value="Teknik & Peralatan">Teknik & Peralatan</option>
              <option value="Logistik & Pergudangan">Logistik & Pergudangan</option>
              <option value="Keamanan & Security">Keamanan & Security</option>
            </Select>
          </FieldGroup>

          <FieldGroup>
            <Label>Peran Pengguna</Label>
            <RoleGrid>
              <RoleOption
                type="button"
                active={role === UserRole.USER}
                onClick={() => setRole(UserRole.USER)}
              >
                <span>Pelapor Lapangan (User)</span>
              </RoleOption>
              <RoleOption
                type="button"
                active={role === UserRole.BPO}
                onClick={() => setRole(UserRole.BPO)}
              >
                <span>Petugas K3 (BPO Admin)</span>
              </RoleOption>
            </RoleGrid>
          </FieldGroup>

          <SubmitBtn
            type="submit"
            as={motion.button}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Lanjutkan ke Dashboard</span>
            <ArrowRight size={16} />
          </SubmitBtn>
        </Form>
      </Card>
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
`;

const Card = styled.div`
  max-width: 460px;
  width: 100%;
  border-radius: 2rem;
  padding: 2.5rem 2rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
`;

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;

  .icon-badge {
    width: 52px;
    height: 52px;
    border-radius: 1rem;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 10px 25px rgba(37, 99, 235, 0.4);
  }
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 800;
  color: #f8fafc;
  margin: 0;
  letter-spacing: 0.05em;
`;

const Subtitle = styled.p`
  font-size: 9px;
  font-weight: 700;
  color: #60a5fa;
  letter-spacing: 0.15em;
  margin: 2px 0 0;
  text-transform: uppercase;
`;

const WelcomeText = styled.div`
  margin-bottom: 2rem;
  h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: white;
    margin: 0 0 0.4rem;
  }
  p {
    font-size: 0.8rem;
    color: #94a3b8;
    line-height: 1.5;
    margin: 0;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const Label = styled.label`
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #cbd5e1;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.85rem 1rem;
  border-radius: 1rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: white;
  font-size: 0.9rem;
  outline: none;

  &:focus {
    border-color: #3b82f6;
    background: rgba(15, 23, 42, 0.8);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.85rem 1rem;
  border-radius: 1rem;
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: white;
  font-size: 0.85rem;
  outline: none;
  cursor: pointer;
`;

const RoleGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
`;

const RoleOption = styled.button<{ active: boolean }>`
  padding: 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid ${({ active }) => (active ? '#3b82f6' : 'rgba(255, 255, 255, 0.08)')};
  background: ${({ active }) => (active ? 'rgba(59, 130, 246, 0.2)' : 'rgba(15, 23, 42, 0.4)')};
  color: ${({ active }) => (active ? '#93c5fd' : '#94a3b8')};
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(59, 130, 246, 0.15);
  }
`;

const SubmitBtn = styled.button`
  margin-top: 0.5rem;
  padding: 1rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.4);
`;
