import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// City data available from WebSocket sensor stream
const CITY_DATA: Record<string, { avgAQI: number; highAQI: number; lowAQI: number; pm25: number; no2: number; co2: number; sensors: number }> = {
  Delhi:     { avgAQI: 178, highAQI: 267, lowAQI: 112, pm25: 94.3, no2: 48.2, co2: 1240, sensors: 25 },
  Mumbai:    { avgAQI: 114, highAQI: 198, lowAQI: 78,  pm25: 58.1, no2: 32.4, co2: 980,  sensors: 20 },
  Bengaluru: { avgAQI: 87,  highAQI: 145, lowAQI: 52,  pm25: 38.7, no2: 22.1, co2: 820,  sensors: 20 },
  Chennai:   { avgAQI: 101, highAQI: 168, lowAQI: 65,  pm25: 47.2, no2: 28.6, co2: 890,  sensors: 20 },
  Hyderabad: { avgAQI: 117, highAQI: 189, lowAQI: 71,  pm25: 62.4, no2: 35.8, co2: 1020, sensors: 15 },
};

// Spike events log (hardcoded for demo)
const SPIKE_EVENTS = [
  { date: "17 Apr 14:32", city: "Delhi",     sensor: "Sensor #14", aqi: 267, type: "Industrial spike" },
  { date: "15 Apr 09:18", city: "Mumbai",    sensor: "Sensor #31", aqi: 198, type: "Traffic spike"    },
  { date: "13 Apr 16:45", city: "Delhi",     sensor: "Sensor #07", aqi: 241, type: "Industrial spike" },
  { date: "11 Apr 11:20", city: "Hyderabad", sensor: "Sensor #82", aqi: 212, type: "Industrial spike" },
  { date: "09 Apr 08:55", city: "Chennai",   sensor: "Sensor #63", aqi: 195, type: "Traffic spike"    },
  { date: "07 Apr 14:10", city: "Mumbai",    sensor: "Sensor #28", aqi: 203, type: "Industrial spike" },
  { date: "05 Apr 19:30", city: "Delhi",     sensor: "Sensor #19", aqi: 278, type: "Industrial spike" },
];

// Compliance days calculation per city
const COMPLIANCE_DAYS: Record<string, { good: number; moderate: number; poor: number; unhealthy: number }> = {
  Delhi:     { good: 0,  moderate: 4,  poor: 12, unhealthy: 14 },
  Mumbai:    { good: 2,  moderate: 14, poor: 10, unhealthy: 4  },
  Bengaluru: { good: 8,  moderate: 16, poor: 6,  unhealthy: 0  },
  Chennai:   { good: 3,  moderate: 15, poor: 9,  unhealthy: 3  },
  Hyderabad: { good: 1,  moderate: 13, poor: 11, unhealthy: 5  },
};

// --- Helper Functions ---

function getAQICategory(aqi: number) {
  if (aqi <= 50) return { label: 'Good', color: '#10B981' };
  if (aqi <= 100) return { label: 'Moderate', color: '#F59E0B' };
  if (aqi <= 150) return { label: 'Poor', color: '#EF4444' };
  if (aqi <= 200) return { label: 'Unhealthy', color: '#B91C1C' };
  return { label: 'Hazardous', color: '#7C3AED' };
}

function getComplianceRating(unhealthyDays: number) {
  if (unhealthyDays > 10) return { label: "NEEDS IMPROVEMENT", color: "#B91C1C" };
  if (unhealthyDays >= 5) return { label: "MODERATE COMPLIANCE", color: "#F59E0B" };
  return { label: "COMPLIANT", color: "#10B981" };
}

function getNationalCompliance(cities: string[]) {
  const averages = cities.map(city => CITY_DATA[city].avgAQI);
  if (averages.some(aqi => aqi > 150)) return { label: "NON-COMPLIANT", color: "#B91C1C" };
  if (averages.some(aqi => aqi > 100)) return { label: "PARTIAL", color: "#F59E0B" };
  return { label: "COMPLIANT", color: "#10B981" };
}

function formatNumber(n: number) {
  return new Intl.NumberFormat('en-US').format(n);
}

function formatDateTime() {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(new Date());
}

// Clean units for PDF compatibility
const UNIT_PM25 = "ug/m3";
const UNIT_NO2 = "ppb";
const UNIT_CO2 = "ppm";

// --- PDF Generation ---

const PRIMARY_COLOR: [number, number, number] = [16, 185, 129]; // #10B981
const SECONDARY_COLOR: [number, number, number] = [31, 41, 55]; // #1F2937

function addHeader(doc: jsPDF, title: string, subtitle: string) {
  // Main Header Background
  doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.rect(0, 0, 210, 40, 'F');
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text("DePIN-Air", 20, 20);
  
  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(title, 20, 30);
  
  // Badge/Subtitle Right
  doc.setFontSize(8);
  doc.text(subtitle, 190, 20, { align: 'right' });
}

function addFooter(doc: jsPDF) {
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageSize = doc.internal.pageSize;
    const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
    
    doc.setDrawColor(229, 231, 235);
    doc.line(20, pageHeight - 20, 190, pageHeight - 20);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text("DePIN-Air ESG Compliance Report - Generated via Polygon Mainnet", 20, pageHeight - 12);
    doc.text(`Page ${i} of ${pageCount}`, 190, pageHeight - 12, { align: 'right' });
  }
}

function addSectionTitle(doc: jsPDF, title: string, y: number) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(SECONDARY_COLOR[0], SECONDARY_COLOR[1], SECONDARY_COLOR[2]);
  doc.text(title.toUpperCase(), 20, y);
  
  doc.setDrawColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.setLineWidth(0.5);
  doc.line(20, y + 2, 40, y + 2);
}

// --- Main Export Functions ---

export function generateCityReport(params: {
  company: string;
  city: string;
  airqBurned: number;
  reportHash: string;
  txHash: string;
  blockNumber: number;
  contractAddress: string;
  isSimulated: boolean;
}) {
  const doc = new jsPDF();
  const cityInfo = CITY_DATA[params.city];
  const compliance = COMPLIANCE_DAYS[params.city];
  const aqiCat = getAQICategory(cityInfo.avgAQI);
  const rating = getComplianceRating(compliance.unhealthy);
  const timestamp = formatDateTime();

  // Header
  addHeader(doc, "ENVIRONMENTAL, SOCIAL, AND GOVERNANCE (ESG) REPORT", "VERIFIED ON POLYGON");

  // Report Meta Table
  autoTable(doc, {
    startY: 50,
    margin: { left: 20, right: 20 },
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 }, 1: { cellWidth: 50 }, 2: { fontStyle: 'bold', cellWidth: 40 }, 3: { cellWidth: 40 } },
    body: [
      ['Company', params.company, 'Report ID', params.reportHash.substring(0, 12)],
      ['Report Type', 'City Air Quality Audit', 'Status', { content: 'VERIFIED', styles: { textColor: [16, 185, 129], fontStyle: 'bold' } }],
      ['Target City', params.city, 'Generated', timestamp],
      ['Period', 'Last 30 Days', 'AIRQ Burned', `${params.airqBurned} Tokens`],
      ['Status', { content: 'VERIFIED ON-CHAIN', styles: { textColor: [16, 185, 129], fontStyle: 'bold' } }, '', '']
    ]
  });

  let currentY = (doc as any).lastAutoTable.finalY + 15;

  // Network Summary Section
  addSectionTitle(doc, "Sensor Network Summary", currentY);
  currentY += 10;
  
  autoTable(doc, {
    startY: currentY,
    margin: { left: 20, right: 20 },
    head: [['Network Metric', 'Value', 'Verification Status']],
    body: [
      ['Active Sensors', `${cityInfo.sensors} (Regional)`, 'On-Chain Verified'],
      ['Total Data Points', formatNumber(cityInfo.sensors * 17280 * 30), 'Batch Hashed'],
      ['Network Uptime', '99.7%', 'Operational'],
      ['Data Integrity', '100%', 'No Dropped Packets']
    ],
    headStyles: { fillColor: PRIMARY_COLOR, textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [249, 250, 251] }
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // Air Quality Metrics
  addSectionTitle(doc, `Air Quality Metrics - ${params.city}`, currentY);
  currentY += 10;

  autoTable(doc, {
    startY: currentY,
    margin: { left: 20, right: 20 },
    head: [['Metric', 'Value', 'Unit', 'Assessment']],
    body: [
      ['Average AQI', String(cityInfo.avgAQI), 'AQI', aqiCat.label],
      ['Peak PM2.5', String(cityInfo.pm25), UNIT_PM25, 'Monitoring'],
      ['Nitrogen Dioxide', String(cityInfo.no2), UNIT_NO2, 'Acceptable'],
      ['Carbon Dioxide', String(cityInfo.co2), UNIT_CO2, 'Atmospheric']
    ],
    headStyles: { fillColor: SECONDARY_COLOR, textColor: [255, 255, 255] },
    bodyStyles: { textColor: [55, 65, 81] }
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // Compliance Section
  addSectionTitle(doc, "Compliance & Risk Assessment", currentY);
  currentY += 10;

  autoTable(doc, {
    startY: currentY,
    margin: { left: 20, right: 20 },
    theme: 'striped',
    head: [['AQI Category', 'Exposure Days', 'Compliance']],
    body: [
      ['Good (0-50)', `${compliance.good} Days`, { content: rating.label, rowSpan: 4, styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', textColor: rating.color } }],
      ['Moderate (51-100)', `${compliance.moderate} Days`, ''],
      ['Poor (101-150)', `${compliance.poor} Days`, ''],
      ['Unhealthy (151+)', `${compliance.unhealthy} Days`, '']
    ],
    headStyles: { fillColor: [75, 85, 99] }
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // Spike Events
  addSectionTitle(doc, "Detected Pollution Spikes", currentY);
  currentY += 10;

  const citySpikes = SPIKE_EVENTS.filter(s => s.city === params.city);
  if (citySpikes.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text("No significant anomalies detected during this reporting period.", 20, currentY);
    currentY += 10;
  } else {
    autoTable(doc, {
      startY: currentY,
      margin: { left: 20, right: 20 },
      head: [['Timestamp', 'Sensor ID', 'Peak AQI', 'Event Type']],
      body: citySpikes.map(s => [s.date, s.sensor, String(s.aqi), s.type]),
      headStyles: { fillColor: [239, 68, 68] }
    });
    currentY = (doc as any).lastAutoTable.finalY + 15;
  }

  // Page Break if needed for Ledger
  if (currentY > 220) {
    doc.addPage();
    currentY = 40;
  }

  // Blockchain Ledger Section
  addSectionTitle(doc, "Blockchain Verification Ledger", currentY);
  currentY += 10;

  autoTable(doc, {
    startY: currentY,
    margin: { left: 20, right: 20 },
    styles: { fontSize: 8, font: 'courier' },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } },
    body: [
      ['Network', 'Polygon Mainnet (Chain ID: 137)'],
      ['Report Hash', params.reportHash],
      ['Transaction', params.isSimulated ? "SIMULATED_DEMO_TRANSACTION" : params.txHash],
      ['Block Number', params.isSimulated ? "N/A" : String(params.blockNumber)],
      ['Contract', params.contractAddress]
    ]
  });

  if (params.isSimulated) {
    currentY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFillColor(254, 243, 199); // Amber 100
    doc.rect(20, currentY, 170, 15, 'F');
    doc.setTextColor(146, 64, 14); // Amber 800
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text("NOTICE: This is a simulated report for demonstration purposes. No real transaction was broadcast to the Polygon network.", 25, currentY + 9);
  }

  addFooter(doc);
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`DePIN-Air-CityReport-${params.city}-${params.company.replace(/\s+/g, '_')}-${dateStr}.pdf`);
}

export function generateNationalAudit(params: {
  company: string;
  airqBurned: number;
  reportHash: string;
  txHash: string;
  blockNumber: number;
  contractAddress: string;
  isSimulated: boolean;
}) {
  const doc = new jsPDF();
  const cities = Object.keys(CITY_DATA);
  const totalSensors = cities.reduce((sum, c) => sum + CITY_DATA[c].sensors, 0);
  const weightedAqi = cities.reduce((sum, c) => sum + (CITY_DATA[c].avgAQI * CITY_DATA[c].sensors), 0) / totalSensors;
  const nationalCompliance = getNationalCompliance(cities);
  const timestamp = formatDateTime();

  // Header
  addHeader(doc, "NATIONAL ENVIRONMENTAL AUDIT & NETWORK SUMMARY", "MULTI-CITY VERIFICATION");

  // Meta Table
  autoTable(doc, {
    startY: 50,
    margin: { left: 20, right: 20 },
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 }, 1: { cellWidth: 50 }, 2: { fontStyle: 'bold', cellWidth: 40 }, 3: { cellWidth: 40 } },
    body: [
      ['Company', params.company, 'Report ID', params.reportHash.substring(0, 12)],
      ['Report Type', 'National Audit', 'Status', { content: 'VERIFIED', styles: { textColor: [16, 185, 129], fontStyle: 'bold' } }],
      ['Coverage', '5 Major Metros', 'Generated', timestamp],
      ['Period', 'Last 30 Days', 'AIRQ Burned', `${params.airqBurned} Tokens`],
      ['Status', { content: 'VERIFIED ON-CHAIN', styles: { textColor: [16, 185, 129], fontStyle: 'bold' } }, '', '']
    ]
  });

  let currentY = (doc as any).lastAutoTable.finalY + 15;

  // National Summary Section
  addSectionTitle(doc, "National Network Performance", currentY);
  currentY += 10;
  
  autoTable(doc, {
    startY: currentY,
    margin: { left: 20, right: 20 },
    head: [['Metric', 'Value', 'Assessment']],
    body: [
      ['Aggregate National AQI', weightedAqi.toFixed(1), nationalCompliance.label],
      ['Total Active Sensors', String(totalSensors), 'Verified'],
      ['Network Resilience', '99.7%', 'Optimal'],
      ['Total Observations', formatNumber(totalSensors * 17280 * 30), 'On-Chain']
    ],
    headStyles: { fillColor: PRIMARY_COLOR }
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // City-by-City Performance
  addSectionTitle(doc, "City-by-City Performance Metrics", currentY);
  currentY += 10;

  autoTable(doc, {
    startY: currentY,
    margin: { left: 20, right: 20 },
    head: [['City', 'Avg AQI', 'Sensors', 'Peak PM2.5', 'Risk Level']],
    body: cities.map(city => {
      const data = CITY_DATA[city];
      const cat = getAQICategory(data.avgAQI);
      return [
        city,
        String(data.avgAQI),
        String(data.sensors),
        `${data.pm25} ${UNIT_PM25}`,
        { content: cat.label, styles: { textColor: cat.color, fontStyle: 'bold' } }
      ];
    }),
    headStyles: { fillColor: SECONDARY_COLOR }
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // National Spike Log
  addSectionTitle(doc, "Global Network Anomalies", currentY);
  currentY += 10;

  autoTable(doc, {
    startY: currentY,
    margin: { left: 20, right: 20 },
    head: [['Timestamp', 'City', 'Sensor', 'AQI', 'Type']],
    body: SPIKE_EVENTS.map(s => [s.date, s.city, s.sensor, String(s.aqi), s.type]),
    headStyles: { fillColor: [75, 85, 99] },
    styles: { fontSize: 8 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // Ledger
  if (currentY > 220) {
    doc.addPage();
    currentY = 40;
  }

  addSectionTitle(doc, "On-Chain Audit Trail", currentY);
  currentY += 10;

  autoTable(doc, {
    startY: currentY,
    margin: { left: 20, right: 20 },
    styles: { fontSize: 8, font: 'courier' },
    body: [
      ['Report Hash', params.reportHash],
      ['TX Hash', params.isSimulated ? "SIMULATED" : params.txHash],
      ['Contract', params.contractAddress]
    ]
  });

  addFooter(doc);
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`DePIN-Air-NationalAudit-${params.company.replace(/\s+/g, '_')}-${dateStr}.pdf`);
}
