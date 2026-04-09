// code.js runs in Figma's main thread and has access to the Scene Graph

figma.showUI(__html__, { width: 340, height: 480 });

function filterPaints(paints, node, typeContext) {
  const hardcodedColors = [];
  
  if (paints && Array.isArray(paints)) {
     paints.forEach(paint => {
       if (paint.type === "SOLID") { 
         // Check boundVariables for Variable mapping
         const hasVariable = paint.boundVariables && paint.boundVariables["color"];
         
         // Check Style mapping (fill/stroke style ID on node)
         let hasStyle = false;
         if (typeContext === 'Fill') {
           hasStyle = node.fillStyleId !== figma.mixed && node.fillStyleId !== "";
         } else if (typeContext === 'Stroke') {
           hasStyle = node.strokeStyleId !== figma.mixed && node.strokeStyleId !== "";
         }
         
         if (!hasVariable && !hasStyle) {
            // Found a hardcoded solid paint! Calculate Hex:
            const toHex = (c) => {
              const hex = Math.round(c * 255).toString(16);
              return hex.length === 1 ? "0" + hex : hex;
            };
            const hex = `#${toHex(paint.color.r)}${toHex(paint.color.g)}${toHex(paint.color.b)}`.toUpperCase();
            hardcodedColors.push({ type: typeContext, hex });
         }
       }
     });
  }
  return hardcodedColors;
}

function auditNodes(nodes) {
  const nonCompliantLayers = [];

  function traverse(node) {
    // Only looking at nodes that support fills or strokes
    if ("fills" in node || "strokes" in node) {
      let isHardcoded = false;
      let colors = [];

      // Process Fills
      const badFills = filterPaints(node.fills, node, 'Fill');
      if (badFills.length > 0) {
        colors = colors.concat(badFills);
        isHardcoded = true;
      }

      // Process Strokes
      const badStrokes = filterPaints(node.strokes, node, 'Stroke');
      if (badStrokes.length > 0) {
        colors = colors.concat(badStrokes);
        isHardcoded = true;
      }

      if (isHardcoded) {
        nonCompliantLayers.push({
          id: node.id,
          name: node.name,
          colors: colors
        });
      }
    }

    // Traverse into children
    if ("children" in node) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  nodes.forEach(n => traverse(n));
  return nonCompliantLayers;
}

// Receive messages from the UI thread
figma.ui.onmessage = msg => {
  if (msg.type === 'run-audit') {
    // Audit the entire current page
    const results = auditNodes([figma.currentPage]);
    // Send payload back to the UI iframe
    figma.ui.postMessage({ type: 'audit-results', data: results });
  } 
  
  else if (msg.type === 'select-node') {
    // A brilliant feature for support tools: Focus camera on the problematic node
    const node = figma.getNodeById(msg.id);
    if (node) {
      figma.currentPage.selection = [node];
      figma.viewport.scrollAndZoomIntoView([node]);
    }
  }
};
