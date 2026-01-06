"use client";

import React from "react";
import { handleImageError, returnImageforDefintion } from "@/lib/utils";

interface JapaneseImageProps {
  value: string;
  type: string;
  height?: string;
  width?: string;
  addBorder?: boolean;
  alt?: string;
  className?: string;
}

export default function JapaneseImage({
  value,
  type,
  height = "h-16",
  width = "w-16",
  addBorder = true,
  alt,
  className = "",
}: JapaneseImageProps) {
  const borderClasses = addBorder ? "border border-gray-200 rounded-lg bg-white p-1" : "";
  const combinedClasses = `${height} ${width} object-contain ${borderClasses} ${className}`.trim();

  return (
    <img
      src={returnImageforDefintion(String(value), type)}
      alt={alt || `${value.split("-")[0] || 'Character'} - ${value}`}
      className={combinedClasses}
      onError={(e) => {
        handleImageError(e, type, String(value));
      }}
    />
  );
}