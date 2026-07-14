import { Router } from "express";
import { issueCsrfToken } from "../middleware/csrf.js";

const router = Router();

router.get("/healthz", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

router.get("/csrf-token", (_req, res) => {
  const token = issueCsrfToken(_req, res);
  res.json({ success: true, data: { csrfToken: token } });
});

export default router;