// skills.js — interactive skills network SVG

(function () {
  const groups = [
    {
      id: 'frontend', label: 'FRONTEND', color: '#7C5CFF',
      cx: 380, cy: 260,
      ox: -240, oy: -110,    // offset from center
      techs: ['Angular', 'TypeScript', 'Tailwind', 'React']
    },
    {
      id: 'backend', label: 'BACKEND', color: '#5CC8FF',
      cx: 380, cy: 260,
      ox: 240, oy: -90,
      techs: ['Node.js', 'Express', 'REST', 'GraphQL']
    },
    {
      id: 'database', label: 'DATABASE', color: '#FFC15C',
      cx: 380, cy: 260,
      ox: -200, oy: 120,
      techs: ['MongoDB', 'PostgreSQL', 'SQLite']
    },
    {
      id: 'ai', label: 'AI / LLM', color: '#FF5CC8',
      cx: 380, cy: 260,
      ox: 200, oy: 110,
      techs: ['LLM APIs', 'Embeddings', 'Prompt Eng.']
    },
    {
      id: 'tools', label: 'TOOLS', color: '#5CC8FF',
      cx: 380, cy: 260,
      ox: 0, oy: 150,
      techs: ['Docker', 'AWS', 'Git', 'CI/CD']
    }
  ];

  const svg = document.getElementById('skills-svg');
  if (!svg) return;

  const linksGroup = document.getElementById('skills-links');
  const nodesGroup = document.getElementById('skills-nodes');

  const cx = 380, cy = 260;
  const linkLen = 120; // distance from center to group

  groups.forEach(group => {
    // target center position
    const tx = cx + group.ox;
    const ty = cy + group.oy;

    // line from center to group node
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', cx);
    line.setAttribute('y1', cy);
    line.setAttribute('x2', tx);
    line.setAttribute('y2', ty);
    line.setAttribute('stroke', '#1A1F2C');
    line.setAttribute('stroke-width', '1');
    line.setAttribute('data-group', group.id);
    linksGroup.appendChild(line);

    // group wrapper
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'group');
    g.setAttribute('data-group', group.id);

    // group label above node
    const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    labelText.setAttribute('x', tx);
    labelText.setAttribute('y', ty - 48);
    labelText.setAttribute('text-anchor', 'middle');
    labelText.setAttribute('fill', group.color);
    labelText.setAttribute('font-family', 'JetBrains Mono, monospace');
    labelText.setAttribute('font-size', '9');
    labelText.setAttribute('letter-spacing', '3');
    labelText.setAttribute('text-transform', 'uppercase');
    labelText.textContent = group.label;
    g.appendChild(labelText);

    // tech labels below
    const techText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    techText.setAttribute('x', tx);
    techText.setAttribute('y', ty + 42);
    techText.setAttribute('text-anchor', 'middle');
    techText.setAttribute('fill', '#5e6478');
    techText.setAttribute('font-family', 'JetBrains Mono, monospace');
    techText.setAttribute('font-size', '8');
    techText.setAttribute('letter-spacing', '1.5');
    techText.textContent = group.techs.join(' · ');
    g.appendChild(techText);

    // main node circle
    const mainCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    mainCircle.setAttribute('cx', tx);
    mainCircle.setAttribute('cy', ty);
    mainCircle.setAttribute('r', '30');
    mainCircle.setAttribute('fill', '#0B0E16');
    mainCircle.setAttribute('stroke', group.color);
    mainCircle.setAttribute('stroke-width', '1');
    mainCircle.setAttribute('opacity', '0.7');
    g.appendChild(mainCircle);

    // inner dot
    const innerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    innerCircle.setAttribute('cx', tx);
    innerCircle.setAttribute('cy', ty);
    innerCircle.setAttribute('r', '3');
    innerCircle.setAttribute('fill', group.color);
    innerCircle.setAttribute('opacity', '0.9');
    g.appendChild(innerCircle);

    // hover interaction
    g.addEventListener('mouseenter', () => {
      svg.classList.add('has-hover');
      svg.querySelectorAll('.group').forEach(gg => {
        gg.classList.remove('hover');
        if (gg.dataset.group === group.id) gg.classList.add('hover');
      });
      svg.querySelectorAll('[data-group]').forEach(ln => {
        ln.style.opacity = (ln.dataset.group === group.id) ? '1' : '0.2';
        ln.style.stroke = (ln.dataset.group === group.id) ? group.color : '#1A1F2C';
      });
    });
    g.addEventListener('mouseleave', () => {
      svg.classList.remove('has-hover');
      svg.querySelectorAll('.group').forEach(gg => gg.classList.remove('hover'));
      svg.querySelectorAll('[data-group]').forEach(ln => {
        ln.style.opacity = '1';
        ln.style.stroke = '#1A1F2C';
      });
    });

    nodesGroup.appendChild(g);
  });

  // hover for center node — dim all
  const centerNode = svg.querySelector('.node.center');
  if (centerNode) {
    centerNode.addEventListener('mouseenter', () => {
      svg.classList.add('has-hover');
    });
    centerNode.addEventListener('mouseleave', () => {
      svg.classList.remove('has-hover');
    });
  }
})();
