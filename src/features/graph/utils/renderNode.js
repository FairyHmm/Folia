export const drawPillNode = (node, ctx, globalScale) => {
  const label = node.name;
  const fontSize = 10 / Math.sqrt(globalScale);

  ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
  const textWidth = ctx.measureText(label).width;

  const bgWidth = textWidth + fontSize * 1.5;
  const bgHeight = fontSize * 2;

  ctx.fillStyle = node.color;
  ctx.beginPath();
  ctx.roundRect(
    node.x - bgWidth / 2,
    node.y - bgHeight / 2,
    bgWidth,
    bgHeight,
    bgHeight / 2,
  );
  ctx.fill();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#000";
  ctx.fillText(label, node.x, node.y, bgWidth);
};
