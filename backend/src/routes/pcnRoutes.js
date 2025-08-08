import express from "express";
import { getRoute } from "../controllers/pcnController.js";

const router = express.Router();

/**
 * @swagger
 * /pcn/route:
 *   post:
 *     summary: Get an optimised PCN cycling route
 *     description: Generates a route between two locations using Singapore Park Connectors.
 *     tags: [PCN]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               current_location:
 *                 type: string
 *                 example: "310172"
 *               destination_location:
 *                 type: string
 *                 example: "Pasir Ris Park"
 *               openInBrowser:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Successfully generated route
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 route:
 *                   type: object
 *                   description: Route details
 *                 mapsUrl:
 *                   type: string
 *                   description: Google Maps URL
 *       400:
 *         description: Missing parameters
 *       500:
 *         description: Server error
 */

router.post("/route", getRoute);

export default router;
