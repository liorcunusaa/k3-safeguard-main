import { K3Report, FindingType, ReportStatus } from '../types';

export const INITIAL_REPORTS: K3Report[] = [
  {
    id: 'REP-2026-001',
    title: 'Genangan Oli Licin Dekat Crane Dermaga 03',
    findingType: FindingType.UNSAFE_CONDITION,
    category: 'Lingkungan Kerja & Housekeeping',
    description: 'Terdapat tumpahan minyak hidrolik alat berat di lantai kerja dermaga berdekatan dengan jalur lalu lintas forklift, berpotensi menyebabkan pekerja terpeleset atau unit tergelincir.',
    locationName: 'Dermaga 03 Sisi Selatan',
    gpsLocation: {
      latitude: -6.1042,
      longitude: 106.8835,
      accuracy: 6.2,
      address: 'Zona Dermaga Petikemas 03, Pelabuhan Tanjung Priok',
      timestamp: Date.now() - 3600000 * 4
    },
    status: ReportStatus.OPEN,
    reporterName: 'Budi Santoso',
    reporterRole: 'Inspector K3',
    photoUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&auto=format&fit=crop&q=60',
    date: '2026-09-05',
    createdAt: { seconds: Math.floor((Date.now() - 3600000 * 4) / 1000) },
    actionTaken: 'Dipasang safety cone barikade sementara.'
  },
  {
    id: 'REP-2026-002',
    title: 'Pekerja Tidak Menggunakan Full Body Harness di Ketinggian',
    findingType: FindingType.UNSAFE_ACTION,
    category: 'Pelanggaran APD / Prosedur',
    description: 'Terlihat teknisi sub-kontraktor memanjat tangga scaffolding setinggi 4.5 meter untuk perbaikan sensor tanpa memasang tali pengaman (lanyard) body harness ke lifeline.',
    locationName: 'Workshop Maintenance Gudang 02',
    gpsLocation: null, // Unsafe Action: Tidak mengambil GPS
    status: ReportStatus.IN_PROGRESS,
    reporterName: 'Ahmad Fauzi',
    reporterRole: 'HSE Officer',
    photoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=60',
    date: '2026-09-05',
    createdAt: { seconds: Math.floor((Date.now() - 3600000 * 2) / 1000) },
    actionTaken: 'Pekerjaan dihentikan (Stop Work Authority) dan diberikan safety briefing langsung.'
  },
  {
    id: 'REP-2026-003',
    title: 'Penutup Parit Saluran Terbuka & Rusak',
    findingType: FindingType.UNSAFE_CONDITION,
    category: 'Fasilitas & Infrastruktur',
    description: 'Grating penutup parit kabel utama patah dan berlubang selebar 40 cm. Berbahaya bagi pejalan kaki dan kendaraan operasional malam hari.',
    locationName: 'Jalur CY Block B-4',
    gpsLocation: {
      latitude: -6.1078,
      longitude: 106.8867,
      accuracy: 4.8,
      address: 'Container Yard Block B, Jalur Logistik Terminal',
      timestamp: Date.now() - 3600000 * 12
    },
    status: ReportStatus.CLOSED,
    reporterName: 'Rahmat Audy',
    reporterRole: 'Safety Officer',
    photoUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&auto=format&fit=crop&q=60',
    date: '2026-09-04',
    createdAt: { seconds: Math.floor((Date.now() - 3600000 * 24) / 1000) },
    actionTaken: 'Grating besi baru telah dipasang dan dilas kuat oleh tim sipil maintenance.'
  },
  {
    id: 'REP-2026-004',
    title: 'Operator Forklift Mengoperasikan Sambil Bermain Handphone',
    findingType: FindingType.UNSAFE_ACTION,
    category: 'Distraksi / Pelanggaran Perilaku',
    description: 'Driver forklift nomor unit FL-08 terlihat menatap ponsel saat membawa pallet muatan di area lintasan transit container.',
    locationName: 'Depan Gate In Terminal 2',
    gpsLocation: null, // Unsafe Action: Tidak mengambil GPS
    status: ReportStatus.OPEN,
    reporterName: 'Dewi Lestari',
    reporterRole: 'BPO Supervisor',
    date: '2026-09-05',
    createdAt: { seconds: Math.floor((Date.now() - 3600000 * 1) / 1000) },
    actionTaken: 'Pemberian surat peringatan lisan dan reminder SOP larangan gadget saat operasi alat berat.'
  }
];
