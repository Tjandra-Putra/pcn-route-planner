"use client";

import { Badge } from "@/components/ui/badge";
import type { RouteData } from "@/types/route";

interface RouteListProps {
  routeDetails: RouteData | null;
}

export default function RouteList({ routeDetails }: RouteListProps) {
  if (!routeDetails) {
    return (
      <p className="text-center text-gray-400 italic mt-4">No route details available. Please enter origin and destination and click Get Route.</p>
    );
  }

  const allPoints = [routeDetails.Start_Point, ...routeDetails.Route, routeDetails.Destination];

  return (
    <div className="w-full text-sm text-gray-700 overflow-auto px-2 py-1">
      {allPoints.map((point, idx) => {
        const isFirst = idx === 0;
        const isLast = idx === allPoints.length - 1;

        return (
          <div key={idx} className="flex items-center space-x-3 pl-10 relative" style={{ minHeight: "52px" }}>
            <span
              className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-semibold
    ${isFirst ? "bg-green-600 text-white" : isLast ? "bg-red-600 text-white" : "bg-blue-600 text-white"}`}
              style={{
                lineHeight: 1,
                marginLeft: "-39px",
                zIndex: 10,
                position: "relative",
                flexShrink: 0, // <-- Add this to prevent squashing
              }}
            >
              {idx + 1}
            </span>

            {!isLast && (
              <span
                className="absolute border-l-2 border-dotted border-blue-300"
                style={{ height: "calc(100% - 24px)", top: "47px", left: "12px", zIndex: 1 }}
              />
            )}

            <Badge
              variant="secondary"
              className={`px-4 py-0 rounded-full text-xs font-bold flex items-center justify-center
    transition-all duration-200 ease-in-out group
    ${
      isFirst
        ? "bg-green-100 hover:bg-green-200 hover:shadow-md hover:-translate-y-0.5"
        : isLast
        ? "bg-red-100 hover:bg-red-200 hover:shadow-md hover:-translate-y-0.5"
        : "bg-blue-100 hover:bg-blue-200 hover:shadow-md hover:-translate-y-0.5"
    }`}
              style={{
                minHeight: "28px",
                lineHeight: "28px",
                minWidth: "60px", // Ensure minimum width to prevent squashing
                whiteSpace: "nowrap", // Prevent line breaks
                flexShrink: 0, // Prevent shrinking inside flex
              }}
            >
              <span>{point.name} </span>
            </Badge>
          </div>
        );
      })}
    </div>
  );
}
