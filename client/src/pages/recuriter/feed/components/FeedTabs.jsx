import React, { useState } from "react";

const FeedTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      {/* Recent Text on Left */}
      <h2
        className="text-[#413C3C]"
        style={{
          fontFamily:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontWeight: 600,
          fontSize: "22px",
          lineHeight: "100%",
          letterSpacing: "-0.96px", // -4% of 24px
        }}
      >
        Recent
      </h2>

      {/* Clean Feed/Case Tabs on Right */}
      <div className="flex items-center space-x-6 mr-2">
        <button
          className={`font-medium transition-colors ${
            activeTab === "feed" ? "" : "text-gray-400"
          }`}
          onClick={() => onTabChange("feed")}
          style={{
            fontFamily:
              'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontWeight: 600,
            fontSize: "16px",
            lineHeight: "100%",
            letterSpacing: "-0.64px", // -4% of 16px
            color: activeTab === "feed" ? "#1890FF" : undefined,
          }}
        >
          Feed
        </button>
        <button
          className={`font-medium transition-colors ${
            activeTab === "case" ? "" : "text-gray-400"
          }`}
          onClick={() => onTabChange("case")}
          style={{
            fontFamily:
              'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontWeight: 600,
            fontSize: "16px",
            lineHeight: "100%",
            letterSpacing: "-0.64px", // -4% of 16px
            color: activeTab === "case" ? "#1890FF" : undefined,
          }}
        >
          Case
        </button>
      </div>
    </div>
  );
};

export default FeedTabs;
