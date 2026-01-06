import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const hardcodedData = [
  {
    word: "SI",
    definition:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Katakana_letter_Si.svg/360px-Katakana_letter_Si.svg.png",
  },
];
export function returnImageforDefintion(
  definitionInitial: string,
  type: string
) {
  //defintion intital = word-defintion
  const [word, definition] = definitionInitial.split("-");
  console.log(
    ` Recieved word: ${word}, definition: ${definition} for type: ${type}`
  );
  // check if part of hardcoded data, only for katakana
  if (hardcodedData.some((item) => item.word === word) && type === "katakana") {
    const foundItem = hardcodedData.find((item) => item.word === word);
    if (foundItem) {
      return foundItem.definition;
    }
  }
  if (type === "hiragana") {
    return `https://upload.wikimedia.org/wikipedia/commons/thumb/${definition}/Japanese_Hiragana_kyokashotai_${word}.svg/360px-Japanese_Hiragana_kyokashotai_${word}.svg.png`;
  } else if (type === "katakana") {
    //         https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Japanese_Katakana_SE.png/120px-Japanese_Katakana_SE.png
    //         https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Japanese_Katakana_SO.png/120px-Japanese_Katakana_SO.png
    return `https://upload.wikimedia.org/wikipedia/commons/thumb/${definition}/Japanese_Katakana_${word}.svg/360px-Japanese_Katakana_${word}.svg.png`;
  } else return definitionInitial;
}
export function returnImageforDefintion2(
  definitionInitial: string,
  type: string
) {
  //defintion intital = word-defintion
  const [word, definition] = definitionInitial.split("-");

  if (type === "hiragana") {
    return `https://upload.wikimedia.org/wikipedia/commons/thumb/${definition}/Japanese_Hiragana_kyokashotai_${word}.svg/360px-Japanese_Hiragana_kyokashotai_${word}.svg.png`;
  } else if (type === "katakana") {
    //         https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Japanese_Katakana_SE.png/120px-Japanese_Katakana_SE.png
    //         https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Japanese_Katakana_SO.png/120px-Japanese_Katakana_SO.png
    //  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${definition}/Japanese_Katakana_${word}.svg/360px-Japanese_Katakana_${word}.svg.png`
    return `https://upload.wikimedia.org/wikipedia/commons/thumb/${definition}/Japanese_Katakana_${word}.png/360px-Japanese_Katakana_${word}.png`;
  } else return definitionInitial;
}

export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  type: string,
  value: string
) => {
  const target = e.target as HTMLImageElement;
  
  // Get current retry count from data attribute
  const currentRetries = parseInt(target.dataset.retries || "0", 10);
  const maxRetries = 2; // Limit to 2 retries (first image -> second image -> text)
  
  // If we've already reached max retries, show text fallback
  if (currentRetries >= maxRetries) {
    target.style.display = "none";
    const parent = target.parentElement;
    if (parent) {
      parent.innerHTML = `<div class="text-gray-500 text-xs break-all">
        <div>Failed to load: ${String(value)}</div>
        <div class="text-red-400 mt-1">URL: ${target.src}</div>
      </div>`;
    }
    return;
  }
  
  const currentSrc = target.src;
  const firstSrc = returnImageforDefintion(String(value), type || "");
  const secondSrc = returnImageforDefintion2(String(value), type || "");

  // If we're currently showing the first image and it failed, try the second
  if (currentSrc === firstSrc && currentRetries === 0) {
    target.dataset.retries = "1";
    target.src = secondSrc;
  }
  // If we're currently showing the second image and it failed, show text
  else {
    target.style.display = "none";
    const parent = target.parentElement;
    if (parent) {
      parent.innerHTML = `<div class="text-gray-500 text-xs break-all">
        <div>Failed to load: ${String(value)}</div>
        <div class="text-red-400 mt-1">URL: ${target.src}</div>
      </div>`;
    }
  }
};
