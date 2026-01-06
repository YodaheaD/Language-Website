/// import Mexico flag
import { MX } from "country-flag-icons/react/3x2";
// import japan flag
import { JP } from "country-flag-icons/react/3x2";
// if japanese return japan flag, if spanish return mexico flag, else return the string back
export function getLanguageFlag(
  lang: string,
  size: "small" | "medium" | "large" = "medium",
  flagOnly?: boolean
) {
  let sizeClass = "w-6 h-4";
  if (size === "small") {
    sizeClass = "w-4 h-3";
  } else if (size === "large") {
    sizeClass = "w-8 h-6";
  }
  if (flagOnly) {
    if (lang.toLowerCase() === "japanese") {
      return <JP className={`${sizeClass} m-auto `} />;
    } else if (lang.toLowerCase() === "spanish") {
      return <MX className={`${sizeClass} m-auto `} />;
    } else {
      return lang;
    }
  }
  if (lang.toLowerCase() === "japanese") {
    return (
      <span className="w-fit  my-auto p-1 rounded-md bg-slate-800  ">
        {" "}
        <JP className={`${sizeClass} m-auto `} />{" "}
      </span>
    );
  } else if (lang.toLowerCase() === "spanish") {
    return (
      <span className="w-fit my-auto p-1 rounded-md bg-slate-800  ">
        {" "}
        <MX className={`${sizeClass} m-auto `} />{" "}
      </span>
    );
  } else {
    return lang;
  }
}
