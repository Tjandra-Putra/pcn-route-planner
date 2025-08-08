import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "PCN Navigator API",
      version: "1.0.0",
      description: "API for generating PCN-optimised routes in Singapore using Perplexity AI",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5001}/api`,
      },
    ],
  },
  apis: ["./src/routes/*.js"], // Path to your route files for annotations
};

export const swaggerSpec = swaggerJsdoc(options);

export function swaggerDocs(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`📄 Swagger docs available at http://localhost:${process.env.PORT || 5001}/api-docs`);
}
