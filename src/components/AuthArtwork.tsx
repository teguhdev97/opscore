import { Bot, FileCheck2, FilePenLine, FileText, FolderOpen, Sparkles } from 'lucide-react';
import './auth-artwork.css';

const sceneWidth = 840;
const sceneHeight = 480;
const centerX = sceneWidth / 2;
const centerY = sceneHeight / 2;
const orbitTracks = [
  { radiusX: 117.5, radiusY: 215.3, angle: 0 },
  { radiusX: 332.7, radiusY: 117.9, angle: -17 },
  { radiusX: 332.7, radiusY: 117.9, angle: 17 },
];
const planets = [
  { name: 'document', Icon: FileText, orbit: 1, phase: 180 },
  { name: 'checklist', Icon: FileCheck2, orbit: 0, phase: 270 },
  { name: 'pen', Icon: FilePenLine, orbit: 1, phase: 0 },
  { name: 'folder', Icon: FolderOpen, orbit: 2, phase: 0 },
  { name: 'workbuddy', Icon: Bot, orbit: 0, phase: 90 },
  { name: 'star', Icon: Sparkles, orbit: 2, phase: 180 },
];
const stars = [
  [8, 17, 2], [22, 12, 1], [41, 16, 2], [64, 11, 2], [89, 16, 3],
  [13, 26, 1], [35, 23, 3], [56, 27, 1], [78, 23, 2], [95, 31, 1],
  [5, 42, 2], [95, 44, 3], [7, 59, 1], [94, 62, 2], [12, 72, 3],
  [33, 76, 1], [55, 72, 2], [78, 77, 3], [91, 83, 1], [20, 85, 2],
  [44, 88, 1], [66, 85, 2], [26, 32, 1], [72, 33, 1], [48, 20, 1],
];

export function AuthArtwork() {
  return <div className="auth-system" aria-hidden="true">
    <div className="auth-system-stars">
      {stars.map(([left, top, size], index) => <i key={index} style={{ left: `${left}%`, top: `${top}%`, width: size, height: size }}/>) }
    </div>
    <div className="auth-system-scene">
      <div className="auth-system-core"><img src="/dokuresai-logo.png" alt=""/></div>
      <svg className="auth-system-orbits" viewBox={`0 0 ${sceneWidth} ${sceneHeight}`} fill="none">
        {orbitTracks.map(({ radiusX, radiusY, angle }) => <ellipse key={`${radiusX}-${angle}`} cx={centerX} cy={centerY} rx={radiusX} ry={radiusY} transform={`rotate(${angle} ${centerX} ${centerY})`}/>)}
      </svg>
      {planets.map(({ name, Icon, orbit, phase }) => {
        // Share the ellipse's radii and rotation so planets stay on their tracks.
        const track = orbitTracks[orbit];
        const rotation = track.angle * Math.PI / 180;
        const angle = phase * Math.PI / 180;
        const x = track.radiusX * Math.cos(angle);
        const y = track.radiusY * Math.sin(angle);
        const left = (centerX + x * Math.cos(rotation) - y * Math.sin(rotation)) / sceneWidth * 100;
        const top = (centerY + x * Math.sin(rotation) + y * Math.cos(rotation)) / sceneHeight * 100;
        return <span key={name} className={`auth-system-planet planet-${name}`} style={{ left: `${left}%`, top: `${top}%` }}><Icon size={24} strokeWidth={1.8}/></span>;
      })}
    </div>
  </div>;
}
