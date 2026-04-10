# Figma Design Drift Audit

**A Support Engineering technical demonstration.**

This project is a technical portfolio piece designed to solve a very common enterprise design system problem: **Design Drift**. Large teams often mistakenly detach components from the core Design System, relying on hard-coded HEX values rather than mapped Variables or Styles. This makes broad design updates fail across massive files.

## The Approach

To fully understand how Figma interacts with both internal workflows and external enterprise integrations, this tool was built in two distinct ways:

### 1. The Native Plugin (This Repository)
Built entirely on the **Figma Plugin API**, this tool runs within the sandboxed `ui.html` iframe and communicates directly with the main Figma thread. 
* **Scene Graph Traversal:** It dynamically traverses the internal node tree of the current page.
* **Property Validation:** It parses through `fills` and `strokes` to verify if they are bound to a mapped Variable (`boundVariables`) or a legacy Color Style (`fillStyleId`/`strokeStyleId`).
* **UX DX (Developer Experience):** When an unlinked node is found, clicking it in the UI sends a message to the Figma engine to automatically focus the viewport camera and select the problematic node on the canvas instantly.

### 2. The External REST Application
Built as a standalone vanilla HTML/JS single-page application that queries the **Figma REST API (`GET /v1/files/:key`)**. 
* **Authentication:** Uses Personal Access Tokens (PATs) and OAuth standard practices.
* **JSON Traversal:** Parses the gigantic un-flattened structural JSON payload returned by Figma's servers.
* **Support Debugger Tooling:** Serves as a simulated "Internal Support Tool" where agents can instantly generate CSV compliance reports of an enterprise client's design file without ever altering the document.

## How to run the Plugin Locally
1. Download this repository.
2. Open your locally installed **Figma Desktop app**.
3. Open any design file.
4. Go to **Plugins > Development > Import plugin from manifest...**
5. Select the `manifest.json` file in this folder.
6. The audit tool is now ready to scan!

_Built to demonstrate technical Support Engineering capabilities regarding Figma's core extensibility layers — a hands-on exploration of the Figma Plugin API._
