(function () {
  const NS = 'http://www.w3.org/2000/svg';

  // Node positions in a 1440×900 coordinate space
  const nodes = [
    [120, 200], [350,  80], [680, 250], [920, 120], [1200, 300], [1380, 150],
    [250, 450], [550, 580], [850, 480], [1100, 600], [1350, 520],
    [100, 700], [400, 780], [720, 820], [1050, 780]
  ];

  // Connected edges (0-based node index pairs)
  const edges = [
    [0,1],[1,2],[2,3],[3,4],[4,5],
    [1,6],[2,7],[3,8],[4,9],[5,10],
    [6,7],[7,8],[8,9],[9,10],
    [6,11],[7,12],[8,13],[9,14],
    [11,12],[12,13],[13,14],
    [0,6],[2,8],[4,10]
  ];

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('viewBox', '0 0 1440 900');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  svg.style.cssText = [
    'position:fixed', 'top:0', 'left:0', 'width:100%', 'height:100%',
    'z-index:0', 'pointer-events:none', 'overflow:hidden'
  ].join(';');

  function makeLine(x1, y1, x2, y2, stroke, sw) {
    const el = document.createElementNS(NS, 'line');
    el.setAttribute('x1', x1); el.setAttribute('y1', y1);
    el.setAttribute('x2', x2); el.setAttribute('y2', y2);
    el.setAttribute('stroke', stroke);
    el.setAttribute('stroke-width', sw);
    el.setAttribute('stroke-linecap', 'round');
    return el;
  }

  // Layer 1 — dim static tracks so the animated dot has a "rail" to travel on
  edges.forEach(([a, b]) => {
    svg.appendChild(makeLine(
      nodes[a][0], nodes[a][1], nodes[b][0], nodes[b][1],
      'rgba(173,206,255,0.05)', '1'
    ));
  });

  // Layer 2 — animated traveling dashes
  // Slower than rhoimpact: 10–18 s per pass
  const durations = [14, 17, 12, 19, 16, 13, 20, 15, 18, 14, 16, 12, 18, 15, 13, 17, 14, 19, 12, 16, 18, 13, 15, 17];
  const delays    = [ 0, -6, -2, -9, -4,-13, -1, -7, -5,-10, -3, -8, -4,-11, -6,  0, -9, -3,-14, -5, -7,-15, -8, -4];

  edges.forEach(([a, b], i) => {
    const el = makeLine(
      nodes[a][0], nodes[a][1], nodes[b][0], nodes[b][1],
      'rgba(173,206,255,0.65)', '1.5'
    );
    // dasharray: short visible segment + long gap; offset animates the segment along the path
    el.setAttribute('stroke-dasharray', '55 2200');
    el.setAttribute('stroke-dashoffset', '2255');
    el.style.animation = `bgTravel ${durations[i]}s linear infinite ${delays[i]}s`;
    el.style.filter = 'drop-shadow(0 0 4px rgba(173,206,255,0.45))';
    svg.appendChild(el);
  });

  // Layer 3 — pulsing nodes at select intersections
  [
    [0,  9,  0], [2, 12, -3], [4, 10, -7],
    [6, 13, -2], [8, 11, -9], [9, 15, -5],
    [11, 10, -3],[13, 14, -10],[14, 12, -6]
  ].forEach(([idx, dur, delay]) => {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', nodes[idx][0]);
    c.setAttribute('cy', nodes[idx][1]);
    c.setAttribute('r', '2.5');
    c.setAttribute('fill', 'rgba(173,206,255,0.45)');
    c.style.animation = `bgNodePulse ${dur}s ease-in-out infinite ${delay}s`;
    svg.appendChild(c);
  });

  // Inject keyframes into <head>
  const style = document.createElement('style');
  style.textContent = `
    @keyframes bgTravel {
      0%   { stroke-dashoffset: 2255; }
      100% { stroke-dashoffset: 0; }
    }
    @keyframes bgNodePulse {
      0%, 100% { opacity: 0.35; }
      50%       { opacity: 0;    }
    }
  `;
  document.head.appendChild(style);

  // Insert as very first child of body so it sits behind everything
  document.body.insertBefore(svg, document.body.firstChild);
})();
