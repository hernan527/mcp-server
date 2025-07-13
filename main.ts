import express, { Request, Response } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import axios from "axios";

async function main() {
  const server = new McpServer({
    name: "weather",
    version: "1.0.0",
    capabilities: { resources: {}, tools: {} }
  });

  server.tool(
    "get-alerts",
    "Get weather alerts",
    {
      location: z.string(),
      state: z.string(),
      country: z.string(),
    },
    async (args) => ({
      content: [{ type: "text", text: `No active alerts for ${args.location}` }],
    })
  );

  // server.tool(
  //   "tool-name", // 🔧 Nombre interno
  //   "Descripción legible para humanos", // 📝 Descripción
  //   {
  //     // 🧩 Variables que recibe la tool (usa zod para validación)
  //     nombre: z.string(),
  //     email: z.string().email(),
  //     edad: z.number().min(0).optional(),
  //   },
  //   async ({ nombre, email, edad }) => {
  //     try {
  //       const res = await axios.post("http://cotizacion.tuchat.com.ar/usuarios", {
  //         nombre,
  //         email,
  //         edad,
  //       });
  
  //       const usuario = res.data;
  
  //       return {
  //         content: [
  //           {
  //             type: "text",
  //             text: `Usuario creado con ID ${usuario.id}`,
  //           },
  //         ],
  //       };
  //     } catch (error: any) {
  //       return {
  //         content: [
  //           {
  //             type: "text",
  //             text: `Error: ${error.response?.data?.message || error.message}`,
  //           },
  //         ],
  //       };
  //     }
  //   }
  // );


  const app = express();
  app.use(express.json());

  app.post("/mcp", async (req: Request, res: Response) => {
    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined
      });
      // Conecta el server con este transporte
      await server.connect(transport);
      // Maneja la petición POST
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      console.error(err);
      if (!res.headersSent) {
        res.status(500).json({ jsonrpc: "2.0", error: { code: -32603, message: "Internal server error" }, id: null });
      }
    }
  });

  // Dejamos GET y DELETE rechazados
  app.get("/mcp", (_req, res) => {
    res.status(405).json({ jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed." }, id: null });
  });
  app.delete("/mcp", (_req, res) => {
    res.status(405).json({ jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed." }, id: null });
  });

  const port = process.env.PORT ?? 3000;
  app.listen(port, () => console.log(`MCP HTTP server listening on http://localhost:${port}/mcp`));
}

main().catch(err => { console.error(err); process.exit(1); });
