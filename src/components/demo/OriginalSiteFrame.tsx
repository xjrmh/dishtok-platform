"use client";

import { useState } from "react";

interface OriginalSiteFrameProps {
  url: string;
}

export function OriginalSiteFrame({ url }: OriginalSiteFrameProps) {
  const [iframeError, setIframeError] = useState(false);

  if (iframeError || url === "demo") {
    return (
      <div className="w-full h-full bg-gray-50 flex flex-col">
        {/* Mock of the original SinglePlatform-style menu page */}
        <div className="bg-gray-800 text-white p-6 text-center">
          <h2 className="text-2xl font-bold tracking-wider">SON CUBANO</h2>
          <div className="flex justify-center gap-6 mt-3 text-sm text-gray-400">
            <span>HOME</span>
            <span>MENU</span>
            <span>ABOUT</span>
            <span>CONTACT</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <h3 className="text-lg font-bold text-gray-700 mb-1 border-b-2 border-gray-300 pb-2">
            DINNER MENU
          </h3>
          <div className="mt-4 space-y-1">
            <h4 className="text-sm font-bold text-gray-600 uppercase mt-4 mb-2">
              Appetizers
            </h4>
            {[
              { name: "Butternut Squash Soup", price: "14.00" },
              { name: "Crab Croquettes", price: "20.00" },
              { name: "Empanadas Mixtas", price: "18.00" },
              { name: "Guacamole", price: "16.00" },
              { name: "Spicy Ceviche Mixto", price: "20.00" },
              { name: "Lobster and Shrimp Tacos", price: "28.00" },
              { name: "Clothesline Bacon", price: "22.00" },
            ].map((item) => (
              <div
                key={item.name}
                className="flex justify-between text-sm text-gray-600 py-1 border-b border-dotted border-gray-200"
              >
                <span>{item.name}</span>
                <span className="font-mono">${item.price}</span>
              </div>
            ))}
            <h4 className="text-sm font-bold text-gray-600 uppercase mt-6 mb-2">
              Entrees
            </h4>
            {[
              { name: "Ropa Vieja", price: "38.00" },
              { name: "Skirt Steak Churrasco", price: "49.00" },
              { name: "BBQ Glazed Salmon", price: "30.00" },
              { name: "Roasted Chicken", price: "31.00" },
              { name: "Crackling Pork Shank", price: "37.00" },
            ].map((item) => (
              <div
                key={item.name}
                className="flex justify-between text-sm text-gray-600 py-1 border-b border-dotted border-gray-200"
              >
                <span>{item.name}</span>
                <span className="font-mono">${item.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <iframe
      src={url}
      className="w-full h-full border-0"
      title="Original restaurant website"
      onError={() => setIframeError(true)}
      sandbox="allow-scripts allow-same-origin"
    />
  );
}
